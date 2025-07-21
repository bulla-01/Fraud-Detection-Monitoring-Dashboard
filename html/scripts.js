// BASE CONFIG
const BASE_URL = "https://fraud-detection-api-xioa.onrender.com/suspicious";

// Chart Instances
let areaChart = null;
let fraudChart = null;
let riskChart = null;

// Plotly Layout
const transactionTypeLayout = {
  title: {
    text: 'Transaction Amount Distribution by Type',
    font: { family: 'Arial, sans-serif', size: 18, color: '#ffffff' },
    xref: 'paper',
    x: 0.05
  },
  yaxis: {
    title: { text: 'Transaction Amount', font: { size: 14, color: '#ffffff' } },
    tickfont: { color: '#ffffff' },
    gridcolor: 'rgba(255, 255, 255, 0.2)',
    zeroline: false
  },
  xaxis: {
    title: { text: 'Transaction Type', font: { size: 14, color: '#ffffff' } },
    tickfont: { color: '#ffffff' }
  },
  boxmode: 'group',
  height: 400,
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)'
};

async function fetchData(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// ================================
// Transaction Volume Input Only
// ================================
async function updateTransactionVolume(start, end) {
  try {
    const data = await fetchData('/transaction_volume/', { start_date: start, end_date: end });

    if (data.length) {
      const [volume] = data;
      document.getElementById("transactionVolumeInput").value = `GHS ${parseFloat(volume.total_volume).toFixed(2)}`;
      document.getElementById("SuspiciousVolumeInput").value = `GHS ${parseFloat(volume.fraud_volume).toFixed(2)}`;
      document.getElementById("legitimateVolumeInput").value = `GHS ${parseFloat(volume.non_fraud_volume).toFixed(2)}`;
    } else {
      setZeroVolume();
    }
  } catch (err) {
    console.error("Volume error:", err);
    setZeroVolume();
  }
}

function setZeroVolume() {
  ["transactionVolumeInput", "SuspiciousVolumeInput", "legitimateVolumeInput"].forEach(id => {
    document.getElementById(id).value = "GHS 0.00";
  });
}

// ================================
// Plotly Box Plot Update
// ================================
async function updateTransactionTypeChart(start, end) {
  try {
    const data = await fetchData('/transaction_type_distribution/', { start_date: start, end_date: end });
    if (!Array.isArray(data) || !data.length) return;

    const traces = data.map(group => ({
      y: group.amounts,
      type: 'box',
      name: group.type,
      boxpoints: 'all',
      jitter: 0.5,
      marker: { size: 4 },
      line: { width: 1 }
    }));

    Plotly.react('donutChartCanvas', traces, transactionTypeLayout, { displayModeBar: false });
  } catch (err) {
    console.error("Box plot error:", err);
  }
}

// ================================
// Area Chart - Line Chart Update
// ================================
async function updateAreaChart(start, end) {
  try {
    const data = await fetchData('/suspicious_transactions_by_day/', { start_date: start, end_date: end });

    const labels = data.map(d => d.day);
    const counts = data.map(d => d.suspicious_count);

    if (areaChart) {
      areaChart.data.labels = labels;
      areaChart.data.datasets[0].data = counts;
      areaChart.update();
    } else {
      areaChart = new Chart(document.getElementById("areaChart"), {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Suspicious Transactions",
            data: counts,
            borderColor: "#ff9800",
            backgroundColor: "rgba(255, 152, 0, 0.3)",
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: "#fff" } } }
        }
      });
    }
  } catch (err) {
    console.error("Area chart error:", err);
  }
}

// ================================
// Fraud Trend Line Chart
// ================================
async function updateFraudChart(start, end) {
  try {
    const data = await fetchData('/api/daily_trend/', { start_date: start, end_date: end });
    if (!data.labels) return;

    if (fraudChart) {
      fraudChart.data.labels = data.labels;
      fraudChart.data.datasets[0].data = data.total_counts;
      fraudChart.data.datasets[1].data = data.fraud_counts;
      fraudChart.update();
    } else {
      fraudChart = new Chart(document.getElementById("fraudTrendChart"), {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [
            { label: "Total Transactions", data: data.total_counts, borderColor: "#00c8ff", fill: false },
            { label: "Fraudulent Transactions", data: data.fraud_counts, borderColor: "#ff00ff", fill: false }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: "#fff" } } }
        }
      });
    }
  } catch (err) {
    console.error("Fraud chart error:", err);
  }
}

// ================================
// Risk Chart
// ================================
function initRiskChart() {
  const ctx = document.getElementById("riskChart").getContext("2d");
  riskChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Risk Score',
        data: [],
        backgroundColor: '#ff00ff'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });
}

// ================================
// Top Risk Users
// ================================
async function updateTopRiskUsers(start, end) {
  try {
    const data = await fetchData('/top_high_risk_users/', { start_date: start, end_date: end });
    if (!data.users) return;

    riskChart.data.labels = data.users.map(u => u.name);
    riskChart.data.datasets[0].data = data.users.map(u => u.risk_score);
    riskChart.update();
  } catch (err) {
    console.error("Risk user error:", err);
  }
}

// ================================
// Donut Chart - Mobile Network
// ================================
async function fetchDonutChart1(start, end) {
  try {
    const data = await fetchData('/mobile_network/', { start_date: start, end_date: end });

    const chartDiv = document.getElementById("mobilenetwork_count");
    if (!chartDiv) return;

    const trace = {
      labels: data.labels,
      values: data.series,
      type: 'pie',
      hole: 0.6,
      textinfo: 'percent+label',
      textfont: { color: 'white', size: 16 }
    };

    const layout = {
      title: { text: 'Mobile Network Report', font: { size: 24, color: 'white' } },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      legend: { font: { color: 'white', size: 14 } },
      margin: { t: 50, l: 0, r: 0, b: 0 }
    };

    Plotly.newPlot("mobilenetwork_count", [trace], layout, { responsive: true, displayModeBar: false });
  } catch (err) {
    console.error("Mobile Network Chart error:", err);
  }
}

// ================================
// Update All Charts
// ================================
async function updateAllCharts() {
  const { start, end } = getDateRange();
  await Promise.all([
    updateTransactionVolume(start, end),
    updateTransactionTypeChart(start, end),
    updateAreaChart(start, end),
    updateFraudChart(start, end),
    updateTopRiskUsers(start, end),
    fetchDonutChart1(start, end)
  ]);
}

function getDateRange() {
  const start = document.getElementById("start-date").value;
  const end = document.getElementById("end-date").value;
  return { start, end };
}

// ================================
// Initialization
// ================================
document.addEventListener("DOMContentLoaded", async function () {
  document.getElementById("filterSection").classList.add("hidden");
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  startInput.value = firstDay.toISOString().slice(0, 10);
  endInput.value = today.toISOString().slice(0, 10);
  initRiskChart();
  await updateAllCharts();
});

document.getElementById("applyFilter").addEventListener("click", updateAllCharts);

setInterval(updateAllCharts, 60 * 1000);
