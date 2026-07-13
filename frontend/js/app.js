document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements Reference
    const methodSelect = document.getElementById('method-select');
    const urlInput = document.getElementById('url-input');
    const sendButton = document.getElementById('send-button');
    const validationMessage = document.getElementById('validation-message');
    
    // Request Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Response Elements
    const responseSection = document.getElementById('response-section');
    const loadingOverlay = document.getElementById('loading-overlay');
    const resStatus = document.getElementById('res-status');
    const resTime = document.getElementById('res-time');
    const resSize = document.getElementById('res-size');
    const resBodyContent = document.getElementById('res-body-content');
    const resHeadersContent = document.getElementById('res-headers-content');
    
    // Response Tabs
    const resTabButtons = document.querySelectorAll('.res-tab-btn');
    const resTabContents = document.querySelectorAll('.res-tab-content');
    
    // Config Lists
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
            document.getElementById(button.getAttribute('data-tab')).classList.add('active');
        });
    });

    resTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            resTabButtons.forEach(btn => btn.classList.remove('active'));
            resTabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.getAttribute('data-tab')).classList.add('active');
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
        row.append(keyInput, valueInput, removeBtn);
        
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
        if (selected !== 'none') document.getElementById(`auth-${selected}-config`).classList.remove('hidden');
    });

    bodyTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            bodyConfigs.forEach(config => config.classList.add('hidden'));
            const selected = e.target.value;
            if (selected !== 'none') document.getElementById(`body-${selected}-config`).classList.remove('hidden');
        });
    });

    // 6. Request Builders
    function buildQueryString() {
        const params = new URLSearchParams();
        paramsList.querySelectorAll('.key-value-row').forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) params.append(key, value);
        });
        return params.toString() ? `?${params.toString()}` : '';
    }

    function getCustomHeaders() {
        const headers = {};
        headersList.querySelectorAll('.key-value-row').forEach(row => {
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
            if (user || pass) headers['Authorization'] = `Basic ${btoa(user + ':' + pass)}`;
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
            const jsonText = document.getElementById('body-json-textarea').value.trim();
            if (jsonText) {
                try {
                    JSON.parse(jsonText);
                    body = jsonText;
                } catch (e) {
                    showError(document.getElementById('body-json-textarea'), "Invalid JSON in Request Body.");
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

    // 7. Response Rendering Helpers
    function renderResponseUI(data) {
        responseSection.classList.remove('hidden');
        
        // Render Meta Badges
        resStatus.textContent = `${data.status} ${data.statusText || ''}`.trim();
        resStatus.className = `badge ${data.status >= 200 && data.status < 300 ? 'success' : 'error'}`;
        resTime.textContent = data.time || 'N/A';
        resSize.textContent = data.size || 'N/A';
        
        // Render Body (Auto-detect JSON to Pretty Print)
        if (data.body === undefined || data.body === null || data.body === '') {
            resBodyContent.textContent = 'No response body returned.';
        } else if (typeof data.body === 'object') {
            resBodyContent.textContent = JSON.stringify(data.body, null, 2);
        } else {
            try {
                // If it's a string, try parsing as JSON to pretty-print
                const parsed = JSON.parse(data.body);
                resBodyContent.textContent = JSON.stringify(parsed, null, 2);
            } catch {
                // Otherwise, raw text (pre preserves line breaks)
                resBodyContent.textContent = data.body;
            }
        }

        // Render Headers (Key-Value)
        resHeadersContent.innerHTML = '';
        if (data.headers && Object.keys(data.headers).length > 0) {
            for (const [key, value] of Object.entries(data.headers)) {
                const row = document.createElement('div');
                row.className = 'header-row';
                
                const keyEl = document.createElement('div');
                keyEl.className = 'header-key';
                keyEl.textContent = key;
                
                const valEl = document.createElement('div');
                valEl.className = 'header-value';
                valEl.textContent = value;
                
                row.appendChild(keyEl);
                row.appendChild(valEl);
                resHeadersContent.appendChild(row);
            }
        } else {
            resHeadersContent.innerHTML = '<p style="padding: 1rem;">No headers returned.</p>';
        }
    }

    function renderErrorUI(errorMessage) {
        responseSection.classList.remove('hidden');
        
        resStatus.textContent = 'ERROR';
        resStatus.className = 'badge error';
        resTime.textContent = '-';
        resSize.textContent = '-';
        
        resBodyContent.textContent = errorMessage;
        resHeadersContent.innerHTML = '<p style="padding: 1rem;">No headers available due to request error.</p>';
    }

    // 8. Request Execution Logic
    async function handleSendRequest() {
        clearErrors();
        const method = methodSelect.value;
        let url = urlInput.value.trim();
        
        if (!url) return showError(urlInput, "URL cannot be empty.");
        try { new URL(url); } catch { return showError(urlInput, "Invalid URL format."); }

        const isGetOrQuery = ['GET', 'QUERY'].includes(method);
        const requestBodyData = getRequestBodyData();
        if (!requestBodyData.isValid) return; 
        
        const finalBody = isGetOrQuery ? null : requestBodyData.body;
        const bodyType = isGetOrQuery ? 'none' : requestBodyData.type;

        const finalHeaders = { ...getCustomHeaders(), ...getAuthHeaders() };

        if (finalBody) {
            const hasContentType = Object.keys(finalHeaders).some(k => k.toLowerCase() === 'content-type');
            if (!hasContentType) {
                if (bodyType === 'json') finalHeaders['Content-Type'] = 'application/json';
                if (bodyType === 'urlencoded') finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }

        const queryString = buildQueryString();
        let finalUrl;
        try {
            const urlObj = new URL(url);
            const uiParams = new URLSearchParams(queryString);
            uiParams.forEach((val, key) => urlObj.searchParams.append(key, val));
            finalUrl = urlObj.toString();
        } catch { finalUrl = url + queryString; }

        // Trigger Loading State
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';
        responseSection.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');

        const requestBody = { method, url: finalUrl, headers: finalHeaders, body: finalBody, bodyType };
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
                renderErrorUI(`Proxy Error: ${backendMsg}${details}`);
            } else {
                const responseData = await response.json();
                renderResponseUI(responseData);
            }
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') renderErrorUI("Request timed out. The server took too long to respond.");
            else renderErrorUI("Network error. Please verify the backend proxy server is running.");
        } finally {
            // Restore UI State
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
            loadingOverlay.classList.add('hidden');
        }
    }

    sendButton.addEventListener('click', handleSendRequest);
});
