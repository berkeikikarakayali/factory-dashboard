function getStatusClass(status) {
    if (status === "CRITICAL") return "status-critical";
    if (status === "WARNING") return "status-warning";
    return "status-normal";
}

function getMachineCardClass(status) {
    if (status === "CRITICAL") return "machine-card critical";
    if (status === "WARNING") return "machine-card warning";
    return "machine-card normal";
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

async function fetchSensorData() {
    const tableBody = document.getElementById("sensorTableBody");

    try {
        const response = await fetch("/api/data");
        const data = await response.json();

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No sensor data available yet.</td>
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
                <td><span class="${getStatusClass(item.status)}">${item.status}</span></td>
                <td>${formatTimestamp(item.timestamp)}</td>
            </tr>
        `).join("");
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">Failed to load data.</td>
            </tr>
        `;
        console.error("Error fetching sensor data:", error);
    }
}

async function fetchSummary() {
    try {
        const response = await fetch("/api/summary");
        const summary = await response.json();

        document.getElementById("totalCount").textContent = summary.total;
        document.getElementById("normalCount").textContent = summary.normal;
        document.getElementById("warningCount").textContent = summary.warning;
        document.getElementById("criticalCount").textContent = summary.critical;
    } catch (error) {
        console.error("Error fetching summary:", error);
    }
}

async function fetchMachineCards() {
    const machineCardsContainer = document.getElementById("machineCards");

    try {
        const response = await fetch("/api/machines/latest");
        const machines = await response.json();

        if (machines.length === 0) {
            machineCardsContainer.innerHTML = "<p>No machine data available yet.</p>";
            return;
        }

        machineCardsContainer.innerHTML = machines.map(machine => `
            <div class="${getMachineCardClass(machine.status)}">
                <h3>${machine.machine_id}</h3>
                <p><strong>Temperature:</strong> ${machine.temperature} °C</p>
                <p><strong>Vibration:</strong> ${machine.vibration}</p>
                <p><strong>Status:</strong> <span class="${getStatusClass(machine.status)}">${machine.status}</span></p>
                <p><strong>Last Update:</strong> ${formatTimestamp(machine.timestamp)}</p>
            </div>
        `).join("");
    } catch (error) {
        machineCardsContainer.innerHTML = "<p>Failed to load machine cards.</p>";
        console.error("Error fetching machine cards:", error);
    }
}

async function refreshDashboard() {
    await fetchSummary();
    await fetchMachineCards();
    await fetchSensorData();
}

refreshDashboard();
setInterval(refreshDashboard, 3000);