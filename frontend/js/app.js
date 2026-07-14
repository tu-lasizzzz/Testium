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
    const saveFolderSelect = document.getElementById('save-folder-select');
    const confirmSaveBtn = document.getElementById('confirm-save-btn');

    // Dark Mode
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Response Search
    const responseSearchInput = document.getElementById('response-search-input');
    const responseSearchCount = document.getElementById('response-search-count');
    const responseSearchClear = document.getElementById('response-search-clear');

    // Response Variables Panel
    const responseVarsPanel = document.getElementById('response-vars-panel');
    const responseVarsToggle = document.getElementById('response-vars-toggle');
    const responseVarsContent = document.getElementById('response-vars-content');
    const responseVarsList = document.getElementById('response-vars-list');

    // WebSocket Elements
    const wsUrlInput = document.getElementById('ws-url-input');
    const wsConnectBtn = document.getElementById('ws-connect-btn');
    const wsDisconnectBtn = document.getElementById('ws-disconnect-btn');
    const wsStatus = document.getElementById('ws-status');
    const wsMessageInput = document.getElementById('ws-message-input');
    const wsSendBtn = document.getElementById('ws-send-btn');
    const wsMessages = document.getElementById('ws-messages');

    // =============================================
    // 2. localStorage Helpers
    // =============================================
    const STORAGE_KEYS = {
        COLLECTIONS: 'collections',
        HISTORY: 'requestHistory',
        ENV_VARS: 'environmentVariables',
        THEME: 'theme'
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
    // 4. Dark Mode
    // =============================================
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            darkModeToggle.textContent = '☀ Light Mode';
        } else {
            document.body.classList.remove('dark');
            darkModeToggle.textContent = '🌙 Dark Mode';
        }
    }

    function toggleDarkMode() {
        const isDark = document.body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        saveToStorage(STORAGE_KEYS.THEME, newTheme);
        applyTheme(newTheme);
    }

    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Apply saved theme on load
    const savedTheme = loadFromStorage(STORAGE_KEYS.THEME) || 'light';
    applyTheme(savedTheme);

    // =============================================
    // 5. Tab Navigation
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
    // 6. Dynamic Key-Value Rows
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
    // 7. Auth and Body UI Toggles
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
    // 8. Environment Variables
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

    // =============================================
    // 9. Request Chaining – Response Variable Store
    // =============================================
    let lastResponseData = null; // In-memory store for the last JSON response

    /** Traverse a nested object using a dot-separated path */
    function resolveNestedPath(obj, path) {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') return undefined;
            current = current[part];
        }
        return current;
    }

    /** Flatten a JSON object into dot-notation paths for display */
    function flattenObject(obj, prefix = '', maxDepth = 4, depth = 0) {
        const result = [];
        if (depth >= maxDepth || obj === null || obj === undefined) return result;
        if (typeof obj !== 'object') return result;

        for (const [key, value] of Object.entries(obj)) {
            const path = prefix ? `${prefix}.${key}` : key;
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                result.push({ path, value: '{...}', isObject: true });
                result.push(...flattenObject(value, path, maxDepth, depth + 1));
            } else if (Array.isArray(value)) {
                result.push({ path, value: `[${value.length} items]`, isObject: true });
                // Show first few array items
                value.slice(0, 3).forEach((item, i) => {
                    if (typeof item === 'object' && item !== null) {
                        result.push({ path: `${path}[${i}]`, value: '{...}', isObject: true });
                        result.push(...flattenObject(item, `${path}[${i}]`, maxDepth, depth + 1));
                    } else {
                        result.push({ path: `${path}[${i}]`, value: String(item), isObject: false });
                    }
                });
            } else {
                result.push({ path, value: String(value), isObject: false });
            }
        }
        return result;
    }

    /** Replace {{VAR}} and {{response.path}} placeholders */
    function replaceVariables(str) {
        if (!str || typeof str !== 'string') return str;
        const vars = loadFromStorage(STORAGE_KEYS.ENV_VARS) || [];

        return str.replace(/\{\{([\w.\[\]]+)\}\}/g, (match, varName) => {
            // Check for response chaining ({{response.path}})
            if (varName.startsWith('response.') && lastResponseData) {
                const path = varName.substring(9); // Remove 'response.' prefix
                const resolved = resolveNestedPath(lastResponseData, path);
                return resolved !== undefined ? String(resolved) : match;
            }
            // Check environment variables
            const found = vars.find(v => v.key === varName);
            return found ? found.value : match;
        });
    }

    /** Apply variable replacement to an object of key-value pairs */
    function replaceVariablesInObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[replaceVariables(key)] = replaceVariables(value);
        }
        return result;
    }

    /** Render the response variables panel */
    function renderResponseVariables(data) {
        if (!data || typeof data !== 'object') {
            responseVarsPanel.classList.add('hidden');
            return;
        }
        const flatPaths = flattenObject(data).filter(p => !p.isObject);
        if (flatPaths.length === 0) {
            responseVarsPanel.classList.add('hidden');
            return;
        }

        responseVarsPanel.classList.remove('hidden');
        responseVarsList.innerHTML = '';

        flatPaths.slice(0, 30).forEach(item => {
            const el = document.createElement('div');
            el.className = 'response-var-item';
            el.innerHTML = `
                <span class="response-var-path">{{response.${item.path}}}</span>
                <span class="response-var-value" title="${item.value}">${item.value}</span>
            `;
            el.addEventListener('click', () => {
                // Copy the variable placeholder to clipboard
                navigator.clipboard.writeText(`{{response.${item.path}}}`).catch(() => {});
            });
            responseVarsList.appendChild(el);
        });
    }

    // Toggle response variables panel
    responseVarsToggle.addEventListener('click', () => {
        responseVarsContent.style.display = responseVarsContent.style.display === 'none' ? 'block' : 'none';
        responseVarsToggle.querySelector('.toggle-arrow').classList.toggle('collapsed');
    });

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
    // 10. Request Builders
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
    // 11. Response Search and Filtering
    // =============================================
    let currentResponseText = ''; // Store raw response text for search

    function performResponseSearch() {
        const query = responseSearchInput.value.trim();
        if (!query || !currentResponseText) {
            resBodyContent.textContent = currentResponseText;
            responseSearchCount.style.display = 'none';
            responseSearchClear.style.display = 'none';
            return;
        }

        // Escape special regex characters in user input
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        const matches = currentResponseText.match(regex);
        const count = matches ? matches.length : 0;

        // Show count badge
        responseSearchCount.textContent = `${count} match${count !== 1 ? 'es' : ''}`;
        responseSearchCount.style.display = 'inline-block';
        responseSearchClear.style.display = 'inline-block';

        if (count > 0) {
            // Use innerHTML with highlighted matches (escape HTML first)
            const escaped = currentResponseText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            const highlighted = escaped.replace(
                new RegExp(`(${escapedQuery.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')})`, 'gi'),
                '<mark>$1</mark>'
            );
            resBodyContent.innerHTML = highlighted;
        } else {
            resBodyContent.textContent = currentResponseText;
        }
    }

    responseSearchInput.addEventListener('input', performResponseSearch);
    responseSearchClear.addEventListener('click', () => {
        responseSearchInput.value = '';
        performResponseSearch();
    });

    // =============================================
    // 12. Response Rendering Helpers
    // =============================================
    function renderResponseUI(data) {
        responseSection.classList.remove('hidden');
        
        resStatus.textContent = `${data.status} ${data.statusText || ''}`.trim();
        resStatus.className = `badge ${data.status >= 200 && data.status < 300 ? 'success' : 'error'}`;
        resTime.textContent = data.time || 'N/A';
        resSize.textContent = data.size || 'N/A';
        
        // Store response body for request chaining
        let parsedBody = null;
        if (data.body !== undefined && data.body !== null && data.body !== '') {
            if (typeof data.body === 'object') {
                parsedBody = data.body;
                currentResponseText = JSON.stringify(data.body, null, 2);
            } else {
                try {
                    parsedBody = JSON.parse(data.body);
                    currentResponseText = JSON.stringify(parsedBody, null, 2);
                } catch {
                    currentResponseText = data.body;
                }
            }
        } else {
            currentResponseText = 'No response body returned.';
        }

        resBodyContent.textContent = currentResponseText;

        // Update chaining store and render variables panel
        lastResponseData = parsedBody;
        renderResponseVariables(parsedBody);

        // Reset search
        responseSearchInput.value = '';
        responseSearchCount.style.display = 'none';
        responseSearchClear.style.display = 'none';

        // Render Headers
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
        
        currentResponseText = errorMessage;
        resBodyContent.textContent = errorMessage;
        lastResponseData = null;
        responseVarsPanel.classList.add('hidden');
        resHeadersContent.innerHTML = '<p style="padding: 1rem;">No headers available due to request error.</p>';
    }

    // =============================================
    // 13. Request History
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
    // 14. Collections with Folders
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
        collections.push({ id: generateId(), name: name.trim(), requests: [], folders: [] });
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

    // Folder CRUD helpers – find and modify folders recursively
    function findFolderById(folders, folderId) {
        for (const folder of folders) {
            if (folder.id === folderId) return folder;
            if (folder.folders && folder.folders.length > 0) {
                const found = findFolderById(folder.folders, folderId);
                if (found) return found;
            }
        }
        return null;
    }

    function deleteFolderById(folders, folderId) {
        const idx = folders.findIndex(f => f.id === folderId);
        if (idx !== -1) { folders.splice(idx, 1); return true; }
        for (const folder of folders) {
            if (folder.folders && deleteFolderById(folder.folders, folderId)) return true;
        }
        return false;
    }

    function createFolder(collectionId, parentFolderId) {
        const name = prompt('Enter folder name:');
        if (!name || !name.trim()) return;
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;

        const newFolder = { id: generateId(), name: name.trim(), requests: [], folders: [] };

        if (parentFolderId) {
            if (!collection.folders) collection.folders = [];
            const parentFolder = findFolderById(collection.folders, parentFolderId);
            if (parentFolder) {
                if (!parentFolder.folders) parentFolder.folders = [];
                parentFolder.folders.push(newFolder);
            }
        } else {
            if (!collection.folders) collection.folders = [];
            collection.folders.push(newFolder);
        }

        saveCollections(collections);
        renderCollections();
    }

    function renameFolder(collectionId, folderId) {
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection || !collection.folders) return;
        const folder = findFolderById(collection.folders, folderId);
        if (!folder) return;
        const newName = prompt('Rename folder:', folder.name);
        if (!newName || !newName.trim()) return;
        folder.name = newName.trim();
        saveCollections(collections);
        renderCollections();
    }

    function deleteFolder(collectionId, folderId) {
        if (!confirm('Delete this folder and all its contents?')) return;
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection || !collection.folders) return;
        deleteFolderById(collection.folders, folderId);
        saveCollections(collections);
        renderCollections();
    }

    // Delete a request from collection root or any folder
    function deleteRequestFromCollection(collectionId, requestId) {
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;
        // Try root requests
        const rootIdx = collection.requests.findIndex(r => r.id === requestId);
        if (rootIdx !== -1) {
            collection.requests.splice(rootIdx, 1);
            saveCollections(collections);
            renderCollections();
            return;
        }
        // Try folders recursively
        function removeFromFolders(folders) {
            for (const folder of folders) {
                const idx = folder.requests.findIndex(r => r.id === requestId);
                if (idx !== -1) { folder.requests.splice(idx, 1); return true; }
                if (folder.folders && removeFromFolders(folder.folders)) return true;
            }
            return false;
        }
        if (collection.folders) removeFromFolders(collection.folders);
        saveCollections(collections);
        renderCollections();
    }

    // Duplicate a request
    function duplicateRequest(collectionId, requestId) {
        const collections = getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;

        function findAndDuplicate(requestsArray) {
            const idx = requestsArray.findIndex(r => r.id === requestId);
            if (idx !== -1) {
                const original = requestsArray[idx];
                const copy = JSON.parse(JSON.stringify(original));
                copy.id = generateId();
                copy.name = `Copy of ${original.name || 'Request'}`;
                requestsArray.splice(idx + 1, 0, copy);
                return true;
            }
            return false;
        }

        // Try root
        if (!findAndDuplicate(collection.requests)) {
            // Try folders recursively
            function searchFolders(folders) {
                for (const folder of folders) {
                    if (findAndDuplicate(folder.requests)) return true;
                    if (folder.folders && searchFolders(folder.folders)) return true;
                }
                return false;
            }
            if (collection.folders) searchFolders(collection.folders);
        }

        saveCollections(collections);
        renderCollections();
    }

    /** Capture the current state of the request builder */
    function captureCurrentRequest() {
        const method = methodSelect.value;
        const url = urlInput.value.trim();

        const params = [];
        paramsList.querySelectorAll('.key-value-row').forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) params.push({ key, value });
        });

        const headers = [];
        headersList.querySelectorAll('.key-value-row').forEach(row => {
            const key = row.querySelector('.key-input').value.trim();
            const value = row.querySelector('.value-input').value.trim();
            if (key) headers.push({ key, value });
        });

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

    /** Load a saved request back into the builder */
    function loadRequestIntoBuilder(request) {
        methodSelect.value = request.method || 'GET';
        urlInput.value = request.url || '';

        if (request.params && request.params.length > 0) {
            paramsList.innerHTML = '';
            request.params.forEach(p => paramsList.appendChild(createKeyValueRow('Query Parameter', 'Value', p.key, p.value)));
        }

        if (request.headers && request.headers.length > 0) {
            headersList.innerHTML = '';
            request.headers.forEach(h => headersList.appendChild(createKeyValueRow('Header (e.g., Content-Type)', 'Value', h.key, h.value)));
        }

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

        document.querySelector('main').scrollTo({ top: 0, behavior: 'smooth' });
    }

    // =============================================
    // 15. Render Collections with Folders
    // =============================================

    /** Render a single request item element */
    function createRequestItemEl(req, collectionId) {
        const reqEl = document.createElement('div');
        reqEl.className = 'saved-request-item';
        reqEl.innerHTML = `
            <span class="method-badge ${req.method.toLowerCase()}">${req.method}</span>
            <span class="request-name" title="${req.name || req.url}">${req.name || req.url}</span>
            <div class="request-item-actions">
                <button class="duplicate-request-btn" title="Duplicate">📋</button>
                <button class="delete-request-btn" title="Delete">✕</button>
            </div>
        `;
        reqEl.addEventListener('click', (e) => {
            if (e.target.closest('.request-item-actions')) return;
            loadRequestIntoBuilder(req);
        });
        reqEl.querySelector('.delete-request-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRequestFromCollection(collectionId, req.id);
        });
        reqEl.querySelector('.duplicate-request-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            duplicateRequest(collectionId, req.id);
        });
        return reqEl;
    }

    /** Recursively render a folder and its children */
    function renderFolder(folder, collectionId, depth = 0) {
        const folderEl = document.createElement('div');
        folderEl.className = 'folder-item';

        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `
            <span class="folder-name" title="${folder.name}">${folder.name}</span>
            <div class="collection-actions">
                <button class="add-subfolder-btn" title="Add sub-folder">📁+</button>
                <button class="rename-btn" title="Rename">✏</button>
                <button class="delete-btn" title="Delete">🗑</button>
            </div>
        `;

        const children = document.createElement('div');
        children.className = 'folder-children';

        // Render requests in this folder
        if (folder.requests && folder.requests.length > 0) {
            folder.requests.forEach(req => children.appendChild(createRequestItemEl(req, collectionId)));
        }

        // Render sub-folders (limit to 2 levels)
        if (folder.folders && folder.folders.length > 0 && depth < 2) {
            folder.folders.forEach(subFolder => children.appendChild(renderFolder(subFolder, collectionId, depth + 1)));
        }

        if ((!folder.requests || folder.requests.length === 0) && (!folder.folders || folder.folders.length === 0)) {
            children.innerHTML = '<p class="empty-state" style="padding-left:0.5rem;font-size:0.8rem;">Empty folder</p>';
        }

        // Toggle expand/collapse
        header.addEventListener('click', (e) => {
            if (e.target.closest('.collection-actions')) return;
            children.classList.toggle('expanded');
        });

        // Folder actions
        header.querySelector('.add-subfolder-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            createFolder(collectionId, folder.id);
        });
        header.querySelector('.rename-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            renameFolder(collectionId, folder.id);
        });
        header.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFolder(collectionId, folder.id);
        });

        folderEl.appendChild(header);
        folderEl.appendChild(children);
        return folderEl;
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

            const totalReqs = countRequests(collection);
            const header = document.createElement('div');
            header.className = 'collection-header';
            header.innerHTML = `
                <span class="collection-name" title="${collection.name}">${collection.name}</span>
                <span style="color:var(--text-muted); font-size:0.75rem;">(${totalReqs})</span>
                <div class="collection-actions">
                    <button class="add-folder-btn" title="Add folder">📁+</button>
                    <button class="rename-btn" title="Rename">✏</button>
                    <button class="delete-btn" title="Delete">🗑</button>
                </div>
            `;

            const requestsContainer = document.createElement('div');
            requestsContainer.className = 'collection-requests';

            // Render root requests
            if (collection.requests && collection.requests.length > 0) {
                collection.requests.forEach(req => requestsContainer.appendChild(createRequestItemEl(req, collection.id)));
            }

            // Render folders
            if (collection.folders && collection.folders.length > 0) {
                collection.folders.forEach(folder => requestsContainer.appendChild(renderFolder(folder, collection.id)));
            }

            if (totalReqs === 0 && (!collection.folders || collection.folders.length === 0)) {
                requestsContainer.innerHTML = '<p class="empty-state" style="padding-left:0.5rem;">No saved requests.</p>';
            }

            // Toggle expand/collapse on header click
            header.addEventListener('click', (e) => {
                if (e.target.closest('.collection-actions')) return;
                requestsContainer.classList.toggle('expanded');
            });

            // Collection-level actions
            header.querySelector('.add-folder-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                createFolder(collection.id, null);
            });
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

    /** Count total requests in a collection (root + all folders recursively) */
    function countRequests(collection) {
        let count = collection.requests ? collection.requests.length : 0;
        function countInFolders(folders) {
            if (!folders) return;
            folders.forEach(f => {
                count += f.requests ? f.requests.length : 0;
                if (f.folders) countInFolders(f.folders);
            });
        }
        countInFolders(collection.folders);
        return count;
    }

    createCollectionBtn.addEventListener('click', createCollection);

    // =============================================
    // 16. Save Request to Collection (with folder support)
    // =============================================
    function populateFolderOptions(folders, prefix = '') {
        if (!folders) return;
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = `${prefix}📁 ${folder.name}`;
            saveFolderSelect.appendChild(option);
            if (folder.folders) populateFolderOptions(folder.folders, prefix + '  ');
        });
    }

    function openSaveModal() {
        const collections = getCollections();
        if (collections.length === 0) {
            alert('No collections exist. Please create a collection first.');
            return;
        }
        saveCollectionSelect.innerHTML = '';
        collections.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            saveCollectionSelect.appendChild(option);
        });

        // Populate folder select for the first collection
        updateFolderSelect();

        const method = methodSelect.value;
        const url = urlInput.value.trim();
        try {
            saveRequestName.value = url ? `${method} ${new URL(url).pathname}` : '';
        } catch {
            saveRequestName.value = url ? `${method} request` : '';
        }
        saveModal.classList.remove('hidden');
    }

    function updateFolderSelect() {
        const collections = getCollections();
        const selectedCollectionId = saveCollectionSelect.value;
        const collection = collections.find(c => c.id === selectedCollectionId);

        saveFolderSelect.innerHTML = '<option value="">(Root of collection)</option>';
        if (collection && collection.folders) {
            populateFolderOptions(collection.folders);
        }
    }

    saveCollectionSelect.addEventListener('change', updateFolderSelect);

    function confirmSaveRequest() {
        const name = saveRequestName.value.trim();
        const collectionId = saveCollectionSelect.value;
        const folderId = saveFolderSelect.value;
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

        if (folderId) {
            if (!collection.folders) collection.folders = [];
            const folder = findFolderById(collection.folders, folderId);
            if (folder) {
                if (!folder.requests) folder.requests = [];
                folder.requests.push(requestData);
            } else {
                collection.requests.push(requestData);
            }
        } else {
            collection.requests.push(requestData);
        }

        saveCollections(collections);
        renderCollections();
        saveModal.classList.add('hidden');
    }

    saveRequestBtn.addEventListener('click', openSaveModal);
    saveModalClose.addEventListener('click', () => saveModal.classList.add('hidden'));
    saveModal.addEventListener('click', (e) => { if (e.target === saveModal) saveModal.classList.add('hidden'); });
    confirmSaveBtn.addEventListener('click', confirmSaveRequest);

    // =============================================
    // 17. Export Collections
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
    // 18. WebSocket Testing
    // =============================================
    let wsConnection = null;

    function wsLog(direction, content) {
        const time = new Date().toLocaleTimeString();
        const msg = document.createElement('div');
        msg.className = 'ws-msg';
        msg.innerHTML = `
            <span class="ws-msg-direction ${direction}">${direction === 'sent' ? '▲' : direction === 'received' ? '▼' : '●'}</span>
            <span class="ws-msg-time">${time}</span>
            <span class="ws-msg-content">${content}</span>
        `;
        // Remove the empty state message if present
        const emptyState = wsMessages.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        wsMessages.appendChild(msg);
        wsMessages.scrollTop = wsMessages.scrollHeight;
    }

    function setWsStatus(status) {
        wsStatus.className = `ws-status ${status}`;
        if (status === 'connected') {
            wsStatus.textContent = '● Connected';
            wsConnectBtn.disabled = true;
            wsDisconnectBtn.disabled = false;
            wsMessageInput.disabled = false;
            wsSendBtn.disabled = false;
        } else if (status === 'disconnected') {
            wsStatus.textContent = '● Disconnected';
            wsConnectBtn.disabled = false;
            wsDisconnectBtn.disabled = true;
            wsMessageInput.disabled = true;
            wsSendBtn.disabled = true;
        } else if (status === 'error') {
            wsStatus.textContent = '● Error';
            wsConnectBtn.disabled = false;
            wsDisconnectBtn.disabled = true;
            wsMessageInput.disabled = true;
            wsSendBtn.disabled = true;
        }
    }

    function wsConnect() {
        const url = wsUrlInput.value.trim();
        if (!url) {
            alert('Please enter a WebSocket URL.');
            return;
        }
        // Validate URL format
        if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
            alert('Invalid WebSocket URL. Must start with ws:// or wss://');
            return;
        }

        try {
            wsConnection = new WebSocket(url);

            wsConnection.onopen = () => {
                setWsStatus('connected');
                wsLog('system', `Connected to ${url}`);
            };

            wsConnection.onmessage = (event) => {
                let displayData = event.data;
                try {
                    const parsed = JSON.parse(event.data);
                    displayData = JSON.stringify(parsed, null, 2);
                } catch { /* Keep raw text */ }
                wsLog('received', displayData);
            };

            wsConnection.onerror = () => {
                setWsStatus('error');
                wsLog('system', 'Connection error occurred.');
            };

            wsConnection.onclose = (event) => {
                setWsStatus('disconnected');
                wsLog('system', `Disconnected (code: ${event.code}, reason: ${event.reason || 'none'})`);
                wsConnection = null;
            };
        } catch (e) {
            setWsStatus('error');
            wsLog('system', `Failed to connect: ${e.message}`);
        }
    }

    function wsDisconnect() {
        if (wsConnection) {
            wsConnection.close();
            wsConnection = null;
        }
    }

    function wsSendMessage() {
        const message = wsMessageInput.value.trim();
        if (!message || !wsConnection || wsConnection.readyState !== WebSocket.OPEN) return;
        wsConnection.send(message);
        wsLog('sent', message);
        wsMessageInput.value = '';
    }

    wsConnectBtn.addEventListener('click', wsConnect);
    wsDisconnectBtn.addEventListener('click', wsDisconnect);
    wsSendBtn.addEventListener('click', wsSendMessage);
    wsMessageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') wsSendMessage();
    });

    // =============================================
    // 19. Request Execution Logic
    // =============================================
    async function handleSendRequest() {
        clearErrors();
        const method = methodSelect.value;
        let url = urlInput.value.trim();
        
        if (!url) return showError(urlInput, "URL cannot be empty.");
        
        // Apply variable replacement (env vars + response chaining)
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

        finalUrl = replaceVariables(finalUrl);

        // Save to history
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
    // 20. Initialize on Load
    // =============================================
    renderCollections();
    renderHistory();
});
