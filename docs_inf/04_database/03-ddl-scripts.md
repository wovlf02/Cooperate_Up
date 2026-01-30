# DDL 스크립트

## 1. 개요

이 문서는 H2 Database(개발) 및 PostgreSQL(운영)용 DDL 스크립트를 제공합니다.
Flyway를 통해 마이그레이션을 관리합니다.

---

## 2. H2 Database (개발 환경)

### 2.1 설정

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:h2:mem:bizonedb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE
    username: sa
    password: 
    driver-class-name: org.h2.Driver
  h2:
    console:
      enabled: true
      path: /h2-console
```

### 2.2 DDL 스크립트 (H2 호환)

```sql
-- =============================================================================
-- Flyway Migration: V1__init_schema.sql
-- Database: H2 (PostgreSQL 호환 모드)
-- =============================================================================

-- =============================================================================
-- 1. 사용자 및 인증
-- =============================================================================

-- 1.1 users (사용자)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    profile_image_url VARCHAR(500),
    role VARCHAR(20) NOT NULL,
    business_number VARCHAR(20),
    business_owner_name VARCHAR(100),
    business_type VARCHAR(100),
    business_open_date DATE,
    business_verified BOOLEAN DEFAULT FALSE NOT NULL,
    business_verified_at TIMESTAMP,
    last_business_check_at TIMESTAMP,
    business_status VARCHAR(20),
    device_token VARCHAR(500),
    device_platform VARCHAR(10),
    current_workplace_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'employee')),
    CONSTRAINT chk_users_business_status CHECK (business_status IN ('active', 'suspended', 'closed')),
    CONSTRAINT chk_users_device_platform CHECK (device_platform IN ('ios', 'android'))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 1.2 refresh_tokens (리프레시 토큰)
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(200),
    ip_address VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- 1.3 password_history (비밀번호 이력)
CREATE TABLE password_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_history_user_id ON password_history(user_id);

-- =============================================================================
-- 2. 사업장
-- =============================================================================

-- 2.1 workplaces (사업장)
CREATE TABLE workplaces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500) NOT NULL,
    address_detail VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location_source VARCHAR(20) DEFAULT 'geocoding' NOT NULL,
    radius INT DEFAULT 50 NOT NULL,
    default_start_time TIME,
    default_end_time TIME,
    schedule_config TEXT,
    payment_date INT,
    business_number VARCHAR(20),
    business_owner_name VARCHAR(100),
    business_type VARCHAR(100),
    business_verified BOOLEAN DEFAULT FALSE NOT NULL,
    business_verified_at TIMESTAMP,
    business_status VARCHAR(20) DEFAULT 'active' NOT NULL,
    invite_code VARCHAR(20),
    invite_code_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_workplaces_invite_code UNIQUE (invite_code),
    CONSTRAINT fk_workplaces_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT chk_workplaces_radius CHECK (radius > 0),
    CONSTRAINT chk_workplaces_payment_date CHECK (payment_date IS NULL OR (payment_date BETWEEN 1 AND 31)),
    CONSTRAINT chk_workplaces_location_source CHECK (location_source IN ('geocoding', 'manual')),
    CONSTRAINT chk_workplaces_business_status CHECK (business_status IN ('active', 'suspended', 'closed'))
);

CREATE INDEX idx_workplaces_owner_id ON workplaces(owner_id);
CREATE INDEX idx_workplaces_is_active ON workplaces(is_active);
CREATE INDEX idx_workplaces_invite_code ON workplaces(invite_code);

-- users.current_workplace_id FK 추가
ALTER TABLE users ADD CONSTRAINT fk_users_current_workplace 
    FOREIGN KEY (current_workplace_id) REFERENCES workplaces(id) ON DELETE SET NULL;

-- 2.2 members (사업장 멤버)
CREATE TABLE members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    hourly_wage INT DEFAULT 0 NOT NULL,
    use_custom_schedule BOOLEAN DEFAULT FALSE NOT NULL,
    custom_start_time TIME,
    custom_end_time TIME,
    custom_schedule_config TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_members_workplace_user UNIQUE (workplace_id, user_id),
    CONSTRAINT fk_members_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_members_role CHECK (role IN ('admin', 'employee')),
    CONSTRAINT chk_members_hourly_wage CHECK (hourly_wage >= 0)
);

CREATE INDEX idx_members_workplace_id ON members(workplace_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_is_active ON members(is_active);

-- 2.3 invitations (초대)
CREATE TABLE invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    workplace_name VARCHAR(200) NOT NULL,
    inviter_id BIGINT NOT NULL,
    inviter_name VARCHAR(100) NOT NULL,
    invitee_id BIGINT NOT NULL,
    invitee_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    responded_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_invitations_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_inviter FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_invitee FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_invitations_status CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'))
);

CREATE INDEX idx_invitations_workplace_id ON invitations(workplace_id);
CREATE INDEX idx_invitations_invitee_id ON invitations(invitee_id);
CREATE INDEX idx_invitations_status ON invitations(status);

-- =============================================================================
-- 3. 출퇴근
-- =============================================================================

-- 3.1 attendance_records (출퇴근 기록)
CREATE TABLE attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    work_date DATE NOT NULL,
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,
    effective_clock_in TIMESTAMP,
    effective_clock_out TIMESTAMP,
    clock_in_lat DECIMAL(10,8),
    clock_in_lng DECIMAL(11,8),
    clock_out_lat DECIMAL(10,8),
    clock_out_lng DECIMAL(11,8),
    work_minutes INT DEFAULT 0 NOT NULL,
    hourly_wage INT DEFAULT 0 NOT NULL,
    daily_wage INT DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'working' NOT NULL,
    is_manual_input BOOLEAN DEFAULT FALSE NOT NULL,
    is_early_clock_in BOOLEAN DEFAULT FALSE NOT NULL,
    checklist_completed BOOLEAN DEFAULT FALSE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_attendance_workplace_user_date UNIQUE (workplace_id, user_id, work_date),
    CONSTRAINT fk_attendance_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_attendance_status CHECK (status IN ('working', 'completed', 'pending_approval', 'approved', 'rejected')),
    CONSTRAINT chk_attendance_work_minutes CHECK (work_minutes >= 0)
);

CREATE INDEX idx_attendance_workplace_date ON attendance_records(workplace_id, work_date);
CREATE INDEX idx_attendance_user_date ON attendance_records(workplace_id, user_id, work_date);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- 3.2 approval_requests (승인 요청)
CREATE TABLE approval_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    attendance_id BIGINT,
    request_type VARCHAR(30) NOT NULL,
    request_date DATE NOT NULL,
    request_clock_in TIME,
    request_clock_out TIME,
    request_reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    processed_by BIGINT,
    processed_at TIMESTAMP,
    process_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_approval_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_attendance FOREIGN KEY (attendance_id) REFERENCES attendance_records(id) ON DELETE SET NULL,
    CONSTRAINT fk_approval_processor FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_approval_type CHECK (request_type IN ('manual_input', 'edit_request')),
    CONSTRAINT chk_approval_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_approval_workplace_status ON approval_requests(workplace_id, status);
CREATE INDEX idx_approval_user_id ON approval_requests(user_id);

-- =============================================================================
-- 4. 체크리스트
-- =============================================================================

-- 4.1 checklists (체크리스트 템플릿)
CREATE TABLE checklists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    time_slot TIME,
    repeat_days VARCHAR(50),
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_checklists_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE
);

CREATE INDEX idx_checklists_workplace_id ON checklists(workplace_id);
CREATE INDEX idx_checklists_is_active ON checklists(is_active);

-- 4.2 checklist_items (체크리스트 항목)
CREATE TABLE checklist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_id BIGINT NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    CONSTRAINT fk_checklist_items_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
);

CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);

-- 4.3 checklist_assignments (체크리스트 할당)
CREATE TABLE checklist_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_id BIGINT NOT NULL,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    assigned_by BIGINT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_checklist_assignments UNIQUE (checklist_id, user_id),
    CONSTRAINT fk_checklist_assign_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_checklist_assign_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_checklist_assign_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_checklist_assign_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_checklist_assign_workplace_user ON checklist_assignments(workplace_id, user_id);

-- 4.4 checklist_favorites (체크리스트 즐겨찾기)
CREATE TABLE checklist_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_id BIGINT NOT NULL,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_checklist_favorites UNIQUE (checklist_id, user_id),
    CONSTRAINT fk_checklist_fav_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_checklist_fav_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_checklist_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_checklist_fav_workplace_user ON checklist_favorites(workplace_id, user_id);

-- 4.5 task_completions (업무 완료 기록)
CREATE TABLE task_completions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    checklist_id BIGINT NOT NULL,
    checklist_name VARCHAR(200) NOT NULL,
    item_id BIGINT NOT NULL,
    item_title VARCHAR(300) NOT NULL,
    completion_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    completed_at TIMESTAMP,
    skipped_at TIMESTAMP,
    skip_reason TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_task_completions UNIQUE (workplace_id, user_id, item_id, completion_date),
    CONSTRAINT fk_task_comp_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_comp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_task_comp_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE SET NULL,
    CONSTRAINT fk_task_comp_item FOREIGN KEY (item_id) REFERENCES checklist_items(id) ON DELETE SET NULL,
    CONSTRAINT chk_task_comp_status CHECK (status IN ('completed', 'skipped'))
);

CREATE INDEX idx_task_comp_workplace_user_date ON task_completions(workplace_id, user_id, completion_date);
CREATE INDEX idx_task_comp_checklist_date ON task_completions(checklist_id, completion_date);

-- =============================================================================
-- 5. 근로계약
-- =============================================================================

-- 5.1 contracts (전자근로계약서)
CREATE TABLE contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    contract_start_date DATE NOT NULL,
    contract_end_date DATE,
    work_location VARCHAR(500) NOT NULL,
    job_description TEXT NOT NULL,
    work_start_time TIME NOT NULL,
    work_end_time TIME NOT NULL,
    break_minutes INT DEFAULT 0 NOT NULL,
    working_days VARCHAR(100) NOT NULL,
    hourly_wage INT NOT NULL,
    payment_date INT NOT NULL,
    meal_allowance INT,
    transport_allowance INT,
    other_allowances TEXT,
    benefits TEXT,
    additional_terms TEXT,
    validation_passed BOOLEAN DEFAULT FALSE NOT NULL,
    validation_result TEXT,
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    admin_signature_url VARCHAR(500),
    admin_signed_at TIMESTAMP,
    employee_signature_url VARCHAR(500),
    employee_signed_at TIMESTAMP,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_contracts_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_contracts_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_contracts_status CHECK (status IN ('draft', 'pending', 'signed', 'expired', 'cancelled')),
    CONSTRAINT chk_contracts_payment_date CHECK (payment_date BETWEEN 1 AND 31),
    CONSTRAINT chk_contracts_hourly_wage CHECK (hourly_wage > 0)
);

CREATE INDEX idx_contracts_workplace_employee ON contracts(workplace_id, employee_id);
CREATE INDEX idx_contracts_workplace_status ON contracts(workplace_id, status);

-- =============================================================================
-- 6. 급여
-- =============================================================================

-- 6.1 payrolls (급여 내역)
CREATE TABLE payrolls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    pay_year INT NOT NULL,
    pay_month INT NOT NULL,
    total_work_days INT DEFAULT 0 NOT NULL,
    total_work_minutes INT DEFAULT 0 NOT NULL,
    hourly_wage INT DEFAULT 0 NOT NULL,
    base_pay INT DEFAULT 0 NOT NULL,
    weekly_holiday_pay INT DEFAULT 0 NOT NULL,
    overtime_pay INT DEFAULT 0 NOT NULL,
    night_pay INT DEFAULT 0 NOT NULL,
    holiday_pay INT DEFAULT 0 NOT NULL,
    total_earnings INT DEFAULT 0 NOT NULL,
    earnings_detail TEXT,
    national_pension INT DEFAULT 0 NOT NULL,
    health_insurance INT DEFAULT 0 NOT NULL,
    long_term_care INT DEFAULT 0 NOT NULL,
    employment_insurance INT DEFAULT 0 NOT NULL,
    income_tax INT DEFAULT 0 NOT NULL,
    local_income_tax INT DEFAULT 0 NOT NULL,
    total_deductions INT DEFAULT 0 NOT NULL,
    deductions_detail TEXT,
    net_pay INT DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE NOT NULL,
    paid_at TIMESTAMP,
    paid_by BIGINT,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_payrolls UNIQUE (workplace_id, user_id, pay_year, pay_month),
    CONSTRAINT fk_payrolls_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_payrolls_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_payrolls_paid_by FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_payrolls_month CHECK (pay_month BETWEEN 1 AND 12),
    CONSTRAINT chk_payrolls_status CHECK (status IN ('pending', 'confirmed', 'paid'))
);

CREATE INDEX idx_payrolls_workplace_year_month ON payrolls(workplace_id, pay_year, pay_month);
CREATE INDEX idx_payrolls_workplace_status ON payrolls(workplace_id, status);

-- =============================================================================
-- 7. 공지사항
-- =============================================================================

-- 7.1 announcements (공지사항)
CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    view_count INT DEFAULT 0 NOT NULL,
    comment_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_announcements_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_announcements_view_count CHECK (view_count >= 0),
    CONSTRAINT chk_announcements_comment_count CHECK (comment_count >= 0)
);

CREATE INDEX idx_announcements_workplace_pinned ON announcements(workplace_id, is_pinned DESC, created_at DESC);

-- 7.2 announcement_attachments (공지사항 첨부파일)
CREATE TABLE announcement_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(20),
    file_size INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_ann_attach_announcement FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    CONSTRAINT chk_ann_attach_type CHECK (file_type IN ('image', 'document'))
);

CREATE INDEX idx_ann_attach_announcement_id ON announcement_attachments(announcement_id);

-- 7.3 announcement_reads (공지사항 읽음)
CREATE TABLE announcement_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_ann_reads UNIQUE (announcement_id, user_id),
    CONSTRAINT fk_ann_reads_announcement FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    CONSTRAINT fk_ann_reads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ann_reads_announcement_id ON announcement_reads(announcement_id);

-- 7.4 comments (댓글)
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    parent_id BIGINT,
    author_id BIGINT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    mention_user_id BIGINT,
    mention_user_name VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_comments_announcement FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_comments_mention FOREIGN KEY (mention_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_comments_announcement_id ON comments(announcement_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- =============================================================================
-- 8. 채팅
-- =============================================================================

-- 8.1 chat_rooms (채팅방)
CREATE TABLE chat_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    workplace_id BIGINT NOT NULL,
    room_type VARCHAR(20) NOT NULL,
    name VARCHAR(200),
    created_by BIGINT,
    last_message_content TEXT,
    last_message_sender_id BIGINT,
    last_message_sender_name VARCHAR(100),
    last_message_type VARCHAR(20),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_chat_rooms_workplace FOREIGN KEY (workplace_id) REFERENCES workplaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_rooms_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_chat_rooms_type CHECK (room_type IN ('group', 'direct'))
);

CREATE INDEX idx_chat_rooms_workplace_updated ON chat_rooms(workplace_id, updated_at DESC);

-- 8.2 chat_room_participants (채팅방 참여자)
CREATE TABLE chat_room_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    last_read_at TIMESTAMP,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_chat_participants UNIQUE (chat_room_id, user_id),
    CONSTRAINT fk_chat_participants_room FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_participants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_participants_room_id ON chat_room_participants(chat_room_id);
CREATE INDEX idx_chat_participants_user_id ON chat_room_participants(user_id);

-- 8.3 messages (메시지)
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_room_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_messages_room FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_messages_type CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'system'))
);

CREATE INDEX idx_messages_room_created ON messages(chat_room_id, created_at DESC);

-- 8.4 message_attachments (메시지 첨부파일)
CREATE TABLE message_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_type VARCHAR(20),
    mime_type VARCHAR(100),
    file_size INT DEFAULT 0 NOT NULL,
    duration INT,
    
    CONSTRAINT fk_msg_attach_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_msg_attach_message_id ON message_attachments(message_id);

-- 8.5 message_reads (메시지 읽음)
CREATE TABLE message_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_msg_reads UNIQUE (message_id, user_id),
    CONSTRAINT fk_msg_reads_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_reads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_msg_reads_message_id ON message_reads(message_id);

-- =============================================================================
-- 9. 설정
-- =============================================================================

-- 9.1 app_configs (앱 설정)
CREATE TABLE app_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_type VARCHAR(50) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT uk_app_configs UNIQUE (config_type, config_key)
);

-- =============================================================================
-- 초기 데이터
-- =============================================================================

-- 최저시급 설정
INSERT INTO app_configs (config_type, config_key, config_value, description) VALUES
('minimum_wage', '2024', '{"hourly_wage": 9860, "effective_date": "2024-01-01"}', '2024년 최저시급'),
('minimum_wage', '2025', '{"hourly_wage": 10030, "effective_date": "2025-01-01"}', '2025년 최저시급'),
('minimum_wage', '2026', '{"hourly_wage": 10320, "effective_date": "2026-01-01"}', '2026년 최저시급 (예정)');
```

---

## 3. PostgreSQL (운영 환경)

### 3.1 설정

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  flyway:
    enabled: true
    locations: classpath:db/migration
```

### 3.2 PostgreSQL 전용 DDL

PostgreSQL에서는 다음 변경사항을 적용합니다:

```sql
-- AUTO_INCREMENT → BIGSERIAL
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    -- ...
);

-- TEXT 타입 → JSONB (JSON 필드)
schedule_config JSONB,
earnings_detail JSONB,

-- 추가 인덱스 (JSONB)
CREATE INDEX idx_workplaces_schedule ON workplaces USING GIN (schedule_config);
```

---

## 4. Flyway 마이그레이션 구조

```
src/main/resources/db/migration/
├── V1__init_schema.sql           # 초기 스키마
├── V2__add_indexes.sql           # 추가 인덱스
├── V3__seed_data.sql             # 초기 데이터
└── V4__add_audit_columns.sql     # 감사 컬럼 (필요 시)
```

