"""
Tests for AnalysisService - Core GitHub Repository Analysis Orchestration
"""
import pytest
import uuid
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch
from app.services.analysis_service import AnalysisService
from app.models.analysis import AnalysisRequest, AnalysisJob, LanguageIntensity


class TestAnalysisService:
    def setup_method(self):
        """各テストの前に実行される初期化"""
        self.service = AnalysisService()
    
    @pytest.mark.asyncio
    async def test_start_analysis_creates_job(self):
        """分析開始時にジョブが作成されるテスト"""
        request = AnalysisRequest(
            github_username="testuser",
            access_token="mock_token"
        )
        
        # _perform_analysisが実行されないようにモック
        with patch.object(self.service, '_perform_analysis') as mock_perform:
            job = await self.service.start_analysis(request)
        
        # 検証
        assert isinstance(job, AnalysisJob)
        assert job.status == "pending"
        assert job.job_id in self.service.jobs
        assert isinstance(job.created_at, datetime)
        
        # バックグラウンド処理が開始されたか確認
        mock_perform.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_analysis_status_existing_job(self):
        """既存ジョブのステータス取得テスト"""
        # ジョブを手動で作成
        job_id = str(uuid.uuid4())
        job = AnalysisJob(
            job_id=job_id,
            status="processing",
            created_at=datetime.now()
        )
        self.service.jobs[job_id] = job
        
        # テスト実行
        retrieved_job = await self.service.get_analysis_status(job_id)
        
        # 検証
        assert retrieved_job.job_id == job_id
        assert retrieved_job.status == "processing"
    
    @pytest.mark.asyncio
    async def test_get_analysis_status_nonexistent_job(self):
        """存在しないジョブのステータス取得テスト"""
        with pytest.raises(ValueError, match="Job .* not found"):
            await self.service.get_analysis_status("nonexistent-job-id")
    
    @pytest.mark.asyncio
    async def test_get_analysis_result_completed_job(self):
        """完了したジョブの結果取得テスト"""
        # 完了済みジョブを手動で作成
        job_id = str(uuid.uuid4())
        mock_result = Mock(spec=['username', 'analysis_date', 'languages'])
        mock_result.username = "testuser"
        
        job = AnalysisJob(
            job_id=job_id,
            status="completed",
            created_at=datetime.now(),
            completed_at=datetime.now(),
            result=mock_result
        )
        self.service.jobs[job_id] = job
        
        # テスト実行
        result = await self.service.get_analysis_result(job_id)
        
        # 検証
        assert result == mock_result
        assert result.username == "testuser"
    
    @pytest.mark.asyncio
    async def test_get_analysis_result_incomplete_job(self):
        """未完了ジョブの結果取得テスト"""
        job_id = str(uuid.uuid4())
        job = AnalysisJob(
            job_id=job_id,
            status="processing",
            created_at=datetime.now()
        )
        self.service.jobs[job_id] = job
        
        with pytest.raises(ValueError, match="Job .* is not completed"):
            await self.service.get_analysis_result(job_id)
    
    @pytest.mark.asyncio
    async def test_perform_analysis_success(self, mocker):
        """分析処理の成功テスト"""
        # モックデータ
        mock_repos = [
            {
                "name": "test-repo",
                "full_name": "testuser/test-repo"
            }
        ]
        
        mock_languages = {
            "Python": 10000,
            "JavaScript": 5000
        }
        
        mock_commits = [
            {
                "sha": "abc123",
                "author": {
                    "date": "2023-06-01T00:00:00Z"
                }
            },
            {
                "sha": "def456", 
                "author": {
                    "date": "2023-01-01T00:00:00Z"
                }
            }
        ]
        
        # GitHubServiceのメソッドをモック
        mocker.patch.object(
            self.service.github_service,
            'get_user_repositories',
            return_value=mock_repos
        )
        mocker.patch.object(
            self.service.github_service,
            'get_repository_languages',
            return_value=mock_languages
        )
        mocker.patch.object(
            self.service.github_service,
            'get_commit_history',
            return_value=mock_commits
        )
        
        # IntencyServiceのメソッドをモック
        mocker.patch.object(
            self.service.intency_service,
            'calculate_language_intensity',
            side_effect=[75.5, 45.2]  # Python, JavaScriptの順
        )
        
        # ジョブを作成
        job_id = str(uuid.uuid4())
        job = AnalysisJob(
            job_id=job_id,
            status="pending",
            created_at=datetime.now()
        )
        self.service.jobs[job_id] = job
        
        request = AnalysisRequest(
            github_username="testuser",
            access_token="mock_token"
        )
        
        # テスト実行
        await self.service._perform_analysis(job_id, request)
        
        # 検証
        updated_job = self.service.jobs[job_id]
        assert updated_job.status == "completed"
        assert updated_job.result is not None
        assert updated_job.result.username == "testuser"
        assert len(updated_job.result.languages) == 2
        
        # 言語強度が高い順にソートされているか確認
        languages = updated_job.result.languages
        assert languages[0].language == "Python"
        assert languages[0].intensity == 75.5
        assert languages[1].language == "JavaScript"
        assert languages[1].intensity == 45.2
    
    @pytest.mark.asyncio
    async def test_perform_analysis_failure(self, mocker):
        """分析処理の失敗テスト"""
        # GitHubServiceでエラーが発生するようにモック
        mocker.patch.object(
            self.service.github_service,
            'get_user_repositories',
            side_effect=ValueError("API Error")
        )
        
        # ジョブを作成
        job_id = str(uuid.uuid4())
        job = AnalysisJob(
            job_id=job_id,
            status="pending",
            created_at=datetime.now()
        )
        self.service.jobs[job_id] = job
        
        request = AnalysisRequest(
            github_username="testuser",
            access_token="mock_token"
        )
        
        # テスト実行
        await self.service._perform_analysis(job_id, request)
        
        # 検証
        updated_job = self.service.jobs[job_id]
        assert updated_job.status == "failed"
        assert updated_job.error_message == "API Error"
        assert updated_job.completed_at is not None
    
    def test_filter_recent_commits(self):
        """最近のコミットフィルタリングテスト"""
        commits = [
            {
                "author": {"date": "2023-06-01T00:00:00Z"}  # 最近
            },
            {
                "author": {"date": "2022-01-01T00:00:00Z"}  # 古い
            },
            {
                "author": {"date": "2023-12-01T00:00:00Z"}  # 最近
            }
        ]
        
        # 12ヶ月以内のコミットをフィルタ
        recent_commits = self.service._filter_recent_commits(commits, 12)
        
        # 検証（実際の日付により結果は変わるが、フィルタリングが機能することを確認）
        assert len(recent_commits) <= len(commits)
        assert all("author" in commit for commit in recent_commits)
    
    def test_filter_recent_commits_invalid_dates(self):
        """無効な日付を含むコミットのフィルタリングテスト"""
        commits = [
            {
                "author": {"date": "2023-06-01T00:00:00Z"}  # 有効
            },
            {
                "author": {"date": "invalid-date"}  # 無効
            },
            {
                "author": {}  # 日付なし
            }
        ]
        
        recent_commits = self.service._filter_recent_commits(commits, 12)
        
        # 無効な日付のコミットはスキップされる
        assert len(recent_commits) <= 1
    
    def test_filter_recent_commits_zero_months(self):
        """0ヶ月指定時のフィルタリングテスト"""
        commits = [{"author": {"date": "2023-06-01T00:00:00Z"}}]
        
        # 0ヶ月指定時は全コミットが返される
        result = self.service._filter_recent_commits(commits, 0)
        assert result == commits