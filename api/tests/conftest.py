"""Pytest configuration and shared fixtures."""
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """FastAPI TestClient fixture.

    テスト用のHTTPクライアント。
    実際のHTTPサーバーを起動せずにAPIをテストできる。
    """
    return TestClient(app)


@pytest.fixture
def sample_user():
    """Sample user data for testing."""
    return {
        "name": "Test User",
        "email": "test@example.com",
        "role": "editor",
        "department": "Engineering",
    }
