// Reusable UI Components for HoopHub

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, getTeamColor } from '../theme';

// ===========================================
// Game Card Component
// ===========================================

export const GameCard = ({ game, onPress }) => {
  const isLive = game.status === 'live';
  const isFinal = game.status === 'final';
  const isScheduled = game.status === 'scheduled';

  const homeWon = isFinal && game.homeTeam.score > game.awayTeam.score;
  const awayWon = isFinal && game.awayTeam.score > game.homeTeam.score;

  // Format date for display
  const gameDate = new Date(game.date);
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Status Bar */}
      <View style={styles.gameStatusBar}>
        <View style={styles.statusLeft}>
          {isLive && <LiveIndicator />}
          <Text style={[styles.statusText, isLive && styles.liveText]}>
            {isFinal ? `${formattedDate} • ${game.statusDetail}` : game.statusDetail}
          </Text>
        </View>
        {isScheduled && (
          <Text style={styles.dateText}>{formattedDate}</Text>
        )}
      </View>
      
      {/* Teams & Scores */}
      <View style={styles.teamsContainer}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <TeamLogo uri={game.awayTeam.logo} abbreviation={game.awayTeam.abbreviation} />
          <View style={styles.teamInfo}>
            <Text style={styles.teamAbbr}>{game.awayTeam.abbreviation}</Text>
            {game.status !== 'scheduled' ? (
              <Text style={[styles.scoreText, awayWon && styles.winnerScore]}>
                {game.awayTeam.score}
              </Text>
            ) : (
              <Text style={styles.gameTime}>
                {new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </View>
        
        {/* Divider */}
        <View style={styles.divider}>
          <Text style={styles.dividerText}>
            {game.status === 'scheduled' ? 'vs' : '-'}
          </Text>
        </View>
        
        {/* Home Team */}
        <View style={[styles.teamSection, styles.teamSectionRight]}>
          <View style={[styles.teamInfo, styles.teamInfoRight]}>
            <Text style={styles.teamAbbr}>{game.homeTeam.abbreviation}</Text>
            {game.status !== 'scheduled' ? (
              <Text style={[styles.scoreText, homeWon && styles.winnerScore]}>
                {game.homeTeam.score}
              </Text>
            ) : null}
          </View>
          <TeamLogo uri={game.homeTeam.logo} abbreviation={game.homeTeam.abbreviation} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ===========================================
// Team Logo Component
// ===========================================

export const TeamLogo = ({ uri, abbreviation, size = 50 }) => {
  const teamColor = getTeamColor(abbreviation);
  
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.teamLogo, { width: size, height: size }]}
        resizeMode="contain"
      />
    );
  }
  
  return (
    <View
      style={[
        styles.teamLogoPlaceholder,
        { width: size, height: size, backgroundColor: teamColor.primary },
      ]}
    >
      <Text style={styles.teamLogoText}>{abbreviation?.charAt(0)}</Text>
    </View>
  );
};

// ===========================================
// Live Indicator Component
// ===========================================

export const LiveIndicator = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  
  return (
    <View style={styles.liveIndicator}>
      <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
      <Text style={styles.liveLabel}>LIVE</Text>
    </View>
  );
};

// ===========================================
// Player Card Component
// ===========================================

export const PlayerCard = ({ player, onPress }) => {
  const teamColor = getTeamColor(player.team?.abbreviation);
  
  return (
    <TouchableOpacity
      style={styles.playerCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.playerImageContainer, { borderColor: teamColor.primary }]}>
        <Image
          source={{ uri: `https://cdn.nba.com/headshots/nba/latest/260x190/${player.id}.png` }}
          style={styles.playerImage}
          defaultSource={require('../../assets/player-placeholder.png')}
        />
      </View>
      
      <Text style={styles.playerName} numberOfLines={1}>
        {player.fullName}
      </Text>
      
      <View style={styles.playerMeta}>
        {player.team && (
          <Text style={[styles.playerTeam, { color: teamColor.primary }]}>
            {player.team.abbreviation}
          </Text>
        )}
        <Text style={styles.playerPosition}> • {player.position}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ===========================================
// News Card Component
// ===========================================

export const NewsCard = ({ article, onPress, featured = false }) => {
  if (featured) {
    return (
      <TouchableOpacity
        style={styles.featuredNewsCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {article.imageUrl && (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.featuredGradient}
        >
          <Text style={styles.featuredHeadline} numberOfLines={3}>
            {article.headline}
          </Text>
          <View style={styles.newsMeta}>
            <Text style={styles.newsSource}>{article.source}</Text>
            <Text style={styles.newsTime}>{article.timeAgo}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {article.imageUrl && (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.newsThumbnail}
          resizeMode="cover"
        />
      )}
      <View style={styles.newsContent}>
        <Text style={styles.newsHeadline} numberOfLines={2}>
          {article.headline}
        </Text>
        <View style={styles.newsMeta}>
          <Text style={styles.newsSource}>{article.source}</Text>
          <Text style={styles.newsTime}>{article.timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ===========================================
// Filter Pills Component
// ===========================================

export const FilterPills = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterPill,
            activeFilter === filter.key && styles.filterPillActive,
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text
            style={[
              styles.filterPillText,
              activeFilter === filter.key && styles.filterPillTextActive,
            ]}
          >
            {filter.label}
          </Text>
          {filter.count > 0 && (
            <View
              style={[
                styles.filterBadge,
                activeFilter === filter.key && styles.filterBadgeActive,
              ]}
            >
              <Text style={styles.filterBadgeText}>{filter.count}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ===========================================
// Loading Skeleton Component
// ===========================================

export const Skeleton = ({ width, height, borderRadius: radius = borderRadius.s }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);
  
  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });
  
  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
      ]}
    />
  );
};

export const GameCardSkeleton = () => (
  <View style={styles.gameCard}>
    <View style={styles.gameStatusBar}>
      <Skeleton width={60} height={14} />
    </View>
    <View style={styles.teamsContainer}>
      <View style={styles.teamSection}>
        <Skeleton width={50} height={50} borderRadius={25} />
        <View style={{ marginLeft: spacing.m }}>
          <Skeleton width={40} height={16} />
          <Skeleton width={30} height={24} style={{ marginTop: spacing.xs }} />
        </View>
      </View>
      <View style={[styles.teamSection, styles.teamSectionRight]}>
        <View style={{ marginRight: spacing.m, alignItems: 'flex-end' }}>
          <Skeleton width={40} height={16} />
          <Skeleton width={30} height={24} style={{ marginTop: spacing.xs }} />
        </View>
        <Skeleton width={50} height={50} borderRadius={25} />
      </View>
    </View>
  </View>
);

export const PlayerCardSkeleton = () => (
  <View style={styles.playerCard}>
    <Skeleton width={80} height={80} borderRadius={40} />
    <Skeleton width={100} height={16} style={{ marginTop: spacing.s }} />
    <Skeleton width={60} height={12} style={{ marginTop: spacing.xs }} />
  </View>
);

// ===========================================
// Stat Block Component
// ===========================================

export const StatBlock = ({ value, label, highlight = false }) => (
  <View style={[styles.statBlock, highlight && styles.statBlockHighlight]}>
    <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ===========================================
// Empty State Component
// ===========================================

export const EmptyState = ({ icon, title, subtitle, action }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {action}
  </View>
);

// ===========================================
// Loading View Component
// ===========================================

export const LoadingView = ({ message = 'Loading...' }) => (
  <View style={styles.loadingView}>
    <ActivityIndicator size="large" color={colors.secondary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// ===========================================
// Styles
// ===========================================

const styles = StyleSheet.create({
  // Game Card
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    overflow: 'hidden',
    marginBottom: spacing.m,
  },
  gameStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  liveText: {
    color: colors.live,
  },
  venueText: {
    ...typography.caption2,
    color: colors.textTertiary,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.m,
  },
  dateText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
  },
  teamSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamSectionRight: {
    justifyContent: 'flex-end',
  },
  teamInfo: {
    marginLeft: spacing.m,
  },
  teamInfoRight: {
    marginLeft: 0,
    marginRight: spacing.m,
    alignItems: 'flex-end',
  },
  teamAbbr: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  winnerScore: {
    color: colors.secondary,
  },
  gameTime: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  divider: {
    paddingHorizontal: spacing.m,
  },
  dividerText: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  teamLogo: {
    width: 50,
    height: 50,
  },
  teamLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  
  // Live Indicator
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
    marginRight: 4,
  },
  liveLabel: {
    ...typography.caption2,
    fontWeight: '700',
    color: colors.live,
  },
  
  // Player Card
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    alignItems: 'center',
    flex: 1,
    margin: spacing.xs,
  },
  playerImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  playerName: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  playerTeam: {
    ...typography.caption1,
    fontWeight: '600',
  },
  playerPosition: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  
  // News Card
  featuredNewsCard: {
    height: 220,
    borderRadius: borderRadius.l,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.m,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.m,
  },
  featuredHeadline: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    overflow: 'hidden',
    marginBottom: spacing.m,
  },
  newsThumbnail: {
    width: 100,
    height: 80,
  },
  newsContent: {
    flex: 1,
    padding: spacing.s,
    justifyContent: 'space-between',
  },
  newsHeadline: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    ...typography.caption2,
    fontWeight: '600',
    color: colors.secondary,
    marginRight: spacing.s,
  },
  newsTime: {
    ...typography.caption2,
    color: colors.textTertiary,
  },
  
  // Filter Pills
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.full,
    marginRight: spacing.s,
  },
  filterPillActive: {
    backgroundColor: colors.secondary,
  },
  filterPillText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: 4,
  },
  filterBadgeActive: {
    backgroundColor: colors.background,
  },
  filterBadgeText: {
    ...typography.caption2,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  
  // Skeleton
  skeleton: {
    backgroundColor: colors.surfaceElevated,
  },
  
  // Stat Block
  statBlock: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.s,
    padding: spacing.m,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statBlockHighlight: {
    backgroundColor: colors.secondary + '20',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statValueHighlight: {
    color: colors.secondary,
  },
  statLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 4,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: spacing.m,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.s,
  },
  
  // Loading View
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.m,
  },
});

// Video Components
export { default as VideoPlayer } from './VideoPlayer';
export { default as ReelCard } from './ReelCard';

export default {
  GameCard,
  TeamLogo,
  LiveIndicator,
  PlayerCard,
  NewsCard,
  FilterPills,
  Skeleton,
  GameCardSkeleton,
  PlayerCardSkeleton,
  StatBlock,
  EmptyState,
  LoadingView,
};
