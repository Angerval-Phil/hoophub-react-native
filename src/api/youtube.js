// YouTube Data API Client for HoopHub Reels
// Fetches NBA highlights from YouTube

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// YouTube API Configuration
// IMPORTANT: Replace with your own API key from Google Cloud Console
// 1. Go to https://console.cloud.google.com
// 2. Create a project and enable "YouTube Data API v3"
// 3. Create an API key and paste it below
const YOUTUBE_API_KEY = 'AIzaSyD4QJ99rv4xK6_KNF2w89fuL6-pnVcwfvk';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// NBA Official Channel - Uploads playlist (derived from channel ID by replacing UC with UU)
// Channel ID: UCWJ2lWNubArHWmf3FIHbfcQ -> Uploads Playlist: UUWJ2lWNubArHWmf3FIHbfcQ
const NBA_UPLOADS_PLAYLIST = 'UUWJ2lWNubArHWmf3FIHbfcQ';

const youtubeApi = axios.create({
  baseURL: YOUTUBE_API_BASE,
  timeout: 10000,
});

const CACHE_KEY = 'youtube_reels_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Fetch NBA highlights from official playlist (quota efficient: 1 unit per call)
export const fetchNBAHighlights = async (pageToken = null, forceRefresh = false) => {
  try {
    // Check cache first (only for first page)
    if (!forceRefresh && !pageToken) {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    }

    // Fetch playlist items
    const response = await youtubeApi.get('/playlistItems', {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet,contentDetails',
        playlistId: NBA_UPLOADS_PLAYLIST,
        maxResults: 20,
        pageToken: pageToken,
      },
    });

    const videoIds = response.data.items
      .map(item => item.contentDetails.videoId)
      .join(',');

    // Get additional video details (duration, view count)
    const videoDetails = await youtubeApi.get('/videos', {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'contentDetails,statistics,snippet',
        id: videoIds,
      },
    });

    const reels = parseYouTubeVideos(response.data.items, videoDetails.data.items);

    // Filter for short-form content (under 5 minutes for highlights)
    const filteredReels = reels.filter(reel => reel.durationSeconds < 300);

    const result = {
      reels: filteredReels,
      nextPageToken: response.data.nextPageToken,
      hasMore: !!response.data.nextPageToken,
    };

    // Cache first page results
    if (!pageToken) {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        data: result,
        timestamp: Date.now(),
      }));
    }

    return result;
  } catch (error) {
    console.error('Error fetching YouTube highlights:', error);

    // Log specific error details for debugging
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data?.error?.message);
    }

    throw error;
  }
};

// Parse YouTube API response into reel format
const parseYouTubeVideos = (playlistItems, videoDetails) => {
  const detailsMap = {};
  videoDetails.forEach(video => {
    detailsMap[video.id] = video;
  });

  return playlistItems.map(item => {
    const videoId = item.contentDetails.videoId;
    const details = detailsMap[videoId] || {};

    return {
      id: videoId,
      videoId: videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.maxres?.url ||
                 item.snippet.thumbnails?.high?.url ||
                 item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: details.contentDetails?.duration || 'PT0M0S',
      durationSeconds: parseDuration(details.contentDetails?.duration),
      viewCount: details.statistics?.viewCount || '0',
      likeCount: details.statistics?.likeCount || '0',
    };
  });
};

// Parse ISO 8601 duration to seconds (e.g., "PT1M30S" -> 90)
const parseDuration = (duration) => {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
};

// Format duration for display (e.g., 90 -> "1:30")
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format view count (e.g., 1234567 -> "1.2M views")
export const formatViewCount = (count) => {
  const num = parseInt(count, 10);
  if (isNaN(num)) return '0 views';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
};

export default {
  fetchNBAHighlights,
  formatDuration,
  formatViewCount,
};
