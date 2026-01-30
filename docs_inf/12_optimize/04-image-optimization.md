# 이미지 최적화

## 1. 이미지 캐싱 라이브러리

### 1.1 react-native-fast-image 설치

```bash
npm install react-native-fast-image
cd ios && pod install
```

### 1.2 기본 사용법

```typescript
import FastImage, { Priority, ResizeMode } from 'react-native-fast-image';
import React from 'react';
import { StyleSheet } from 'react-native';

interface ProfileImageProps {
  uri: string;
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: 40,
  medium: 80,
  large: 120,
};

export const ProfileImage: React.FC<ProfileImageProps> = ({
  uri,
  size = 'medium',
}) => {
  const dimension = SIZES[size];
  
  return (
    <FastImage
      style={[styles.image, { width: dimension, height: dimension }]}
      source={{
        uri,
        priority: Priority.normal,  // low | normal | high
        cache: 'immutable',         // immutable | web | cacheOnly
      }}
      resizeMode={ResizeMode.cover}
      fallback  // iOS에서 SDWebImage 대신 UIImage 사용
    />
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});
```

### 1.3 캐시 전략

```typescript
import FastImage from 'react-native-fast-image';

// 캐시 모드 옵션
const cacheStrategies = {
  // 불변 리소스 (프로필 이미지 등) - 영구 캐시
  immutable: FastImage.cacheControl.immutable,
  
  // 웹 표준 캐시 헤더 따름
  web: FastImage.cacheControl.web,
  
  // 캐시만 사용 (오프라인 모드)
  cacheOnly: FastImage.cacheControl.cacheOnly,
};

// 이미지 미리 로드 (prefetch)
export const preloadImages = (uris: string[]) => {
  const sources = uris.map(uri => ({
    uri,
    priority: FastImage.priority.normal,
  }));
  
  FastImage.preload(sources);
};

// 캐시 클리어
export const clearImageCache = async () => {
  await FastImage.clearMemoryCache();
  await FastImage.clearDiskCache();
};
```

---

## 2. 이미지 로딩 상태 처리

### 2.1 Placeholder & Error 처리

```typescript
import React, { useState, useCallback } from 'react';
import FastImage, { OnLoadEvent, OnProgressEvent } from 'react-native-fast-image';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OptimizedImageProps {
  uri: string;
  width: number;
  height: number;
  placeholder?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  width,
  height,
  placeholder,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoad = useCallback((e: OnLoadEvent) => {
    setIsLoading(false);
    // 이미지 실제 크기 확인 가능
    console.log('Image size:', e.nativeEvent.width, e.nativeEvent.height);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Icon name="broken-image" size={24} color="#999" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <FastImage
        style={[styles.image, { width, height }]}
        source={{ uri }}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {isLoading && (
        <View style={[styles.placeholder, { width, height }]}>
          {placeholder || <ActivityIndicator size="small" color="#007AFF" />}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  placeholder: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});
```

### 2.2 Progressive Loading (블러 → 선명)

```typescript
import React, { useState, useCallback } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';

interface ProgressiveImageProps {
  thumbnailUri: string;
  fullUri: string;
  width: number;
  height: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  thumbnailUri,
  fullUri,
  width,
  height,
}) => {
  const [thumbnailOpacity] = useState(new Animated.Value(1));
  const [fullImageLoaded, setFullImageLoaded] = useState(false);

  const handleFullImageLoad = useCallback(() => {
    setFullImageLoaded(true);
    Animated.timing(thumbnailOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [thumbnailOpacity]);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* 풀 이미지 */}
      <FastImage
        style={[styles.image, { width, height }]}
        source={{ uri: fullUri }}
        onLoad={handleFullImageLoad}
      />
      
      {/* 썸네일 (블러 처리) - 풀 이미지 로딩 전까지 표시 */}
      {!fullImageLoaded && (
        <Animated.View
          style={[
            styles.thumbnailContainer,
            { width, height, opacity: thumbnailOpacity },
          ]}
        >
          <Image
            source={{ uri: thumbnailUri }}
            style={[styles.image, { width, height }]}
            blurRadius={10}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
  },
  image: {
    position: 'absolute',
  },
  thumbnailContainer: {
    position: 'absolute',
  },
});
```

---

## 3. 이미지 크기 최적화

### 3.1 서버 사이드 리사이징 (CloudFront + Lambda@Edge)

```typescript
// 클라이언트에서 필요한 크기만 요청
const getOptimizedImageUrl = (
  originalUrl: string,
  width: number,
  quality = 80
): string => {
  // CloudFront URL 형식으로 변환
  // 예: https://cdn.bizone.com/images/profile/abc.jpg
  //  → https://cdn.bizone.com/images/profile/abc.jpg?w=200&q=80
  
  const url = new URL(originalUrl);
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', quality.toString());
  
  return url.toString();
};

// 디바이스 화면 밀도에 따른 최적 크기 계산
import { PixelRatio } from 'react-native';

const getResponsiveImageSize = (displayWidth: number): number => {
  const pixelRatio = PixelRatio.get();
  return Math.round(displayWidth * pixelRatio);
};

// 사용 예시
const ProfileImage: React.FC<{ uri: string }> = ({ uri }) => {
  const displaySize = 80;
  const actualSize = getResponsiveImageSize(displaySize);
  const optimizedUri = getOptimizedImageUrl(uri, actualSize);
  
  return (
    <FastImage
      source={{ uri: optimizedUri }}
      style={{ width: displaySize, height: displaySize }}
    />
  );
};
```

### 3.2 디바이스별 이미지 선택

```typescript
import { Dimensions, PixelRatio } from 'react-native';

type ImageVariant = 'small' | 'medium' | 'large' | 'original';

interface ImageSet {
  small: string;   // 100px
  medium: string;  // 300px
  large: string;   // 600px
  original: string;
}

const getOptimalImageVariant = (
  displayWidth: number
): ImageVariant => {
  const pixelWidth = displayWidth * PixelRatio.get();
  
  if (pixelWidth <= 150) return 'small';
  if (pixelWidth <= 450) return 'medium';
  if (pixelWidth <= 900) return 'large';
  return 'original';
};

export const ResponsiveImage: React.FC<{
  imageSet: ImageSet;
  width: number;
  height: number;
}> = ({ imageSet, width, height }) => {
  const variant = getOptimalImageVariant(width);
  const uri = imageSet[variant];
  
  return (
    <FastImage
      source={{ uri }}
      style={{ width, height }}
      resizeMode="cover"
    />
  );
};
```

---

## 4. 레이지 로딩

### 4.1 뷰포트 진입 시 로딩

```typescript
import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LazyImageProps {
  uri: string;
  width: number;
  height: number;
  threshold?: number;  // 뷰포트 진입 전 미리 로딩 시작할 거리
}

export const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  width,
  height,
  threshold = 100,
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<View>(null);

  // 뷰포트 내 위치 확인
  const checkVisibility = useCallback(() => {
    if (containerRef.current && !shouldLoad) {
      containerRef.current.measureInWindow((x, y, w, h) => {
        const isNearViewport = y < SCREEN_HEIGHT + threshold && y + h > -threshold;
        if (isNearViewport) {
          setShouldLoad(true);
        }
      });
    }
  }, [shouldLoad, threshold]);

  return (
    <View
      ref={containerRef}
      style={[styles.container, { width, height }]}
      onLayout={checkVisibility}
    >
      {shouldLoad ? (
        <FastImage
          source={{ uri }}
          style={{ width, height }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholder, { width, height }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    backgroundColor: '#e0e0e0',
  },
});
```

### 4.2 FlatList 내 이미지 최적화

```typescript
import { FlashList } from '@shopify/flash-list';
import FastImage from 'react-native-fast-image';
import React, { useCallback, useState } from 'react';

interface GalleryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
}

export const ImageGallery: React.FC<{ items: GalleryItem[] }> = ({ items }) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    // 화면에 보이는 이미지만 로드
    const visibleIds = viewableItems.map(item => item.item.id);
    setLoadedImages(prev => new Set([...prev, ...visibleIds]));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: GalleryItem }) => (
      <GalleryImage
        item={item}
        shouldLoadFull={loadedImages.has(item.id)}
      />
    ),
    [loadedImages]
  );

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      estimatedItemSize={200}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
    />
  );
};

const GalleryImage = React.memo<{
  item: GalleryItem;
  shouldLoadFull: boolean;
}>(({ item, shouldLoadFull }) => {
  const uri = shouldLoadFull ? item.imageUrl : item.thumbnailUrl;
  
  return (
    <FastImage
      source={{ uri }}
      style={styles.galleryImage}
      resizeMode="cover"
    />
  );
});
```

---

## 5. 메모리 관리

### 5.1 이미지 캐시 크기 제한

```typescript
// iOS: Info.plist에서 설정 또는 네이티브 코드
// Android: 자동으로 디스크 용량의 2% 사용

// 수동 캐시 관리
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_CLEARED_KEY = 'last_cache_cleared';
const CACHE_CLEAR_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7일

export const manageCacheSize = async () => {
  const lastCleared = await AsyncStorage.getItem(CACHE_CLEARED_KEY);
  const lastClearedTime = lastCleared ? parseInt(lastCleared, 10) : 0;
  
  if (Date.now() - lastClearedTime > CACHE_CLEAR_INTERVAL) {
    // 오래된 캐시 정리
    await FastImage.clearDiskCache();
    await AsyncStorage.setItem(CACHE_CLEARED_KEY, Date.now().toString());
    console.log('Image cache cleared');
  }
};

// 앱 시작 시 호출
manageCacheSize();
```

### 5.2 대용량 이미지 처리

```typescript
import { Image, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 이미지 크기 미리 확인
export const getImageDimensions = (uri: string): Promise<{
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject
    );
  });
};

// 최적의 표시 크기 계산
export const calculateOptimalSize = (
  imageWidth: number,
  imageHeight: number,
  maxWidth: number = SCREEN_WIDTH
): { width: number; height: number } => {
  if (imageWidth <= maxWidth) {
    return { width: imageWidth, height: imageHeight };
  }
  
  const aspectRatio = imageWidth / imageHeight;
  return {
    width: maxWidth,
    height: maxWidth / aspectRatio,
  };
};

// 사용 예시
const DynamicImage: React.FC<{ uri: string }> = ({ uri }) => {
  const [dimensions, setDimensions] = useState({ width: SCREEN_WIDTH, height: 200 });
  
  useEffect(() => {
    getImageDimensions(uri).then(({ width, height }) => {
      setDimensions(calculateOptimalSize(width, height));
    });
  }, [uri]);
  
  return (
    <FastImage
      source={{ uri }}
      style={dimensions}
      resizeMode="contain"
    />
  );
};
```

---

## 6. SVG 이미지 처리

### 6.1 react-native-svg 사용

```bash
npm install react-native-svg react-native-svg-transformer
```

```javascript
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
```

```typescript
// 타입 선언 (declarations.d.ts)
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// 사용 예시
import Logo from '../assets/icons/logo.svg';

const Header: React.FC = () => (
  <View>
    <Logo width={100} height={40} fill="#007AFF" />
  </View>
);
```

---

## 7. 이미지 최적화 체크리스트

- [ ] FastImage 라이브러리 사용
- [ ] 적절한 캐시 전략 설정
- [ ] 서버 사이드 리사이징 구현
- [ ] 디바이스 밀도에 맞는 이미지 제공
- [ ] Placeholder/Error 상태 처리
- [ ] Progressive 로딩 구현 (필요시)
- [ ] 레이지 로딩 적용
- [ ] 주기적인 캐시 정리
- [ ] SVG 최적화 (아이콘)

