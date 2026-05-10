"""
Career blog router for fetching career level details from existing blog_career tables.
Provides data for the Job Details / Career Blog UI.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

import schemas
from dependencies import get_db
from services.career.blog_service import get_career_blog_details

router = APIRouter(
    prefix="/blog",
    tags=["career_blog"]
)


@router.get("/career-details")
def get_career_details(
    careerId: str = Query(..., description="Career ID (UUID from career_tracks.id)"),
    level: str = Query("Junior", description="Career level: Entry, Junior, or Senior"),
    db: Session = Depends(get_db)
):
    """
    Get career blog details for a specific career and level.
    
    Queries existing blog_career_levels and related tables by career_id.
    
    Query Parameters:
    - careerId (required): UUID from career_tracks.id
    - level (optional): Career level - "Entry", "Junior", or "Senior" (default: "Junior")
    
    Returns:
    - Dictionary with Entry/Junior/Senior keys, each containing:
        - salary: Salary range (e.g., "E£ 10-15K")
        - demand: Market demand (Low/Medium/High)
        - demandColor: Hex color for the demand level
        - responsibilities: List of key responsibilities
        - fitReason: List of reasons this level fits
        - skills: List of required skills
    """
    try:
        print(f"[API] GET /blog/career-details - careerId={careerId}, level={level}")
        
        # Fetch career details from existing tables
        career_details = get_career_blog_details(
            db=db,
            career_id=careerId,
            level=level
        )
        
        if not career_details:
            print(f"[API] No career details found for careerId={careerId}")
            raise HTTPException(
                status_code=404,
                detail=f"Career details not found for career ID: {careerId}"
            )
        
        print(f"[API] Returning career details: {list(career_details.keys())}")
        return career_details
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[API] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
