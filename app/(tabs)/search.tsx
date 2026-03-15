import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { AnimeCard } from '../../components/AnimeCard';
import { borderRadius, colors, shadows, spacing, typography } from '../../theme';
import type { AnimeBasic } from '../../types';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    // Reset state for new search
    setLoading(true);
    setPage(1);
    setHasMore(true);
    
    try {
      const data = await apiClient.searchAnime(query, 1);
      setResults(data.data || []);
      
      // Animepahe latest api pattern
      if (data.paginationInfo && data.paginationInfo.lastPage <= 1) {
          setHasMore(false);
      } else if (data.last_page && data.last_page <= 1) {
          setHasMore(false);
      } else if (!data.data || data.data.length === 0) {
          setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || loading || !query.trim()) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const data = await apiClient.searchAnime(query, nextPage);
      if (data.data && data.data.length > 0) {
        setResults((prev) => [...prev, ...data.data]);
        setPage(nextPage);
      }
      
      if (data.paginationInfo && data.paginationInfo.lastPage <= nextPage) {
        setHasMore(false);
      } else if (data.last_page && data.last_page <= nextPage) {
        setHasMore(false);
      } else if (!data.data || data.data.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more search results:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const navigateToDetails = (anime: AnimeBasic) => {
    router.push(`/anime/${anime.session}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <Text style={styles.headerAccent}>DISCOVER</Text>
        <Text style={styles.headerTitle}>Search Anime</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type an anime title..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
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
          ListEmptyComponent={
             query && !loading ? (
                <View style={styles.centerContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.emptyText}>No results for "{query}"</Text>
                </View>
             ) : !query ? (
                <View style={styles.centerContainer}>
                  <Ionicons name="sparkles-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.emptyText}>Search for your favorite anime</Text>
                </View>
             ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerAccent: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
});
