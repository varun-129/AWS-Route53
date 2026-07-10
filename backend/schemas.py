from pydantic import BaseModel, ConfigDict
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SessionResponse(BaseModel):
    user: UserResponse
    expires_at: datetime

from typing import Optional, List
from enum import Enum
from pydantic import Field

class HostedZoneTypeSchema(str, Enum):
    Public = "Public"
    Private = "Private"

class HostedZoneCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Domain name for the hosted zone")
    type: HostedZoneTypeSchema
    comment: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "example.com",
                "type": "Public",
                "comment": "My test zone"
            }
        }
    )

class HostedZoneUpdate(BaseModel):
    comment: Optional[str] = None

class HostedZoneResponse(BaseModel):
    id: int
    name: str
    type: HostedZoneTypeSchema
    comment: Optional[str]
    record_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HostedZoneListResponse(BaseModel):
    items: List[HostedZoneResponse]
    total_count: int
    page: int
    page_size: int

import re
from pydantic import model_validator
from ipaddress import ip_address, IPv4Address as ip_IPv4Address, IPv6Address as ip_IPv6Address

class DNSRecordTypeSchema(str, Enum):
    A = "A"
    AAAA = "AAAA"
    CNAME = "CNAME"
    TXT = "TXT"
    MX = "MX"
    NS = "NS"
    PTR = "PTR"
    SRV = "SRV"
    CAA = "CAA"
    SOA = "SOA"

def is_valid_hostname(hostname: str) -> bool:
    if len(hostname) > 255:
        return False
    if hostname[-1] == ".":
        hostname = hostname[:-1] # allow trailing dot
    allowed = re.compile(r"(?!-)[A-Z\d-]{1,63}(?<!-)$", re.IGNORECASE)
    return all(allowed.match(x) for x in hostname.split("."))

class DNSRecordBase(BaseModel):
    name: str = Field(..., min_length=1)
    type: DNSRecordTypeSchema
    ttl: int = Field(300, ge=0)
    value: str = Field(..., min_length=1)
    priority: Optional[int] = None
    weight: Optional[int] = None
    port: Optional[int] = None

    @model_validator(mode='after')
    def validate_record_type_rules(self):
        type_ = self.type
        val = self.value
        
        # Helper to attach errors to specific fields
        def _err(msg, field="value"):
            raise ValueError(msg) # In Pydantic v2, raising ValueError in model_validator raises it as a general error, but we want clear messages.

        if type_ == DNSRecordTypeSchema.A:
            try:
                ip = ip_address(val)
                if not isinstance(ip, ip_IPv4Address):
                    _err("Value must be a valid IPv4 address")
            except ValueError:
                _err("Value must be a valid IPv4 address")

        elif type_ == DNSRecordTypeSchema.AAAA:
            try:
                ip = ip_address(val)
                if not isinstance(ip, ip_IPv6Address):
                    _err("Value must be a valid IPv6 address")
            except ValueError:
                _err("Value must be a valid IPv6 address")

        elif type_ in (DNSRecordTypeSchema.CNAME, DNSRecordTypeSchema.NS, DNSRecordTypeSchema.PTR):
            if not is_valid_hostname(val):
                _err("Value must be a valid hostname")

        elif type_ in (DNSRecordTypeSchema.TXT, DNSRecordTypeSchema.SOA):
            pass # Free text or handled elsewhere

        elif type_ == DNSRecordTypeSchema.MX:
            if self.priority is None:
                raise ValueError("Priority is required for MX records")
            if not is_valid_hostname(val):
                raise ValueError("Value must be a valid hostname for MX records")

        elif type_ == DNSRecordTypeSchema.SRV:
            if self.priority is None or self.weight is None or self.port is None:
                raise ValueError("Priority, weight, and port are required for SRV records")
            if not is_valid_hostname(val):
                raise ValueError("Value must be a valid hostname for SRV records")

        elif type_ == DNSRecordTypeSchema.CAA:
            if not re.match(r"^\d+\s+[a-zA-Z0-9]+\s+.+$", val):
                raise ValueError("CAA value must be in the form '<flag> <tag> <value>'")

        return self


class DNSRecordCreate(DNSRecordBase):
    pass

class DNSRecordUpdate(DNSRecordBase):
    name: Optional[str] = Field(None, min_length=1)
    type: Optional[DNSRecordTypeSchema] = None
    value: Optional[str] = Field(None, min_length=1)

class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    type: DNSRecordTypeSchema
    ttl: int
    value: str
    priority: Optional[int]
    weight: Optional[int]
    port: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DNSRecordListResponse(BaseModel):
    items: List[DNSRecordResponse]
    total_count: int
    page: int
    page_size: int

class BulkDeleteRequest(BaseModel):
    record_ids: List[int]

class BulkDeleteResponse(BaseModel):
    deleted_count: int
