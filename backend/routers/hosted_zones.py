from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from dependencies import get_current_session
from models import Session as SessionModel
from schemas import HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse, HostedZoneListResponse
from services.hosted_zones_service import (
    get_hosted_zones,
    create_hosted_zone,
    get_hosted_zone,
    update_hosted_zone,
    delete_hosted_zone
)

router = APIRouter()

@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    search: Optional[str] = Query(None, description="Search hosted zones by name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    items, total_count = get_hosted_zones(db, search, page, page_size)
    return {
        "items": items,
        "total_count": total_count,
        "page": page,
        "page_size": page_size
    }

@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(
    zone: HostedZoneCreate,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    return create_hosted_zone(db, zone)

@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    zone = get_hosted_zone(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return zone

@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_zone(
    zone_id: int,
    zone_update: HostedZoneUpdate,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    updated_zone = update_hosted_zone(db, zone_id, zone_update)
    if not updated_zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return updated_zone

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    success = delete_hosted_zone(db, zone_id)
    if not success:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return
