import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../api/client';
import { AnimeCard } from '../../components/AnimeCard';
import { colors, spacing, typography } from '../../theme';
import type { AnimeBasic } from '../../types';

export default function HomeScreen() {
  const [airingList, setAiringList] = useState<AnimeBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAiring();
  }, []);

  const fetchAiring = async () => {
    try {
      const data = await apiClient.getAiring(1);
      setAiringList(data.data);
      if (data.paginationInfo && data.paginationInfo.lastPage <= 1) {
          setHasMore(false);
      }
    } catch (err) {
      setError('Failed to fetch airing anime');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    // only load up to page 5 as requested by the user
    if (loadingMore || !hasMore || page >= 5) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const data = await apiClient.getAiring(nextPage);
      if (data.data.length > 0) {
        setAiringList((prev) => [...prev, ...data.data]);
        setPage(nextPage);
      }
      if (nextPage >= 5 || (data.paginationInfo && data.paginationInfo.lastPage <= nextPage)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more airing anime:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const navigateToDetails = (anime: AnimeBasic) => {
    router.push(`/anime/${anime.session}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerAccent}>ANIMEPAHE</Text>
        <Text style={styles.header}>Currently Airing</Text>
      </View>
      <FlatList
        data={airingList}
        keyExtractor={(item, index) => `${item.session}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ paddingVertical: spacing.lg }} size="small" color={colors.primary} />
          ) : null
        }
        renderItem={({ item }) => (
          <AnimeCard anime={item} onPress={navigateToDetails} />
        )}
      />
    </SafeAreaView>
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
  },
  headerContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerAccent: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  header: {
    color: colors.text,
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
  },
});
