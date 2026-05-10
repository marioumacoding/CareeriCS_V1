"""
Career blog service for fetching career level details from existing blog_career tables.
Provides data for the Job Details / Career Blog UI.
"""

import uuid
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from db.models import (
    BlogCareerLevel,
    BlogCareerLevelSkill,
    BlogCareerLevelResponsibility,
    BlogCareerLevelFitProfile,
)


def _map_demand_to_color(demand: Optional[str]) -> str:
    """
    Map demand string to hex color value.
    
    Args:
        demand: One of "Low", "Medium", "High", or None
    
    Returns:
        Hex color value
    """
    if not demand:
        return "#FFBC6A"
    
    demand_lower = demand.lower()
    if demand_lower == "low":
        return "#FFBC6A"
    elif demand_lower == "medium":
        return "#FFF47C"
    elif demand_lower == "high":
        return "#E6FFB2"
    else:
        return "#FFBC6A"  # Default fallback


def _format_salary_range(salary_min: Optional[int], salary_max: Optional[int]) -> str:
    """Format salary_min and salary_max into a readable string."""
    if salary_min is None and salary_max is None:
        return "N/A"
    elif salary_min is None:
        return f"E£ {salary_max}K"
    elif salary_max is None:
        return f"E£ {salary_min}K"
    else:
        return f"E£ {salary_min}-{salary_max}K"


def _deduplicate_list(items: Optional[List[str]]) -> List[str]:
    """Remove duplicates while preserving order."""
    if not items:
        return []
    
    seen = set()
    result = []
    for item in items:
        if item and item not in seen:
            seen.add(item)
            result.append(item)
    return result


def _normalize_level_name(level: Optional[str]) -> Optional[str]:
    """Normalize DB level value to API key format expected by frontend."""
    if not level:
        return None

    normalized = level.strip().lower()
    mapping = {
        "entry": "Entry",
        "junior": "Junior",
        "senior": "Senior",
    }
    return mapping.get(normalized)


def get_career_blog_details(
    db: Session,
    career_id: str,
    level: str = "Junior"
) -> Optional[Dict[str, Dict]]:
    """
    Fetch career blog details for a specific career and level.
    
    Args:
        db: Database session
        career_id: UUID of the career (from career_tracks.id - this is trackId from frontend)
        level: Career level ("Entry", "Junior", "Senior")
    
    Returns:
        Dict with Entry/Junior/Senior levels or None if not found
    """
    
    try:
        # Convert career_id string to UUID if needed
        if isinstance(career_id, str):
            career_uuid = uuid.UUID(career_id)
        else:
            career_uuid = career_id
        
        print(f"[DEBUG] Querying blog_career_levels with career_id={career_uuid}")
    except (ValueError, TypeError) as e:
        print(f"[ERROR] Invalid career_id format: {career_id} - {e}")
        return None
    
    try:
        # Fetch all career levels for this career using career_id directly
        # blog_career_levels.career_id references career_tracks.id
        career_levels = db.query(BlogCareerLevel).filter(
            BlogCareerLevel.career_id == career_uuid
        ).all()
        
        print(f"[DEBUG] Found {len(career_levels)} career levels for career_id={career_uuid}")
        
        if not career_levels:
            print(f"[WARNING] No career levels found for career_id={career_uuid}")
            return None
    except Exception as e:
        print(f"[ERROR] Database query failed: {e}")
        return None
    
    # Build response for all three levels
    result = {}
    
    for career_level in career_levels:
        level_name = _normalize_level_name(career_level.level)
        if not level_name:
            continue
        
        # Fetch skills for this level
        skills_records = db.query(BlogCareerLevelSkill).filter(
            BlogCareerLevelSkill.career_level_id == career_level.id
        ).all()
        level_skills = [s.skill_name for s in skills_records]
        
        # Fetch responsibilities for this level
        resp_records = db.query(BlogCareerLevelResponsibility).filter(
            BlogCareerLevelResponsibility.career_level_id == career_level.id
        ).all()
        responsibilities = [r.description for r in resp_records]
        
        # Fetch fit profiles for this level
        fit_records = db.query(BlogCareerLevelFitProfile).filter(
            BlogCareerLevelFitProfile.career_level_id == career_level.id
        ).all()
        fit_reasons = [f.statement for f in fit_records]
        
        # Format salary
        salary = _format_salary_range(career_level.salary_min, career_level.salary_max)
        
        print(f"[DEBUG] Level {level_name}: {len(level_skills)} skills, {len(responsibilities)} responsibilities, {len(fit_reasons)} fit reasons")
        
        # Build level detail
        result[level_name] = {
            "salary": salary,
            "demand": career_level.market_demand or "N/A",
            "demandColor": _map_demand_to_color(career_level.market_demand),
            "responsibilities": _deduplicate_list(responsibilities),
            "fitReason": _deduplicate_list(fit_reasons),
            "skills": _deduplicate_list(level_skills)
        }
    
    # Ensure all three levels exist
    for level_name in ["Entry", "Junior", "Senior"]:
        if level_name not in result:
            result[level_name] = {
                "salary": "N/A",
                "demand": "N/A",
                "demandColor": "#FFBC6A",
                "responsibilities": [],
                "fitReason": [],
                "skills": []
            }
    
    print(f"[DEBUG] Returning result with keys: {list(result.keys())}")
    return result
