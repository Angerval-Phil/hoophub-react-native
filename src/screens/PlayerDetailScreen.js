// Player Detail Screen - Shows player bio and stats

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius, getTeamColor } from '../theme';
import { fetchPlayerStatsByName } from '../api';
import { StatBlock } from '../components';

const PlayerDetailScreen = ({ route }) => {
  const { player } = route.params;
  const [seasonStats, setSeasonStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teamColor = getTeamColor(player.team?.abbreviation);

  useEffect(() => {
    loadStats();
  }, [player.id]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use RapidAPI NBA to fetch stats by player name
      const stats = await fetchPlayerStatsByName(player.firstName, player.lastName);
      setSeasonStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatStat = (value, decimals = 1) => {
    if (value === null || value === undefined) return 'N/A';
    return Number(value).toFixed(decimals);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    // RapidAPI returns percentages already formatted (e.g., "45.0")
    return `${value}%`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Player Header */}
      <View style={styles.header}>
        <View style={[styles.imageContainer, { borderColor: teamColor.primary }]}>
          <Image
            source={{
              uri: seasonStats?.espnPlayerId
                ? `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${seasonStats.espnPlayerId}.png&w=350&h=254`
                : `https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png`,
            }}
            style={styles.playerImage}
            defaultSource={require('../../assets/player-placeholder.png')}
          />
        </View>

        <Text style={styles.playerName}>{player.fullName}</Text>
        
        {player.team && (
          <Text style={[styles.teamName, { color: teamColor.primary }]}>
            {player.team.name}
          </Text>
        )}

        <View style={styles.metaRow}>
          {player.jerseyNumber && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Jersey</Text>
              <Text style={styles.metaValue}>#{player.jerseyNumber}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Position</Text>
            <Text style={styles.metaValue}>{player.position}</Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <View style={styles.bioCard}>
          <View style={styles.bioGrid}>
            <BioItem label="Height" value={player.height || 'N/A'} />
            <BioItem label="Weight" value={player.weight ? `${player.weight} lbs` : 'N/A'} />
            <BioItem label="Country" value={player.country || 'N/A'} />
            <BioItem label="College" value={player.college || 'N/A'} />
          </View>
          
          {player.draftYear && (
            <View style={styles.draftInfo}>
              <Text style={styles.bioLabel}>Draft</Text>
              <Text style={styles.bioValue}>
                {player.draftYear} Round {player.draftRound}, Pick {player.draftNumber}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Season Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Season Averages
          {seasonStats && (
            <Text style={styles.seasonYear}> {seasonStats.season}-{seasonStats.season + 1}</Text>
          )}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
          </View>
        ) : seasonStats ? (
          <>
            {/* Main Stats */}
            <View style={styles.mainStats}>
              <StatBlock
                value={formatStat(seasonStats.points)}
                label="PPG"
                highlight
              />
              <StatBlock
                value={formatStat(seasonStats.rebounds)}
                label="RPG"
              />
              <StatBlock
                value={formatStat(seasonStats.assists)}
                label="APG"
              />
            </View>

            {/* Secondary Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <StatItem label="SPG" value={formatStat(seasonStats.steals)} />
                <StatItem label="BPG" value={formatStat(seasonStats.blocks)} />
                <StatItem label="GP" value={seasonStats.gamesPlayed} />
                <StatItem label="FG%" value={formatPercentage(seasonStats.fieldGoalPct)} />
                <StatItem label="3P%" value={formatPercentage(seasonStats.threePointPct)} />
                <StatItem label="FT%" value={formatPercentage(seasonStats.freeThrowPct)} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noStats}>
            <Text style={styles.noStatsIcon}>📊</Text>
            <Text style={styles.noStatsText}>No stats available</Text>
          </View>
        )}
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
};

// Bio Item Component
const BioItem = ({ label, value }) => (
  <View style={styles.bioItem}>
    <Text style={styles.bioLabel}>{label}</Text>
    <Text style={styles.bioValue}>{value}</Text>
  </View>
);

// Stat Item Component
const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statItemValue}>{value}</Text>
    <Text style={styles.statItemLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.m,
    padding: spacing.l,
    borderRadius: borderRadius.l,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  playerName: {
    ...typography.title2,
    color: colors.textPrimary,
    marginTop: spacing.m,
  },
  teamName: {
    ...typography.subhead,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.m,
  },
  metaItem: {
    alignItems: 'center',
    marginHorizontal: spacing.m,
  },
  metaLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  metaValue: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.m,
    marginTop: spacing.m,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  seasonYear: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  bioCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.m,
  },
  bioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bioItem: {
    width: '50%',
    paddingVertical: spacing.s,
  },
  bioLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  bioValue: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  draftInfo: {
    marginTop: spacing.s,
    paddingTop: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mainStats: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  statItemValue: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  statItemLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginTop: 2,
  },
  loadingContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.xl,
    alignItems: 'center',
  },
  noStats: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.xl,
    alignItems: 'center',
  },
  noStatsIcon: {
    fontSize: 40,
    marginBottom: spacing.s,
  },
  noStatsText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
});

export default PlayerDetailScreen;
