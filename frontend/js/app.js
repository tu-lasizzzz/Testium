document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements Reference
    const methodSelect = document.getElementById('method-select');
    const urlInput = document.getElementById('url-input');
    const sendButton = document.getElementById('send-button');
    const validationMessage = document.getElementById('validation-message');
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const paramsList = document.getElementById('params-list');
    const addParamBtn = document.getElementById('add-param-btn');

    // 2. Tab Navigation Logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Reset active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Set active state for clicked tab
            button.classList.add('active');
            const targetTabId = button.getAttribute('data-tab');
            document.getElementById(targetTabId).classList.add('active');
        });
    });

    // 3. Query Parameters Management
    function createParamRow() {
        const row = document.createElement('div');
        row.className = 'key-value-row';
        
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.className = 'key-value-input key-input';
        keyInput.placeholder = 'Key';
        
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'key-value-input value-input';
        valueInput.placeholder = 'Value';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn danger remove-param-btn';
        removeBtn.textContent = 'Remove';
        
        // Remove row when button is clicked
        removeBtn.addEventListener('click', () => {
            row.remove();
        });

        row.appendChild(keyInput);
        row.appendChild(valueInput);
        row.appendChild(removeBtn);
        
        return row;
    }

    addParamBtn.addEventListener('click', () => {
        paramsList.appendChild(createParamRow());
    });

    // Initialize UI with one empty parameter row
    paramsList.appendChild(createParamRow());

    // 4. Request Building & Execution
    
    // Reads rows and serializes them into a URLSearchParams query string
    function buildQueryString() {
        const rows = document.querySelectorAll('.key-value-row');
        const params = new URLSearchParams();
        
        rows.forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            
            // Only include rows where the key is not empty
            if (key) {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }

    async function handleSendRequest() {
        const method = methodSelect.value;
        let url = urlInput.value.trim();
        
        // Validation: Empty URL
        if (!url) {
            validationMessage.textContent = "Please enter a valid URL.";
            validationMessage.classList.remove('hidden');
            return;
        }

        // Validation: Format URL
        try {
            new URL(url);
            validationMessage.classList.add('hidden');
        } catch (e) {
            validationMessage.textContent = "Invalid URL format. Please include http:// or https://";
            validationMessage.classList.remove('hidden');
            return;
        }

        // Combine base URL with Query Params from the UI
        const queryString = buildQueryString();
        let finalUrl;
        try {
            const urlObj = new URL(url);
            
            // Safely merge user-defined params with any params that were already in the typed URL
            const uiParams = new URLSearchParams(queryString);
            uiParams.forEach((val, key) => {
                urlObj.searchParams.append(key, val);
            });
            
            finalUrl = urlObj.toString();
        } catch (e) {
            // Fallback just in case, though the URL constructor check above should prevent this
            finalUrl = url + queryString;
        }

        console.log(`[Request Builder] Preparing to send ${method} request to: ${finalUrl}`);
        
        // Prepare request body for proxy
        const requestBody = {
            method: method,
            url: finalUrl,
            headers: {},
            // Body will be implemented in later commits
        };

        // Execute request to the proxy
        const proxyUrl = 'http://localhost:5000/proxy';

        try {
            const response = await fetch(proxyUrl, {
                method: 'POST', // The proxy itself always expects a POST with instructions
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();
            
            // Log to console (UI viewer not built yet)
            console.log('--- Proxy Response ---');
            console.log(responseData);
            console.log('----------------------');
            
        } catch (error) {
            console.error('Failed to send request via proxy:', error);
        }
    }

    sendButton.addEventListener('click', handleSendRequest);
});
