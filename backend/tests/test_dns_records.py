import pytest

@pytest.fixture
def auth_client(client):
    client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    return client

@pytest.fixture
def zone_id(auth_client):
    resp = auth_client.post("/api/hosted-zones", json={
        "name": "dns-test.com",
        "type": "Public"
    })
    return resp.json()["id"]

# --- CRUD Tests ---

def test_crud_a_record(auth_client, zone_id):
    # Create
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "www.dns-test.com",
        "type": "A",
        "value": "192.168.1.1"
    })
    assert resp.status_code == 201
    data = resp.json()
    record_id = data["id"]
    
    # Read
    get_resp = auth_client.get(f"/api/hosted-zones/{zone_id}/records/{record_id}")
    assert get_resp.status_code == 200
    
    # Update
    put_resp = auth_client.put(f"/api/hosted-zones/{zone_id}/records/{record_id}", json={
        "value": "10.0.0.1"
    })
    assert put_resp.status_code == 200
    assert put_resp.json()["value"] == "10.0.0.1"
    
    # Delete
    del_resp = auth_client.delete(f"/api/hosted-zones/{zone_id}/records/{record_id}")
    assert del_resp.status_code == 204

def test_crud_mx_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "dns-test.com",
        "type": "MX",
        "value": "mail.example.com",
        "priority": 10
    })
    assert resp.status_code == 201

def test_crud_srv_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "_sip._tcp.dns-test.com",
        "type": "SRV",
        "value": "sip.example.com",
        "priority": 10,
        "weight": 5,
        "port": 5060
    })
    assert resp.status_code == 201

# --- Validation Failure Tests ---

def test_validation_a_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "test.com",
        "type": "A",
        "value": "not-an-ip"
    })
    assert resp.status_code == 422
    assert "Value must be a valid IPv4 address" in resp.text

def test_validation_aaaa_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "test.com",
        "type": "AAAA",
        "value": "192.168.1.1" # not IPv6
    })
    assert resp.status_code == 422
    assert "Value must be a valid IPv6 address" in resp.text

def test_validation_cname_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "test.com",
        "type": "CNAME",
        "value": "invalid_hostname!" # invalid chars
    })
    assert resp.status_code == 422
    assert "Value must be a valid hostname" in resp.text

def test_validation_mx_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "test.com",
        "type": "MX",
        "value": "mail.example.com"
        # missing priority
    })
    assert resp.status_code == 422
    assert "Priority is required for MX records" in resp.text

def test_validation_srv_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "test.com",
        "type": "SRV",
        "value": "sip.example.com",
        "priority": 10
        # missing weight and port
    })
    assert resp.status_code == 422
    assert "Priority, weight, and port are required for SRV records" in resp.text

def test_validation_caa_record(auth_client, zone_id):
    resp = auth_client.post(f"/api/hosted-zones/{zone_id}/records", json={
        "name": "test.com",
        "type": "CAA",
        "value": "invalid caa format"
    })
    assert resp.status_code == 422
    assert "CAA value must be in the form" in resp.text
