# Save as backend/project_doctor.py and run:  python backend/project_doctor.py
import json, os, sys, time
import requests

BASE = os.getenv("BASE_URL", "http://127.0.0.1:8000")

def ok(label, cond, extra=""):
    print(("✅" if cond else "❌"), label, extra or "")
    if not cond:
        sys.exit(1)

def main():
    print("Checking base:", BASE)
    # 1) root or health
    try:
        r = requests.get(BASE + "/")
        ok("Server reachable /", r.status_code in (200, 404))  # some apps return 404 at /
    except Exception as e:
        ok("Server reachable /", False, str(e))

    # 2) register
    email = f"smoke_{int(time.time())}@example.com"
    r = requests.post(BASE + "/auth/register", json={
        "email": email,
        "password": "secret123",
        "first_name": "Smoke",
        "last_name": "Test",
        "account_type": "candidate"
    })
    ok("Register", r.status_code in (200, 201), f"status={r.status_code} body={r.text[:200]}")

    # 3) login
    r = requests.post(BASE + "/auth/login", json={"email": email, "password": "secret123"})
    ok("Login", r.status_code == 200, f"status={r.status_code} body={r.text[:200]}")
    token = r.json().get("access_token")
    ok("Token present", bool(token))

    headers = {"Authorization": f"Bearer {token}"}

    # 4) /users/me
    r = requests.get(BASE + "/users/me", headers=headers)
    ok("/users/me", r.status_code == 200, f"status={r.status_code} body={r.text[:200]}")

    print("All good 🎉")
if __name__ == "__main__":
    main()
