document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".xml";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  const uploadBtn = document.querySelector(".upload-box button");
  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", handleFile);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlString = event.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const smsNodes = Array.from(xmlDoc.getElementsByTagName("sms"));
      const transactions = smsNodes.map(parseSMS).filter((t) => t);
      renderTransactions(transactions);
      renderCharts(transactions);
    };
    reader.readAsText(file);
  }

  function parseSMS(smsNode) {
    const body = smsNode.getAttribute("body");
    if (!body) return null;

    const transaction = {
      type: "",
      amount: 0,
      receiver: "",
      date: "",
      transaction_id: ""
    };

    try {
      if (/received/i.test(body)) {
        transaction.type = "Incoming Money";
        transaction.amount = parseInt(body.match(/received\s([\d,]+)\sRWF/i)[1].replace(/,/g, ""));
        transaction.receiver = body.match(/from\s(.+?)\s?\(/i)?.[1] || "Unknown";
        transaction.date = body.match(/at\s(\d{4}-\d{2}-\d{2}.*?)\./)?.[1] || "";
        transaction.transaction_id = body.match(/Transaction Id: (\d+)/i)?.[1] || "";
      } else if (/Your payment of/i.test(body)) {
        transaction.type = "Payment";
        transaction.amount = parseInt(body.match(/payment of\s([\d,]+)\sRWF/i)[1].replace(/,/g, ""));
        transaction.receiver = body.match(/to\s(.+?)\s/i)?.[1] || "Unknown";
        transaction.date = body.match(/at\s(\d{4}-\d{2}-\d{2}.*?)\./)?.[1] || "";
        transaction.transaction_id = body.match(/TxId[:\s]*(\d+)/i)?.[1] || "";
      } else if (/transferred to/i.test(body)) {
        transaction.type = "Transfer";
        transaction.amount = parseInt(body.match(/(\d{3,})\sRWF transferred/i)[1].replace(/,/g, ""));
        transaction.receiver = body.match(/to\s(.+?)\s?\(/i)?.[1] || "Unknown";
        transaction.date = body.match(/at\s(\d{4}-\d{2}-\d{2}.*?)\s\./)?.[1] || "";
      } else if (/bank deposit/i.test(body)) {
        transaction.type = "Bank Deposit";
        transaction.amount = parseInt(body.match(/deposit of\s([\d,]+)\sRWF/i)[1].replace(/,/g, ""));
        transaction.receiver = "Self";
        transaction.date = body.match(/at\s(\d{4}-\d{2}-\d{2}.*?)\./)?.[1] || "";
      } else {
        return null; // Ignore unrelated messages
      }

      return transaction;
    } catch (e) {
      return null;
    }
  }

  function renderTransactions(transactions) {
    const section = document.querySelector(".transactions");
    section.innerHTML = `<h2>Transaction Details</h2><p>Showing ${transactions.length} transactions</p>`;
    transactions.forEach((tx) => {
      section.innerHTML += `
        <div class="transaction">
          <div class="meta"><span class="tag">${tx.type}</span><span>${tx.date}</span></div>
          <p>${tx.type} of <strong>${tx.amount} RWF</strong> to ${tx.receiver}</p>
        </div>`;
    });
  }

  function renderCharts(transactions) {
    const typeCounts = {};
    const monthlySums = {};
    transactions.forEach((tx) => {
      // Count by type
      typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;

      // Monthly aggregation
      const month = tx.date.slice(0, 7); // YYYY-MM
      monthlySums[month] = (monthlySums[month] || 0) + tx.amount;
    });

    // Pie Chart
    new Chart(document.getElementById("pieChart"), {
      type: "pie",
      data: {
        labels: Object.keys(typeCounts),
        datasets: [{
          label: "Transactions",
          data: Object.values(typeCounts),
          backgroundColor: ["#34d399", "#60a5fa", "#facc15", "#f87171"]
        }]
      }
    });

    // Bar Chart
    new Chart(document.getElementById("barChart"), {
      type: "bar",
      data: {
        labels: Object.keys(monthlySums),
        datasets: [{
          label: "Volume (RWF)",
          data: Object.values(monthlySums),
          backgroundColor: "#3b82f6"
        }]
      }
    });

    // Line Chart
    new Chart(document.getElementById("lineChart"), {
      type: "line",
      data: {
        labels: Object.keys(monthlySums),
        datasets: [{
          label: "Monthly Trend",
          data: Object.values(monthlySums),
          borderColor: "#10b981",
          fill: false,
          tension: 0.3
        }]
      }
    });
  }
});
