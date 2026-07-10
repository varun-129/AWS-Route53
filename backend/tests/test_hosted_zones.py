import pytest

@pytest.fixture
def auth_client(client):
    # Log in
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    # Client now has session cookie
    return client

def test_create_hosted_zone(auth_client):
    response = auth_client.post("/api/hosted-zones", json={
        "name": "testzone.com",
        "type": "Public",
        "comment": "A test zone"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "testzone.com"
    assert data["type"] == "Public"
    assert data["comment"] == "A test zone"
    assert "id" in data

def test_create_hosted_zone_empty_name(auth_client):
    response = auth_client.post("/api/hosted-zones", json={
        "name": "",
        "type": "Public"
    })
    assert response.status_code == 422 # Validation error

def test_create_hosted_zone_invalid_type(auth_client):
    response = auth_client.post("/api/hosted-zones", json={
        "name": "example.com",
        "type": "InvalidType"
    })
    assert response.status_code == 422

def test_list_hosted_zones(auth_client):
    # Create another zone
    auth_client.post("/api/hosted-zones", json={"name": "another.com", "type": "Private"})
    
    response = auth_client.get("/api/hosted-zones")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] >= 2
    assert len(data["items"]) >= 2

def test_search_hosted_zones(auth_client):
    response = auth_client.get("/api/hosted-zones?search=testzone")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 1
    assert data["items"][0]["name"] == "testzone.com"

def test_get_hosted_zone(auth_client):
    create_resp = auth_client.post("/api/hosted-zones", json={"name": "get-test.com", "type": "Public"})
    zone_id = create_resp.json()["id"]
    
    response = auth_client.get(f"/api/hosted-zones/{zone_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "get-test.com"

def test_update_hosted_zone(auth_client):
    create_resp = auth_client.post("/api/hosted-zones", json={"name": "update-test.com", "type": "Public"})
    zone_id = create_resp.json()["id"]
    
    response = auth_client.put(f"/api/hosted-zones/{zone_id}", json={"comment": "Updated comment"})
    assert response.status_code == 200
    assert response.json()["comment"] == "Updated comment"

def test_delete_hosted_zone(auth_client):
    create_resp = auth_client.post("/api/hosted-zones", json={"name": "delete-test.com", "type": "Public"})
    zone_id = create_resp.json()["id"]
    
    response = auth_client.delete(f"/api/hosted-zones/{zone_id}")
    assert response.status_code == 204
    
    # Verify it's gone
    get_resp = auth_client.get(f"/api/hosted-zones/{zone_id}")
    assert get_resp.status_code == 404

def test_unauthorized_access(client):
    # Clear cookies
    client.cookies.clear()
    response = client.get("/api/hosted-zones")
    assert response.status_code == 401
