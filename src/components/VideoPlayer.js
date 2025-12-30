// VideoPlayer - YouTube iframe wrapper with autoplay control
import React, { useCallback, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { colors } from '../theme';

const VideoPlayer = forwardRef(({
  videoId,
  isActive,
  onReady,
  onError,
  onStateChange,
  onVideoEnd,
  muted = true,
  playerHeight,
  playerWidth,
}, ref) => {
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Use dynamic dimensions for all screen sizes (iPhone SE, etc.)
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const height = playerHeight || screenHeight;
  const width = playerWidth || screenWidth;

  // Expose play/pause methods to parent
  useImperativeHandle(ref, () => ({
    play: () => {
      playerRef.current?.seekTo(0, true);
    },
    pause: () => {
      // Player will auto-pause when isActive becomes false
    },
  }));

  const handleReady = useCallback(() => {
    setLoading(false);
    onReady?.();
  }, [onReady]);

  const handleStateChange = useCallback((state) => {
    onStateChange?.(state);
    if (state === 'ended') {
      onVideoEnd?.();
    }
  }, [onStateChange, onVideoEnd]);

  const handleError = useCallback((error) => {
    setLoading(false);
    console.error('YouTube Player Error:', error);
    onError?.(error);
  }, [onError]);

  return (
    <View style={[styles.container, { width, height }]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      )}
      <YoutubePlayer
        ref={playerRef}
        height={height}
        width={width}
        play={isActive}
        mute={muted}
        videoId={videoId}
        onReady={handleReady}
        onChangeState={handleStateChange}
        onError={handleError}
        webViewStyle={{ width, height, opacity: 0.99 }}
        webViewProps={{
          injectedJavaScript: `
            var element = document.getElementsByClassName('container')[0];
            if (element) {
              element.style.position = 'unset';
              element.style.backgroundColor = 'black';
            }
            true;
          `,
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
          scrollEnabled: false,
          bounces: false,
          javaScriptEnabled: true,
          domStorageEnabled: true,
          allowsFullscreenVideo: false,
          originWhitelist: ['*'],
        }}
        initialPlayerParams={{
          loop: false,
          controls: true,
          modestbranding: true,
          rel: false,
          showClosedCaptions: false,
          preventFullScreen: false,
          iv_load_policy: 3,
          playsinline: 1,
        }}
        forceAndroidAutoplay={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default VideoPlayer;
