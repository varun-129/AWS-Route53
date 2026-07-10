def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Logged in successfully"}
    assert "session_token" in response.cookies

def test_login_failure(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_protected_route_rejects_without_session(client):
    # Clear cookies just in case
    client.cookies.clear()
    response = client.get("/api/auth/session")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

def test_logout_invalidates_session(client):
    # 1. Login
    client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    
    # 2. Access protected route
    response = client.get("/api/auth/session")
    assert response.status_code == 200
    assert response.json()["user"]["username"] == "admin"
    
    # 3. Logout
    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    
    # 4. Access protected route again (should fail)
    fail_response = client.get("/api/auth/session")
    assert fail_response.status_code == 401
