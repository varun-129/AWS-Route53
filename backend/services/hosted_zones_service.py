from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from models import HostedZone
from schemas import HostedZoneCreate, HostedZoneUpdate

def get_hosted_zones(db: Session, search: Optional[str] = None, page: int = 1, page_size: int = 10):
    query = db.query(HostedZone)
    
    if search:
        # Case insensitive search on name
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
        
    total_count = query.count()
    
    # Pagination
    offset = (page - 1) * page_size
    items = query.order_by(HostedZone.created_at.desc()).offset(offset).limit(page_size).all()
    
    return items, total_count

def create_hosted_zone(db: Session, zone: HostedZoneCreate):
    db_zone = HostedZone(
        name=zone.name,
        type=zone.type.value,
        comment=zone.comment
    )
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

def get_hosted_zone(db: Session, zone_id: int):
    return db.query(HostedZone).filter(HostedZone.id == zone_id).first()

def update_hosted_zone(db: Session, zone_id: int, zone: HostedZoneUpdate):
    db_zone = get_hosted_zone(db, zone_id)
    if not db_zone:
        return None
        
    update_data = zone.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_zone, key, value)
        
    db.commit()
    db.refresh(db_zone)
    return db_zone

def delete_hosted_zone(db: Session, zone_id: int):
    db_zone = get_hosted_zone(db, zone_id)
    if db_zone:
        db.delete(db_zone)
        db.commit()
        return True
    return False
