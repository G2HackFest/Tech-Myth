document.getElementById("upload-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    let fileInput = document.getElementById("file-input").files[0];
    let textInput = document.getElementById("text-input").value.trim();
    
    let formData;
    let headers = {};

    if (fileInput) {
        formData = new FormData();
        formData.append("file", fileInput);
    } else if (textInput) {
        formData = JSON.stringify({ text: textInput });
        headers = { "Content-Type": "application/json" };
    } else {
        alert("Please upload a file or enter text!");
        return;
    }

    try {
        let response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            body: fileInput ? formData : formData,
            headers: headers
        });

        let result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        document.getElementById("result").innerHTML = `<h3>Summary:</h3><p>${result.data.summary}</p>
                                                        <h3>Bias Detected:</h3><p>${result.data.bias}</p>`;
    } catch (error) {
        console.error("Request failed:", error);
        alert("Error analyzing document. Check console for details.");
    }
});
