document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Random Name Picker functionality
    const namesInput = document.getElementById('namesInput');
    const pickButton = document.getElementById('pickButton');
    const selectedName = document.getElementById('selectedName');

    // Load saved names from localStorage
    loadSavedNames();

    pickButton.addEventListener('click', pickRandomName);
    
    // Save names to localStorage when input changes
    namesInput.addEventListener('input', saveNames);
    
    // Line Leader functionality
    const lineLeaderInput = document.getElementById('lineLeaderInput');
    const startLineButton = document.getElementById('startLineButton');
    const nextPersonButton = document.getElementById('nextPersonButton');
    const nameList = document.getElementById('nameList');
    const syncButton = document.getElementById('syncButton');
    const syncStatus = document.getElementById('syncStatus');
    const debugButton = document.getElementById('debugButton');
    const debugPanel = document.getElementById('debugPanel');
    const debugContent = document.getElementById('debugContent');
    
    // Cleaners functionality
    const cleanersInput = document.getElementById('cleanersInput');
    const pickCleanersButton = document.getElementById('pickCleanersButton');
    const cleaner1 = document.getElementById('cleaner1');
    const cleaner2 = document.getElementById('cleaner2');
    const cleanersSyncButton = document.getElementById('cleanersSyncButton');
    const cleanersSyncStatus = document.getElementById('cleanersSyncStatus');
    
    let lineLeaderNames = [];
    let currentPersonIndex = 0;
    let isLineLeaderActive = false;
    
    let cleanersNames = [];
    let currentCleaners = [];
    let isCleanersActive = false;
    let cleanersHistory = []; // Track recently picked cleaners
    const MAX_HISTORY = 10; // Keep track of last 10 selections
    
    // Load saved line leader names
    loadLineLeaderNames();
    
    startLineButton.addEventListener('click', startLineLeader);
    nextPersonButton.addEventListener('click', nextPerson);
    lineLeaderInput.addEventListener('input', function() {
        saveLineLeaderNames();
        autoResizeTextarea(lineLeaderInput);
    });
    
    // Auto-resize functionality
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 200) + 'px';
    }
    
    // Initial auto-resize for Line Leader input
    setTimeout(() => {
        autoResizeTextarea(lineLeaderInput);
        autoResizeTextarea(cleanersInput);
    }, 100);
    
    // Load saved cleaners names
    loadCleanersNames();
    
    syncButton.addEventListener('click', syncLineLeaderState);
    debugButton.addEventListener('click', toggleDebugPanel);
    
    // Cleaners event listeners
    pickCleanersButton.addEventListener('click', pickCleaners);
    cleanersInput.addEventListener('input', function() {
        saveCleanersNames();
        autoResizeTextarea(cleanersInput);
    });
    cleanersSyncButton.addEventListener('click', syncCleanersState);
    
    // Auto-sync when line leader state changes
    let autoSyncTimeout;
    function autoSync() {
        clearTimeout(autoSyncTimeout);
        autoSyncTimeout = setTimeout(() => {
            if (isLineLeaderActive) {
                syncLineLeaderState(false); // Silent auto-sync
            }
        }, 2000); // Wait 2 seconds after changes
    }

    function pickRandomName() {
        const namesText = namesInput.value.trim();
        
        if (!namesText) {
            showError('Please enter at least one name.');
            return;
        }

        const names = namesText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (names.length === 0) {
            showError('Please enter at least one valid name.');
            return;
        }

        // Remove any existing error messages
        removeErrorMessages();

        // Pick a random name
        const randomIndex = Math.floor(Math.random() * names.length);
        const chosenName = names[randomIndex];

        // Display the result with green background
        selectedName.textContent = chosenName;
        selectedName.classList.add('picked');

        // Remove the highlight after 3 seconds
        setTimeout(() => {
            selectedName.classList.remove('picked');
        }, 3000);
    }

    function saveNames() {
        const namesText = namesInput.value;
        localStorage.setItem('savedNames', namesText);
    }

    function loadSavedNames() {
        const savedNames = localStorage.getItem('savedNames');
        if (savedNames) {
            namesInput.value = savedNames;
        }
    }

    function showError(message) {
        removeErrorMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        pickButton.parentNode.insertBefore(errorDiv, pickButton.nextSibling);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    function removeErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
    
    // Line Leader Functions
    function startLineLeader() {
        const namesText = lineLeaderInput.value.trim();
        
        if (!namesText) {
            showLineError('Please enter at least one name.');
            return;
        }
        
        lineLeaderNames = namesText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (lineLeaderNames.length === 0) {
            showLineError('Please enter at least one valid name.');
            return;
        }
        
        // Remove any existing error messages
        removeLineErrorMessages();
        
        // Reset state
        currentPersonIndex = 0;
        
        // Create name list
        createNameList();
        
        // Show first person as selected
        selectPerson(0);
        
        // Update buttons
        startLineButton.style.display = 'none';
        nextPersonButton.style.display = 'inline-block';
        isLineLeaderActive = true;
        
        // Auto-sync after starting
        autoSync();
    }
    
    function createNameList() {
        nameList.innerHTML = '';
        
        lineLeaderNames.forEach((name, index) => {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            nameItem.textContent = name;
            nameItem.setAttribute('data-index', index);
            
            nameItem.addEventListener('click', () => {
                selectPerson(index);
                // Auto-sync after manual selection
                autoSync();
            });
            
            nameList.appendChild(nameItem);
        });
    }
    
    function selectPerson(index) {
        // Remove all previous selections
        const allItems = nameList.querySelectorAll('.name-item');
        allItems.forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.getAttribute('data-index')) < index) {
                item.classList.add('processed');
            } else {
                item.classList.remove('processed');
            }
        });
        
        // Add selected class to current person
        const currentItem = nameList.querySelector(`[data-index="${index}"]`);
        if (currentItem) {
            currentItem.classList.add('selected');
            
            // Scroll to selected person
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        currentPersonIndex = index;
        
        // Update next button text if we're at the end
        if (index >= lineLeaderNames.length - 1) {
            nextPersonButton.textContent = 'Start Over';
        } else {
            nextPersonButton.textContent = 'Next Person';
        }
    }
    
    function nextPerson() {
        if (currentPersonIndex >= lineLeaderNames.length - 1) {
            // Start over
            startLineButton.style.display = 'inline-block';
            nextPersonButton.style.display = 'none';
            nameList.innerHTML = '';
            isLineLeaderActive = false;
        } else {
            // Move to next person
            selectPerson(currentPersonIndex + 1);
        }
        
        // Auto-sync after state change
        autoSync();
    }
    
    function saveLineLeaderNames() {
        const namesText = lineLeaderInput.value;
        localStorage.setItem('savedLineLeaderNames', namesText);
    }
    
    function loadLineLeaderNames() {
        const savedNames = localStorage.getItem('savedLineLeaderNames');
        if (savedNames) {
            lineLeaderInput.value = savedNames;
        }
    }
    
    function showLineError(message) {
        removeLineErrorMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        startLineButton.parentNode.insertBefore(errorDiv, startLineButton.nextSibling);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    function removeLineErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
    
    // Cleaners Functions
    function pickCleaners() {
        const namesText = cleanersInput.value.trim();
        
        if (!namesText) {
            showCleanersError('Please enter at least one name.');
            return;
        }
        
        cleanersNames = namesText.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        if (cleanersNames.length < 2) {
            showCleanersError('Please enter at least two names to pick cleaners.');
            return;
        cleaner1.textContent = currentCleaners[0];
        cleaner2.textContent = currentCleaners[1];
        console.log('DEBUG: Cleaners UI updated for active state');
    } else {
        cleaner1.textContent = '';
        cleaner2.textContent = '';
        console.log('DEBUG: Cleaners UI updated for inactive state');
        
        isCleanersActive = true;
        
        // Auto-sync after picking cleaners
        autoSyncCleaners();
        
        // Remove the highlight after 3 seconds
        setTimeout(() => {
            cleaner1.classList.remove('picked');
            cleaner2.classList.remove('picked');
        }, 3000);
    }
    
    function saveCleanersNames() {
        const namesText = cleanersInput.value;
        localStorage.setItem('savedCleanersNames', namesText);
    }
    
    function loadCleanersNames() {
        const savedNames = localStorage.getItem('savedCleanersNames');
        if (savedNames) {
            cleanersInput.value = savedNames;
        }
    }
    
    function showCleanersError(message) {
        removeCleanersErrorMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        pickCleanersButton.parentNode.insertBefore(errorDiv, pickCleanersButton.nextSibling);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    function removeCleanersErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
    
    // Sync functionality
    function getLineLeaderState() {
        const state = {
            names: lineLeaderNames,
            currentIndex: currentPersonIndex,
            isActive: isLineLeaderActive,
            timestamp: new Date().toISOString()
        };
        console.log('DEBUG: Getting current state:', state);
        return state;
    }
    
    function getCleanersState() {
        const state = {
            names: cleanersNames,
            currentCleaners: currentCleaners,
            isActive: isCleanersActive,
            timestamp: new Date().toISOString()
        };
        console.log('DEBUG: Getting cleaners state:', state);
        return state;
    }
    
    function setLineLeaderState(state) {
        console.log('DEBUG: Setting state from sync:', state);
        
        if (!state || !state.names) {
            console.log('DEBUG: Invalid state, returning false');
            return false;
        }
        
        lineLeaderNames = state.names;
        currentPersonIndex = state.currentIndex || 0;
        isLineLeaderActive = state.isActive || false;
        
        console.log('DEBUG: Updated local variables:', {
            lineLeaderNames,
            currentPersonIndex,
            isLineLeaderActive
        });
        
        // Update UI
        lineLeaderInput.value = lineLeaderNames.join('\n');
        
        if (isLineLeaderActive && lineLeaderNames.length > 0) {
            createNameList();
            selectPerson(currentPersonIndex);
            startLineButton.style.display = 'none';
            nextPersonButton.style.display = 'inline-block';
            console.log('DEBUG: UI updated for active state');
        } else {
            console.log('DEBUG: UI updated for inactive state');
        }
        
        return true;
    }
    
    function setCleanersState(state) {
        console.log('DEBUG: Setting cleaners state from sync:', state);
        
        if (!state || !state.names) {
            console.log('DEBUG: Invalid cleaners state, returning false');
            return false;
        }
        
        cleanersNames = state.names;
        currentCleaners = state.currentCleaners || [];
        isCleanersActive = state.isActive || false;
        
        console.log('DEBUG: Updated cleaners local variables:', {
            cleanersNames,
            currentCleaners,
            isCleanersActive
        });
        
        // Update UI
        cleanersInput.value = cleanersNames.join('\n');
        
        if (isCleanersActive && currentCleaners.length >= 2) {
            cleaner1.textContent = currentCleaners[0];
            cleaner2.textContent = currentCleaners[1];
            console.log('DEBUG: Cleaners UI updated for active state');
        } else {
            cleaner1.textContent = '';
            cleaner2.textContent = '';
            console.log('DEBUG: Cleaners UI updated for inactive state');
        }
        
        return true;
    }
    
    async function syncLineLeaderState(showStatus = true) {
        const state = getLineLeaderState();
        
        if (showStatus) {
            updateSyncStatus('syncing', 'Syncing...');
        }
        
        try {
            // Use GitHub Pages as a simple data store
            // We'll use localStorage as fallback and GitHub Gist as primary
            const response = await saveToGitHubStorage(state);
            
            if (response.success) {
                if (showStatus) {
                    updateSyncStatus('success', `Synced at ${new Date().toLocaleTimeString()}`);
                }
                // Also save to localStorage as backup
                localStorage.setItem('lineLeaderState', JSON.stringify(state));
            } else {
                throw new Error(response.error || 'Sync failed');
            }
        } catch (error) {
            console.error('Sync failed:', error);
            // Fallback to localStorage
            localStorage.setItem('lineLeaderState', JSON.stringify(state));
            
            if (showStatus) {
                updateSyncStatus('error', 'Offline - Saved locally');
            }
        }
    }
    
    async function syncCleanersState(showStatus = true) {
        const state = getCleanersState();
        
        if (showStatus) {
            updateCleanersSyncStatus('syncing', 'Syncing...');
        }
        
        try {
            // Use GitHub Pages as a simple data store
            const response = await saveCleanersToGitHubStorage(state);
            
            if (response.success) {
                if (showStatus) {
                    updateCleanersSyncStatus('success', `Synced at ${new Date().toLocaleTimeString()}`);
                }
                // Also save to localStorage as backup
                localStorage.setItem('cleanersState', JSON.stringify(state));
            } else {
                throw new Error(response.error || 'Sync failed');
            }
        } catch (error) {
            console.error('Cleaners sync failed:', error);
            // Fallback to localStorage
            localStorage.setItem('cleanersState', JSON.stringify(state));
            
            if (showStatus) {
                updateCleanersSyncStatus('error', 'Offline - Saved locally');
            }
        }
    }
    
    // Auto-sync for cleaners
    let autoSyncCleanersTimeout;
    function autoSyncCleaners() {
        clearTimeout(autoSyncCleanersTimeout);
        autoSyncCleanersTimeout = setTimeout(() => {
            if (isCleanersActive) {
                syncCleanersState(false); // Silent auto-sync
            }
        }, 2000); // Wait 2 seconds after changes
    }
    
    async function loadFromGitHubStorage() {
        try {
            console.log('DEBUG: Attempting to load from GitHub storage...');
            
            // Try to load from GitHub storage first
            const response = await fetch('https://api.github.com/gists', {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            // For demo purposes, we'll use a simple approach with localStorage
            // In a real implementation, you'd use GitHub API or a backend service
            console.log('DEBUG: Loading from localStorage...');
            const savedState = localStorage.getItem('lineLeaderState');
            console.log('DEBUG: Found saved state in localStorage:', savedState);
            
            if (savedState) {
                const parsed = JSON.parse(savedState);
                console.log('DEBUG: Parsed state:', parsed);
                return parsed;
            }
            
            console.log('DEBUG: No saved state found');
            return null;
        } catch (error) {
            console.error('DEBUG: Load failed:', error);
            return null;
        }
    }
    
    async function saveToGitHubStorage(state) {
        try {
            // For demo purposes, we'll simulate GitHub storage with localStorage
            // In a real implementation, you'd:
            // 1. Use GitHub API to create/update a Gist
            // 2. Or use a backend service like Firebase
            // 3. Or use GitHub Pages with a JSON file
            
            console.log('DEBUG: Saving state to localStorage:', state);
            localStorage.setItem('lineLeaderState', JSON.stringify(state));
            
            // Verify it was saved
            const saved = localStorage.getItem('lineLeaderState');
            console.log('DEBUG: Verified saved data:', saved);
            
            return { success: true };
        } catch (error) {
            console.error('DEBUG: Save failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async function saveCleanersToGitHubStorage(state) {
        try {
            // For demo purposes, we'll simulate GitHub storage with localStorage
            console.log('DEBUG: Saving cleaners state to localStorage:', state);
            localStorage.setItem('cleanersState', JSON.stringify(state));
            
            // Verify it was saved
            const saved = localStorage.getItem('cleanersState');
            console.log('DEBUG: Verified cleaners saved data:', saved);
            
            return { success: true };
        } catch (error) {
            console.error('DEBUG: Cleaners save failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    function updateSyncStatus(status, message) {
        syncStatus.className = `sync-status ${status}`;
        syncStatus.textContent = message;
        
        if (status === 'success' || status === 'error') {
            setTimeout(() => {
                syncStatus.className = 'sync-status';
                syncStatus.textContent = '';
            }, 3000);
        }
    }
    
    function updateCleanersSyncStatus(status, message) {
        cleanersSyncStatus.className = `sync-status ${status}`;
        cleanersSyncStatus.textContent = message;
        
        if (status === 'success' || status === 'error') {
            setTimeout(() => {
                cleanersSyncStatus.className = 'sync-status';
                cleanersSyncStatus.textContent = '';
            }, 3000);
        }
    }
    
    // Load synced state on page load
    async function loadSyncedState() {
        try {
            // Load Line Leader state
            const lineLeaderState = await loadFromGitHubStorage();
            if (lineLeaderState) {
                setLineLeaderState(lineLeaderState);
                updateSyncStatus('success', 'Loaded from sync');
                setTimeout(() => {
                    syncStatus.className = 'sync-status';
                    syncStatus.textContent = '';
                }, 2000);
            }
            
            // Load Cleaners state
            const cleanersState = await loadCleanersFromGitHubStorage();
            if (cleanersState) {
                setCleanersState(cleanersState);
                updateCleanersSyncStatus('success', 'Loaded from sync');
                setTimeout(() => {
                    cleanersSyncStatus.className = 'sync-status';
                    cleanersSyncStatus.textContent = '';
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to load synced state:', error);
        }
    }
    
    async function loadCleanersFromGitHubStorage() {
        try {
            console.log('DEBUG: Attempting to load cleaners from GitHub storage...');
            
            // For demo purposes, we'll use localStorage
            console.log('DEBUG: Loading cleaners from localStorage...');
            const savedState = localStorage.getItem('cleanersState');
            console.log('DEBUG: Found cleaners saved state in localStorage:', savedState);
            
            if (savedState) {
                const parsed = JSON.parse(savedState);
                console.log('DEBUG: Parsed cleaners state:', parsed);
                return parsed;
            }
            
            console.log('DEBUG: No cleaners saved state found');
            return null;
        } catch (error) {
            console.error('DEBUG: Cleaners load failed:', error);
            return null;
        }
    }
    
    // Initialize sync on page load
    loadSyncedState();
    
    function toggleDebugPanel() {
        const isVisible = debugPanel.style.display !== 'none';
        debugPanel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            updateDebugInfo();
        }
    }
    
    function updateDebugInfo() {
        const debugInfo = {
            localStorage: {
                lineLeaderState: localStorage.getItem('lineLeaderState'),
                cleanersState: localStorage.getItem('cleanersState'),
                savedLineLeaderNames: localStorage.getItem('savedLineLeaderNames'),
                savedCleanersNames: localStorage.getItem('savedCleanersNames'),
                savedNames: localStorage.getItem('savedNames')
            },
            currentVariables: {
                lineLeaderNames: lineLeaderNames,
                currentPersonIndex: currentPersonIndex,
                isLineLeaderActive: isLineLeaderActive,
                cleanersNames: cleanersNames,
                currentCleaners: currentCleaners,
                isCleanersActive: isCleanersActive
            },
            timestamp: new Date().toISOString()
        };
        
        debugContent.textContent = JSON.stringify(debugInfo, null, 2);
    }
});
