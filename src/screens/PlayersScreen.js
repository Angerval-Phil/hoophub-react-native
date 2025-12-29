// Players Screen - Search and browse NBA players

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../theme';
import { searchPlayers } from '../api';
import { PlayerCard, PlayerCardSkeleton, EmptyState } from '../components';

const POPULAR_SEARCHES = ['LeBron', 'Curry', 'Jokic', 'Giannis', 'Doncic'];

const PlayersScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setPlayers([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await searchPlayers(searchQuery);
      setPlayers(result.players);
    } catch (err) {
      setError(err.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text) => {
    setQuery(text);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 500);
  };

  const handleClear = () => {
    setQuery('');
    setPlayers([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handlePopularSearch = (term) => {
    Haptics.selectionAsync();
    setQuery(term);
    performSearch(term);
    Keyboard.dismiss();
  };

  const handlePlayerPress = (player) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PlayerDetail', { player });
  };

  const renderPlayer = ({ item }) => (
    <View style={styles.playerCardWrapper}>
      <PlayerCard player={item} onPress={() => handlePlayerPress(item)} />
    </View>
  );

  const renderInitialState = () => (
    <View style={styles.initialState}>
      <Text style={styles.initialIcon}>🔍</Text>
      <Text style={styles.initialTitle}>Search NBA Players</Text>
      <Text style={styles.initialSubtitle}>Find stats for any player</Text>
      
      <View style={styles.popularSection}>
        <Text style={styles.popularTitle}>Popular Searches</Text>
        <View style={styles.popularTags}>
          {POPULAR_SEARCHES.map((term) => (
            <TouchableOpacity
              key={term}
              style={styles.popularTag}
              onPress={() => handlePopularSearch(term)}
            >
              <Text style={styles.popularTagText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    if (!hasSearched) return renderInitialState();
    
    return (
      <EmptyState
        icon="🏀"
        title="No players found"
        subtitle="Try a different search term"
      />
    );
  };

  const renderLoading = () => (
    <View style={styles.skeletonGrid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.playerCardWrapper}>
          <PlayerCardSkeleton />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Players</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search players..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={handleQueryChange}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading && players.length === 0 ? (
        renderLoading()
      ) : (
        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.xl,
    paddingBottom: spacing.s,
  },
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.s,
    marginRight: spacing.s,
  },
  listContent: {
    paddingHorizontal: spacing.s,
    paddingBottom: spacing.xxl,
  },
  playerCardWrapper: {
    flex: 1,
    maxWidth: '50%',
    padding: spacing.xs,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.s,
  },
  initialState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  initialIcon: {
    fontSize: 60,
    marginBottom: spacing.m,
  },
  initialTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  initialSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  popularSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  popularTitle: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: spacing.s,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  popularTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.full,
    margin: spacing.xs,
  },
  popularTagText: {
    ...typography.subhead,
    color: colors.textPrimary,
  },
});

export default PlayersScreen;
