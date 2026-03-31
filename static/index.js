async function fetchSensorData() {
    const tableBody = document.getElementById("sensorTableBody");

    try {
        const response = await fetch("/api/data");
        const data = await response.json();

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">No sensor data available yet.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.machine_id}</td>
                <td>${item.temperature} °C</td>
                <td>${item.vibration}</td>
                <td>${item.timestamp}</td>
            </tr>
        `).join("");
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">Failed to load data.</td>
            </tr>
        `;
        console.error("Error fetching sensor data:", error);
    }
}

document.getElementById("refreshButton").addEventListener("click", fetchSensorData);

fetchSensorData();