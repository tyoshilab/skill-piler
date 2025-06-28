import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserInput from './UserInput';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

// Zustandストアをモック化
jest.mock('../hooks/useAnalysisStore');

const mockUseAnalysisStore = useAnalysisStore as jest.MockedFunction<typeof useAnalysisStore>;

describe('UserInput', () => {
  const mockStartAnalysis = jest.fn();

  beforeEach(() => {
    // 各テストの前にモックをリセット
    jest.clearAllMocks();
    // useAnalysisStoreの戻り値を設定
    mockUseAnalysisStore.mockReturnValue({
      startAnalysis: mockStartAnalysis,
      isLoading: false,
      currentAnalysis: null,
      currentJob: null,
      timeSeriesData: null,
      isLoadingTimeSeries: false,
      error: null,
      loadTimeSeriesData: jest.fn(),
      clearAnalysis: jest.fn(),
      setError: jest.fn(),
      pollJobStatus: jest.fn(),
    });
  });

  it('初期レンダリング時に必要な要素がすべて表示される', () => {
    render(<UserInput />);

    expect(screen.getByLabelText(/github username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/include private repositories/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('ユーザー名を入力できる', async () => {
    render(<UserInput />);
    const user = userEvent.setup();

    const usernameInput = screen.getByLabelText(/github username/i);
    await user.type(usernameInput, 'testuser');

    expect(usernameInput).toHaveValue('testuser');
  });

  it('プライベートリポジトリのチェックボックスをクリックできる', async () => {
    render(<UserInput />);
    const user = userEvent.setup();

    const checkbox = screen.getByLabelText(/include private repositories/i);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('フォームを送信すると、正しい引数でstartAnalysisが呼ばれる', async () => {
    render(<UserInput />);
    const user = userEvent.setup();

    // 1. ユーザー名を入力
    await user.type(screen.getByLabelText(/github username/i), 'testuser');

    // 2. チェックボックスをクリック
    await user.click(screen.getByLabelText(/include private repositories/i));

    // 3. 送信ボタンをクリック
    await user.click(screen.getByRole('button', { name: /analyze/i }));

    // 4. startAnalysisが正しい引数で呼び出されたか検証
    expect(mockStartAnalysis).toHaveBeenCalledWith({
      github_username: 'testuser',
      include_private: true,
    });
  });

  it('空のユーザー名では送信ボタンが無効化される', () => {
    render(<UserInput />);

    const submitButton = screen.getByRole('button', { name: /analyze/i });
    expect(submitButton).toBeDisabled();
  });

  it('isLoadingがtrueの間、送信ボタンは無効化される', () => {
    // isLoading: trueの状態でストアをモック
    mockUseAnalysisStore.mockReturnValue({
      startAnalysis: mockStartAnalysis,
      isLoading: true,
      currentAnalysis: null,
      currentJob: null,
      timeSeriesData: null,
      isLoadingTimeSeries: false,
      error: null,
      loadTimeSeriesData: jest.fn(),
      clearAnalysis: jest.fn(),
      setError: jest.fn(),
      pollJobStatus: jest.fn(),
    });

    render(<UserInput />);

    // ボタンが無効であることを検証
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
    expect(screen.getByLabelText(/github username/i)).toBeDisabled();
    expect(screen.getByLabelText(/include private repositories/i)).toBeDisabled();
  });

  it('ローディング中は"Analyzing..."と表示される', () => {
    mockUseAnalysisStore.mockReturnValue({
      startAnalysis: mockStartAnalysis,
      isLoading: true,
      currentAnalysis: null,
      currentJob: null,
      timeSeriesData: null,
      isLoadingTimeSeries: false,
      error: null,
      loadTimeSeriesData: jest.fn(),
      clearAnalysis: jest.fn(),
      setError: jest.fn(),
      pollJobStatus: jest.fn(),
    });

    render(<UserInput />);

    expect(screen.getByRole('button', { name: /analyzing/i })).toBeInTheDocument();
  });

  it('空白のみのユーザー名は無効とみなされる', async () => {
    render(<UserInput />);
    const user = userEvent.setup();

    const usernameInput = screen.getByLabelText(/github username/i);
    const submitButton = screen.getByRole('button', { name: /analyze/i });

    // 空白のみを入力
    await user.type(usernameInput, '   ');

    expect(submitButton).toBeDisabled();
  });

  it('ユーザー名にトリム処理が適用される', async () => {
    render(<UserInput />);
    const user = userEvent.setup();

    // 前後に空白があるユーザー名を入力
    await user.type(screen.getByLabelText(/github username/i), '  testuser  ');
    await user.click(screen.getByRole('button', { name: /analyze/i }));

    // トリムされたユーザー名で呼び出されることを確認
    expect(mockStartAnalysis).toHaveBeenCalledWith({
      github_username: 'testuser',
      include_private: false,
    });
  });
});