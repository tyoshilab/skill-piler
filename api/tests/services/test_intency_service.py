"""
Tests for IntencyService - Custom Programming Language Skill Intensity Calculation
"""
import pytest
from app.services.intency_service import IntencyService


class TestIntencyService:
    def setup_method(self):
        """各テストの前に実行される初期化"""
        self.service = IntencyService()
    
    def test_calculate_language_intensity_basic(self):
        """基本的な言語強度計算のテスト"""
        intensity = self.service.calculate_language_intensity(
            language="Python",
            total_bytes=10000,
            commit_count=50,
            repository_count=3,
            recent_activity=20
        )
        
        assert intensity > 0
        assert isinstance(intensity, float)
        assert intensity <= 100.0
    
    def test_calculate_language_intensity_zero_values(self):
        """ゼロ値での強度計算テスト"""
        intensity = self.service.calculate_language_intensity(
            language="Python",
            total_bytes=0,
            commit_count=0,
            repository_count=1
        )
        
        assert intensity == 0.0
    
    def test_calculate_language_intensity_complex_language(self):
        """複雑な言語（C++）での強度計算テスト"""
        cpp_intensity = self.service.calculate_language_intensity(
            language="C++",
            total_bytes=5000,
            commit_count=25,
            repository_count=2
        )
        
        python_intensity = self.service.calculate_language_intensity(
            language="Python",
            total_bytes=5000,
            commit_count=25,
            repository_count=2
        )
        
        # C++はPythonより複雑度が高いため、同じ使用量でも強度が高くなる
        assert cpp_intensity > python_intensity
    
    def test_calculate_language_intensity_with_recent_activity(self):
        """最近の活動を含む強度計算テスト"""
        with_recent = self.service.calculate_language_intensity(
            language="Python",
            total_bytes=5000,
            commit_count=50,
            repository_count=2,
            recent_activity=30
        )
        
        without_recent = self.service.calculate_language_intensity(
            language="Python",
            total_bytes=5000,
            commit_count=50,
            repository_count=2,
            recent_activity=0
        )
        
        # 最近の活動があると強度にブーストがかかる
        assert with_recent > without_recent
    
    def test_get_language_complexity(self):
        """言語複雑度の取得テスト"""
        assert self.service._get_language_complexity("C++") == 1.4
        assert self.service._get_language_complexity("Python") == 1.0
        assert self.service._get_language_complexity("HTML") == 0.5
        assert self.service._get_language_complexity("UnknownLang") == 1.0
    
    def test_calculate_volume_score(self):
        """コード量スコア計算テスト"""
        # 小さな値
        small_score = self.service._calculate_volume_score(100)
        # 大きな値
        large_score = self.service._calculate_volume_score(10000)
        
        assert small_score < large_score
        assert small_score >= 0
        assert large_score <= 50.0  # 上限チェック
    
    def test_calculate_commit_score(self):
        """コミットスコア計算テスト"""
        small_score = self.service._calculate_commit_score(5)
        large_score = self.service._calculate_commit_score(100)
        
        assert small_score < large_score
        assert small_score >= 0
        assert large_score <= 40.0  # 上限チェック
    
    def test_calculate_repository_score(self):
        """リポジトリスコア計算テスト"""
        single_repo = self.service._calculate_repository_score(1)
        multiple_repos = self.service._calculate_repository_score(9)
        
        assert single_repo < multiple_repos
        assert single_repo >= 0
        assert multiple_repos <= 30.0  # 上限チェック
    
    def test_normalize_intensities(self):
        """強度の正規化テスト"""
        intensities = [10.0, 20.0, 50.0, 30.0]
        normalized = self.service.normalize_intensities(intensities)
        
        # 最大値が100になる
        assert max(normalized) == 100.0
        # 相対的な順序が保たれる
        assert normalized[2] > normalized[3] > normalized[1] > normalized[0]
        # すべて正の値
        assert all(score >= 0 for score in normalized)
    
    def test_normalize_intensities_empty_list(self):
        """空リストの正規化テスト"""
        normalized = self.service.normalize_intensities([])
        assert normalized == []
    
    def test_normalize_intensities_all_zero(self):
        """すべてゼロのリストの正規化テスト"""
        intensities = [0.0, 0.0, 0.0]
        normalized = self.service.normalize_intensities(intensities)
        assert normalized == [0.0, 0.0, 0.0]