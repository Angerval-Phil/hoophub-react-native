// Games Screen - Shows NBA scores and schedule

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../theme';
import { fetchScoreboard } from '../api';
import {
  GameCard,
  GameCardSkeleton,
  FilterPills,
  EmptyState,
} from '../components';

const FILTERS = [
  { key: 'recent', label: 'Recent' },
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
];

const GamesScreen = ({ navigation }) => {
  const [todayGames, setTodayGames] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('recent');

  const loadGames = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      // Fetch today's games (for live games)
      const today = await fetchScoreboard();
      setTodayGames(today);

      // Fetch recent games (past 3 days)
      const recentResults = [];
      for (let i = 1; i <= 3; i++) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - i);
        const pastGames = await fetchScoreboard(pastDate);
        // Only include finished games
        const finishedGames = pastGames.filter(g => g.status === 'final');
        recentResults.push(...finishedGames);
      }
      // Sort by date descending (most recent first)
      recentResults.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentGames(recentResults);

      // Fetch upcoming games (next 3 days)
      const upcomingResults = [];
      for (let i = 0; i <= 3; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        const futureGames = await fetchScoreboard(futureDate);
        // Only include scheduled games
        const scheduledGames = futureGames.filter(g => g.status === 'scheduled');
        upcomingResults.push(...scheduledGames);
      }
      setUpcomingGames(upcomingResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load games on focus
  useFocusEffect(
    useCallback(() => {
      loadGames();
      
      // Auto-refresh every 30 seconds for live games
      const interval = setInterval(() => {
        loadGames(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadGames(false);
  };

  const handleFilterChange = (filter) => {
    Haptics.selectionAsync();
    setActiveFilter(filter);
  };

  const filteredGames = (() => {
    switch (activeFilter) {
      case 'recent':
        return recentGames;
      case 'live':
        return todayGames.filter((g) => g.status === 'live');
      case 'upcoming':
        return upcomingGames;
      default:
        return recentGames;
    }
  })();

  const filterCounts = {
    recent: recentGames.length,
    live: todayGames.filter((g) => g.status === 'live').length,
    upcoming: upcomingGames.length,
  };

  const filtersWithCounts = FILTERS.map((f) => ({
    ...f,
    count: filterCounts[f.key],
  }));

  const handleGamePress = (game) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('GameDetail', { game });
  };

  const renderGame = ({ item }) => (
    <GameCard game={item} onPress={() => handleGamePress(item)} />
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="🏀"
        title="No games"
        subtitle="Check back later or select a different filter"
      />
    );
  };

  const renderHeader = () => (
    <FilterPills
      filters={filtersWithCounts}
      activeFilter={activeFilter}
      onFilterChange={handleFilterChange}
    />
  );

  if (loading && todayGames.length === 0 && recentGames.length === 0 && upcomingGames.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Games</Text>
        </View>
        {renderHeader()}
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <GameCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (error && todayGames.length === 0 && recentGames.length === 0 && upcomingGames.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Games</Text>
        </View>
        <EmptyState
          icon="⚠️"
          title="Unable to load games"
          subtitle={error}
          action={
            <TouchableOpacity style={styles.retryButton} onPress={() => loadGames()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Games</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <FlatList
        data={filteredGames}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondary}
            colors={[colors.secondary]}
          />
        }
      />
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
  dateText: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xxl,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  retryButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: 8,
    marginTop: spacing.m,
  },
  retryButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
});

export default GamesScreen;
