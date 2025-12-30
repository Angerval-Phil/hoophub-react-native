// ReelCard - Full-screen video reel with overlay UI
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import VideoPlayer from './VideoPlayer';
import { colors, spacing, typography } from '../theme';
import { formatViewCount, formatDuration } from '../api/youtube';

const ReelCard = ({
  reel,
  isActive,
  onLike,
  onShare,
  onChannelPress,
  onVideoEnd,
  cardHeight,
  cardWidth,
}) => {
  // Use dynamic dimensions for all screen sizes
  const { width: screenWidth } = useWindowDimensions();
  const actualWidth = cardWidth || screenWidth;
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const playIconOpacity = useRef(new Animated.Value(0)).current;
  const playerRef = useRef(null);

  // Reset state when reel changes
  useEffect(() => {
    setIsPaused(false);
    setShowPlayIcon(false);
  }, [reel.id]);

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(!isPaused);

    // Show play/pause icon briefly
    setShowPlayIcon(true);
    Animated.sequence([
      Animated.timing(playIconOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(playIconOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowPlayIcon(false));
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLiked(!isLiked);
    onLike?.(reel);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare?.(reel);
  };

  const handleMuteToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  return (
    <View style={[styles.container, { height: cardHeight, width: actualWidth }]}>
      {/* Video Player */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.videoContainer}>
          {isActive ? (
            <VideoPlayer
              ref={playerRef}
              videoId={reel.videoId}
              isActive={isActive && !isPaused}
              muted={isMuted}
              onVideoEnd={onVideoEnd}
              playerHeight={cardHeight}
              playerWidth={actualWidth}
            />
          ) : (
            // Show thumbnail when not active (performance optimization)
            <Image
              source={{ uri: reel.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}

          {/* Play/Pause overlay icon */}
          {showPlayIcon && (
            <Animated.View style={[styles.playIconContainer, { opacity: playIconOpacity }]}>
              <View style={styles.playIconBackground}>
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={50}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Bottom Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
        pointerEvents="box-none"
      >
        {/* Video Info */}
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.channelRow}
            onPress={() => onChannelPress?.(reel)}
            activeOpacity={0.7}
          >
            <View style={styles.channelAvatar}>
              <Ionicons name="basketball" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.channelName} numberOfLines={1}>
              {reel.channelTitle}
            </Text>
          </TouchableOpacity>

          <Text style={styles.title} numberOfLines={2}>
            {reel.title}
          </Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {formatViewCount(reel.viewCount)}
            </Text>
            <Text style={styles.statsDot}>  </Text>
            <Text style={styles.statsText}>
              {formatDuration(reel.durationSeconds)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Right Side Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleMuteToggle} activeOpacity={0.7}>
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={28}
            color={colors.textPrimary}
          />
          <Text style={styles.actionText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={32}
            color={isLiked ? colors.accent : colors.textPrimary}
          />
          <Text style={styles.actionText}>
            {formatLikeCount(reel.likeCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={32} color={colors.textPrimary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={28} color={colors.textPrimary} />
          <Text style={styles.actionText}>Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Format like count for display (e.g., 50000 -> "50K")
const formatLikeCount = (count) => {
  const num = parseInt(count, 10);
  if (isNaN(num)) return '0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return `${num}`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBackground: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: spacing.m,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    justifyContent: 'flex-end',
    paddingBottom: spacing.l,
    paddingLeft: spacing.m,
    paddingRight: 80, // Leave room for action buttons
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  channelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  channelName: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  statsDot: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  actionsContainer: {
    position: 'absolute',
    right: spacing.m,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  actionText: {
    ...typography.caption1,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});

export default ReelCard;
