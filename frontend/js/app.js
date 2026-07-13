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

    // 2. UI Utilities (Validation & Error Handling)
    function showError(element, message) {
        if (element) {
            element.classList.add('input-error');
        }
        validationMessage.textContent = message;
        validationMessage.classList.remove('hidden');
    }

    function clearErrors() {
        urlInput.classList.remove('input-error');
        methodSelect.classList.remove('input-error');
        validationMessage.classList.add('hidden');
        validationMessage.textContent = '';
    }

    // Automatically remove error state when the user corrects the input
    urlInput.addEventListener('input', clearErrors);
    methodSelect.addEventListener('change', clearErrors);

    // 3. Tab Navigation Logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetTabId = button.getAttribute('data-tab');
            document.getElementById(targetTabId).classList.add('active');
        });
    });

    // 4. Query Parameters Management
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

    paramsList.appendChild(createParamRow());

    // 5. Request Building & Execution
    
    function buildQueryString() {
        const rows = document.querySelectorAll('.key-value-row');
        const params = new URLSearchParams();
        
        rows.forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            
            // Ignore rows where both key and value are empty
            if (!key && !value) return;
            
            // Append valid keys (URLSearchParams naturally handles encoding & duplicate separators)
            if (key) {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }

    async function handleSendRequest() {
        clearErrors();
        
        const method = methodSelect.value;
        let url = urlInput.value.trim();
        
        // --- Input Validation ---
        
        if (!url) {
            showError(urlInput, "URL cannot be empty. Please enter a destination URL.");
            return;
        }

        try {
            new URL(url);
        } catch (e) {
            showError(urlInput, "Invalid URL format. Please include http:// or https:// (e.g., https://api.example.com).");
            return;
        }

        const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'QUERY'];
        if (!validMethods.includes(method)) {
            showError(methodSelect, "Unsupported HTTP method selected.");
            return;
        }

        // --- Execution Preparation ---
        
        // Prevent multiple rapid clicks while request is in progress
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';

        // Safely combine base URL with Query Params
        const queryString = buildQueryString();
        let finalUrl;
        try {
            const urlObj = new URL(url);
            const uiParams = new URLSearchParams(queryString);
            uiParams.forEach((val, key) => {
                urlObj.searchParams.append(key, val);
            });
            finalUrl = urlObj.toString();
        } catch (e) {
            finalUrl = url + queryString;
        }

        console.log(`[Request Builder] Sending ${method} request to: ${finalUrl}`);
        
        const requestBody = {
            method: method,
            url: finalUrl,
            headers: {},
        };

        const proxyUrl = 'http://localhost:5000/proxy';
        
        // Implement 15-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(proxyUrl, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            // Handle Proxy-level errors (e.g., Target server down, invalid destination URL)
            if (!response.ok) {
                // Safely try to parse JSON error message from our Express proxy
                const errorData = await response.json().catch(() => ({}));
                const backendMsg = errorData.error || "Server unavailable or proxy failed.";
                const details = errorData.details ? ` (${errorData.details})` : "";
                
                showError(null, `Request failed: ${backendMsg}${details}`);
            } else {
                const responseData = await response.json();
                
                console.log('--- Proxy Response ---');
                console.log(responseData);
                console.log('----------------------');
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            // Handle client-level network errors and timeouts gracefully (no raw JS errors)
            if (error.name === 'AbortError') {
                showError(null, "Request timed out. The server took too long to respond.");
            } else {
                showError(null, "Network error. Please verify the backend proxy server is running.");
            }
            console.error('[Request Error]:', error);
        } finally {
            // Re-enable button after request completes or fails
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
        }
    }

    sendButton.addEventListener('click', handleSendRequest);
});
