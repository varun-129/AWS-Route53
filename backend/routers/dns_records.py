from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from dependencies import get_current_session
from models import Session as SessionModel
from schemas import (
    DNSRecordCreate, DNSRecordUpdate, DNSRecordResponse, 
    DNSRecordListResponse, DNSRecordTypeSchema,
    BulkDeleteRequest, BulkDeleteResponse
)
from services.dns_records_service import (
    get_dns_records,
    create_dns_record,
    get_dns_record,
    update_dns_record,
    delete_dns_record,
    bulk_delete_records
)
from services.hosted_zones_service import get_hosted_zone

router = APIRouter()

def ensure_zone_exists(db: Session, zone_id: int):
    zone = get_hosted_zone(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return zone

@router.get("", response_model=DNSRecordListResponse)
def list_dns_records(
    zone_id: int,
    search: Optional[str] = Query(None, description="Search by record name"),
    type: Optional[DNSRecordTypeSchema] = Query(None, description="Filter by record type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    all: bool = Query(False, description="Fetch all records without pagination"),
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    ensure_zone_exists(db, zone_id)
    items, total_count = get_dns_records(db, zone_id, search, type, page, page_size, all_records=all)
    return {
        "items": items,
        "total_count": total_count,
        "page": page,
        "page_size": page_size
    }

@router.post("", response_model=DNSRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    zone_id: int,
    record: DNSRecordCreate,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    ensure_zone_exists(db, zone_id)
    return create_dns_record(db, zone_id, record)

@router.get("/{record_id}", response_model=DNSRecordResponse)
def get_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    record = get_dns_record(db, zone_id, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="DNS record not found")
    return record

@router.put("/{record_id}", response_model=DNSRecordResponse)
def update_record(
    zone_id: int,
    record_id: int,
    record_update: DNSRecordUpdate,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    updated_record = update_dns_record(db, zone_id, record_id, record_update)
    if not updated_record:
        raise HTTPException(status_code=404, detail="DNS record not found")
    return updated_record

@router.delete("/bulk", response_model=BulkDeleteResponse)
def delete_records_bulk(
    zone_id: int,
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    ensure_zone_exists(db, zone_id)
    success, count = bulk_delete_records(db, zone_id, request.record_ids)
    if not success:
        raise HTTPException(status_code=404, detail="One or more DNS records not found in this zone")
    return {"deleted_count": count}

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    session: SessionModel = Depends(get_current_session)
):
    success = delete_dns_record(db, zone_id, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="DNS record not found")
    return
