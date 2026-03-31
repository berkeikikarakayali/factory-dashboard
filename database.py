import sqlite3

DB_NAME = "factory.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id TEXT NOT NULL,
            temperature REAL NOT NULL,
            vibration REAL NOT NULL,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def insert_sensor_data(machine_id, temperature, vibration, status, timestamp):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO sensor_data (machine_id, temperature, vibration, status, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (machine_id, temperature, vibration, status, timestamp))

    conn.commit()
    conn.close()


def get_latest_sensor_data(limit=20):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM sensor_data
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_status_summary():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM sensor_data")
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as count FROM sensor_data WHERE status = 'NORMAL'")
    normal = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM sensor_data WHERE status = 'WARNING'")
    warning = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM sensor_data WHERE status = 'CRITICAL'")
    critical = cursor.fetchone()["count"]

    conn.close()

    return {
        "total": total,
        "normal": normal,
        "warning": warning,
        "critical": critical
    }

def get_latest_data_per_machine():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s1.*
        FROM sensor_data s1
        INNER JOIN (
            SELECT machine_id, MAX(id) as max_id
            FROM sensor_data
            GROUP BY machine_id
        ) s2
        ON s1.id = s2.max_id
        ORDER BY s1.machine_id
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_alert_data():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM sensor_data
        WHERE status = 'WARNING' OR status = 'CRITICAL'
        ORDER BY id DESC
        LIMIT 20
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_machine_data(machine_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM sensor_data
        WHERE machine_id = ?
        ORDER BY id DESC
        LIMIT 10
    """, (machine_id,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]