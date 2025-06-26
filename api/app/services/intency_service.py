from typing import List, Dict
import math
import logging

logger = logging.getLogger(__name__)

class IntencyService:
    def __init__(self):
        # Language complexity weights (higher = more complex)
        self.language_complexity = {
            "C++": 1.4,
            "C": 1.3,
            "Rust": 1.3,
            "Assembly": 1.5,
            "Java": 1.2,
            "C#": 1.2,
            "Go": 1.1,
            "Python": 1.0,
            "JavaScript": 1.0,
            "TypeScript": 1.1,
            "PHP": 0.9,
            "Ruby": 0.9,
            "HTML": 0.5,
            "CSS": 0.6,
            "Markdown": 0.3,
            "JSON": 0.2,
            "XML": 0.4,
            "YAML": 0.3
        }
    
    def calculate_language_intensity(self, language: str, total_bytes: int, commit_count: int, repository_count: int) -> float:
        """
        Calculate intensity score for a programming language
        Based on:
        - Code volume (bytes/lines of code)
        - Commit frequency  
        - Repository count
        - Language complexity
        """
        if total_bytes == 0 or commit_count == 0:
            return 0.0
        
        # Base metrics
        line_count = total_bytes // 50  # Rough estimation: 50 bytes per line
        
        # Calculate base intensity components
        volume_score = self._calculate_volume_score(line_count)
        commit_score = self._calculate_commit_score(commit_count)
        repository_score = self._calculate_repository_score(repository_count)
        complexity_multiplier = self._get_language_complexity(language)
        
        # Combine scores with weights
        base_intensity = (
            volume_score * 0.4 +      # 40% weight on code volume
            commit_score * 0.35 +     # 35% weight on commit activity  
            repository_score * 0.25   # 25% weight on repository spread
        )
        
        # Apply language complexity multiplier
        final_intensity = base_intensity * complexity_multiplier
        
        # Cap the maximum intensity at 100
        final_intensity = min(final_intensity, 100.0)
        
        logger.debug(f"Intensity for {language}: volume={volume_score:.1f}, "
                    f"commits={commit_score:.1f}, repos={repository_score:.1f}, "
                    f"complexity={complexity_multiplier:.1f}, final={final_intensity:.1f}")
        
        return round(final_intensity, 2)
    
    def _calculate_volume_score(self, line_count: int) -> float:
        """
        Calculate score based on code volume (logarithmic scale)
        """
        if line_count <= 0:
            return 0.0
        
        # Logarithmic scaling: significant experience starts showing around 1000 lines
        # Max score around 100k lines
        score = math.log10(max(line_count, 1)) * 15
        return min(score, 50.0)  # Cap at 50 points for volume
    
    def _calculate_commit_score(self, commit_count: int) -> float:
        """
        Calculate score based on commit frequency (logarithmic scale)
        """
        if commit_count <= 0:
            return 0.0
        
        # Logarithmic scaling: regular contribution shows experience
        # Active development = higher intensity
        score = math.log10(max(commit_count, 1)) * 20
        return min(score, 40.0)  # Cap at 40 points for commits
    
    def _calculate_repository_score(self, repository_count: int) -> float:
        """
        Calculate score based on repository spread (square root scale)
        """
        if repository_count <= 0:
            return 0.0
        
        # Square root scaling: using language across multiple projects shows expertise
        score = math.sqrt(repository_count) * 8
        return min(score, 30.0)  # Cap at 30 points for repository spread
    
    def _get_language_complexity(self, language: str) -> float:
        """
        Get complexity multiplier for a language
        """
        return self.language_complexity.get(language, 1.0)  # Default to 1.0 for unknown languages
    
    def _apply_time_weight(self, base_intensity: float, maintenance_months: int) -> float:
        """
        Apply time-based weighting to intensity score
        Recent activity gets higher weight
        """
        if maintenance_months <= 0:
            return base_intensity
        
        # Decay factor: older projects get slightly lower weight
        # But we don't want to penalize long-term projects too much
        decay_factor = math.exp(-maintenance_months / 36.0)  # 36 months half-life
        time_weight = 0.7 + 0.3 * decay_factor  # Minimum 70% weight
        
        return base_intensity * time_weight
    
    def normalize_intensities(self, intensities: List[float]) -> List[float]:
        """
        Normalize intensity scores to 0-100 range while preserving relative differences
        """
        if not intensities:
            return []
        
        max_intensity = max(intensities)
        if max_intensity == 0:
            return intensities
        
        # Scale so the highest intensity becomes 100
        scaling_factor = 100.0 / max_intensity
        normalized = [intensity * scaling_factor for intensity in intensities]
        
        return [round(score, 2) for score in normalized]