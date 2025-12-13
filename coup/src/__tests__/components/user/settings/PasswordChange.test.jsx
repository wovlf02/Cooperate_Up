/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordChange from '@/app/user/settings/components/PasswordChange';

// Mock fetch
global.fetch = jest.fn();

describe('PasswordChange Component', () => {
  // Helper to get password inputs
  const getPasswordInputs = () => {
    const inputs = document.querySelectorAll('input[type="password"]');
    return {
      current: inputs[0],
      new: inputs[1],
      confirm: inputs[2]
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('렌더링 및 기본 기능', () => {
    it('컴포넌트가 올바르게 렌더링됨', () => {
      render(<PasswordChange />);
      expect(screen.getByText('🔒 비밀번호 변경')).toBeInTheDocument();
      const inputs = getPasswordInputs();
      expect(inputs.current).toBeInTheDocument();
      expect(inputs.new).toBeInTheDocument();
      expect(inputs.confirm).toBeInTheDocument();
    });

    it('비밀번호 강도 표시기 작동', async () => {
      const user = userEvent.setup();
      render(<PasswordChange />);

      const { new: newPasswordInput } = getPasswordInputs();
      await user.type(newPasswordInput, 'Test123!');

      await waitFor(() => {
        expect(screen.getByText(/강도:/i)).toBeInTheDocument();
      });
    });
  });

  describe('비밀번호 변경', () => {
    it('변경 성공', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const user = userEvent.setup();
      render(<PasswordChange />);

      const inputs = getPasswordInputs();
      await user.type(inputs.current, 'OldPass123!');
      await user.type(inputs.new, 'NewPass123!');
      await user.type(inputs.confirm, 'NewPass123!');

      fireEvent.click(screen.getByText('변경'));

      await waitFor(() => {
        const toastElement = document.querySelector('[class*="toast"]');
        expect(toastElement).toBeInTheDocument();
        expect(toastElement.className).toMatch(/toastSuccess/i);
      });
    });

    it('에러 처리 - 비밀번호 불일치', async () => {
      const user = userEvent.setup();
      render(<PasswordChange />);

      const inputs = getPasswordInputs();
      await user.type(inputs.current, 'OldPass123!');
      await user.type(inputs.new, 'NewPass123!');
      await user.type(inputs.confirm, 'Different!');

      fireEvent.click(screen.getByText('변경'));

      await waitFor(() => {
        const errorElement = document.querySelector('[class*="errorBanner"], [class*="errorText"], [class*="toast"]');
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('에러 처리 - 네트워크 오류', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      render(<PasswordChange />);

      const inputs = getPasswordInputs();
      await user.type(inputs.current, 'OldPass123!');
      await user.type(inputs.new, 'NewPass123!');
      await user.type(inputs.confirm, 'NewPass123!');

      fireEvent.click(screen.getByText('변경'));

      await waitFor(() => {
        const errorElement = document.querySelector('[class*="errorBanner"], [class*="toast"]');
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});

