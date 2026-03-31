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
            timestamp TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def insert_sensor_data(machine_id, temperature, vibration, timestamp):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO sensor_data (machine_id, temperature, vibration, timestamp)
        VALUES (?, ?, ?, ?)
    """, (machine_id, temperature, vibration, timestamp))

    conn.commit()
    conn.close()


def get_all_sensor_data():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM sensor_data
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]