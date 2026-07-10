from database import SessionLocal
from models import DNSRecord, DNSRecordType

db = SessionLocal()

# Delete all existing records for hosted zone 1 to match the user's empty DB screenshot
db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == 1).delete()
db.commit()

records = [
    DNSRecord(
        hosted_zone_id=1,
        name="varun12.com",
        type=DNSRecordType.NS,
        ttl=172800,
        value="ns-1316.awsdns-36.org.\nns-1006.awsdns-61.net.\nns-1942.awsdns-50.co.uk.\nns-173.awsdns-21.com."
    ),
    DNSRecord(
        hosted_zone_id=1,
        name="varun12.com",
        type=DNSRecordType.SOA,
        ttl=900,
        value="ns-1316.awsdns-36.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
    )
]

db.add_all(records)
db.commit()
print("Successfully replaced existing records with the 2 hardcoded AWS records.")
