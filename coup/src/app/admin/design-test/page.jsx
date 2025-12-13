'use client'

import React, { useState } from 'react'
import Button from '@/components/admin/ui/Button'
import Input from '@/components/admin/ui/Input'
import Select from '@/components/admin/ui/Select'
import Badge from '@/components/admin/ui/Badge'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/admin/ui/Card'
import Table from '@/components/admin/ui/Table'
import StatCard from '@/components/admin/ui/Stats'
import { ToastProvider, useToast } from '@/components/admin/ui/Toast'
import styles from './page.module.css'

/**
 * 디자인 시스템 테스트 페이지
 */
function DesignTestContent() {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [multiSelectValue, setMultiSelectValue] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const { toast } = useToast()

  const handleLoadingClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const selectOptions = [
    { value: 'option1', label: '옵션 1' },
    { value: 'option2', label: '옵션 2' },
    { value: 'option3', label: '옵션 3' },
    { value: 'option4', label: '옵션 4', group: '그룹 A' },
    { value: 'option5', label: '옵션 5', group: '그룹 A' },
    { value: 'option6', label: '옵션 6', group: '그룹 B' },
  ]

  const tableColumns = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일', sortable: true },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? '활성' : '비활성'}
        </Badge>
      )
    },
  ]

  const tableData = [
    { id: 1, name: '김철수', email: 'kim@example.com', status: 'active' },
    { id: 2, name: '이영희', email: 'lee@example.com', status: 'active' },
    { id: 3, name: '박민수', email: 'park@example.com', status: 'inactive' },
    { id: 4, name: '정수진', email: 'jung@example.com', status: 'active' },
  ]

  const handleToast = (type) => {
    switch(type) {
      case 'success':
        toast.success('성공적으로 처리되었습니다!')
        break
      case 'error':
        toast.error('오류가 발생했습니다.')
        break
      case 'warning':
        toast.warning('주의가 필요합니다.')
        break
      case 'info':
        toast.info('알림 메시지입니다.')
        break
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>🎨 디자인 시스템 테스트</h1>
        <p>Phase 1: 기본 UI 컴포넌트</p>
      </div>

      <div className={styles.content}>
        {/* CSS 변수 섹션 */}
        <section className={styles.section}>
          <h2>CSS 변수</h2>
          <Card variant="outlined">
            <CardContent>
              <div className={styles.colorGrid}>
                <div className={styles.colorItem}>
                  <div className={styles.colorBox} style={{ backgroundColor: 'var(--primary-500)' }} />
                  <span>Primary</span>
                </div>
                <div className={styles.colorItem}>
                  <div className={styles.colorBox} style={{ backgroundColor: 'var(--success-500)' }} />
                  <span>Success</span>
                </div>
                <div className={styles.colorItem}>
                  <div className={styles.colorBox} style={{ backgroundColor: 'var(--warning-500)' }} />
                  <span>Warning</span>
                </div>
                <div className={styles.colorItem}>
                  <div className={styles.colorBox} style={{ backgroundColor: 'var(--danger-500)' }} />
                  <span>Danger</span>
                </div>
                <div className={styles.colorItem}>
                  <div className={styles.colorBox} style={{ backgroundColor: 'var(--info-500)' }} />
                  <span>Info</span>
                </div>
                <div className={styles.colorItem}>
                  <div className={styles.colorBox} style={{ backgroundColor: 'var(--gray-500)' }} />
                  <span>Gray</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Button 섹션 */}
        <section className={styles.section}>
          <h2>Button</h2>

          <Card variant="outlined">
            <CardHeader>
              <h3>Variants</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.buttonGroup}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>Sizes</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.buttonGroup}>
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>States</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.buttonGroup}>
                <Button loading={loading} onClick={handleLoadingClick}>
                  {loading ? '로딩 중...' : '로딩 테스트'}
                </Button>
                <Button disabled>Disabled</Button>
                <Button active>Active</Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>With Icons</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.buttonGroup}>
                <Button
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  }
                >
                  추가
                </Button>
                <Button
                  variant="outline"
                  rightIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  다음
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input 섹션 */}
        <section className={styles.section}>
          <h2>Input</h2>

          <Card variant="outlined">
            <CardHeader>
              <h3>Basic</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.inputGroup}>
                <Input
                  label="이메일"
                  type="email"
                  placeholder="email@example.com"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="이메일 주소를 입력하세요"
                />
                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>Sizes</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.inputGroup}>
                <Input size="sm" placeholder="Small" />
                <Input size="md" placeholder="Medium" />
                <Input size="lg" placeholder="Large" />
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>States</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.inputGroup}>
                <Input
                  label="에러 상태"
                  error="유효하지 않은 입력입니다"
                  placeholder="에러..."
                />
                <Input
                  label="비활성 상태"
                  disabled
                  placeholder="비활성..."
                />
                <Input
                  label="읽기 전용"
                  readonly
                  value="읽기 전용 값"
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>With Icons</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.inputGroup}>
                <Input
                  type="search"
                  placeholder="검색..."
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  }
                />
                <Input
                  type="email"
                  placeholder="email@example.com"
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Select 섹션 */}
        <section className={styles.section}>
          <h2>Select</h2>

          <Card variant="outlined">
            <CardHeader>
              <h3>Basic</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.inputGroup}>
                <Select
                  label="상태"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="선택하세요"
                  helperText="옵션을 선택하세요"
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>Searchable</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.inputGroup}>
                <Select
                  label="검색 가능한 Select"
                  options={selectOptions}
                  searchable
                  placeholder="검색하여 선택..."
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>Multiple</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.inputGroup}>
                <Select
                  label="다중 선택"
                  options={selectOptions}
                  value={multiSelectValue}
                  onChange={setMultiSelectValue}
                  multiple
                  placeholder="여러 개 선택 가능"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badge 섹션 */}
        <section className={styles.section}>
          <h2>Badge</h2>

          <Card variant="outlined">
            <CardHeader>
              <h3>Variants</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.badgeGroup}>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>Sizes</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.badgeGroup}>
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>With Dot</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.badgeGroup}>
                <Badge variant="success" dot>활성</Badge>
                <Badge variant="danger" dot>비활성</Badge>
                <Badge variant="warning" dot>대기 중</Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h3>Removable</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.badgeGroup}>
                <Badge variant="primary" removable onRemove={() => alert('제거!')}>
                  제거 가능
                </Badge>
                <Badge variant="info" removable onRemove={() => alert('제거!')}>
                  태그
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card 섹션 */}
        <section className={styles.section}>
          <h2>Card</h2>

          <div className={styles.cardGrid}>
            <Card variant="default">
              <CardHeader>
                <h3>Default Card</h3>
              </CardHeader>
              <CardContent>
                <p>기본 카드 스타일입니다. 얇은 테두리와 작은 그림자가 있습니다.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">액션</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <h3>Elevated Card</h3>
              </CardHeader>
              <CardContent>
                <p>떠있는 느낌의 카드입니다. 테두리가 없고 큰 그림자가 있습니다.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="primary">액션</Button>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <h3>Outlined Card</h3>
              </CardHeader>
              <CardContent>
                <p>테두리만 있는 카드입니다. 그림자가 없습니다.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">액션</Button>
              </CardFooter>
            </Card>
          </div>

          <div className={styles.cardGrid}>
            <Card variant="elevated" hoverable>
              <CardContent>
                <h3>Hoverable Card</h3>
                <p>마우스를 올리면 효과가 나타납니다.</p>
              </CardContent>
            </Card>

            <Card variant="elevated" clickable onClick={() => alert('카드 클릭!')}>
              <CardContent>
                <h3>Clickable Card</h3>
                <p>클릭할 수 있는 카드입니다.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Table 섹션 */}
        <section className={styles.section}>
          <h2>Table</h2>

          <Card variant="outlined">
            <CardHeader>
              <h3>기본 테이블</h3>
            </CardHeader>
            <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                sortable
                selectable
                selectedRows={selectedRows}
                onSelectRows={setSelectedRows}
                loading={tableLoading}
                onRowClick={(row) => alert(`${row.name} 클릭!`)}
              />
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTableLoading(true)}
                  disabled={tableLoading}
                >
                  {tableLoading ? '로딩 중...' : '로딩 테스트'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRows([])}
                  disabled={selectedRows.length === 0}
                >
                  선택 해제
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats 섹션 */}
        <section className={styles.section}>
          <h2>Stats Card</h2>

          <div className={styles.statsGrid}>
            <StatCard
              title="총 사용자"
              value={1234}
              previousValue={1100}
              unit="명"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                </svg>
              }
              iconColor="primary"
              countUp
            />
            <StatCard
              title="활성 스터디"
              value={45}
              previousValue={52}
              unit="개"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
                </svg>
              }
              iconColor="success"
            />
            <StatCard
              title="신규 가입"
              value={89}
              previousValue={67}
              unit="명"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              }
              iconColor="info"
            />
            <StatCard
              title="처리 대기"
              value={12}
              unit="건"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              }
              iconColor="warning"
            />
          </div>
        </section>

        {/* Toast 섹션 */}
        <section className={styles.section}>
          <h2>Toast</h2>

          <Card variant="outlined">
            <CardHeader>
              <h3>알림 테스트</h3>
            </CardHeader>
            <CardContent>
              <div className={styles.buttonGroup}>
                <Button onClick={() => handleToast('success')} variant="primary">
                  Success Toast
                </Button>
                <Button onClick={() => handleToast('error')} variant="danger">
                  Error Toast
                </Button>
                <Button onClick={() => handleToast('warning')} variant="secondary">
                  Warning Toast
                </Button>
                <Button onClick={() => handleToast('info')} variant="outline">
                  Info Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default function DesignTestPage() {
  return (
    <ToastProvider position="top-right">
      <DesignTestContent />
    </ToastProvider>
  )
}
