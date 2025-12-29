// News Screen - NBA news feed

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { fetchNews, formatTimeAgo } from '../api';
import { NewsCard, EmptyState } from '../components';

// Skeleton components
const FeaturedSkeleton = () => (
  <View style={styles.featuredSkeleton}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonContent}>
      <View style={[styles.skeletonLine, { width: '90%' }]} />
      <View style={[styles.skeletonLine, { width: '70%' }]} />
      <View style={[styles.skeletonLine, { width: '40%' }]} />
    </View>
  </View>
);

const NewsSkeleton = () => (
  <View style={styles.newsSkeleton}>
    <View style={styles.skeletonThumb} />
    <View style={styles.skeletonNewsContent}>
      <View style={[styles.skeletonLine, { width: '100%' }]} />
      <View style={[styles.skeletonLine, { width: '80%' }]} />
      <View style={[styles.skeletonLine, { width: '30%' }]} />
    </View>
  </View>
);

const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadNews = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      const data = await fetchNews();
      // Add timeAgo to each article
      const articlesWithTime = data.map((article) => ({
        ...article,
        timeAgo: formatTimeAgo(article.publishedAt),
      }));
      setArticles(articlesWithTime);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNews();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadNews(false);
  };

  const handleArticlePress = async (article) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (article.url) {
      await WebBrowser.openBrowserAsync(article.url, {
        controlsColor: colors.secondary,
        toolbarColor: colors.background,
      });
    }
  };

  const renderArticle = ({ item, index }) => {
    // First article is featured
    if (index === 0) {
      return (
        <NewsCard
          article={item}
          featured
          onPress={() => handleArticlePress(item)}
        />
      );
    }
    
    return (
      <NewsCard
        article={item}
        onPress={() => handleArticlePress(item)}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="📰"
        title="No news available"
        subtitle="Check back later for the latest NBA news"
      />
    );
  };

  if (loading && articles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>News</Text>
        </View>
        <View style={styles.skeletonContainer}>
          <FeaturedSkeleton />
          {[1, 2, 3, 4].map((i) => (
            <NewsSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (error && articles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>News</Text>
        </View>
        <EmptyState
          icon="⚠️"
          title="Unable to load news"
          subtitle={error}
          action={
            <TouchableOpacity style={styles.retryButton} onPress={() => loadNews()}>
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
        <Text style={styles.title}>News</Text>
      </View>

      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  listContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xxl,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.m,
  },
  featuredSkeleton: {
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 140,
    backgroundColor: colors.surfaceElevated,
  },
  skeletonContent: {
    padding: spacing.m,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  newsSkeleton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  skeletonThumb: {
    width: 100,
    height: 80,
    backgroundColor: colors.surfaceElevated,
  },
  skeletonNewsContent: {
    flex: 1,
    padding: spacing.s,
    justifyContent: 'center',
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

export default NewsScreen;
