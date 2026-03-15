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
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await apiClient.searchAnime(query);
      setResults(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
            <Pressable onPress={() => setQuery('')}>
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
          keyExtractor={(item) => item.session}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
