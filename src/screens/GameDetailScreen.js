// Game Detail Screen - Shows box score and game details

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius, getTeamColor } from '../theme';
import { TeamLogo, LiveIndicator, StatBlock } from '../components';
import { fetchBoxScore } from '../api';

const GameDetailScreen = ({ route }) => {
  const { game } = route.params;
  const [boxScore, setBoxScore] = useState(null);
  const [loadingBoxScore, setLoadingBoxScore] = useState(false);
  const [activeTeamTab, setActiveTeamTab] = useState('away');

  const isLive = game.status === 'live';
  const isFinal = game.status === 'final';
  const homeWon = isFinal && game.homeTeam.score > game.awayTeam.score;
  const awayWon = isFinal && game.awayTeam.score > game.homeTeam.score;

  const homeColor = getTeamColor(game.homeTeam.abbreviation);
  const awayColor = getTeamColor(game.awayTeam.abbreviation);

  useEffect(() => {
    if (isFinal || isLive) {
      loadBoxScore();
    }
  }, [game.id]);

  const loadBoxScore = async () => {
    setLoadingBoxScore(true);
    try {
      const data = await fetchBoxScore(game.id);
      setBoxScore(data);
    } catch (err) {
      console.error('Error loading box score:', err);
    } finally {
      setLoadingBoxScore(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Score Header */}
      <View style={styles.scoreHeader}>
        {/* Away Team */}
        <View style={styles.teamColumn}>
          <TeamLogo
            uri={game.awayTeam.logo}
            abbreviation={game.awayTeam.abbreviation}
            size={70}
          />
          <Text style={styles.teamName}>{game.awayTeam.abbreviation}</Text>
          <Text style={[styles.score, awayWon && styles.winnerScore]}>
            {game.awayTeam.score}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusColumn}>
          {isLive && <LiveIndicator />}
          <Text style={[styles.statusText, isLive && styles.liveStatusText]}>
            {game.statusDetail}
          </Text>
          {isLive && game.clock && (
            <Text style={styles.clockText}>{game.clock}</Text>
          )}
        </View>

        {/* Home Team */}
        <View style={styles.teamColumn}>
          <TeamLogo
            uri={game.homeTeam.logo}
            abbreviation={game.homeTeam.abbreviation}
            size={70}
          />
          <Text style={styles.teamName}>{game.homeTeam.abbreviation}</Text>
          <Text style={[styles.score, homeWon && styles.winnerScore]}>
            {game.homeTeam.score}
          </Text>
        </View>
      </View>

      {/* Game Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Info</Text>
        <View style={styles.infoCard}>
          {game.venue && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Venue</Text>
              <Text style={styles.infoValue}>{game.venue}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Date</Text>
            <Text style={styles.infoValue}>
              {new Date(game.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕐 Time</Text>
            <Text style={styles.infoValue}>
              {new Date(game.date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Team Comparison */}
      {(isFinal || isLive) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Comparison</Text>
          
          <View style={styles.comparisonCard}>
            {/* Header */}
            <View style={styles.comparisonHeader}>
              <View style={[styles.teamBadge, { backgroundColor: awayColor.primary }]}>
                <Text style={styles.teamBadgeText}>{game.awayTeam.abbreviation}</Text>
              </View>
              <Text style={styles.comparisonLabel}>STAT</Text>
              <View style={[styles.teamBadge, { backgroundColor: homeColor.primary }]}>
                <Text style={styles.teamBadgeText}>{game.homeTeam.abbreviation}</Text>
              </View>
            </View>

            {/* Stats Rows */}
            <ComparisonRow
              away={game.awayTeam.score}
              label="Points"
              home={game.homeTeam.score}
            />
            {/* Add more stats here when available */}
          </View>
        </View>
      )}

      {/* Box Score */}
      {(isFinal || isLive) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Box Score</Text>

          {loadingBoxScore ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.secondary} />
            </View>
          ) : boxScore ? (
            <View style={styles.boxScoreCard}>
              {/* Team Tabs */}
              <View style={styles.teamTabs}>
                <TouchableOpacity
                  style={[
                    styles.teamTab,
                    activeTeamTab === 'away' && styles.activeTeamTab,
                    activeTeamTab === 'away' && { borderBottomColor: awayColor.primary },
                  ]}
                  onPress={() => setActiveTeamTab('away')}
                >
                  <Text
                    style={[
                      styles.teamTabText,
                      activeTeamTab === 'away' && styles.activeTeamTabText,
                    ]}
                  >
                    {game.awayTeam.abbreviation}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.teamTab,
                    activeTeamTab === 'home' && styles.activeTeamTab,
                    activeTeamTab === 'home' && { borderBottomColor: homeColor.primary },
                  ]}
                  onPress={() => setActiveTeamTab('home')}
                >
                  <Text
                    style={[
                      styles.teamTabText,
                      activeTeamTab === 'home' && styles.activeTeamTabText,
                    ]}
                  >
                    {game.homeTeam.abbreviation}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Stats Header */}
              <View style={styles.statsHeader}>
                <Text style={[styles.statsHeaderCell, styles.playerCell]}>Player</Text>
                <Text style={styles.statsHeaderCell}>MIN</Text>
                <Text style={styles.statsHeaderCell}>PTS</Text>
                <Text style={styles.statsHeaderCell}>REB</Text>
                <Text style={styles.statsHeaderCell}>AST</Text>
              </View>

              {/* Player Rows */}
              {(activeTeamTab === 'away' ? boxScore.awayTeam : boxScore.homeTeam)?.players
                .filter((p) => !p.didNotPlay)
                .map((player, index) => (
                  <View
                    key={player.id || index}
                    style={[
                      styles.playerRow,
                      player.starter && styles.starterRow,
                    ]}
                  >
                    <View style={styles.playerCell}>
                      <Text style={styles.playerName} numberOfLines={1}>
                        {player.shortName || player.name}
                      </Text>
                      <Text style={styles.playerPosition}>{player.position}</Text>
                    </View>
                    <Text style={styles.statCell}>{player.stats.MIN || '-'}</Text>
                    <Text style={[styles.statCell, styles.pointsCell]}>
                      {player.stats.PTS || '0'}
                    </Text>
                    <Text style={styles.statCell}>{player.stats.REB || '0'}</Text>
                    <Text style={styles.statCell}>{player.stats.AST || '0'}</Text>
                  </View>
                ))}

              {/* DNP Players */}
              {(activeTeamTab === 'away' ? boxScore.awayTeam : boxScore.homeTeam)?.players
                .filter((p) => p.didNotPlay).length > 0 && (
                <View style={styles.dnpSection}>
                  <Text style={styles.dnpTitle}>Did Not Play</Text>
                  {(activeTeamTab === 'away' ? boxScore.awayTeam : boxScore.homeTeam)?.players
                    .filter((p) => p.didNotPlay)
                    .map((player, index) => (
                      <Text key={player.id || index} style={styles.dnpPlayer}>
                        {player.name} {player.reason ? `(${player.reason})` : ''}
                      </Text>
                    ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>📊</Text>
              <Text style={styles.placeholderTitle}>Box Score Unavailable</Text>
              <Text style={styles.placeholderSubtitle}>
                Stats not available for this game
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
};

// Comparison Row Component
const ComparisonRow = ({ away, label, home }) => {
  const awayWins = away > home;
  const homeWins = home > away;
  
  return (
    <View style={styles.comparisonRow}>
      <Text style={[styles.comparisonValue, awayWins && styles.winningValue]}>
        {away}
      </Text>
      <Text style={styles.comparisonStatLabel}>{label}</Text>
      <Text style={[styles.comparisonValue, homeWins && styles.winningValue]}>
        {home}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.m,
    padding: spacing.l,
    borderRadius: borderRadius.l,
  },
  teamColumn: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: spacing.s,
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  winnerScore: {
    color: colors.secondary,
  },
  statusColumn: {
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  statusText: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  liveStatusText: {
    color: colors.live,
    fontWeight: '600',
  },
  clockText: {
    ...typography.title3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.subhead,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.m,
  },
  comparisonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    overflow: 'hidden',
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.m,
  },
  teamBadge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.s,
  },
  teamBadgeText: {
    ...typography.caption1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  comparisonLabel: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  comparisonValue: {
    ...typography.headline,
    color: colors.textPrimary,
    width: 60,
    textAlign: 'center',
  },
  winningValue: {
    color: colors.secondary,
  },
  comparisonStatLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  placeholderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.xl,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    marginBottom: spacing.m,
  },
  placeholderTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  placeholderSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.xl,
    alignItems: 'center',
  },
  boxScoreCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    overflow: 'hidden',
  },
  teamTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
  },
  teamTab: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTeamTab: {
    backgroundColor: colors.surface,
  },
  teamTabText: {
    ...typography.headline,
    color: colors.textSecondary,
  },
  activeTeamTabText: {
    color: colors.textPrimary,
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsHeaderCell: {
    ...typography.caption2,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 40,
    textAlign: 'center',
  },
  playerCell: {
    flex: 1,
    minWidth: 100,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  starterRow: {
    backgroundColor: colors.surfaceElevated,
  },
  playerName: {
    ...typography.subhead,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  playerPosition: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  statCell: {
    ...typography.subhead,
    color: colors.textPrimary,
    width: 40,
    textAlign: 'center',
  },
  pointsCell: {
    fontWeight: '600',
    color: colors.secondary,
  },
  dnpSection: {
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dnpTitle: {
    ...typography.caption1,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dnpPlayer: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginTop: 2,
  },
});

export default GameDetailScreen;
