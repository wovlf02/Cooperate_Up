# 2. iOS 앱 설정

> iOS 앱에서 AWS SDK를 설정합니다.

## 📝 단계별 가이드

### 2.1 AWS Amplify 라이브러리 설치

**1. npm 패키지 설치**

```bash
# AWS Amplify 코어
npm install aws-amplify @aws-amplify/react-native

# 추가 의존성
npm install @react-native-async-storage/async-storage
npm install react-native-get-random-values
npm install react-native-url-polyfill

# 푸시 알림
npm install @aws-amplify/pushnotification
npm install @react-native-community/push-notification-ios
```

**2. iOS Pod 설치**

```bash
cd ios
pod install
cd ..
```

### 2.2 Xcode 프로젝트 설정

**1. Xcode에서 프로젝트 열기**

```bash
open ios/BizOne.xcworkspace
```

**2. Capabilities 설정**

TARGETS → BizOne → Signing & Capabilities:

- ✅ Push Notifications 추가
- ✅ Background Modes 추가
  - ✅ Remote notifications 체크

**3. Info.plist 설정**

`ios/BizOne/Info.plist`에 추가:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
  <string>remote-notification</string>
</array>
```

### 2.3 AppDelegate 설정

**AppDelegate.mm 수정:**

```objective-c
#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>

// AWS Push Notification (필요시)
#import <UserNotifications/UserNotifications.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"BizOne";
  self.initialProps = @{};
  
  // 푸시 알림 권한 요청
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if (granted) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [application registerForRemoteNotifications];
      });
    }
  }];
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// 푸시 토큰 수신
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  // AWS Pinpoint에 토큰 등록 로직
}

// 포그라운드 알림 표시
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
```

### 2.4 AWS 설정 파일

**1. amplifyconfiguration.json 생성**

`src/config/amplifyconfiguration.json`:

```json
{
  "auth": {
    "plugins": {
      "awsCognitoAuthPlugin": {
        "UserAgent": "aws-amplify-cli/0.1.0",
        "Version": "0.1.0",
        "IdentityManager": {
          "Default": {}
        },
        "CredentialsProvider": {
          "CognitoIdentity": {
            "Default": {
              "PoolId": "ap-northeast-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
              "Region": "ap-northeast-2"
            }
          }
        },
        "CognitoUserPool": {
          "Default": {
            "PoolId": "ap-northeast-2_xxxxxxxxx",
            "AppClientId": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
            "Region": "ap-northeast-2"
          }
        }
      }
    }
  },
  "storage": {
    "plugins": {
      "awsS3StoragePlugin": {
        "bucket": "biz-one-storage-xxxxx",
        "region": "ap-northeast-2"
      }
    }
  },
  "analytics": {
    "plugins": {
      "awsPinpointAnalyticsPlugin": {
        "pinpointAnalytics": {
          "appId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "region": "ap-northeast-2"
        },
        "pinpointTargeting": {
          "region": "ap-northeast-2"
        }
      }
    }
  }
}
```

**2. aws-exports.ts 생성**

`src/config/aws-exports.ts`:

```typescript
const awsconfig = {
  aws_project_region: 'ap-northeast-2',
  
  // Cognito
  aws_cognito_region: 'ap-northeast-2',
  aws_user_pools_id: 'ap-northeast-2_xxxxxxxxx',
  aws_user_pools_web_client_id: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
  aws_cognito_identity_pool_id: 'ap-northeast-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  
  // S3
  aws_user_files_s3_bucket: 'biz-one-storage-xxxxx',
  aws_user_files_s3_bucket_region: 'ap-northeast-2',
  
  // Pinpoint
  aws_mobile_analytics_app_id: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  aws_mobile_analytics_app_region: 'ap-northeast-2',
};

export default awsconfig;
```

### 2.5 앱 진입점 설정

**index.js 수정:**

```javascript
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// AWS Amplify 설정
import {Amplify} from 'aws-amplify';
import awsconfig from './src/config/aws-exports';

Amplify.configure(awsconfig);

AppRegistry.registerComponent(appName, () => App);
```

## ✅ 체크리스트

iOS 앱 설정 완료 확인:

- [ ] AWS Amplify 패키지 설치됨
- [ ] iOS Pod 설치됨
- [ ] Xcode Capabilities 설정됨
- [ ] AppDelegate 수정됨
- [ ] AWS 설정 파일 생성됨
- [ ] 앱 진입점에 Amplify 설정됨

## 🎯 다음 단계

iOS 앱 설정이 완료되었습니다!

**다음**: [3. Android 앱 설정](./03-android-setup.md)

---

## ❓ 문제 해결

**Q: Pod install 실패**
- A: `pod repo update` 후 다시 시도
- A: Xcode 버전 확인 (15+ 권장)

**Q: 빌드 오류 발생**
- A: `ios/Pods` 폴더 삭제 후 `pod install` 재실행
- A: Xcode 캐시 정리: Product → Clean Build Folder

