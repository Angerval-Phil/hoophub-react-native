// Reels Screen - TikTok-style vertical video feed
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../theme';
import { fetchNBAHighlights } from '../api/youtube';
import ReelCard from '../components/ReelCard';
import { EmptyState } from '../components';

const TAB_BAR_HEIGHT = 88; // Match AppNavigator tab bar height

const ReelsScreen = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(null);

  const flatListRef = useRef(null);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  // Use dynamic dimensions for different screen sizes (iPhone SE, etc.)
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const viewableHeight = windowHeight - TAB_BAR_HEIGHT;

  const loadReels = async (refresh = false) => {
    if (refresh) {
      setLoading(true);
      setNextPageToken(null);
    }
    setError(null);

    try {
      const data = await fetchNBAHighlights(refresh ? null : nextPageToken, refresh);

      if (refresh) {
        setReels(data.reels);
      } else {
        setReels(prev => [...prev, ...data.reels]);
      }

      setNextPageToken(data.nextPageToken);
    } catch (err) {
      setError(err.message || 'Failed to load highlights');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load reels when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (reels.length === 0) {
        loadReels(true);
      }
    }, [])
  );

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadReels(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && nextPageToken) {
      setLoadingMore(true);
      loadReels(false);
    }
  };

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== undefined) {
        setCurrentIndex(newIndex);
        Haptics.selectionAsync();
      }
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 100,
  }).current;

  const handleShare = async (reel) => {
    try {
      await Share.share({
        message: `Check out this NBA highlight: ${reel.title}\nhttps://www.youtube.com/watch?v=${reel.videoId}`,
        title: reel.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleLike = (reel) => {
    // Could persist to AsyncStorage or backend
    console.log('Liked:', reel.id);
  };

  const scrollToNextVideo = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < reels.length && flatListRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      flatListRef.current.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }
  }, [currentIndex, reels.length]);

  const renderReel = ({ item, index }) => (
    <ReelCard
      reel={item}
      isActive={isFocused && index === currentIndex}
      onLike={handleLike}
      onShare={handleShare}
      onVideoEnd={scrollToNextVideo}
      cardHeight={viewableHeight}
      cardWidth={windowWidth}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  };

  const getItemLayout = useCallback((data, index) => ({
    length: viewableHeight,
    offset: viewableHeight * index,
    index,
  }), [viewableHeight]);

  if (loading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Loading highlights...</Text>
      </View>
    );
  }

  if (error && reels.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <EmptyState
          icon="🎬"
          title="Unable to load reels"
          subtitle={error}
          action={
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={viewableHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />

      {/* Header overlay for "Highlights" branding */}
      <View style={[styles.headerOverlay, { top: insets.top + spacing.s }]}>
        <Text style={styles.headerTitle}>Highlights</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.m,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingMore: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    left: spacing.m,
    zIndex: 10,
  },
  headerTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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

export default ReelsScreen;
