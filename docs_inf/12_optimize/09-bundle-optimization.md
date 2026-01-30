# 번들 사이즈 최적화

## 1. 번들 분석

### 1.1 Metro Bundler 분석

```bash
# 번들 사이즈 분석
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ./ios-bundle.js \
  --assets-dest ./ios-assets

# 번들 크기 확인
ls -lh ios-bundle.js
```

### 1.2 소스 맵 분석

```bash
# source-map-explorer 설치
npm install -g source-map-explorer

# 소스 맵 생성
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ./bundle.js \
  --sourcemap-output ./bundle.js.map

# 분석
source-map-explorer bundle.js bundle.js.map
```

### 1.3 패키지 크기 확인

```bash
# 패키지별 크기 확인
npx react-native-bundle-visualizer

# package.json 의존성 크기 분석
npx bundle-phobia-cli analyze
```

---

## 2. 코드 분할

### 2.1 동적 임포트

```typescript
// ❌ Bad: 정적 임포트 (모든 코드가 초기 번들에 포함)
import { HeavyChart } from './components/HeavyChart';
import { PDFGenerator } from './utils/PDFGenerator';
import { ExcelExporter } from './utils/ExcelExporter';

// ✅ Good: 동적 임포트 (필요할 때 로드)
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const PDFGenerator = lazy(() => import('./utils/PDFGenerator'));
const ExcelExporter = lazy(() => import('./utils/ExcelExporter'));
```

### 2.2 조건부 로딩

```typescript
import React, { lazy, Suspense, useState } from 'react';
import { Button, ActivityIndicator, View } from 'react-native';

// 무거운 컴포넌트는 필요할 때만 로드
const HeavyReportViewer = lazy(() => import('./HeavyReportViewer'));

export const ReportScreen: React.FC = () => {
  const [showReport, setShowReport] = useState(false);

  return (
    <View>
      <Button
        title="보고서 보기"
        onPress={() => setShowReport(true)}
      />
      
      {showReport && (
        <Suspense fallback={<ActivityIndicator />}>
          <HeavyReportViewer />
        </Suspense>
      )}
    </View>
  );
};
```

### 2.3 라우트 기반 코드 분할

```typescript
import React, { lazy, Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 자주 사용하는 화면: 정적 임포트
import HomeScreen from './screens/HomeScreen';
import AttendanceScreen from './screens/AttendanceScreen';

// 드물게 사용하는 화면: 동적 임포트
const PayrollScreen = lazy(() => import('./screens/PayrollScreen'));
const ContractScreen = lazy(() => import('./screens/ContractScreen'));
const AdminSettingsScreen = lazy(() => import('./screens/AdminSettingsScreen'));
const ReportScreen = lazy(() => import('./screens/ReportScreen'));

// 지연 로딩 래퍼
const withSuspense = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};

const Stack = createNativeStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator>
    {/* 정적 임포트 */}
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} />
    
    {/* 동적 임포트 */}
    <Stack.Screen name="Payroll" component={withSuspense(PayrollScreen)} />
    <Stack.Screen name="Contract" component={withSuspense(ContractScreen)} />
    <Stack.Screen name="AdminSettings" component={withSuspense(AdminSettingsScreen)} />
    <Stack.Screen name="Report" component={withSuspense(ReportScreen)} />
  </Stack.Navigator>
);
```

---

## 3. 트리 쉐이킹

### 3.1 Named Import 사용

```typescript
// ❌ Bad: 전체 라이브러리 임포트
import _ from 'lodash';
const result = _.map(data, item => item.value);

// ✅ Good: 필요한 함수만 임포트
import map from 'lodash/map';
const result = map(data, item => item.value);

// 또는 lodash-es 사용
import { map, filter, reduce } from 'lodash-es';
```

### 3.2 아이콘 최적화

```typescript
// ❌ Bad: 전체 아이콘 번들 포함
import Icon from 'react-native-vector-icons/MaterialIcons';

// ✅ Good: 사용하는 아이콘만 포함 (커스텀 아이콘 폰트)
// 1. 사용하는 아이콘만 추출하여 커스텀 폰트 생성
// 2. https://icomoon.io 등 사용

// 또는 SVG 아이콘 사용
import HomeIcon from '../assets/icons/home.svg';
import AttendanceIcon from '../assets/icons/attendance.svg';

export const TabIcon: React.FC<{ name: string; color: string }> = ({
  name,
  color,
}) => {
  switch (name) {
    case 'home':
      return <HomeIcon fill={color} width={24} height={24} />;
    case 'attendance':
      return <AttendanceIcon fill={color} width={24} height={24} />;
    default:
      return null;
  }
};
```

### 3.3 Babel 설정

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // lodash 트리 쉐이킹
    'lodash',
    
    // 환경변수
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    
    // 경로 별칭
    ['module-resolver', {
      root: ['./src'],
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      alias: {
        '@components': './src/components',
        '@screens': './src/screens',
        '@hooks': './src/hooks',
        '@utils': './src/utils',
        '@api': './src/api',
        '@assets': './src/assets',
      },
    }],
    
    // Reanimated (마지막에 위치)
    'react-native-reanimated/plugin',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
```

---

## 4. 의존성 최적화

### 4.1 번들 크기가 큰 패키지 대체

| 기존 패키지 | 크기 | 대체 패키지 | 크기 |
|------------|------|------------|------|
| moment | 280KB | date-fns | 75KB (트리 쉐이킹) |
| moment | 280KB | dayjs | 2KB |
| lodash | 530KB | lodash-es | 트리 쉐이킹 |
| axios | 29KB | ky | 9KB |

### 4.2 날짜 라이브러리 최적화

```typescript
// ❌ Bad: moment (280KB)
import moment from 'moment';
const formatted = moment().format('YYYY-MM-DD');

// ✅ Good: dayjs (2KB)
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const formatted = dayjs().format('YYYY-MM-DD');
const relative = dayjs().fromNow();

// ✅ Good: date-fns (트리 쉐이킹)
import { format, formatDistance } from 'date-fns';
import { ko } from 'date-fns/locale';

const formatted = format(new Date(), 'yyyy-MM-dd');
const relative = formatDistance(new Date(), Date.now(), { locale: ko });
```

### 4.3 불필요한 의존성 제거

```bash
# 사용하지 않는 패키지 확인
npx depcheck

# 중복 패키지 확인
npm ls --all | grep -E "^\├|^\└"

# 패키지 정리
npm prune
```

---

## 5. 에셋 최적화

### 5.1 이미지 압축

```bash
# 이미지 최적화 도구 설치
npm install -D imagemin imagemin-pngquant imagemin-mozjpeg

# 스크립트 작성 (scripts/optimize-images.js)
```

```javascript
// scripts/optimize-images.js
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

(async () => {
  const files = await imagemin(['src/assets/images/*.{jpg,png}'], {
    destination: 'src/assets/images/optimized',
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
      imageminMozjpeg({
        quality: 75,
      }),
    ],
  });

  console.log('Optimized images:', files.map(f => f.destinationPath));
})();
```

### 5.2 폰트 최적화

```typescript
// 필요한 글리프만 포함된 서브셋 폰트 사용
// https://transfonter.org/ 등으로 서브셋 생성

// 폰트 로딩 최적화
import { useFonts } from 'expo-font';

const App = () => {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard-Regular.subset.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.subset.otf'),
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return <AppContent />;
};
```

### 5.3 SVG 최적화

```bash
# SVGO 설치
npm install -D svgo

# SVG 최적화
npx svgo src/assets/icons/*.svg --config svgo.config.js
```

```javascript
// svgo.config.js
module.exports = {
  plugins: [
    'preset-default',
    'removeDimensions',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['class', 'style'],
      },
    },
  ],
};
```

---

## 6. Metro 설정 최적화

### 6.1 metro.config.js

```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,  // 인라인 require로 초기 로드 감소
      },
    }),
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        toplevel: true,
      },
    },
  },
  resolver: {
    // 불필요한 플랫폼 파일 제외
    platforms: ['ios', 'android'],
    // 해결할 확장자 제한
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'svg'],
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
  },
};

module.exports = mergeConfig(defaultConfig, config);
```

### 6.2 Hermes 최적화

```javascript
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,  // Hermes 활성화
    hermesCommand: "../../node_modules/react-native/sdks/hermesc/%OS-BIN%/hermesc",
]

// 바이트코드 사전 컴파일
// Hermes는 JavaScript를 바이트코드로 컴파일하여 시작 시간 단축
```

---

## 7. 프로덕션 빌드 최적화

### 7.1 Android 최적화

```groovy
// android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            // 네이티브 라이브러리 분리 (App Bundle)
            ndk {
                debugSymbolLevel 'SYMBOL_TABLE'
            }
        }
    }
    
    // ABI 분리 빌드
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
}
```

### 7.2 iOS 최적화

```ruby
# ios/Podfile
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # 배포 최적화
      if config.name == 'Release'
        config.build_settings['SWIFT_OPTIMIZATION_LEVEL'] = '-O'
        config.build_settings['GCC_OPTIMIZATION_LEVEL'] = 's'
      end
    end
  end
end
```

---

## 8. 번들 사이즈 모니터링

### 8.1 CI/CD에서 번들 크기 추적

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  check-bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build bundle
        run: |
          npx react-native bundle \
            --platform android \
            --dev false \
            --entry-file index.js \
            --bundle-output ./bundle.js
      
      - name: Check bundle size
        run: |
          SIZE=$(stat -f%z bundle.js)
          MAX_SIZE=5000000  # 5MB
          if [ $SIZE -gt $MAX_SIZE ]; then
            echo "Bundle size ($SIZE bytes) exceeds limit ($MAX_SIZE bytes)"
            exit 1
          fi
          echo "Bundle size: $SIZE bytes"
```

### 8.2 번들 사이즈 보고

```typescript
// scripts/report-bundle-size.ts
import * as fs from 'fs';
import * as path from 'path';

interface BundleSizeReport {
  platform: string;
  bundleSize: number;
  timestamp: string;
}

const generateReport = () => {
  const bundlePath = path.join(__dirname, '../bundle.js');
  const stats = fs.statSync(bundlePath);
  
  const report: BundleSizeReport = {
    platform: process.argv[2] || 'unknown',
    bundleSize: stats.size,
    timestamp: new Date().toISOString(),
  };
  
  console.log('Bundle Size Report:');
  console.log(`  Platform: ${report.platform}`);
  console.log(`  Size: ${(report.bundleSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Timestamp: ${report.timestamp}`);
  
  // 이전 보고서와 비교
  const historyPath = path.join(__dirname, '../bundle-history.json');
  let history: BundleSizeReport[] = [];
  
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    const lastReport = history[history.length - 1];
    const diff = report.bundleSize - lastReport.bundleSize;
    const diffPercent = ((diff / lastReport.bundleSize) * 100).toFixed(2);
    
    console.log(`  Change: ${diff > 0 ? '+' : ''}${(diff / 1024).toFixed(2)} KB (${diffPercent}%)`);
  }
  
  history.push(report);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
};

generateReport();
```

---

## 9. 번들 최적화 체크리스트

- [ ] 번들 크기 분석 실행
- [ ] 동적 임포트 적용 (무거운 화면/컴포넌트)
- [ ] 트리 쉐이킹 확인
- [ ] Named Import 사용
- [ ] 무거운 라이브러리 대체
- [ ] 불필요한 의존성 제거
- [ ] 이미지/폰트/SVG 최적화
- [ ] Metro 설정 최적화
- [ ] Hermes 활성화
- [ ] 프로덕션 빌드 최적화
- [ ] CI/CD 번들 크기 모니터링

