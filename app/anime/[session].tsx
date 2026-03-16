import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../api/client';
import { borderRadius, colors, shadows, spacing, textShadows, typography } from '../../theme';
import type { AnimeDetails, Episode, StreamData } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 380;

export default function AnimeDetailsScreen() {
    const { session } = useLocalSearchParams<{ session: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [anime, setAnime] = useState<AnimeDetails | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingEpisodes, setLoadingEpisodes] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [downloadingEpisode, setDownloadingEpisode] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await apiClient.getAnimeDetails(session!);
            setAnime(data);

            const episodesData = await apiClient.getEpisodes(session!);
            setEpisodes(episodesData.data);
        } catch (err) {
            setError('Failed to load anime details');
        } finally {
            setLoading(false);
            setLoadingEpisodes(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleDownloadEpisode = async (episode: Episode) => {
        try {
            setDownloadingEpisode(episode.session);
            const streamData: StreamData = await apiClient.getStreamLinks(session!, episode.session);
            if (streamData.sources && streamData.sources.length > 0) {
                // Find the highest quality source with a download link
                const sourceWithDownload = streamData.sources.find(s => s.download) || streamData.sources[0];
                if (sourceWithDownload?.download) {
                    Linking.openURL(sourceWithDownload.download);
                } else if (sourceWithDownload?.url) {
                    Linking.openURL(sourceWithDownload.url);
                } else {
                    alert('No download link available.');
                }
            }
        } catch (err) {
            alert('Failed to get download link.');
        } finally {
            setDownloadingEpisode(null);
        }
    };

    const posterUri = anime?.poster || anime?.image || undefined;

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error || !anime) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={handleBack} style={styles.backButtonLarge}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={episodes}
                keyExtractor={(item) => item.id || item.session}
                contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        {/* Hero Header */}
                        <View style={styles.header}>
                            {posterUri && (
                                <Image source={{ uri: posterUri }} style={styles.backgroundImage} blurRadius={20} />
                            )}
                            <LinearGradient
                                colors={['rgba(9,9,11,0.3)', colors.background]}
                                locations={[0.3, 1]}
                                style={styles.gradient}
                            />
                            
                            <Pressable 
                                style={[styles.iconButton, { top: insets.top + spacing.sm, left: spacing.lg }]} 
                                onPress={handleBack}
                            >
                                <Ionicons name="arrow-back" size={22} color={colors.text} />
                            </Pressable>

                            <View style={styles.headerContent}>
                                {posterUri ? (
                                    <Image source={{ uri: posterUri }} style={styles.poster} />
                                ) : (
                                    <View style={[styles.poster, styles.posterFallback]}>
                                        <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                                    </View>
                                )}
                                <View style={styles.headerInfo}>
                                    <Text style={styles.title}>{anime.title}</Text>
                                    <View style={styles.metaRow}>
                                        {anime.type && <Text style={styles.metaBadge}>{anime.type}</Text>}
                                        {anime.status && <Text style={[styles.metaBadge, styles.statusBadge]}>{anime.status}</Text>}
                                        {anime.episodes ? <Text style={[styles.metaBadge, styles.epBadge]}>{anime.episodes} EP</Text> : null}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Synopsis */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Synopsis</Text>
                            <Text 
                                style={styles.synopsis} 
                                numberOfLines={expanded ? undefined : 4}
                            >
                                {anime.synopsis}
                            </Text>
                            {anime.synopsis && anime.synopsis.length > 200 && (
                                <Pressable onPress={() => setExpanded(!expanded)}>
                                    <Text style={styles.showMore}>{expanded ? 'Show Less' : 'Show More'}</Text>
                                </Pressable>
                            )}
                        </View>

                        <View style={styles.episodeHeader}>
                            <Text style={styles.sectionTitle}>Episodes</Text>
                            <Text style={styles.episodeCount}>{episodes.length} episodes</Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <Pressable 
                        style={({ pressed }) => [styles.episodeRow, pressed && styles.episodeRowPressed]}
                        onPress={() => {
                            const watchUrl = `/watch/${session}?episodeId=${encodeURIComponent(item.session)}`;
                            router.push(watchUrl as any);
                        }}
                    >
                        {item.snapshot ? (
                            <Image source={{ uri: item.snapshot }} style={styles.episodeSnapshot} />
                        ) : (
                            <View style={styles.episodeSnapshotFallback}>
                                <Ionicons name="play-circle" size={28} color={colors.textMuted} />
                            </View>
                        )}
                        <View style={styles.episodeInfo}>
                            <Text style={styles.episodeTitle}>Episode {item.episode || item.number || '?'}</Text>
                            <Text style={styles.episodeSubtitle}>{item.duration || '24m'}</Text>
                        </View>

                        {/* Download button */}
                        <Pressable 
                            onPress={(e) => {
                                e.stopPropagation?.();
                                handleDownloadEpisode(item);
                            }}
                            style={({ pressed }) => [styles.downloadBtn, pressed && styles.downloadBtnPressed]}
                            hitSlop={8}
                        >
                            {downloadingEpisode === item.session ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Ionicons name="download-outline" size={20} color={colors.primary} />
                            )}
                        </Pressable>

                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </Pressable>
                )}
                ListEmptyComponent={
                    loadingEpisodes ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.lg }} />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="film-outline" size={40} color={colors.textMuted} />
                            <Text style={styles.emptyText}>No episodes available.</Text>
                        </View>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    header: {
        height: HEADER_HEIGHT,
        position: 'relative',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: SCREEN_WIDTH,
        height: HEADER_HEIGHT,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    iconButton: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    headerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: spacing.lg,
    },
    poster: {
        width: 120,
        height: 170,
        borderRadius: borderRadius.lg,
        ...shadows.lg,
    },
    posterFallback: {
        backgroundColor: colors.backgroundTertiary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: spacing.lg,
        justifyContent: 'flex-end',
    },
    title: {
        color: colors.text,
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        ...textShadows.md,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    metaBadge: {
        backgroundColor: colors.backgroundTertiary,
        color: colors.textSecondary,
        fontSize: typography.fontSize.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    statusBadge: {
        backgroundColor: colors.primary + '22',
        color: colors.primary,
    },
    epBadge: {
        backgroundColor: colors.accent + '22',
        color: colors.accent,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.lg,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    synopsis: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        lineHeight: 22,
    },
    showMore: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        marginTop: spacing.xs,
    },
    episodeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        marginBottom: spacing.xs,
    },
    episodeCount: {
        color: colors.textMuted,
        fontSize: typography.fontSize.sm,
    },
    episodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    episodeRowPressed: {
        backgroundColor: colors.backgroundSecondary,
    },
    episodeSnapshot: {
        width: 110,
        height: 62,
        borderRadius: borderRadius.md,
        backgroundColor: colors.backgroundSecondary,
    },
    episodeSnapshotFallback: {
        width: 110,
        height: 62,
        borderRadius: borderRadius.md,
        backgroundColor: colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    episodeInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    episodeTitle: {
        color: colors.text,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    episodeSubtitle: {
        color: colors.textMuted,
        fontSize: typography.fontSize.sm,
        marginTop: 2,
    },
    downloadBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    downloadBtnPressed: {
        backgroundColor: colors.primary + '30',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xxl,
        gap: spacing.sm,
    },
    emptyText: {
        color: colors.textMuted,
        textAlign: 'center',
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSize.md,
    },
    loadingText: {
        color: colors.textMuted,
        fontSize: typography.fontSize.sm,
    },
    backButtonLarge: {
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    backButtonText: {
        color: colors.text,
        fontWeight: 'bold',
    },
});
