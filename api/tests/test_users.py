import pytest

class TestGetUsers:
    @pytest.mark.unit
    def test_get_user_empty(self, client):
        """初期状態は空リストを返す。"""
        response = client.get("/api/users")
        assert response.status_code == 200
        assert response.json() == []

class TestCreateUser:
    @pytest.mark.unit
    def test_create_user(self, client, sample_user):
        """ユーザー作成で201が返り、id と createdAt が付与される"""
        # Arrange
        payload = sample_user

        # Act
        response = client.post("/api/users", json=payload)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["id"] == 1
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["role"] == payload["role"]
        assert data["department"] == payload["department"]
        assert "createdAt" in data