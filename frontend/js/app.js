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
    
    const headersList = document.getElementById('headers-list');
    const addHeaderBtn = document.getElementById('add-header-btn');
    
    const authTypeSelect = document.getElementById('auth-type');
    const authConfigs = document.querySelectorAll('.auth-config');
    
    const bodyTypeRadios = document.querySelectorAll('input[name="body-type"]');
    const bodyConfigs = document.querySelectorAll('.body-config');
    
    const formDataList = document.getElementById('formdata-list');
    const addFormDataBtn = document.getElementById('add-formdata-btn');
    
    const urlEncodedList = document.getElementById('urlencoded-list');
    const addUrlEncodedBtn = document.getElementById('add-urlencoded-btn');

    // 2. UI Utilities
    function showError(element, message) {
        if (element) element.classList.add('input-error');
        validationMessage.textContent = message;
        validationMessage.classList.remove('hidden');
    }

    function clearErrors() {
        urlInput.classList.remove('input-error');
        methodSelect.classList.remove('input-error');
        document.querySelectorAll('.body-textarea').forEach(el => el.classList.remove('input-error'));
        validationMessage.classList.add('hidden');
        validationMessage.textContent = '';
    }

    urlInput.addEventListener('input', clearErrors);
    methodSelect.addEventListener('change', clearErrors);
    document.querySelectorAll('.body-textarea').forEach(el => el.addEventListener('input', clearErrors));

    // 3. Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetTabId = button.getAttribute('data-tab');
            document.getElementById(targetTabId).classList.add('active');
        });
    });

    // 4. Dynamic Key-Value Rows
    function createKeyValueRow(placeholderKey = 'Key', placeholderValue = 'Value') {
        const row = document.createElement('div');
        row.className = 'key-value-row';
        
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.className = 'key-value-input key-input';
        keyInput.placeholder = placeholderKey;
        
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'key-value-input value-input';
        valueInput.placeholder = placeholderValue;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn danger remove-param-btn';
        removeBtn.textContent = 'Remove';
        
        removeBtn.addEventListener('click', () => row.remove());

        row.appendChild(keyInput);
        row.appendChild(valueInput);
        row.appendChild(removeBtn);
        
        return row;
    }

    // Initialize lists
    paramsList.appendChild(createKeyValueRow('Query Parameter', 'Value'));
    headersList.appendChild(createKeyValueRow('Header (e.g., Content-Type)', 'Value'));
    formDataList.appendChild(createKeyValueRow('Form Data Key', 'Value'));
    urlEncodedList.appendChild(createKeyValueRow('URL Encoded Key', 'Value'));

    addParamBtn.addEventListener('click', () => paramsList.appendChild(createKeyValueRow('Query Parameter', 'Value')));
    addHeaderBtn.addEventListener('click', () => headersList.appendChild(createKeyValueRow('Header (e.g., Content-Type)', 'Value')));
    addFormDataBtn.addEventListener('click', () => formDataList.appendChild(createKeyValueRow('Form Data Key', 'Value')));
    addUrlEncodedBtn.addEventListener('click', () => urlEncodedList.appendChild(createKeyValueRow('URL Encoded Key', 'Value')));

    // 5. Auth and Body UI Toggles
    authTypeSelect.addEventListener('change', (e) => {
        authConfigs.forEach(config => config.classList.add('hidden'));
        const selected = e.target.value;
        if (selected !== 'none') {
            document.getElementById(`auth-${selected}-config`).classList.remove('hidden');
        }
    });

    bodyTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            bodyConfigs.forEach(config => config.classList.add('hidden'));
            const selected = e.target.value;
            if (selected !== 'none') {
                document.getElementById(`body-${selected}-config`).classList.remove('hidden');
            }
        });
    });

    // 6. Request Builders
    function buildQueryString() {
        const rows = paramsList.querySelectorAll('.key-value-row');
        const params = new URLSearchParams();
        rows.forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) params.append(key, value);
        });
        return params.toString() ? `?${params.toString()}` : '';
    }

    function getCustomHeaders() {
        const rows = headersList.querySelectorAll('.key-value-row');
        const headers = {};
        rows.forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) headers[key] = value;
        });
        return headers;
    }

    function getAuthHeaders() {
        const type = authTypeSelect.value;
        const headers = {};
        if (type === 'bearer') {
            const token = document.getElementById('auth-bearer-token').value.trim();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        } else if (type === 'basic') {
            const user = document.getElementById('auth-basic-username').value.trim();
            const pass = document.getElementById('auth-basic-password').value;
            if (user || pass) {
                // Encode to Base64 using native btoa
                headers['Authorization'] = `Basic ${btoa(user + ':' + pass)}`;
            }
        } else if (type === 'apikey') {
            const key = document.getElementById('auth-apikey-key').value.trim();
            const val = document.getElementById('auth-apikey-value').value.trim();
            if (key) headers[key] = val;
        }
        return headers;
    }

    function getRequestBodyData() {
        const type = document.querySelector('input[name="body-type"]:checked').value;
        let body = null;
        let isValid = true;
        
        if (type === 'json') {
            const textarea = document.getElementById('body-json-textarea');
            const jsonText = textarea.value.trim();
            if (jsonText) {
                try {
                    JSON.parse(jsonText);
                    body = jsonText;
                } catch (e) {
                    showError(textarea, "Invalid JSON in Request Body.");
                    isValid = false;
                }
            }
        } else if (type === 'text') {
            body = document.getElementById('body-text-textarea').value;
        } else if (type === 'form-data') {
            const rows = formDataList.querySelectorAll('.key-value-row');
            body = {};
            rows.forEach(row => {
                const key = row.querySelector('.key-input').value.trim();
                const value = row.querySelector('.value-input').value.trim();
                if (key) body[key] = value;
            });
            if (Object.keys(body).length === 0) body = null;
        } else if (type === 'urlencoded') {
            const rows = urlEncodedList.querySelectorAll('.key-value-row');
            const params = new URLSearchParams();
            rows.forEach(row => {
                const key = row.querySelector('.key-input').value.trim();
                const value = row.querySelector('.value-input').value.trim();
                if (key) params.append(key, value);
            });
            body = params.toString() || null;
        }
        
        return { body, type, isValid };
    }

    // 7. Request Execution
    async function handleSendRequest() {
        clearErrors();
        const method = methodSelect.value;
        let url = urlInput.value.trim();
        
        // Input Validation
        if (!url) return showError(urlInput, "URL cannot be empty.");
        try { new URL(url); } catch { return showError(urlInput, "Invalid URL format."); }

        // Compile Body
        const isGetOrQuery = ['GET', 'QUERY'].includes(method);
        const requestBodyData = getRequestBodyData();
        
        if (!requestBodyData.isValid) return; // Validation failed (e.g., bad JSON)
        
        const finalBody = isGetOrQuery ? null : requestBodyData.body;
        const bodyType = isGetOrQuery ? 'none' : requestBodyData.type;

        // Compile Headers (Auth overrides manual headers if there's a conflict)
        const finalHeaders = {
            ...getCustomHeaders(),
            ...getAuthHeaders()
        };

        // Auto-inject Content-Type based on body type
        if (finalBody) {
            const hasContentType = Object.keys(finalHeaders).some(k => k.toLowerCase() === 'content-type');
            if (!hasContentType) {
                if (bodyType === 'json') finalHeaders['Content-Type'] = 'application/json';
                if (bodyType === 'urlencoded') finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }

        // URL Compilation
        const queryString = buildQueryString();
        let finalUrl;
        try {
            const urlObj = new URL(url);
            const uiParams = new URLSearchParams(queryString);
            uiParams.forEach((val, key) => urlObj.searchParams.append(key, val));
            finalUrl = urlObj.toString();
        } catch {
            finalUrl = url + queryString;
        }

        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';

        console.log(`[Request Builder] Sending ${method} request to: ${finalUrl}`);
        
        // Payload object specifically designed for our proxy server
        const requestBody = {
            method: method,
            url: finalUrl,
            headers: finalHeaders,
            body: finalBody,
            bodyType: bodyType
        };

        const proxyUrl = 'http://localhost:5000/proxy';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(proxyUrl, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
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
            if (error.name === 'AbortError') showError(null, "Request timed out.");
            else showError(null, "Network error. Is proxy running?");
            console.error(error);
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
        }
    }

    sendButton.addEventListener('click', handleSendRequest);
});
