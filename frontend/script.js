document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
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
            // Show error in a more user-friendly way
            showNotification("Please upload a file or enter text!", "error");
            return;
        }

        // Show loading state
        showLoading(true);

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

            // Update the result content area with the analysis results
            updateResults(result.data);

            // Enable chat functionality
            enableChat();

        } catch (error) {
            console.error("Request failed:", error);
            showNotification("Error analyzing document: " + error.message, "error");
        } finally {
            showLoading(false);
        }
    });

    // Chat functionality
    document.getElementById("chat-send").addEventListener("click", sendChatMessage);
    document.getElementById("chat-input").addEventListener("keypress", function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Tab switching in results section
    setupResultTabs();

    // Drag and drop file upload enhancement
    setupDragAndDrop();
});

// Helper Functions

async function sendChatMessage() {
    let chatInput = document.getElementById("chat-input");
    let message = chatInput.value.trim();
    if (!message) return;

    let chatBox = document.getElementById("chat-box");
    
    // Add user message
    appendMessage('user', message);
    
    // Clear input field
    chatInput.value = "";

    try {
        // Show typing indicator
        appendTypingIndicator();

        let response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message })
        });

        let result = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (result.error) throw new Error(result.error);

        // Add AI response
        appendMessage('ai', result.response);

    } catch (error) {
        console.error("Chat request failed:", error);
        removeTypingIndicator();
        appendMessage('ai', "Sorry, I encountered an error processing your request.");
    }
}

function appendMessage(type, content) {
    let chatBox = document.getElementById("chat-box");
    let messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type === 'user' ? 'user-message' : 'ai-message'}`;
    
    let bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = content;
    
    messageDiv.appendChild(bubbleDiv);
    chatBox.appendChild(messageDiv);
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTypingIndicator() {
    let chatBox = document.getElementById("chat-box");
    let indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'chat-message ai-message typing-indicator';
    
    let bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = '<span>•</span><span>•</span><span>•</span>';
    
    indicatorDiv.appendChild(bubbleDiv);
    chatBox.appendChild(indicatorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    let typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function updateResults(data) {
    let resultContent = document.querySelector('.result-content');
    
    // Structure the results based on the tabs
    let summaryHTML = `
        <div class="result-section">
            <h3 class="result-section-title"><span class="icon">📝</span> Executive Summary</h3>
            <p>${data.summary || 'No summary available'}</p>
        </div>
    `;
    
    let keyPointsHTML = '';
    if (data.keyPoints && data.keyPoints.length) {
        keyPointsHTML = `
            <div class="result-section">
                <h3 class="result-section-title"><span class="icon">🔑</span> Key Points</h3>
                <ul>
                    ${data.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        keyPointsHTML = `<p>No key points identified.</p>`;
    }
    
    let biasHTML = `
        <div class="result-section">
            <h3 class="result-section-title"><span class="icon">⚖️</span> Potential Bias Detected</h3>
            <p>${data.bias || 'No bias detected'}</p>
        </div>
    `;

    // Set the initial active tab content
    resultContent.innerHTML = summaryHTML;
    
    // Store all tab contents for switching
    document.querySelectorAll('.result-tab').forEach((tab, index) => {
        tab.onclick = function() {
            document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            switch(index) {
                case 0: // Summary tab
                    resultContent.innerHTML = summaryHTML;
                    break;
                case 1: // Key Points tab
                    resultContent.innerHTML = keyPointsHTML;
                    break;
                case 2: // Bias Detection tab
                    resultContent.innerHTML = biasHTML;
                    break;
            }
        };
    });
}

function enableChat() {
    // Enable chat functionality
    document.getElementById("chat-input").disabled = false;
    document.getElementById("chat-send").disabled = false;
    
    // Add a message to inform the user
    let chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = '';
    appendMessage('ai', "Document analysis complete! You can now ask me questions about this document.");
}

function showLoading(isLoading) {
    if (isLoading) {
        document.querySelector('button[type="submit"]').innerHTML = '<span class="icon">⏳</span> Analyzing...';
        document.querySelector('button[type="submit"]').disabled = true;
    } else {
        document.querySelector('button[type="submit"]').innerHTML = '<span class="icon">🔍</span> Analyze Document';
        document.querySelector('button[type="submit"]').disabled = false;
    }
}

function showNotification(message, type = 'info') {
    // Create a notification element
    let notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<span class="icon">${type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

function setupResultTabs() {
    // Initialize the result tabs
    document.querySelectorAll('.result-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setupDragAndDrop() {
    const dropArea = document.querySelector('.file-upload');
    const fileInput = document.getElementById('file-input');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        fileInput.files = files;
        
        // Show file name if file is selected
        if (files.length > 0) {
            const fileInfoElement = document.createElement('p');
            fileInfoElement.className = 'file-info';
            fileInfoElement.textContent = `Selected: ${files[0].name}`;
            
            // Remove any existing file info
            const existingFileInfo = dropArea.querySelector('.file-info');
            if (existingFileInfo) {
                dropArea.removeChild(existingFileInfo);
            }
            
            dropArea.appendChild(fileInfoElement);
        }
    }
    
    // Also update when file is selected via the input
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const fileInfoElement = document.createElement('p');
            fileInfoElement.className = 'file-info';
            fileInfoElement.textContent = `Selected: ${this.files[0].name}`;
            
            // Remove any existing file info
            const existingFileInfo = dropArea.querySelector('.file-info');
            if (existingFileInfo) {
                dropArea.removeChild(existingFileInfo);
            }
            
            dropArea.appendChild(fileInfoElement);
        }
    });
}

// Add necessary styles for notifications
(function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            transition: opacity 0.5s ease;
            max-width: 350px;
            font-size: 14px;
        }
        
        .notification.error {
            border-left-color: #e74c3c;
        }
        
        .file-upload.highlight {
            border-color: #3498db;
            background-color: rgba(52, 152, 219, 0.1);
        }
        
        .file-info {
            margin-top: 10px;
            font-size: 14px;
            color: #3498db;
        }
        
        .typing-indicator span {
            animation: dotTyping 1.5s infinite;
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #888;
            margin: 0 2px;
        }
        
        .typing-indicator span:nth-child(2) {
            animation-delay: 0.5s;
        }
        
        .typing-indicator span:nth-child(3) {
            animation-delay: 1s;
        }
        
        @keyframes dotTyping {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
})();