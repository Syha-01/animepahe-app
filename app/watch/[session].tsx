import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View, Pressable, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { apiClient } from '../../api/client';
import { borderRadius, colors, shadows, spacing, textShadows, typography } from '../../theme';
import type { StreamData } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WatchScreen() {
    const { session, episodeId } = useLocalSearchParams<{ session: string, episodeId: string }>();
    const router = useRouter();

    const [streamData, setStreamData] = useState<StreamData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedResolution, setSelectedResolution] = useState<string>('');
    const [showQualityPicker, setShowQualityPicker] = useState(false);

    // Derived states
    const currentSource = streamData?.sources.find(s => s.resolution === selectedResolution) || 
                          streamData?.sources[0] || null;
    const currentSourceUrl = currentSource?.url || null;

    // Expo Video Player
    const player = useVideoPlayer(
        currentSourceUrl 
            ? { uri: currentSourceUrl, headers: { Referer: 'https://kwik.cx/' } } 
            : null, 
        player => {
        if (player && currentSourceUrl) {
            player.loop = false;
            player.play();
        }
    });

    useEffect(() => {
        if (session && episodeId) {
            fetchStream();
        }
    }, [session, episodeId]);

    // Lock to landscape on mount, unlock on unmount
    useEffect(() => {
        const lockOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        };
        lockOrientation();

        return () => {
            ScreenOrientation.unlockAsync();
        };
    }, []);

    const fetchStream = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.getStreamLinks(session!, episodeId!);
            setStreamData(data);
            
            if (data.sources && data.sources.length > 0) {
                // Default to highest available resolution
                const sorted = [...data.sources].sort((a, b) => {
                    const aRes = parseInt(a.resolution) || 0;
                    const bRes = parseInt(b.resolution) || 0;
                    return bRes - aRes;
                });
                setSelectedResolution(sorted[0].resolution);
            } else {
                setError('No playable sources found.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load video stream');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = async () => {
        if (player) {
            player.pause();
        }
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        router.back();
    };

    const handleDownload = () => {
        if (currentSource?.download) {
            Linking.openURL(currentSource.download);
        } else {
            alert('No download link available for this resolution.');
        }
    };

    const handleSelectQuality = (resolution: string) => {
        setSelectedResolution(resolution);
        setShowQualityPicker(false);
    };

    const getQualityLabel = (resolution: string) => {
        const res = parseInt(resolution);
        if (res >= 1080) return 'FHD';
        if (res >= 720) return 'HD';
        if (res >= 480) return 'SD';
        return 'Low';
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading stream...</Text>
            </View>
        );
    }

    if (error || !streamData) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Video */}
            <View style={styles.videoContainer}>
                {currentSourceUrl ? (
                    <VideoView 
                        player={player}
                        style={styles.video} 
                        allowsFullscreen
                        allowsPictureInPicture
                        contentFit="contain"
                    />
                ) : (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>Source error occurred.</Text>
                    </View>
                )}
            </View>

            {/* Top overlay bar */}
            <View style={styles.topOverlay}>
                <Pressable onPress={handleBack} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </Pressable>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {streamData.anime_title}
                    </Text>
                    <Text style={styles.headerSubtitle}>Episode {streamData.episode}</Text>
                </View>
                <Pressable onPress={handleDownload} style={styles.iconBtn}>
                    <Ionicons name="download-outline" size={22} color={colors.primary} />
                </Pressable>
            </View>

            {/* Bottom overlay — Quality button */}
            <View style={styles.bottomOverlay}>
                <Pressable 
                    onPress={() => setShowQualityPicker(!showQualityPicker)} 
                    style={styles.qualityToggle}
                >
                    <Ionicons name="settings-sharp" size={14} color={colors.text} />
                    <Text style={styles.qualityToggleText}>{selectedResolution}p</Text>
                    <View style={styles.qualityBadge}>
                        <Text style={styles.qualityBadgeText}>{getQualityLabel(selectedResolution)}</Text>
                    </View>
                </Pressable>
            </View>

            {/* Quality Picker Dropdown */}
            {showQualityPicker && (
                <Pressable 
                    style={styles.qualityOverlay} 
                    onPress={() => setShowQualityPicker(false)}
                >
                    <View style={styles.qualityDropdown}>
                        <Text style={styles.qualityDropdownTitle}>Video Quality</Text>
                        {[...streamData.sources]
                            .sort((a, b) => (parseInt(b.resolution) || 0) - (parseInt(a.resolution) || 0))
                            .map(source => {
                            const isSelected = selectedResolution === source.resolution;
                            return (
                                <Pressable
                                    key={source.resolution}
                                    style={[styles.qualityOption, isSelected && styles.qualityOptionActive]}
                                    onPress={() => handleSelectQuality(source.resolution)}
                                >
                                    <View style={styles.qualityOptionLeft}>
                                        <Text style={[styles.qualityOptionText, isSelected && styles.qualityOptionTextActive]}>
                                            {source.resolution}p
                                        </Text>
                                        <View style={[styles.qualityTag, isSelected && styles.qualityTagActive]}>
                                            <Text style={[styles.qualityTagText, isSelected && styles.qualityTagTextActive]}>
                                                {getQualityLabel(source.resolution)}
                                            </Text>
                                        </View>
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    videoContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    // Top overlay
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        zIndex: 10,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
        marginHorizontal: spacing.md,
    },
    headerTitle: {
        color: colors.text,
        fontSize: typography.fontSize.md,
        fontWeight: 'bold',
        ...textShadows.md,
    },
    headerSubtitle: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm,
        ...textShadows.sm,
    },

    // Bottom overlay
    bottomOverlay: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.lg,
        zIndex: 10,
    },
    qualityToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        gap: spacing.xs,
    },
    qualityToggleText: {
        color: colors.text,
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
    },
    qualityBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    qualityBadgeText: {
        color: '#000',
        fontSize: typography.fontSize.xxs,
        fontWeight: 'bold',
    },

    // Quality Picker Dropdown
    qualityOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    qualityDropdown: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.borderLight,
        padding: spacing.lg,
        minWidth: 240,
        ...shadows.lg,
    },
    qualityDropdownTitle: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.xs,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    qualityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    qualityOptionActive: {
        backgroundColor: colors.primary + '15',
    },
    qualityOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    qualityOptionText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    qualityOptionTextActive: {
        color: colors.text,
    },
    qualityTag: {
        backgroundColor: colors.backgroundTertiary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    qualityTagActive: {
        backgroundColor: colors.primary + '33',
    },
    qualityTagText: {
        color: colors.textMuted,
        fontSize: typography.fontSize.xxs,
        fontWeight: 'bold',
    },
    qualityTagTextActive: {
        color: colors.primary,
    },

    // General
    loadingText: {
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSize.md,
    },
    backButton: {
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
