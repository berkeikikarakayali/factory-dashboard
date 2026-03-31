from datetime import datetime

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from database import (
    init_db,
    insert_sensor_data,
    get_latest_sensor_data,
    get_status_summary,
    get_latest_data_per_machine,
    get_alert_data,
    get_machine_data
)

app = FastAPI()

init_db()

app.mount("/static", StaticFiles(directory="static"), name="static")


class SensorReading(BaseModel):
    machine_id: str
    temperature: float
    vibration: float


def calculate_status(temperature, vibration):
    if temperature >= 85 or vibration >= 9:
        return "CRITICAL"
    elif temperature >= 70 or vibration >= 7:
        return "WARNING"
    else:
        return "NORMAL"


@app.get("/")
def root():
    return FileResponse("static/index.html")


@app.post("/api/sensor")
def receive_sensor_data(reading: SensorReading):
    timestamp = datetime.now().isoformat()
    status = calculate_status(reading.temperature, reading.vibration)

    insert_sensor_data(
        machine_id=reading.machine_id,
        temperature=reading.temperature,
        vibration=reading.vibration,
        status=status,
        timestamp=timestamp
    )

    return {
        "message": "Data saved successfully",
        "status": status
    }


@app.get("/api/data")
def get_data():
    return get_latest_sensor_data()


@app.get("/api/summary")
def get_summary():
    return get_status_summary()


@app.get("/api/machines/latest")
def get_latest_machine_data():
    return get_latest_data_per_machine()


@app.get("/api/alerts")
def get_alerts():
    return get_alert_data()


@app.get("/api/machine/{machine_id}")
def get_machine_details(machine_id: str):
    return get_machine_data(machine_id)