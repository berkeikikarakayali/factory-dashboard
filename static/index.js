let currentAlertFilter = "ALL";

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
            <div class="${getMachineCardClass(machine.status)}" onclick="loadMachineDetails('${machine.machine_id}')">
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
    await fetchAlerts();
}

refreshDashboard();
setInterval(refreshDashboard, 3000);


async function loadMachineDetails(machineId) {
    let detailText = document.getElementById("selectedMachineText");
    let tableBody = document.getElementById("machineDetailBody");

    detailText.textContent = "Selected machine: " + machineId;

    try {
        let response = await fetch("/api/machine/" + machineId);
        let data = await response.json();

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">No data found for this machine.</td>
                </tr>
            `;
            return;
        }

        let html = "";

        for (let item of data) {
            html += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.temperature} °C</td>
                    <td>${item.vibration}</td>
                    <td><span class="${getStatusClass(item.status)}">${item.status}</span></td>
                    <td>${formatTimestamp(item.timestamp)}</td>
                </tr>
            `;
        }

        tableBody.innerHTML = html;
        drawCharts(data);
        updateMachineStats(data);
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">Could not load machine details.</td>
            </tr>
        `;
        console.log("Machine detail error:", error);
    }
}

async function fetchAlerts() {
    let tableBody = document.getElementById("alertTableBody");

    try {
        let response = await fetch("/api/alerts");
        let data = await response.json();

        if (currentAlertFilter !== "ALL") {
            data = data.filter(item => item.status === currentAlertFilter);
        }

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">No alerts found.</td>
                </tr>
            `;
            return;
        }

        let html = "";

        for (let item of data) {
            html += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.machine_id}</td>
                    <td>${item.temperature} °C</td>
                    <td>${item.vibration}</td>
                    <td><span class="${getStatusClass(item.status)}">${item.status}</span></td>
                    <td>${formatTimestamp(item.timestamp)}</td>
                </tr>
            `;
        }

        tableBody.innerHTML = html;
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">Could not load alerts.</td>
            </tr>
        `;
        console.log("Alert error:", error);
    }
}


function setAlertFilter(filterValue) {
    currentAlertFilter = filterValue;
    fetchAlerts();
}


function drawCharts(machineData) {
    let temperatureChart = document.getElementById("temperatureChart");
    let vibrationChart = document.getElementById("vibrationChart");

    temperatureChart.innerHTML = "";
    vibrationChart.innerHTML = "";

    if (machineData.length === 0) {
        temperatureChart.innerHTML = "<p>No temperature data</p>";
        vibrationChart.innerHTML = "<p>No vibration data</p>";
        return;
    }

    let maxTemperature = 100;
    let maxVibration = 10;

    for (let i = machineData.length - 1; i >= 0; i--) {
        let item = machineData[i];

        let tempHeight = (item.temperature / maxTemperature) * 180;
        let vibrationHeight = (item.vibration / maxVibration) * 180;

        let tempBar = document.createElement("div");
        tempBar.className = getTemperatureBarClass(item.temperature);
        tempBar.style.height = tempHeight + "px";
        tempBar.textContent = item.temperature;

        let vibrationBar = document.createElement("div");
        vibrationBar.className = getVibrationBarClass(item.vibration);
        vibrationBar.style.height = vibrationHeight + "px";
        vibrationBar.textContent = item.vibration;

        temperatureChart.appendChild(tempBar);
        vibrationChart.appendChild(vibrationBar);
    }
}


function getTemperatureBarClass(value) {
    if (value >= 85) {
        return "bar bar-critical";
    } else if (value >= 70) {
        return "bar bar-warning";
    } else {
        return "bar bar-normal";
    }
}

function getVibrationBarClass(value) {
    if (value >= 9) {
        return "bar bar-critical";
    } else if (value >= 7) {
        return "bar bar-warning";
    } else {
        return "bar bar-normal";
    }
}

function updateMachineStats(machineData) {
    if (machineData.length === 0) {
        document.getElementById("avgTemp").textContent = "-";
        document.getElementById("maxTemp").textContent = "-";
        document.getElementById("avgVibration").textContent = "-";
        document.getElementById("warningCountMachine").textContent = "-";
        document.getElementById("criticalCountMachine").textContent = "-";
        return;
    }

    let totalTemp = 0;
    let maxTemp = machineData[0].temperature;
    let totalVibration = 0;
    let warningCount = 0;
    let criticalCount = 0;

    for (let item of machineData) {
        totalTemp += item.temperature;
        totalVibration += item.vibration;

        if (item.temperature > maxTemp) {
            maxTemp = item.temperature;
        }

        if (item.status === "WARNING") {
            warningCount++;
        }

        if (item.status === "CRITICAL") {
            criticalCount++;
        }
    }

    let avgTemp = totalTemp / machineData.length;
    let avgVibration = totalVibration / machineData.length;

    document.getElementById("avgTemp").textContent = avgTemp.toFixed(1) + " °C";
    document.getElementById("maxTemp").textContent = maxTemp.toFixed(1) + " °C";
    document.getElementById("avgVibration").textContent = avgVibration.toFixed(2);
    document.getElementById("warningCountMachine").textContent = warningCount;
    document.getElementById("criticalCountMachine").textContent = criticalCount;
}