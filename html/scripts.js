// BASE CONFIG
const BASE_URL = "https://fraud-detection-api-xioa.onrender.com/suspicious";

// Chart Instances
let areaChart = null;
let fraudChart = null;

// Plotly Layout
const transactionTypeLayout = {
  title: {
    text: 'Transaction Amount Distribution by Type',
    font: { family: 'Arial, sans-serif', size: 18, color: '#ffffff' },
    xref: 'paper', x: 0.05
  },
  yaxis: {
    title: { text: 'Transaction Amount', font: { size: 14, color: '#ffffff' } },
    tickfont: { color: '#ffffff' },
    gridcolor: 'rgba(255, 255, 255, 0.2)', zeroline: false
  },
  xaxis: {
    title: { text: 'Transaction Type', font: { size: 14, color: '#ffffff' } },
    tickfont: { color: '#ffffff' }
  },
  boxmode: 'group', height: 400,
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)'
};

// ================================
// Transaction Volume Input Only
// ================================
async function updateTransactionVolume(start, end) {
  try {
    const res = await fetch(`${BASE_URL}/transaction_volume/?start_date=${start}&end_date=${end}`);
    const data = await res.json();

    if (data.length) {
      const total = parseFloat(data[0].total_volume).toFixed(2);
      const fraud = parseFloat(data[0].fraud_volume).toFixed(2);
      const legitimate = parseFloat(data[0].non_fraud_volume).toFixed(2);

      document.getElementById("transactionVolumeInput").value = `GHS ${total}`;
      document.getElementById("SuspiciousVolumeInput").value = `GHS ${fraud}`;
      document.getElementById("legitimateVolumeInput").value = `GHS ${legitimate}`;
    } else {
      // fallback values
      document.getElementById("transactionVolumeInput").value = "GHS 0.00";
      document.getElementById("SuspiciousVolumeInput").value = "GHS 0.00";
      document.getElementById("legitimateVolumeInput").value = "GHS 0.00";
    }
  } catch (err) {
    console.error("Volume error:", err);
    document.getElementById("transactionVolumeInput").value = "GHS 0.00";
    document.getElementById("SuspiciousVolumeInput").value = "GHS 0.00";
    document.getElementById("legitimateVolumeInput").value = "GHS 0.00";
  }
}


// ================================
// Plotly Box Plot Update
// ================================
async function updateTransactionTypeChart(start, end) {
  try {
    const res = await fetch(`${BASE_URL}/transaction_type_distribution/?start_date=${start}&end_date=${end}`);
    const data = await res.json();
    if (!Array.isArray(data)) return;

    const traces = data.map(group => ({
      y: group.amounts,
      type: 'box', name: group.type,
      boxpoints: 'all', jitter: 0.5, marker: { size: 4 }, line: { width: 1 }
    }));

    Plotly.react('donutChartCanvas', traces, transactionTypeLayout, { displayModeBar: false });
/* 	Plotly.react('transactionTypeChart', traces, transactionTypeLayout, { displayModeBar: false }); */
  } catch (err) {
    console.error("Box plot error:", err);
  }
}

// ================================
// Area Chart - Line Chart Update
// ================================
async function updateAreaChart(start, end) {
  try {
    const res = await fetch(`${BASE_URL}/suspicious_transactions_by_day/?start_date=${start}&end_date=${end}`);
    const data = await res.json();

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
  options: { responsive: true, plugins: { legend: { labels: { color: "#fff" } } } }
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
    const res = await fetch(`${BASE_URL}/api/daily_trend/?start_date=${start}&end_date=${end}`);
    const data = await res.json();
    if (!data.labels) return;

    if (fraudChart) fraudChart.destroy();

    fraudChart = new Chart(document.getElementById("fraudTrendChart"), {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          { label: "Total Transactions", data: data.total_counts, borderColor: "#00c8ff", fill: false },
          { label: "Fraudulent Transactions", data: data.fraud_counts, borderColor: "#ff00ff", fill: false }
        ]
      },
      options: { responsive: true, plugins: { legend: { labels: { color: "#fff" } } } }
    });
  } catch (err) {
    console.error("Fraud chart error:", err);
  }
}

// ================================
// Fraud Trend Line Chart
// ================================

let riskChart;

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
      plugins: {
        legend: { labels: { color: "#fff" } }
      },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });
}


async function updateTopRiskUsers(start, end) {
  try {
    const res = await fetch(`${BASE_URL}/top_high_risk_users/?start_date=${start}&end_date=${end}`);
    const data = await res.json();
    riskChart.data.labels = data.users.map(u => u.name);
    riskChart.data.datasets[0].data = data.users.map(u => u.risk_score);
    riskChart.update();
  } catch (err) {
    console.error("Risk user error:", err);
  }
}

async function fetchDonutChart1(start, end) {
  try {
    const res = await fetch(`${BASE_URL}/mobile_network/?start_date=${start}&end_date=${end}`);
    const data = await res.json();
    console.log("Data Labels:", data.labels);
    console.log("Data Series:", data.series);

    const chartDiv = document.getElementById("mobilenetwork_count");
    if (!chartDiv) {
      console.error("Chart div not found!");
      return;
    }

const trace = {
    labels: data.labels,
    values: data.series,
    type: 'pie',
    hole: 0.6,
    textinfo: 'percent+label',
    textfont: {
        color: 'white',
        size: 16
    }
};

const layout = {
    title: {
        text: 'Mobile Network Report',
        font: {
            size: 24,
            color: 'white'
        }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    legend: {
        font: {
            color: 'white',
            size: 14
        }
    },
    margin: { t: 50, l: 0, r: 0, b: 0 }
};

await Plotly.newPlot("mobilenetwork_count", [trace], layout, { responsive: true, displayModeBar: false });

    console.log("Donut chart rendered successfully");
  } catch (err) {
    console.error("Mobile Network Chart error:", err);
  }
}



// ================================
// Date Utilities & Events
// ================================
function getDateRange() {
  return {
    start: document.getElementById("start-date").value,
    end: document.getElementById("end-date").value
  };
}

document.addEventListener("DOMContentLoaded", async function () {
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  startInput.value = firstDay.toISOString().slice(0, 10);
  endInput.value = today.toISOString().slice(0, 10);
  initRiskChart();

  const { start, end } = getDateRange();
  await updateTransactionVolume(start, end);
  await updateTransactionTypeChart(start, end);
  await updateAreaChart(start, end);
  await updateFraudChart(start, end);
  await updateTopRiskUsers(start, end);
  await fetchDonutChart1(start, end);
});

setInterval(async function () {
  console.log("Auto-refreshing charts...");
  const { start, end } = getDateRange();
  await updateTransactionVolume(start, end);
  await updateTransactionTypeChart(start, end);
  await updateAreaChart(start, end);
  await updateFraudChart(start, end);
  await updateTopRiskUsers(start, end);
  await fetchDonutChart1(start, end);
}, 60 * 1000);  // refresh every 60 seconds

document.getElementById("applyFilter").addEventListener("click", async () => {

  const { start, end } = getDateRange();
  await updateTransactionVolume(start, end);
  await updateTransactionTypeChart(start, end);
  await updateAreaChart(start, end);
  await updateFraudChart(start, end);
  await updateTopRiskUsers(start, end);
  await fetchDonutChart1(start, end);
});
