import os
import re
from datetime import datetime
import secrets
import requests
import bcrypt
import mysql.connector
from mysql.connector import pooling
from fastapi import FastAPI, HTTPException, Request, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import pytesseract
from PIL import Image

load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "cancel5th")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

TESSERACT_CMD = os.getenv("TESSERACT_CMD", r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe")
TESSDATA_PREFIX = os.getenv("TESSDATA_PREFIX", r"C:\\Program Files\\Tesseract-OCR\\tessdata")
pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
os.environ["TESSDATA_PREFIX"] = TESSDATA_PREFIX

POOL: pooling.MySQLConnectionPool | None = None

def get_conn():
    if POOL is not None:
        return POOL.get_connection()
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        auth_plugin='mysql_native_password'
    )

def ensure_database_exists():
    try:
        server_conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            auth_plugin='mysql_native_password'
        )
        cur = server_conn.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` DEFAULT CHARACTER SET utf8mb4")
        server_conn.commit()
        cur.close(); server_conn.close()
    except Exception as e:
        print(f"Database ensure error: {e}")

def init_schema():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS companies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            country VARCHAR(255) NOT NULL,
            currency VARCHAR(64) NOT NULL,
            cfo_user_id INT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin','manager','employee') NOT NULL,
            country VARCHAR(255) NOT NULL,
            currency VARCHAR(64) NOT NULL,
            manager_id INT NULL,
            company_id INT NULL,
            is_manager_approver BOOLEAN DEFAULT FALSE,
            auth_token TEXT,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS approver_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            approver_id INT NOT NULL,
            step_order INT NOT NULL,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id INT NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            date DATE,
            currency VARCHAR(64) NOT NULL,
            status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
            manager_comment TEXT,
            company_id INT,
            FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS approvals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            expense_id INT NOT NULL,
            approver_id INT NOT NULL,
            step_order INT NOT NULL,
            decision ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
            comment TEXT,
            decided_at DATETIME NULL,
            FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
            FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS approval_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            percentage_threshold INT DEFAULT 60,
            cfo_user_id INT NULL,
            hybrid BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (cfo_user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
    )
    conn.commit()
    cur.close()
    conn.close()

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    country: str
    currency: str
    company_name: str | None = None

class LoginRequest(BaseModel):
    email: str
    password: str

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    country: str
    currency: str
    manager_id: int | None = None

class ExpenseCreate(BaseModel):
    employee_id: int
    amount: float
    description: str | None = None
    category: str | None = None
    date: str | None = None
    currency: str

class ApprovalDecision(BaseModel):
    decision: str
    comment: str | None = None

class RuleUpdate(BaseModel):
    percentage_threshold: int | None = None
    cfo_user_id: int | None = None
    hybrid: bool | None = None

app = FastAPI(title="TRAe API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})

@app.on_event("startup")
def on_startup():
    try:
        ensure_database_exists()
        global POOL
        try:
            POOL = pooling.MySQLConnectionPool(
                pool_name="trae_pool",
                pool_size=int(os.getenv("MYSQL_POOL_SIZE", "5")),
                host=MYSQL_HOST,
                port=MYSQL_PORT,
                user=MYSQL_USER,
                password=MYSQL_PASSWORD,
                database=MYSQL_DATABASE,
                auth_plugin='mysql_native_password'
            )
        except Exception as e:
            print(f"Pool init error: {e}")
        init_schema()
    except Exception as e:
        print(f"Schema init error: {e}")

@app.post('/auth/signup')
def admin_signup(payload: SignupRequest):
    try:
        conn = get_conn()
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT COUNT(*) AS c FROM users WHERE role='admin'")
    row = cur.fetchone()
    if row and row['c'] > 0:
        cur.close(); conn.close()
        raise HTTPException(status_code=403, detail="Admin already exists")
    cur.execute("SELECT id FROM users WHERE email=%s", (payload.email,))
    if cur.fetchone():
        cur.close(); conn.close()
        raise HTTPException(status_code=400, detail="Email already exists")
    password_hash = bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    company_name = payload.company_name or f"{payload.name}'s Company"
    cur.execute(
        "INSERT INTO companies (name, country, currency) VALUES (%s,%s,%s)",
        (company_name, payload.country, payload.currency)
    )
    conn.commit()
    cur.execute("SELECT LAST_INSERT_ID() AS id")
    company_id = cur.fetchone()["id"]
    cur.execute(
        "INSERT INTO users (name, email, password_hash, role, country, currency, company_id, is_manager_approver) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (payload.name, payload.email, password_hash, 'admin', payload.country, payload.currency, company_id, True)
    )
    conn.commit()
    cur.execute("SELECT id, name, email, role, country, currency FROM users WHERE email=%s", (payload.email,))
    user = cur.fetchone()
    cur.close(); conn.close()
    return {"message":"Signup successful","user":user}

@app.post('/auth/login')
def login(payload: LoginRequest):
    try:
        conn = get_conn()
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, name, email, password_hash, role, country, currency, auth_token, company_id FROM users WHERE email=%s", (payload.email,))
    user = cur.fetchone()
    if not user:
        cur.close(); conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user['role'] not in ('admin','manager','employee'):
        cur.close(); conn.close()
        raise HTTPException(status_code=403, detail="Invalid role")
    if not bcrypt.checkpw(payload.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        cur.close(); conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = user['auth_token'] or secrets.token_urlsafe(32)
    if not user['auth_token']:
        cur.execute("UPDATE users SET auth_token=%s WHERE id=%s", (token, user['id']))
        conn.commit()
    cur.close(); conn.close()
    return {
        "message":"Login successful",
        "access_token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "role": user['role'],
            "country": user['country'],
            "currency": user['currency'],
            "company_id": user['company_id'],
        }
    }

def auth_user_from_header(authorization: str | None) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
    else:
        token = authorization
    try:
        conn = get_conn()
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, name, email, role, country, currency, manager_id, company_id FROM users WHERE auth_token=%s", (token,))
    user = cur.fetchone()
    cur.close(); conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@app.post('/admin/users')
def create_user(payload: CreateUserRequest, authorization: str | None = Header(None)):
    admin = auth_user_from_header(authorization)
    if admin['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    if payload.role not in ('manager','employee'):
        raise HTTPException(status_code=400, detail="Invalid role")
    try:
        conn = get_conn()
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id FROM users WHERE email=%s", (payload.email,))
    if cur.fetchone():
        cur.close(); conn.close();
        raise HTTPException(status_code=400, detail="Email already exists")
    password_hash = bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cur.execute(
        "INSERT INTO users (name, email, password_hash, role, country, currency, manager_id, company_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (payload.name, payload.email, password_hash, payload.role, payload.country, payload.currency, payload.manager_id, admin['company_id'])
    )
    conn.commit()
    cur.execute("SELECT id, name, email, role, country, currency, manager_id FROM users WHERE email=%s", (payload.email,))
    user = cur.fetchone()
    cur.close(); conn.close()
    return {"message":"User created","user":user}

@app.get('/admin/users')
def list_users(authorization: str | None = Header(None)):
    admin = auth_user_from_header(authorization)
    if admin['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    conn = get_conn(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, name, email, role, country, currency, manager_id FROM users WHERE company_id=%s", (admin['company_id'],))
    users = cur.fetchall()
    cur.close(); conn.close()
    return {"users": users}

@app.get('/admin/expenses')
def list_expenses(authorization: str | None = Header(None)):
    admin = auth_user_from_header(authorization)
    if admin['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    conn = get_conn(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM expenses WHERE company_id=%s", (admin['company_id'],))
    expenses = cur.fetchall()
    cur.close(); conn.close()
    return {"expenses": expenses}

@app.put('/admin/rules')
def update_rules(payload: RuleUpdate, authorization: str | None = Header(None)):
    admin = auth_user_from_header(authorization)
    if admin['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    conn = get_conn(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id FROM approval_rules WHERE company_id=%s", (admin['company_id'],))
    row = cur.fetchone()
    if not row:
        cur.execute("INSERT INTO approval_rules (company_id) VALUES (%s)", (admin['company_id'],))
        conn.commit()
        cur.execute("SELECT id FROM approval_rules WHERE company_id=%s", (admin['company_id'],))
        row = cur.fetchone()
    updates = []
    params = []
    if payload.percentage_threshold is not None:
        updates.append("percentage_threshold=%s"); params.append(payload.percentage_threshold)
    if payload.cfo_user_id is not None:
        updates.append("cfo_user_id=%s"); params.append(payload.cfo_user_id)
    if payload.hybrid is not None:
        updates.append("hybrid=%s"); params.append(payload.hybrid)
    if updates:
        params.append(admin['company_id'])
        cur.execute(f"UPDATE approval_rules SET {', '.join(updates)} WHERE company_id=%s", tuple(params))
        conn.commit()
    cur.close(); conn.close()
    return {"message":"Rules updated"}

@app.post('/expenses')
def create_expense(payload: ExpenseCreate, authorization: str | None = Header(None)):
    user = auth_user_from_header(authorization)
    if user['id'] != payload.employee_id:
        raise HTTPException(status_code=403, detail="Cannot create for other user")
    conn = get_conn(); cur = conn.cursor(dictionary=True)
    company_id = user['company_id']
    cur.execute(
        "INSERT INTO expenses (employee_id, amount, description, category, date, currency, status, company_id) VALUES (%s,%s,%s,%s,%s,%s,'Pending',%s)",
        (payload.employee_id, payload.amount, payload.description, payload.category, payload.date, payload.currency, company_id)
    )
    conn.commit()
    cur.execute("SELECT LAST_INSERT_ID() AS id")
    expense_id = cur.fetchone()["id"]
    if user.get('is_manager_approver') and user.get('manager_id'):
        cur.execute("INSERT INTO approvals (expense_id, approver_id, step_order) VALUES (%s,%s,%s)", (expense_id, user['manager_id'], 1))
    else:
        cur.execute("SELECT approver_id, step_order FROM approver_assignments WHERE company_id=%s ORDER BY step_order", (company_id,))
        assignments = cur.fetchall()
        for a in assignments:
            cur.execute("INSERT INTO approvals (expense_id, approver_id, step_order) VALUES (%s,%s,%s)", (expense_id, a['approver_id'], a['step_order']))
    conn.commit()
    cur.close(); conn.close()
    return {"message":"Expense created","expense_id": expense_id}

def evaluate_expense_status(conn, expense_id, company_id):
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT percentage_threshold, cfo_user_id, hybrid FROM approval_rules WHERE company_id=%s", (company_id,))
    rules = cur.fetchone() or {"percentage_threshold": 60, "cfo_user_id": None, "hybrid": False}
    cur.execute("SELECT decision, approver_id FROM approvals WHERE expense_id=%s", (expense_id,))
    approvals = cur.fetchall()
    total = len(approvals)
    approved = sum(1 for a in approvals if a['decision'] == 'Approved')
    cfo_approved = any(a['approver_id'] == rules.get('cfo_user_id') and a['decision'] == 'Approved' for a in approvals if rules.get('cfo_user_id'))
    majority_ok = total > 0 and (approved / total) * 100 >= (rules.get('percentage_threshold') or 60)
    final_approved = majority_ok or (rules.get('hybrid') and cfo_approved) or (not rules.get('hybrid') and cfo_approved)
    status = 'Approved' if final_approved else 'Pending'
    cur.execute("UPDATE expenses SET status=%s WHERE id=%s", (status, expense_id))
    conn.commit()
    cur.close()

@app.post('/expenses/{expense_id}/decision')
def approve_expense(expense_id: int, payload: ApprovalDecision, authorization: str | None = Header(None)):
    approver = auth_user_from_header(authorization)
    if approver['role'] not in ('manager','admin','employee'):
        raise HTTPException(status_code=403, detail="Invalid role")
    conn = get_conn(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM approvals WHERE expense_id=%s AND approver_id=%s", (expense_id, approver['id']))
    ap = cur.fetchone()
    if not ap:
        cur.close(); conn.close();
        raise HTTPException(status_code=404, detail="No approval step for user")
    if payload.decision not in ('Approved','Rejected'):
        cur.close(); conn.close();
        raise HTTPException(status_code=400, detail="Invalid decision")
    cur.execute("UPDATE approvals SET decision=%s, comment=%s, decided_at=%s WHERE id=%s", (payload.decision, payload.comment, datetime.utcnow(), ap['id']))
    conn.commit()
    cur.execute("SELECT company_id FROM expenses WHERE id=%s", (expense_id,))
    company_row = cur.fetchone()
    company_id = company_row['company_id'] if company_row else None
    evaluate_expense_status(conn, expense_id, company_id)
    cur.close(); conn.close()
    return {"message":"Decision recorded"}

@app.post('/upload_receipt')
def upload_receipt(file: UploadFile = File(...)):
    try:
        image = Image.open(file.file)
        text = pytesseract.image_to_string(image)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image")
    amount_match = re.search(r"(\d+[\.,]\d{2})", text)
    date_match = re.search(r"(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4})", text)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    vendor = lines[0] if lines else None
    description = " ".join(lines[:5]) if lines else None
    return {
        "message":"Receipt parsed",
        "parsed": {
            "amount": float(amount_match.group(1).replace(',', '.')) if amount_match else None,
            "date": date_match.group(1) if date_match else None,
            "description": description,
            "vendor": vendor,
        }
    }

@app.get('/utils/currencies')
def list_currencies():
    try:
        resp = requests.get('https://restcountries.com/v3.1/all?fields=name,currencies', timeout=10)
        data = resp.json()
        out = []
        for c in data:
            name = c.get('name', {}).get('common') or c.get('name', {}).get('official')
            cur = list(c.get('currencies', {}).keys())[0] if c.get('currencies') else None
            if name and cur:
                out.append({"country": name, "currency": cur})
        return {"items": out}
    except Exception:
        raise HTTPException(status_code=502, detail="Currency service error")

@app.get('/utils/convert')
def convert_currency(base: str, target: str, amount: float):
    try:
        resp = requests.get(f'https://api.exchangerate-api.com/v4/latest/{base}', timeout=10)
        data = resp.json()
        rate = data.get('rates', {}).get(target)
        if not rate:
            raise HTTPException(status_code=400, detail="Unsupported currency")
        return {"base": base, "target": target, "amount": amount, "converted": amount * rate}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=502, detail="Exchange rate error")

@app.get('/health')
def health():
    return {"status":"ok"}