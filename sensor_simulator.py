import random
import time
import requests

API_URL = "http://localhost:8000/api/sensor"

machines = {
    "MACHINE-01": {
        "base_temp": 60,
        "base_vibration": 5
    },
     "MACHINE-02": {
        "base_temp": 45,
        "base_vibration": 3
    },
     "MACHINE-03": {
        "base_temp": 75,
        "base_vibration": 7
    },
    "MACHINE-04": {
        "base_temp": 80,
        "base_vibration": 5
    }
}

def generate_machine_data(machine_id, machine_info):
    temperature = machine_info["base_temp"] + random.uniform(-8, 8)
    vibration = machine_info["base_vibration"] + random.uniform(-1.5, 1.5)

    if random.random() < 0.15:
        temperature += random.uniform(8, 18)

    if random.random() < 0.15:
        vibration += random.uniform(1.5, 3)

    temperature = round(temperature, 1)
    vibration = round(vibration, 2)

    return {
        "machine_id": machine_id,
        "temperature": temperature,
        "vibration": vibration
    }


def send_machine_data(data):
    response = requests.post(API_URL, json=data, timeout=5)
    return response


while True:
    for machine_id, machine_info in machines.items():
        data = generate_machine_data(machine_id, machine_info)

        try:
            response = send_machine_data(data)
            print(f"Sent: {data} -> Status: {response.status_code}")
        except Exception as e:
            print(f"Error sending data for {machine_id}: {e}")

    time.sleep(3)