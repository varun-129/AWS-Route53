import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, hosted_zones, dns_records

app = FastAPI(title="Route53 Clone API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://aws-route53-rosy.vercel.app/",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(hosted_zones.router, prefix="/api/hosted-zones", tags=["hosted-zones"])
app.include_router(dns_records.router, prefix="/api/hosted-zones/{zone_id}/records", tags=["dns-records"])

@app.get("/")
def read_root():
    return {"message": "Route53 Clone API is running"}
