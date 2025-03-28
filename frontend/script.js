const backendUrl = "http://127.0.0.1:5000/api";

async function uploadDocument() {
    const text = document.getElementById("legalText").value;
    const response = await fetch(`${backendUrl}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    const data = await response.json();
    alert(data.message);
}

async function analyzeText() {
    const text = document.getElementById("legalText").value;
    const response = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    const data = await response.json();
    document.getElementById("analysisResult").innerText = data.analysis;
}
