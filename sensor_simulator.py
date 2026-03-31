import random
import time

import requests

API_URL = "http://localhost:8000/api/sensor"

MACHINES = ["MACHINE-01", "MACHINE-02", "MACHINE-03"]


def generate_sensor_data(machine_id):
    return {
        "machine_id": machine_id,
        "temperature": round(random.uniform(30, 90), 1),
        "vibration": round(random.uniform(1, 10), 2)
    }

def send_sensor_data(data):
    response = requests.post(API_URL, json=data, timeout=5)
    return response

while True:
    for machine_id in MACHINES:
        data = generate_sensor_data(machine_id)

        try:
            response = send_sensor_data(data)
            print(f"Sent: {data} -> Status: {response.status_code}")
        except Exception as e:
            print(f"Error sending data for {machine_id}: {e}")

    time.sleep(3)