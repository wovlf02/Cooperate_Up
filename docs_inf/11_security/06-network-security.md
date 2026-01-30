# 네트워크 보안 (Network Security)

## 1. AWS 네트워크 아키텍처

### 1.1 VPC 구성

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VPC (10.0.0.0/16)                                 │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      Public Subnet (10.0.1.0/24)                       │ │
│  │                                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │   Internet   │  │     NAT      │  │   Bastion    │                │ │
│  │  │   Gateway    │  │   Gateway    │  │    Host      │                │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                 Application Load Balancer                         │ │ │
│  │  │                    (HTTPS:443, WSS:443)                           │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     Private Subnet (10.0.2.0/24)                       │ │
│  │                                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │ Spring Boot  │  │ Spring Boot  │  │   Node.js    │                │ │
│  │  │   (EC2-1)    │  │   (EC2-2)    │  │  (Fargate)   │                │ │
│  │  │  10.0.2.10   │  │  10.0.2.11   │  │  10.0.2.x    │                │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                       │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      Data Subnet (10.0.3.0/24)                         │ │
│  │                                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐                                  │ │
│  │  │ PostgreSQL   │  │ ElastiCache  │                                  │ │
│  │  │   (RDS)      │  │  (Redis)     │                                  │ │
│  │  │  10.0.3.10   │  │  10.0.3.20   │                                  │ │
│  │  └──────────────┘  └──────────────┘                                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 서브넷 설계

| 서브넷 | CIDR | 용도 | 인터넷 접근 |
|--------|------|------|------------|
| Public Subnet A | 10.0.1.0/24 | ALB, NAT GW, Bastion | 직접 |
| Public Subnet B | 10.0.11.0/24 | ALB (Multi-AZ) | 직접 |
| Private Subnet A | 10.0.2.0/24 | EC2, ECS | NAT 경유 |
| Private Subnet B | 10.0.12.0/24 | EC2, ECS (Multi-AZ) | NAT 경유 |
| Data Subnet A | 10.0.3.0/24 | RDS, Redis | 없음 |
| Data Subnet B | 10.0.13.0/24 | RDS, Redis (Multi-AZ) | 없음 |

---

## 2. Security Group

### 2.1 Security Group 설계

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Security Group 구성                                │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ sg-alb (Application Load Balancer)                                  │ │
│  │   Inbound:                                                          │ │
│  │     - 0.0.0.0/0 : 443 (HTTPS)                                      │ │
│  │     - 0.0.0.0/0 : 80  (HTTP → HTTPS Redirect)                      │ │
│  │   Outbound:                                                         │ │
│  │     - sg-app : All Traffic                                         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                │                                         │
│                                ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ sg-app (Application Servers)                                        │ │
│  │   Inbound:                                                          │ │
│  │     - sg-alb : 8080 (Spring Boot)                                  │ │
│  │     - sg-alb : 3001 (Node.js)                                      │ │
│  │     - sg-bastion : 22 (SSH)                                        │ │
│  │   Outbound:                                                         │ │
│  │     - sg-db : 5432 (PostgreSQL)                                    │ │
│  │     - sg-redis : 6379 (Redis)                                      │ │
│  │     - 0.0.0.0/0 : 443 (External APIs)                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                │                                         │
│                                ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ sg-db (PostgreSQL RDS)                                              │ │
│  │   Inbound:                                                          │ │
│  │     - sg-app : 5432                                                │ │
│  │     - sg-bastion : 5432 (관리용)                                    │ │
│  │   Outbound:                                                         │ │
│  │     - None (Stateful)                                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ sg-redis (ElastiCache Redis)                                        │ │
│  │   Inbound:                                                          │ │
│  │     - sg-app : 6379                                                │ │
│  │   Outbound:                                                         │ │
│  │     - None (Stateful)                                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ sg-bastion (Bastion Host)                                           │ │
│  │   Inbound:                                                          │ │
│  │     - 관리자 IP : 22 (SSH)                                          │ │
│  │   Outbound:                                                         │ │
│  │     - 10.0.0.0/16 : All Traffic                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Security Group Terraform 예시

```hcl
# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "bizone-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP redirect to HTTPS"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description     = "To Application Servers"
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.app.id]
  }

  tags = {
    Name = "bizone-alb-sg"
  }
}

# Application Security Group
resource "aws_security_group" "app" {
  name        = "bizone-app-sg"
  description = "Security group for Application Servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Spring Boot from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Node.js from ALB"
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "SSH from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    description = "To PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.db.id]
  }

  egress {
    description = "To Redis"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    security_groups = [aws_security_group.redis.id]
  }

  egress {
    description = "HTTPS to Internet (for external APIs)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "bizone-app-sg"
  }
}
```

---

## 3. TLS/SSL 설정

### 3.1 ALB SSL 설정

```hcl
# ACM 인증서
resource "aws_acm_certificate" "main" {
  domain_name               = "api.bizone.com"
  subject_alternative_names = ["*.api.bizone.com"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# ALB HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"  # TLS 1.3 우선
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# HTTP → HTTPS Redirect
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

### 3.2 SSL/TLS 정책

| 설정 | 값 | 설명 |
|------|-----|------|
| SSL Policy | ELBSecurityPolicy-TLS13-1-2-2021-06 | TLS 1.3 + 1.2 지원 |
| 최소 TLS 버전 | TLS 1.2 | TLS 1.0, 1.1 비활성화 |
| 인증서 | ACM 관리형 | 자동 갱신 |
| Perfect Forward Secrecy | 활성화 | ECDHE 키 교환 |

---

## 4. WAF (Web Application Firewall)

### 4.1 WAF 규칙 설정

```hcl
resource "aws_wafv2_web_acl" "main" {
  name        = "bizone-waf"
  description = "WAF for Bizone API"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # AWS 관리형 규칙 - 일반적인 취약점 방어
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled  = true
    }
  }

  # SQL Injection 방어
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesSQLiRuleSetMetric"
      sampled_requests_enabled  = true
    }
  }

  # Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesKnownBadInputsRuleSetMetric"
      sampled_requests_enabled  = true
    }
  }

  # Rate Limiting (IP당 5000 요청/5분)
  rule {
    name     = "RateLimitRule"
    priority = 4

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 5000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "RateLimitRuleMetric"
      sampled_requests_enabled  = true
    }
  }

  # 특정 국가 차단 (필요 시)
  rule {
    name     = "GeoBlockRule"
    priority = 5

    action {
      block {}
    }

    statement {
      geo_match_statement {
        country_codes = ["CN", "RU", "KP"]  # 예시
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "GeoBlockRuleMetric"
      sampled_requests_enabled  = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "BizoneWAFMetric"
    sampled_requests_enabled  = true
  }
}

# WAF를 ALB에 연결
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
```

### 4.2 WAF 규칙 요약

| 규칙 | 유형 | 설명 |
|------|------|------|
| AWSManagedRulesCommonRuleSet | 관리형 | OWASP Top 10 방어 |
| AWSManagedRulesSQLiRuleSet | 관리형 | SQL Injection 방어 |
| AWSManagedRulesKnownBadInputsRuleSet | 관리형 | 알려진 악성 입력 방어 |
| RateLimitRule | 커스텀 | IP당 요청 제한 |
| GeoBlockRule | 커스텀 | 국가별 차단 (선택적) |

---

## 5. DDoS 보호

### 5.1 AWS Shield

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DDoS 보호 계층                                   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Layer 7 (Application)                                               │ │
│  │   - AWS WAF Rate Limiting                                          │ │
│  │   - 애플리케이션 Rate Limiter (Bucket4j)                            │ │
│  │   - 로그인 시도 제한                                                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Layer 3/4 (Network/Transport)                                       │ │
│  │   - AWS Shield Standard (무료, 자동 적용)                           │ │
│  │     - SYN Flood 방어                                               │ │
│  │     - UDP Reflection 방어                                          │ │
│  │     - DNS Query Flood 방어                                         │ │
│  │                                                                     │ │
│  │   - AWS Shield Advanced (선택적, 유료)                              │ │
│  │     - 24/7 DDoS Response Team                                      │ │
│  │     - 비용 보호                                                    │ │
│  │     - 고급 모니터링                                                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ 엣지 보호 (CloudFront)                                              │ │
│  │   - 전 세계 엣지 로케이션에서 트래픽 분산                           │ │
│  │   - Origin 서버 보호                                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 네트워크 모니터링

### 6.1 VPC Flow Logs

```hcl
# VPC Flow Logs 활성화
resource "aws_flow_log" "main" {
  vpc_id                   = aws_vpc.main.id
  traffic_type             = "ALL"
  log_destination_type     = "cloud-watch-logs"
  log_destination          = aws_cloudwatch_log_group.flow_logs.arn
  iam_role_arn            = aws_iam_role.flow_logs.arn
  max_aggregation_interval = 60

  tags = {
    Name = "bizone-vpc-flow-logs"
  }
}

resource "aws_cloudwatch_log_group" "flow_logs" {
  name              = "/aws/vpc/bizone-flow-logs"
  retention_in_days = 30
}
```

### 6.2 CloudWatch 알람

```hcl
# 비정상 트래픽 알람
resource "aws_cloudwatch_metric_alarm" "high_request_count" {
  alarm_name          = "bizone-high-request-count"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "RequestCount"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10000"
  alarm_description   = "ALB 요청 수가 비정상적으로 높습니다."
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }
}

# WAF 차단 알람
resource "aws_cloudwatch_metric_alarm" "waf_blocked_requests" {
  alarm_name          = "bizone-waf-blocked-requests"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = "300"
  statistic           = "Sum"
  threshold           = "100"
  alarm_description   = "WAF에서 차단된 요청이 많습니다."
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    WebACL = aws_wafv2_web_acl.main.name
    Rule   = "ALL"
    Region = "ap-northeast-2"
  }
}
```

---

## 7. 보안 체크리스트

### 7.1 네트워크 보안 점검 항목

| 항목 | 상태 | 설명 |
|------|:----:|------|
| VPC 격리 | ✅ | 별도 VPC 구성 |
| 서브넷 분리 | ✅ | Public/Private/Data |
| Security Group | ✅ | 최소 권한 원칙 |
| NACL | ✅ | 서브넷 레벨 방화벽 |
| TLS 1.2+ | ✅ | TLS 1.3 우선 |
| WAF | ✅ | SQL Injection, XSS 방어 |
| Rate Limiting | ✅ | IP당 요청 제한 |
| DDoS 보호 | ✅ | AWS Shield Standard |
| VPC Flow Logs | ✅ | 트래픽 로깅 |
| CloudWatch 알람 | ✅ | 이상 트래픽 탐지 |

