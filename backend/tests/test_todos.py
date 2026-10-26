from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_list(client: TestClient) -> None:
    created = client.post("/todos", json={"body": "Buy milk"})
    assert created.status_code == 201
    data = created.json()
    assert data["body"] == "Buy milk"
    assert data["done"] is False
    assert "id" in data
    assert "created_at" in data

    listed = client.get("/todos")
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["total"] == 1
    assert payload["items"][0]["body"] == "Buy milk"
    assert listed.headers.get("X-Total-Count") == "1"


def test_create_rejects_empty_body(client: TestClient) -> None:
    response = client.post("/todos", json={"body": ""})
    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_get_not_found(client: TestClient) -> None:
    response = client.get("/todos/999")
    assert response.status_code == 404
    assert response.json()["code"] == "http_404"


def test_partial_update(client: TestClient) -> None:
    created = client.post("/todos", json={"body": "Task"}).json()
    patched = client.patch(f"/todos/{created['id']}", json={"done": True})
    assert patched.status_code == 200
    assert patched.json()["done"] is True
    assert patched.json()["body"] == "Task"


def test_update_requires_field(client: TestClient) -> None:
    created = client.post("/todos", json={"body": "Task"}).json()
    response = client.patch(f"/todos/{created['id']}", json={})
    assert response.status_code == 422


def test_delete(client: TestClient) -> None:
    created = client.post("/todos", json={"body": "Temp"}).json()
    deleted = client.delete(f"/todos/{created['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/todos/{created['id']}").status_code == 404


def test_delete_not_found(client: TestClient) -> None:
    assert client.delete("/todos/999").status_code == 404


def test_search(client: TestClient) -> None:
    client.post("/todos", json={"body": "alpha task"})
    client.post("/todos", json={"body": "beta item"})
    response = client.get("/todos", params={"q": "alpha"})
    assert response.status_code == 200
    bodies = [item["body"] for item in response.json()["items"]]
    assert bodies == ["alpha task"]


def test_filter_done(client: TestClient) -> None:
    a = client.post("/todos", json={"body": "open"}).json()
    client.post("/todos", json={"body": "closed"})
    client.patch(f"/todos/{a['id']}", json={"done": True})
    active = client.get("/todos", params={"done": False}).json()
    assert all(item["done"] is False for item in active["items"])
    assert active["total"] == 1


def test_bulk_update_and_delete(client: TestClient) -> None:
    client.post("/todos", json={"body": "one"})
    client.post("/todos", json={"body": "two"})
    updated = client.patch("/todos", json={"done": True})
    assert updated.status_code == 200
    assert updated.json()["updated"] == 2

    deleted = client.delete("/todos", params={"done": True})
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] == 2
    assert client.get("/todos").json()["total"] == 0


def test_invalid_path_param(client: TestClient) -> None:
    response = client.get("/todos/abc")
    assert response.status_code == 422
