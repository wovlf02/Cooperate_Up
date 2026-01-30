# 인프라 보안 (Infrastructure Security)

## 1. AWS IAM 보안

### 1.1 IAM 정책 설계 원칙

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         IAM 권한 계층 구조                                │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Root Account                                                        │ │
│  │   - MFA 필수                                                        │ │
│  │   - 일상 작업 사용 금지                                              │ │
│  │   - 결제/계정 설정만 사용                                            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ IAM Users (개발자)                                                   │ │
│  │   - MFA 필수                                                        │ │
│  │   - 최소 권한 원칙                                                  │ │
│  │   - 그룹 기반 권한 관리                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ IAM Roles (서비스)                                                   │ │
│  │   - EC2 Instance Profile                                           │ │
│  │   - ECS Task Role                                                  │ │
│  │   - Lambda Execution Role                                          │ │
│  │   - 교차 계정 접근 (필요 시)                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 EC2 Instance Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::bizone-files/*"
    },
    {
      "Sid": "SecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:ap-northeast-2:*:secret:bizone/*"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-northeast-2:*:log-group:/aws/ec2/bizone-*"
    },
    {
      "Sid": "CloudWatchMetrics",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "cloudwatch:namespace": "Bizone"
        }
      }
    }
  ]
}
```

### 1.3 ECS Task Role (Node.js Signaling Server)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:ap-northeast-2:*:secret:bizone/signaling/*"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-northeast-2:*:log-group:/ecs/bizone-signaling*"
    }
  ]
}
```

---

## 2. Secrets 관리

### 2.1 AWS Secrets Manager

```hcl
# Secrets Manager 시크릿 생성
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "bizone/prod/db-credentials"
  description = "PostgreSQL database credentials"
  
  tags = {
    Environment = "prod"
    Application = "bizone"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    host     = aws_db_instance.main.endpoint
    port     = 5432
    database = "bizone"
  })
}

# 자동 로테이션 설정
resource "aws_secretsmanager_secret_rotation" "db_credentials" {
  secret_id           = aws_secretsmanager_secret.db_credentials.id
  rotation_lambda_arn = aws_lambda_function.secret_rotation.arn

  rotation_rules {
    automatically_after_days = 30
  }
}
```

### 2.2 Spring Boot에서 Secrets 사용

```java
// application.yml
spring:
  config:
    import: aws-secretsmanager:bizone/prod/db-credentials

// 또는 프로그래밍 방식
@Configuration
public class SecretsConfig {
    
    @Autowired
    private SecretsManagerClient secretsManagerClient;
    
    @PostConstruct
    public void loadSecrets() {
        GetSecretValueRequest request = GetSecretValueRequest.builder()
            .secretId("bizone/prod/db-credentials")
            .build();
        
        GetSecretValueResponse response = secretsManagerClient.getSecretValue(request);
        String secretString = response.secretString();
        
        // JSON 파싱 후 환경 변수 설정
        JsonNode secrets = objectMapper.readTree(secretString);
        System.setProperty("spring.datasource.username", secrets.get("username").asText());
        System.setProperty("spring.datasource.password", secrets.get("password").asText());
    }
}
```

### 2.3 Secrets 목록

| Secret Name | 용도 | 로테이션 주기 |
|-------------|------|--------------|
| bizone/prod/db-credentials | PostgreSQL 인증정보 | 30일 |
| bizone/prod/jwt-secret | JWT 서명 키 | 90일 |
| bizone/prod/encryption-key | 데이터 암호화 키 | 180일 |
| bizone/prod/apns-key | APNs 인증 키 | 수동 |
| bizone/prod/fcm-credentials | FCM 서비스 계정 | 수동 |

---

## 3. 서버 보안

### 3.1 EC2 보안 설정

```bash
#!/bin/bash
# EC2 User Data - 보안 하드닝 스크립트

# 시스템 업데이트
yum update -y

# 불필요한 서비스 비활성화
systemctl disable postfix
systemctl disable rpcbind

# SSH 보안 설정
cat >> /etc/ssh/sshd_config << EOF
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers ec2-user
EOF

# 방화벽 설정 (Security Group 외 추가 보안)
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -j DROP

# 파일 시스템 보안
chmod 700 /home/ec2-user
chmod 600 /home/ec2-user/.ssh/authorized_keys

# 감사 로깅 활성화
yum install -y audit
systemctl enable auditd
systemctl start auditd

# CloudWatch Agent 설치
yum install -y amazon-cloudwatch-agent
```

### 3.2 ECS Fargate 보안

```hcl
# ECS Task Definition with Security
resource "aws_ecs_task_definition" "signaling" {
  family                   = "bizone-signaling"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "signaling-server"
      image = "${aws_ecr_repository.signaling.repository_url}:latest"
      
      # 읽기 전용 루트 파일시스템
      readonlyRootFilesystem = true
      
      # 권한 없는 사용자로 실행
      user = "1000:1000"
      
      # 로그 설정
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/bizone-signaling"
          "awslogs-region"        = "ap-northeast-2"
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      # Secrets 참조
      secrets = [
        {
          name      = "JWT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.jwt_secret.arn}"
        },
        {
          name      = "REDIS_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.redis_password.arn}"
        }
      ]
      
      # 환경 변수 (비민감)
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3001"
        }
      ]
    }
  ])
}
```

---

## 4. 데이터베이스 보안

### 4.1 RDS 보안 설정

```hcl
resource "aws_db_instance" "main" {
  identifier = "bizone-prod-db"
  
  # 암호화 설정
  storage_encrypted = true
  kms_key_id       = aws_kms_key.rds.arn
  
  # 네트워크 격리
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  
  # 인증
  iam_database_authentication_enabled = true
  
  # 로깅
  enabled_cloudwatch_logs_exports = [
    "postgresql",
    "upgrade"
  ]
  
  # 백업
  backup_retention_period = 30
  backup_window          = "18:00-19:00"
  
  # 삭제 보호
  deletion_protection = true
  
  # 스냅샷
  copy_tags_to_snapshot = true
  skip_final_snapshot   = false
  final_snapshot_identifier = "bizone-prod-final-snapshot"
  
  # 자동 마이너 버전 업그레이드
  auto_minor_version_upgrade = true
  
  tags = {
    Environment = "prod"
    Application = "bizone"
  }
}
```

### 4.2 Redis (ElastiCache) 보안

```hcl
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "bizone-redis"
  description         = "Redis cluster for Bizone"
  
  # 암호화 설정
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                = aws_kms_key.redis.arn
  
  # 인증
  auth_token = random_password.redis_auth_token.result
  
  # 네트워크
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  # 자동 장애 조치
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  tags = {
    Environment = "prod"
    Application = "bizone"
  }
}
```

---

## 5. 로깅 및 모니터링

### 5.1 중앙 집중식 로깅

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         로깅 아키텍처                                     │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Spring Boot  │  │   Node.js    │  │    RDS       │                  │
│  │   Logs       │  │   Logs       │  │   Logs       │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                 │                           │
│         └─────────────────┼─────────────────┘                           │
│                           │                                              │
│                           ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    CloudWatch Logs                                  │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ Log Groups:                                                  │   │ │
│  │  │  - /aws/ec2/bizone-api                                      │   │ │
│  │  │  - /ecs/bizone-signaling                                    │   │ │
│  │  │  - /aws/rds/bizone-db                                       │   │ │
│  │  │  - /bizone/security-audit                                   │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                           │                                              │
│                           ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    CloudWatch Metrics                               │ │
│  │  - 요청 수, 에러율, 지연 시간                                       │ │
│  │  - 보안 이벤트 카운트                                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                           │                                              │
│                           ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    CloudWatch Alarms                                │ │
│  │  - 보안 임계값 초과 알람                                            │ │
│  │  - SNS → 이메일/Slack 알림                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 보안 이벤트 알람

```hcl
# 다수의 인증 실패 알람
resource "aws_cloudwatch_metric_alarm" "auth_failures" {
  alarm_name          = "bizone-auth-failures-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "AuthenticationFailures"
  namespace           = "Bizone/Security"
  period              = "300"
  statistic           = "Sum"
  threshold           = "50"
  alarm_description   = "인증 실패가 비정상적으로 많습니다."
  
  alarm_actions = [aws_sns_topic.security_alerts.arn]
  
  dimensions = {
    Environment = "prod"
  }
}

# 비정상 API 에러율 알람
resource "aws_cloudwatch_metric_alarm" "api_errors" {
  alarm_name          = "bizone-api-errors-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "5XXError"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "API 5XX 에러가 비정상적으로 많습니다."
  
  alarm_actions = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# 권한 상승 시도 알람
resource "aws_cloudwatch_metric_alarm" "privilege_escalation" {
  alarm_name          = "bizone-privilege-escalation-attempt"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "PrivilegeEscalationAttempts"
  namespace           = "Bizone/Security"
  period              = "60"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "권한 상승 시도가 감지되었습니다."
  
  alarm_actions = [aws_sns_topic.security_alerts.arn]
}
```

---

## 6. 백업 및 재해 복구

### 6.1 백업 전략

| 대상 | 백업 방법 | 주기 | 보관 기간 |
|------|----------|------|----------|
| RDS | 자동 스냅샷 | 매일 | 30일 |
| RDS | 수동 스냅샷 | 배포 전 | 영구 |
| S3 | 버전 관리 | 실시간 | 90일 |
| Redis | 스냅샷 | 매일 | 7일 |
| Secrets | 버전 관리 | 변경 시 | 영구 |

### 6.2 복구 절차

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         재해 복구 절차                                    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ RPO (Recovery Point Objective): 1시간                               │ │
│  │ RTO (Recovery Time Objective): 4시간                                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  1. 장애 감지                                                            │
│     - CloudWatch 알람                                                   │
│     - 담당자 알림 (SNS → 이메일/Slack)                                  │
│                                                                          │
│  2. 원인 분석                                                            │
│     - CloudWatch Logs 확인                                              │
│     - VPC Flow Logs 확인                                                │
│                                                                          │
│  3. 복구 실행                                                            │
│     - RDS: 특정 시점 복구 (PITR) 또는 스냅샷 복원                       │
│     - S3: 버전 복원                                                     │
│     - EC2: AMI에서 새 인스턴스 시작                                      │
│     - ECS: 서비스 재배포                                                │
│                                                                          │
│  4. 검증                                                                 │
│     - 헬스체크 확인                                                     │
│     - 기능 테스트                                                       │
│     - 데이터 무결성 확인                                                │
│                                                                          │
│  5. 사후 분석                                                            │
│     - 근본 원인 분석 (RCA)                                              │
│     - 재발 방지 대책 수립                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 보안 체크리스트

### 7.1 인프라 보안 점검 항목

| 항목 | 상태 | 설명 |
|------|:----:|------|
| IAM 최소 권한 | ✅ | 역할별 최소 권한 |
| MFA 활성화 | ✅ | 모든 IAM 사용자 |
| Root 계정 보호 | ✅ | MFA + 사용 제한 |
| Secrets 관리 | ✅ | Secrets Manager |
| 키 로테이션 | ✅ | 자동 로테이션 |
| EC2 하드닝 | ✅ | SSH 보안, 방화벽 |
| RDS 암호화 | ✅ | 저장/전송 암호화 |
| Redis 암호화 | ✅ | 전송 암호화 + AUTH |
| CloudWatch 로깅 | ✅ | 모든 서비스 |
| 보안 알람 | ✅ | 임계값 기반 알림 |
| 자동 백업 | ✅ | RDS, S3 |
| 재해 복구 계획 | ✅ | RPO/RTO 정의 |

