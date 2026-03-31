from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel

from database import init_db, insert_sensor_data, get_all_sensor_data

app = FastAPI()

init_db()


class SensorReading(BaseModel):
    machine_id: str
    temperature: float
    vibration: float


@app.get("/")
def root():
    return {"message": "Smart Factory API is running"}


@app.post("/api/sensor")
def receive_sensor_data(reading: SensorReading):
    timestamp = datetime.now().isoformat()

    insert_sensor_data(
        machine_id=reading.machine_id,
        temperature=reading.temperature,
        vibration=reading.vibration,
        timestamp=timestamp
    )

    return {
        "message": "Sensor data received successfully",
        "data": {
            "machine_id": reading.machine_id,
            "temperature": reading.temperature,
            "vibration": reading.vibration,
            "timestamp": timestamp
        }
    }


@app.get("/api/data")
def get_sensor_data():
    return get_all_sensor_data()