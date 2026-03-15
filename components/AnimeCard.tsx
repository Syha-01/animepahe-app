import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, shadows, spacing, typography } from '../theme';
import type { AnimeBasic } from '../types';

interface AnimeCardProps {
    anime: AnimeBasic;
    onPress: (anime: AnimeBasic) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onPress }) => {
    return (
        <Pressable 
            style={({ pressed }) => [styles.cardContainer, pressed && styles.cardPressed]}
            onPress={() => onPress(anime)}
        >
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: anime.poster }} 
                    style={styles.image} 
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(9,9,11,0.95)']}
                    locations={[0.5, 1]}
                    style={styles.gradient}
                />
                
                {/* Badges Overlay */}
                <View style={styles.badgeContainer}>
                    {anime.type && (
                        <View style={styles.typeBadge}>
                            <Text style={styles.badgeText}>{anime.type}</Text>
                        </View>
                    )}
                </View>

                {/* Score Badge */}
                {anime.score ? (
                    <View style={styles.scoreBadge}>
                        <Ionicons name="star" size={10} color={colors.gold} style={{ marginRight: 2 }} />
                        <Text style={styles.scoreText}>{anime.score}</Text>
                    </View>
                ) : null}

                {/* Episode Count */}
                {anime.episodes ? (
                    <View style={styles.episodeCountBadge}>
                        <Ionicons name="play-circle" size={10} color={colors.text} style={{ marginRight: 2 }} />
                        <Text style={styles.badgeText}>{anime.episodes} EP</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>
                    {anime.title}
                </Text>
                {anime.season && (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {anime.season} {anime.year}
                    </Text>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 155,
        marginBottom: spacing.xl,
        ...shadows.md,
    },
    cardPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.97 }],
    },
    imageContainer: {
        width: '100%',
        height: 220,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: colors.card,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    badgeContainer: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
        flexDirection: 'row',
        gap: 4,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: borderRadius.sm,
    },
    scoreBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: borderRadius.sm,
    },
    scoreText: {
        color: colors.gold,
        fontSize: typography.fontSize.xxs,
        fontWeight: 'bold',
    },
    episodeCountBadge: {
        position: 'absolute',
        bottom: spacing.sm,
        right: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        color: '#FFF',
        fontSize: typography.fontSize.xxs,
        fontWeight: 'bold',
    },
    infoContainer: {
        paddingTop: spacing.sm,
    },
    title: {
        color: colors.text,
        fontSize: typography.fontSize.sm,
        fontWeight: 'bold',
        lineHeight: 18,
    },
    subtitle: {
        color: colors.textMuted,
        fontSize: typography.fontSize.xs,
        marginTop: 2,
    },
});
