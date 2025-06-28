"""
Tests for GitHubService - GitHub API Communication and Data Retrieval
"""
import pytest
import httpx
from unittest.mock import Mock, AsyncMock
from app.services.github_service import GitHubService


class TestGitHubService:
    def setup_method(self):
        """各テストの前に実行される初期化"""
        self.service = GitHubService()
    
    @pytest.mark.asyncio
    async def test_get_user_repositories_success(self, mocker):
        """ユーザーリポジトリ取得の成功テスト"""
        # モックレスポンスデータ
        mock_response_data = [
            {
                "name": "test-repo",
                "full_name": "testuser/test-repo",
                "description": "A test repository",
                "language": "Python",
                "size": 1024,
                "stargazers_count": 10,
                "forks_count": 2,
                "updated_at": "2023-01-01T00:00:00Z",
                "created_at": "2022-01-01T00:00:00Z",
                "clone_url": "https://github.com/testuser/test-repo.git",
                "languages_url": "https://api.github.com/repos/testuser/test-repo/languages",
                "fork": False
            },
            {
                "name": "forked-repo", 
                "full_name": "testuser/forked-repo",
                "description": "A forked repository",
                "language": "JavaScript",
                "size": 512,
                "stargazers_count": 5,
                "forks_count": 1,
                "updated_at": "2023-01-01T00:00:00Z",
                "created_at": "2022-01-01T00:00:00Z",
                "clone_url": "https://github.com/testuser/forked-repo.git",
                "languages_url": "https://api.github.com/repos/testuser/forked-repo/languages",
                "fork": True  # フォークされたリポジトリ
            }
        ]
        
        # HTTPXのAsyncClientをモック
        mock_response = Mock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status.return_value = None
        
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        
        mocker.patch('httpx.AsyncClient', return_value=mock_client)
        
        # テスト実行
        repos = await self.service.get_user_repositories("testuser", "mock_token")
        
        # 検証
        assert len(repos) == 1  # フォークは除外される
        assert repos[0]["name"] == "test-repo"
        assert repos[0]["language"] == "Python"
        
        # APIが正しいパラメータで呼び出されたか確認
        mock_client.get.assert_called_once()
        call_args = mock_client.get.call_args
        assert "users/testuser/repos" in str(call_args[0][0])
    
    @pytest.mark.asyncio
    async def test_get_user_repositories_not_found(self, mocker):
        """存在しないユーザーのテスト"""
        # 404エラーをモック
        mock_response = Mock()
        mock_response.status_code = 404
        
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.HTTPStatusError(
            "Not Found", request=Mock(), response=mock_response
        )
        
        mocker.patch('httpx.AsyncClient', return_value=mock_client)
        
        # テスト実行と検証
        with pytest.raises(ValueError, match="User .* not found"):
            await self.service.get_user_repositories("nonexistent", "mock_token")
    
    @pytest.mark.asyncio
    async def test_get_repository_languages_success(self, mocker):
        """リポジトリ言語取得の成功テスト"""
        mock_languages = {
            "Python": 15000,
            "JavaScript": 8000,
            "HTML": 2000
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_languages
        mock_response.raise_for_status.return_value = None
        
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        
        mocker.patch('httpx.AsyncClient', return_value=mock_client)
        
        # テスト実行
        languages = await self.service.get_repository_languages("owner", "repo", "mock_token")
        
        # 検証
        assert languages == mock_languages
        assert languages["Python"] == 15000
        assert len(languages) == 3
    
    @pytest.mark.asyncio
    async def test_get_commit_history_success(self, mocker):
        """コミット履歴取得の成功テスト"""
        mock_commits = [
            {
                "sha": "abc123",
                "url": "https://api.github.com/repos/owner/repo/commits/abc123",
                "commit": {
                    "message": "Initial commit",
                    "author": {
                        "name": "Test User",
                        "email": "test@example.com",
                        "date": "2023-01-01T00:00:00Z"
                    },
                    "committer": {
                        "name": "Test User",
                        "email": "test@example.com",
                        "date": "2023-01-01T00:00:00Z"
                    }
                }
            }
        ]
        
        mock_response = Mock()
        mock_response.json.return_value = mock_commits
        mock_response.raise_for_status.return_value = None
        
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        
        mocker.patch('httpx.AsyncClient', return_value=mock_client)
        
        # テスト実行
        commits = await self.service.get_commit_history("owner", "repo", "mock_token")
        
        # 検証
        assert len(commits) == 1
        assert commits[0]["sha"] == "abc123"
        assert commits[0]["message"] == "Initial commit"
        assert commits[0]["author"]["name"] == "Test User"
    
    @pytest.mark.asyncio
    async def test_validate_access_token_success(self, mocker):
        """アクセストークン検証の成功テスト"""
        mock_user_data = {
            "login": "testuser",
            "name": "Test User",
            "email": "test@example.com",
            "avatar_url": "https://avatars.githubusercontent.com/u/123456",
            "public_repos": 10,
            "total_private_repos": 5
        }
        
        mock_response = Mock()
        mock_response.json.return_value = mock_user_data
        mock_response.raise_for_status.return_value = None
        
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        
        mocker.patch('httpx.AsyncClient', return_value=mock_client)
        
        # テスト実行
        user_info = await self.service.validate_access_token("valid_token")
        
        # 検証
        assert user_info["login"] == "testuser"
        assert user_info["name"] == "Test User"
        assert user_info["public_repos"] == 10
        assert user_info["private_repos"] == 5
    
    @pytest.mark.asyncio
    async def test_validate_access_token_invalid(self, mocker):
        """無効なアクセストークンのテスト"""
        mock_response = Mock()
        mock_response.status_code = 401
        
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.HTTPStatusError(
            "Unauthorized", request=Mock(), response=mock_response
        )
        
        mocker.patch('httpx.AsyncClient', return_value=mock_client)
        
        # テスト実行と検証
        with pytest.raises(ValueError, match="Invalid access token"):
            await self.service.validate_access_token("invalid_token")
    
    def test_get_headers_without_token(self):
        """トークンなしでのヘッダー生成テスト"""
        headers = self.service._get_headers()
        
        assert "Accept" in headers
        assert "User-Agent" in headers
        assert "Authorization" not in headers
    
    def test_get_headers_with_token(self):
        """トークンありでのヘッダー生成テスト"""
        headers = self.service._get_headers("test_token")
        
        assert "Accept" in headers
        assert "User-Agent" in headers
        assert headers["Authorization"] == "token test_token"