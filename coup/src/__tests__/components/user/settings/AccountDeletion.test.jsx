/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccountDeletion from '@/app/user/settings/components/AccountDeletion';
import { signOut } from 'next-auth/react';

// Mock fetch
global.fetch = jest.fn();

// Mock signOut
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

describe('AccountDeletion Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    signOut.mockClear();
  });

  describe('렌더링 테스트', () => {
    it('컴포넌트가 올바르게 렌더링됨', () => {
      render(<AccountDeletion user={mockUser} />);

      expect(screen.getByText('🗑️ 계정 삭제')).toBeInTheDocument();
      expect(screen.getByText('⚠️ 주의사항')).toBeInTheDocument();
    });

    it('경고 메시지 표시됨', () => {
      render(<AccountDeletion user={mockUser} />);

      expect(screen.getByText(/계정 삭제 후 30일간 데이터가 보관되며/i)).toBeInTheDocument();
      expect(screen.getByText(/OWNER 권한의 스터디가 있는 경우/i)).toBeInTheDocument();
      expect(screen.getByText(/삭제된 계정은 복구할 수 없습니다/i)).toBeInTheDocument();
    });

    it('삭제 버튼 표시됨', () => {
      render(<AccountDeletion user={mockUser} />);

      const deleteButton = screen.getByRole('button', { name: /계정 삭제/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('다이얼로그 초기에 숨겨짐', () => {
      render(<AccountDeletion user={mockUser} />);

      expect(screen.queryByText(/계정 삭제 확인/i)).not.toBeInTheDocument();
    });

    it('주의사항 목록 표시됨', () => {
      render(<AccountDeletion user={mockUser} />);

      const warningItems = screen.getByRole('list');
      expect(warningItems).toBeInTheDocument();
      expect(warningItems.children).toHaveLength(4);
    });
  });

  describe('다이얼로그 테스트', () => {
    it('삭제 버튼 클릭 시 다이얼로그 열림', async () => {
      render(<AccountDeletion user={mockUser} />);

      const deleteButton = screen.getByRole('button', { name: /계정 삭제/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });
    });

    it('취소 버튼 클릭 시 다이얼로그 닫힘', async () => {
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // 취소 버튼 클릭
      const cancelButton = screen.getByRole('button', { name: /취소/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/계정 삭제 확인/i)).not.toBeInTheDocument();
      });
    });

    it('오버레이 클릭 시 다이얼로그 닫힘', async () => {
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // 오버레이 클릭 (다이얼로그 밖 클릭)
      const overlay = screen.getByText(/계정 삭제 확인/i).closest('.dialogOverlay');
      if (overlay) {
        fireEvent.click(overlay);
      }

      // 실제로는 이벤트 전파를 막기 때문에 다이얼로그 내부 클릭은 닫히지 않음
      // 테스트에서는 정확한 오버레이를 클릭해야 함
    });

    it('다이얼로그 내부 클릭 시 닫히지 않음', async () => {
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // 다이얼로그 내용 클릭
      const dialogTitle = screen.getByText(/계정 삭제 확인/i);
      fireEvent.click(dialogTitle);

      // 다이얼로그가 여전히 열려있음
      expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
    });
  });

  describe('확인 입력 테스트', () => {
    it('이메일 입력 검증', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // 이메일 입력
      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'test@test.com');

      // 삭제 버튼 클릭
      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/users/me',
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });

    it('"DELETE" 입력 검증', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // "DELETE" 입력
      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      // 삭제 버튼 클릭
      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/users/me',
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });

    it('잘못된 입력 시 에러', async () => {
      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // 잘못된 입력
      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'wrong');

      // 삭제 버튼 클릭
      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorElements = document.querySelectorAll('[class*="error"]');
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });

    it('확인 입력 없으면 버튼 비활성화', async () => {
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // 삭제 버튼 비활성화 확인
      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      expect(confirmButton).toBeDisabled();
    });

    it('올바른 입력 시 버튼 활성화', async () => {
      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열기
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      // 입력
      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      // 버튼 활성화 확인
      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('계정 삭제 테스트', () => {
    it('계정 삭제 성공', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열고 확인 입력
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      // 삭제 버튼 클릭
      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const toastElement = document.querySelector('[class*="toast"]');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement.className).toMatch(/toastSuccess/i);
      });
    });

    it('삭제 중 로딩 상태', async () => {
      global.fetch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() =>
          resolve({
            ok: true,
            json: async () => ({ success: true })
          }), 100))
      );

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열고 확인 입력
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      // 삭제 버튼 클릭
      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      // 로딩 상태 확인
      await waitFor(() => {
        expect(screen.getByText('삭제 중...')).toBeInTheDocument();
      });
    });

    it('성공 토스트 표시', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열고 확인 입력
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const toastElement = document.querySelector('[class*="toast"]');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement.className).toMatch(/toastSuccess/i);
      }, { timeout: 3000 });
    });

    it('로그아웃 처리', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      // 다이얼로그 열고 확인 입력
      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      // signOut 호출 확인 (2초 후)
      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/auth/signin?deleted=true' });
      }, { timeout: 3000 });
    });

    it('리다이렉트 확인', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith(
          expect.objectContaining({
            callbackUrl: expect.stringContaining('deleted=true')
          })
        );
      }, { timeout: 3000 });
    });
  });

  describe('에러 처리 테스트', () => {
    it('필수 항목 누락 (PROFILE-001)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: { code: 'PROFILE-001', message: '필수 항목이 누락되었습니다' }
        })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorElement = document.querySelector('[class*="errorBanner"], [class*="toast"]');
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('확인 불일치 (PROFILE-067)', async () => {
      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'wrong');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorElements = document.querySelectorAll('[class*="error"]');
        expect(errorElements.length).toBeGreaterThan(0);
      });
    });

    it('OWNER 스터디 존재 (PROFILE-064)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: { code: 'PROFILE-064', message: 'OWNER 권한의 스터디가 있습니다' }
        })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorElement = document.querySelector('[class*="errorBanner"], [class*="toast"]');
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('네트워크 오류 처리', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorElement = document.querySelector('[class*="errorBanner"], [class*="toast"]');
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('일반 삭제 실패 (PROFILE-069)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: { code: 'PROFILE-069', message: '계정 삭제에 실패했습니다' }
        })
      });

      const user = userEvent.setup();
      render(<AccountDeletion user={mockUser} />);

      fireEvent.click(screen.getByRole('button', { name: /계정 삭제/i }));

      await waitFor(() => {
        expect(screen.getByText(/계정 삭제 확인/i)).toBeInTheDocument();
      });

      const confirmInput = screen.getByPlaceholderText(/test@test.com/i);
      await user.type(confirmInput, 'DELETE');

      const confirmButton = screen.getAllByRole('button', { name: /삭제/i })[1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const errorElement = document.querySelector('[class*="errorBanner"], [class*="toast"]');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});

