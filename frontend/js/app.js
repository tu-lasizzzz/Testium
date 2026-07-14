document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    // 1. DOM Elements Reference
    // =============================================
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

    // Sidebar Elements
    const collectionsList = document.getElementById('collections-list');
    const createCollectionBtn = document.getElementById('create-collection-btn');
    const exportCollectionsBtn = document.getElementById('export-collections-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Environment Variables Modal Elements
    const envVarsBtn = document.getElementById('env-vars-btn');
    const envModal = document.getElementById('env-modal');
    const envModalClose = document.getElementById('env-modal-close');
    const envVarsList = document.getElementById('env-vars-list');
    const addEnvVarBtn = document.getElementById('add-env-var-btn');
    const saveEnvVarsBtn = document.getElementById('save-env-vars-btn');

    // Save to Collection Modal Elements
    const saveRequestBtn = document.getElementById('save-request-btn');
    const saveModal = document.getElementById('save-modal');
    const saveModalClose = document.getElementById('save-modal-close');
    const saveRequestName = document.getElementById('save-request-name');
    const saveCollectionSelect = document.getElementById('save-collection-select');
    const confirmSaveBtn = document.getElementById('confirm-save-btn');

    // =============================================
    // 2. localStorage Helpers
    // =============================================
    const STORAGE_KEYS = {
        COLLECTIONS: 'collections',
        HISTORY: 'requestHistory',
        ENV_VARS: 'environmentVariables'
    };
    const MAX_HISTORY = 20;

    function loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Failed to load "${key}" from localStorage:`, e);
            return null;
        }
    }

    function saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Failed to save "${key}" to localStorage:`, e);
        }
    }

    // Simple unique ID generator
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    }

    // =============================================
    // 3. UI Utilities
    // =============================================
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

    // =============================================
    // 4. Tab Navigation
    // =============================================
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

    // =============================================
    // 5. Dynamic Key-Value Rows
    // =============================================
    function createKeyValueRow(placeholderKey = 'Key', placeholderValue = 'Value', initialKey = '', initialValue = '') {
        const row = document.createElement('div');
        row.className = 'key-value-row';
        
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.className = 'key-value-input key-input';
        keyInput.placeholder = placeholderKey;
        keyInput.value = initialKey;
        
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'key-value-input value-input';
        valueInput.placeholder = placeholderValue;
        valueInput.value = initialValue;
        
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

    // =============================================
    // 6. Auth and Body UI Toggles
    // =============================================
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

    // =============================================
    // 7. Environment Variables
    // =============================================
    function createEnvVarRow(key = '', value = '') {
        const row = document.createElement('div');
        row.className = 'env-var-row';

        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.placeholder = 'VARIABLE_NAME';
        keyInput.value = key;

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = 'value';
        valueInput.value = value;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn danger btn-sm';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => row.remove());

        row.append(keyInput, valueInput, removeBtn);
        return row;
    }

    function loadEnvVarsIntoModal() {
        envVarsList.innerHTML = '';
        const vars = loadFromStorage(STORAGE_KEYS.ENV_VARS) || [];
        if (vars.length === 0) {
            // Add one empty row by default
            envVarsList.appendChild(createEnvVarRow());
        } else {
            vars.forEach(v => envVarsList.appendChild(createEnvVarRow(v.key, v.value)));
        }
    }

    function saveEnvVarsFromModal() {
        const rows = envVarsList.querySelectorAll('.env-var-row');
        const vars = [];
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const key = inputs[0].value.trim();
            const value = inputs[1].value.trim();
            if (key) vars.push({ key, value });
        });
        saveToStorage(STORAGE_KEYS.ENV_VARS, vars);
    }

    /** Replace {{VAR}} placeholders in a string with stored environment variable values */
    function replaceVariables(str) {
        if (!str || typeof str !== 'string') return str;
        const vars = loadFromStorage(STORAGE_KEYS.ENV_VARS) || [];
        return str.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            const found = vars.find(v => v.key === varName);
            return found ? found.value : match; // Keep placeholder if not found
        });
    }

    /** Apply variable replacement to an object of key-value pairs (headers, form data) */
    function replaceVariablesInObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[replaceVariables(key)] = replaceVariables(value);
        }
        return result;
    }

    // Env modal events
    envVarsBtn.addEventListener('click', () => {
        loadEnvVarsIntoModal();
        envModal.classList.remove('hidden');
    });
    envModalClose.addEventListener('click', () => envModal.classList.add('hidden'));
    envModal.addEventListener('click', (e) => { if (e.target === envModal) envModal.classList.add('hidden'); });
    addEnvVarBtn.addEventListener('click', () => envVarsList.appendChild(createEnvVarRow()));
    saveEnvVarsBtn.addEventListener('click', () => {
        saveEnvVarsFromModal();
        envModal.classList.add('hidden');
    });

    // =============================================
    // 8. Request Builders
    // =============================================
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

    // =============================================
    // 9. Response Rendering Helpers
    // =============================================
    function renderResponseUI(data) {
        responseSection.classList.remove('hidden');
        
        resStatus.textContent = `${data.status} ${data.statusText || ''}`.trim();
        resStatus.className = `badge ${data.status >= 200 && data.status < 300 ? 'success' : 'error'}`;
        resTime.textContent = data.time || 'N/A';
        resSize.textContent = data.size || 'N/A';
        
        if (data.body === undefined || data.body === null || data.body === '') {
            resBodyContent.textContent = 'No response body returned.';
        } else if (typeof data.body === 'object') {
            resBodyContent.textContent = JSON.stringify(data.body, null, 2);
        } else {
            try {
                const parsed = JSON.parse(data.body);
                resBodyContent.textContent = JSON.stringify(parsed, null, 2);
            } catch {
                resBodyContent.textContent = data.body;
            }
        }

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

    // =============================================
    // 10. Request History
    // =============================================
    function getHistory() {
        return loadFromStorage(STORAGE_KEYS.HISTORY) || [];
    }

    function addHistoryItem(method, url) {
        const history = getHistory();
        const item = {
            id: generateId(),
            method: method,
            url: url,
            timestamp: new Date().toISOString()
        };
        history.unshift(item);
        // Keep only the last MAX_HISTORY items
        if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
        saveToStorage(STORAGE_KEYS.HISTORY, history);
        renderHistory();
    }

    function clearHistory() {
        saveToStorage(STORAGE_KEYS.HISTORY, []);
        renderHistory();
    }

    function formatTimestamp(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    }

    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No history yet. Send a request to see it here.</p>';
            return;
        }

        history.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = `
                <span class="method-badge ${item.method.toLowerCase()}">${item.method}</span>
                <span class="history-url" title="${item.url}">${item.url}</span>
                <span class="history-time">${formatTimestamp(item.timestamp)}</span>
            `;
            el.addEventListener('click', () => loadRequestIntoBuilder({ method: item.method, url: item.url }));
            historyList.appendChild(el);
        });
    }

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear all request history?')) clearHistory();
    });

    // =============================================
    // 11. Collections
    // =============================================
    function getCollections() {
        return loadFromStorage(STORAGE_KEYS.COLLECTIONS) || [];
    }

    function saveCollections(collections) {
        saveToStorage(STORAGE_KEYS.COLLECTIONS, collections);
    }

    function createCollection() {
        const name = prompt('Enter collection name:');
        if (!name || !name.trim()) return;
        const collections = getCollections();
        collections.push({ id: generateId(), name: name.trim(), requests: [] });
        saveCollections(collections);
        renderCollections();
    }

    function renameCollection(collectionId) {
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;
        const newName = prompt('Rename collection:', collection.name);
        if (!newName || !newName.trim()) return;
        collection.name = newName.trim();
        saveCollections(collections);
        renderCollections();
    }

    function deleteCollection(collectionId) {
        if (!confirm('Delete this collection and all its requests?')) return;
        let collections = getCollections();
        collections = collections.filter(c => c.id !== collectionId);
        saveCollections(collections);
        renderCollections();
    }

    function deleteRequest(collectionId, requestId) {
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;
        collection.requests = collection.requests.filter(r => r.id !== requestId);
        saveCollections(collections);
        renderCollections();
    }

    /** Capture the current state of the request builder into a serializable object */
    function captureCurrentRequest() {
        const method = methodSelect.value;
        const url = urlInput.value.trim();

        // Capture params
        const params = [];
        paramsList.querySelectorAll('.key-value-row').forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) params.push({ key, value });
        });

        // Capture headers
        const headers = [];
        headersList.querySelectorAll('.key-value-row').forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) headers.push({ key, value });
        });

        // Capture auth
        const authType = authTypeSelect.value;
        const auth = { type: authType };
        if (authType === 'bearer') auth.token = document.getElementById('auth-bearer-token').value;
        if (authType === 'basic') {
            auth.username = document.getElementById('auth-basic-username').value;
            auth.password = document.getElementById('auth-basic-password').value;
        }
        if (authType === 'apikey') {
            auth.key = document.getElementById('auth-apikey-key').value;
            auth.value = document.getElementById('auth-apikey-value').value;
        }

        // Capture body
        const bodyType = document.querySelector('input[name="body-type"]:checked').value;
        const body = { type: bodyType };
        if (bodyType === 'json') body.content = document.getElementById('body-json-textarea').value;
        if (bodyType === 'text') body.content = document.getElementById('body-text-textarea').value;
        if (bodyType === 'form-data') {
            body.fields = [];
            formDataList.querySelectorAll('.key-value-row').forEach(row => {
                const key = row.querySelector('.key-input').value.trim();
                const value = row.querySelector('.value-input').value.trim();
                if (key) body.fields.push({ key, value });
            });
        }
        if (bodyType === 'urlencoded') {
            body.fields = [];
            urlEncodedList.querySelectorAll('.key-value-row').forEach(row => {
                const key = row.querySelector('.key-input').value.trim();
                const value = row.querySelector('.value-input').value.trim();
                if (key) body.fields.push({ key, value });
            });
        }

        return { method, url, params, headers, auth, body };
    }

    /** Load a saved request object back into the request builder UI */
    function loadRequestIntoBuilder(request) {
        // Set method and URL
        methodSelect.value = request.method || 'GET';
        urlInput.value = request.url || '';

        // Restore params
        if (request.params && request.params.length > 0) {
            paramsList.innerHTML = '';
            request.params.forEach(p => paramsList.appendChild(createKeyValueRow('Query Parameter', 'Value', p.key, p.value)));
        }

        // Restore headers
        if (request.headers && request.headers.length > 0) {
            headersList.innerHTML = '';
            request.headers.forEach(h => headersList.appendChild(createKeyValueRow('Header (e.g., Content-Type)', 'Value', h.key, h.value)));
        }

        // Restore auth
        if (request.auth) {
            authTypeSelect.value = request.auth.type || 'none';
            authTypeSelect.dispatchEvent(new Event('change'));
            if (request.auth.type === 'bearer') {
                document.getElementById('auth-bearer-token').value = request.auth.token || '';
            } else if (request.auth.type === 'basic') {
                document.getElementById('auth-basic-username').value = request.auth.username || '';
                document.getElementById('auth-basic-password').value = request.auth.password || '';
            } else if (request.auth.type === 'apikey') {
                document.getElementById('auth-apikey-key').value = request.auth.key || '';
                document.getElementById('auth-apikey-value').value = request.auth.value || '';
            }
        }

        // Restore body
        if (request.body) {
            const bodyRadio = document.querySelector(`input[name="body-type"][value="${request.body.type}"]`);
            if (bodyRadio) {
                bodyRadio.checked = true;
                bodyRadio.dispatchEvent(new Event('change'));
            }
            if (request.body.type === 'json') {
                document.getElementById('body-json-textarea').value = request.body.content || '';
            } else if (request.body.type === 'text') {
                document.getElementById('body-text-textarea').value = request.body.content || '';
            } else if (request.body.type === 'form-data' && request.body.fields) {
                formDataList.innerHTML = '';
                request.body.fields.forEach(f => formDataList.appendChild(createKeyValueRow('Form Data Key', 'Value', f.key, f.value)));
            } else if (request.body.type === 'urlencoded' && request.body.fields) {
                urlEncodedList.innerHTML = '';
                request.body.fields.forEach(f => urlEncodedList.appendChild(createKeyValueRow('URL Encoded Key', 'Value', f.key, f.value)));
            }
        }

        // Scroll main area to top
        document.querySelector('main').scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderCollections() {
        const collections = getCollections();
        collectionsList.innerHTML = '';

        if (collections.length === 0) {
            collectionsList.innerHTML = '<p class="empty-state">No collections yet. Create one to save requests.</p>';
            return;
        }

        collections.forEach(collection => {
            const item = document.createElement('div');
            item.className = 'collection-item';

            // Header row (clickable to expand)
            const header = document.createElement('div');
            header.className = 'collection-header';
            header.innerHTML = `
                <span class="collection-name" title="${collection.name}">${collection.name}</span>
                <span style="color:#999; font-size:0.75rem;">(${collection.requests.length})</span>
                <div class="collection-actions">
                    <button class="rename-btn" title="Rename">✏</button>
                    <button class="delete-btn" title="Delete">🗑</button>
                </div>
            `;

            // Requests container (expandable)
            const requestsContainer = document.createElement('div');
            requestsContainer.className = 'collection-requests';

            if (collection.requests.length === 0) {
                requestsContainer.innerHTML = '<p class="empty-state" style="padding-left:0.5rem;">No saved requests.</p>';
            } else {
                collection.requests.forEach(req => {
                    const reqEl = document.createElement('div');
                    reqEl.className = 'saved-request-item';
                    reqEl.innerHTML = `
                        <span class="method-badge ${req.method.toLowerCase()}">${req.method}</span>
                        <span class="request-name" title="${req.name || req.url}">${req.name || req.url}</span>
                        <button class="delete-request-btn" title="Delete request">✕</button>
                    `;
                    // Load request on click
                    reqEl.addEventListener('click', (e) => {
                        if (e.target.classList.contains('delete-request-btn')) return;
                        loadRequestIntoBuilder(req);
                    });
                    // Delete request
                    reqEl.querySelector('.delete-request-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteRequest(collection.id, req.id);
                    });
                    requestsContainer.appendChild(reqEl);
                });
            }

            // Toggle expand/collapse on header click
            header.addEventListener('click', (e) => {
                if (e.target.closest('.collection-actions')) return;
                requestsContainer.classList.toggle('expanded');
            });

            // Rename and Delete actions
            header.querySelector('.rename-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                renameCollection(collection.id);
            });
            header.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCollection(collection.id);
            });

            item.appendChild(header);
            item.appendChild(requestsContainer);
            collectionsList.appendChild(item);
        });
    }

    // Create collection button
    createCollectionBtn.addEventListener('click', createCollection);

    // =============================================
    // 12. Save Request to Collection
    // =============================================
    function openSaveModal() {
        const collections = getCollections();
        if (collections.length === 0) {
            alert('No collections exist. Please create a collection first.');
            return;
        }
        // Populate the collection dropdown
        saveCollectionSelect.innerHTML = '';
        collections.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            saveCollectionSelect.appendChild(option);
        });
        // Default request name from the URL
        const method = methodSelect.value;
        const url = urlInput.value.trim();
        saveRequestName.value = url ? `${method} ${new URL(url).pathname}` : '';
        saveModal.classList.remove('hidden');
    }

    function confirmSaveRequest() {
        const name = saveRequestName.value.trim();
        const collectionId = saveCollectionSelect.value;
        if (!name) {
            alert('Please enter a request name.');
            return;
        }
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;

        const requestData = captureCurrentRequest();
        requestData.id = generateId();
        requestData.name = name;
        collection.requests.push(requestData);
        saveCollections(collections);
        renderCollections();
        saveModal.classList.add('hidden');
    }

    saveRequestBtn.addEventListener('click', openSaveModal);
    saveModalClose.addEventListener('click', () => saveModal.classList.add('hidden'));
    saveModal.addEventListener('click', (e) => { if (e.target === saveModal) saveModal.classList.add('hidden'); });
    confirmSaveBtn.addEventListener('click', confirmSaveRequest);

    // =============================================
    // 13. Export Collections
    // =============================================
    function exportCollections() {
        const collections = getCollections();
        if (collections.length === 0) {
            alert('No collections to export.');
            return;
        }
        const exportData = {
            exportedAt: new Date().toISOString(),
            source: 'Postman Lite',
            collections: collections
        };
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `postman-lite-collections-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    exportCollectionsBtn.addEventListener('click', exportCollections);

    // =============================================
    // 14. Request Execution Logic (with Variable Replacement & History)
    // =============================================
    async function handleSendRequest() {
        clearErrors();
        const method = methodSelect.value;
        let url = urlInput.value.trim();
        
        if (!url) return showError(urlInput, "URL cannot be empty.");
        
        // Apply variable replacement to the URL before validation
        url = replaceVariables(url);
        
        try { new URL(url); } catch { return showError(urlInput, "Invalid URL format. Check your environment variables."); }

        const isGetOrQuery = ['GET', 'QUERY'].includes(method);
        const requestBodyData = getRequestBodyData();
        if (!requestBodyData.isValid) return; 
        
        let finalBody = isGetOrQuery ? null : requestBodyData.body;
        const bodyType = isGetOrQuery ? 'none' : requestBodyData.type;

        // Apply variable replacement to body
        if (finalBody) {
            if (typeof finalBody === 'string') {
                finalBody = replaceVariables(finalBody);
            } else if (typeof finalBody === 'object') {
                finalBody = replaceVariablesInObject(finalBody);
            }
        }

        // Apply variable replacement to headers
        const rawHeaders = { ...getCustomHeaders(), ...getAuthHeaders() };
        const finalHeaders = replaceVariablesInObject(rawHeaders);

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

        // Apply variable replacement to final URL (in case params had variables)
        finalUrl = replaceVariables(finalUrl);

        // Save to history (using the original URL the user typed, before replacement)
        addHistoryItem(method, urlInput.value.trim());

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
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
            loadingOverlay.classList.add('hidden');
        }
    }

    sendButton.addEventListener('click', handleSendRequest);

    // =============================================
    // 15. Initialize on Load
    // =============================================
    renderCollections();
    renderHistory();
});
