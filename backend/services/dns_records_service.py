# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import or_
from typing import Optional
from models import DNSRecord
from schemas import DNSRecordCreate, DNSRecordUpdate, DNSRecordTypeSchema

def get_dns_records(db: Session, zone_id: int, search: Optional[str] = None, type_filter: Optional[DNSRecordTypeSchema] = None, page: int = 1, page_size: int = 10, all_records: bool = False):
    query = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id)
    
    if search:
        query = query.filter(DNSRecord.name.ilike(f"%{search}%"))
    if type_filter:
        query = query.filter(DNSRecord.type == type_filter.value)
        
    total_count = query.count()
    query = query.order_by(DNSRecord.created_at.desc())
    
    if all_records:
        items = query.all()
    else:
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()
    
    return items, total_count

def create_dns_record(db: Session, zone_id: int, record: DNSRecordCreate):
    db_record = DNSRecord(
        hosted_zone_id=zone_id,
        name=record.name,
        type=record.type.value,
        ttl=record.ttl,
        value=record.value,
        priority=record.priority,
        weight=record.weight,
        port=record.port
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_dns_record(db: Session, zone_id: int, record_id: int):
    return db.query(DNSRecord).filter(
        DNSRecord.id == record_id,
        DNSRecord.hosted_zone_id == zone_id
    ).first()

def update_dns_record(db: Session, zone_id: int, record_id: int, record: DNSRecordUpdate):
    db_record = get_dns_record(db, zone_id, record_id)
    if not db_record:
        return None
        
    update_data = record.model_dump(exclude_unset=True)
    if 'type' in update_data and update_data['type'] is not None:
        update_data['type'] = update_data['type'].value

    for key, value in update_data.items():
        setattr(db_record, key, value)
        
    db.commit()
    db.refresh(db_record)
    return db_record

def delete_dns_record(db: Session, zone_id: int, record_id: int):
    db_record = get_dns_record(db, zone_id, record_id)
    if db_record:
        db.delete(db_record)
        db.commit()
        return True
    return False

def bulk_delete_records(db: Session, zone_id: int, record_ids: list[int]):
    unique_ids = list(set(record_ids))
    records = db.query(DNSRecord).filter(
        DNSRecord.hosted_zone_id == zone_id,
        DNSRecord.id.in_(unique_ids)
    ).all()
    
    if len(records) != len(unique_ids):
        return False, 0
        
    for record in records:
        db.delete(record)
    
    db.commit()
    return True, len(records)
