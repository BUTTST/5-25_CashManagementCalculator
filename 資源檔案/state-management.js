/* ?¾é?ç®¡ç?è¨ˆç?å·¥å…· - ?€?‹ç®¡?†æ¨¡çµ?*/

// === ?€?‹ç®¡?†é???===

/**
 * ?‰ç”¨ç¨‹å??€?‹ç®¡?†å™¨
 */
class StateManager {
    constructor(stateKey = APP_CONFIG.STATE_KEY) {
        this.stateKey = stateKey;
        this.state = {
            inputs: {},           // ä½¿ç”¨?…è¼¸?¥è???
            results: null,        // è¨ˆç?çµæ?
            exchangeHistory: [],  // å¾®èª¿æ­·å²è¨˜é?
            version: '3.6'        // ?ˆæœ¬??
        };
        this.listeners = [];      // ?€?‹è??´ç›£?½å™¨
    }
    
    /**
     * å¾?localStorage è¼‰å…¥?€??
     * @returns {boolean} ?¯å¦?å?è¼‰å…¥
     */
    loadState() {
        try {
            const savedState = localStorage.getItem(this.stateKey);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this.state = { ...this.state, ...parsedState };
                this.notifyListeners('load', this.state);
                return true;
            }
        } catch (error) {
            console.error('?¡æ?è¼‰å…¥?€??', error);
            this.clearState();
        }
        return false;
    }
    
    /**
     * ?²å??€?‹åˆ° localStorage
     * @returns {boolean} ?¯å¦?å??²å?
     */
    saveState() {
        try {
            localStorage.setItem(this.stateKey, JSON.stringify(this.state));
            this.notifyListeners('save', this.state);
            return true;
        } catch (error) {
            console.error('?¡æ??²å??€??', error);
            return false;
        }
    }
    
    /**
     * æ¸…é™¤?€??
     */
    clearState() {
        this.state = {
            inputs: {},
            results: null,
            exchangeHistory: [],
            version: '3.6'
        };
        localStorage.removeItem(this.stateKey);
        this.notifyListeners('clear', this.state);
    }
    
    /**
     * ?´æ–°è¼¸å…¥è³‡æ?
     * @param {Object} inputs - ?°ç?è¼¸å…¥è³‡æ?
     */
    updateInputs(inputs) {
        this.state.inputs = { ...inputs };
        this.saveState();
        this.notifyListeners('inputs', this.state);
    }
    
    /**
     * ?´æ–°è¨ˆç?çµæ?
     * @param {Object} results - è¨ˆç?çµæ?
     */
    updateResults(results) {
        this.state.results = results;
        // ?ç½®å¾®èª¿æ­·å²ï¼Œå??°ç??œä??ºå?å§‹ç???
        this.state.exchangeHistory = [JSON.parse(JSON.stringify(results))];
        this.saveState();
        this.notifyListeners('results', this.state);
    }
    
    /**
     * æ·»å?å¾®èª¿æ­·å²è¨˜é?
     * @param {Object} newResult - ?°ç?çµæ??€??
     */
    addExchangeHistory(newResult) {
        // æ·»å??‚é??³è?
        if (newResult.lastAction) {
            newResult.lastAction.time = Date.now();
        }
        
        this.state.exchangeHistory.push(JSON.parse(JSON.stringify(newResult)));
        this.state.results = newResult; // ?´æ–°?¶å?çµæ?
        this.saveState();
        this.notifyListeners('exchange', this.state);
    }
    
    /**
     * ?¤éŠ·?€å¾Œä?æ¬¡å¾®èª?
     * @returns {boolean} ?¯å¦?å??¤éŠ·
     */
    undoLastExchange() {
        if (this.state.exchangeHistory.length <= 1) {
            return false; // ?¡æ??¤éŠ·?å??€??
        }
        
        this.state.exchangeHistory.pop();
        this.state.results = this.state.exchangeHistory[this.state.exchangeHistory.length - 1];
        this.saveState();
        this.notifyListeners('undo', this.state);
        return true;
    }
    
    /**
     * ?ç½®?€?‰å¾®èª?
     * @returns {boolean} ?¯å¦?å??ç½®
     */
    resetAllExchanges() {
        if (this.state.exchangeHistory.length <= 1) {
            return false; // æ²’æ?å¾®èª¿?€è¦é?ç½?
        }
        
        // ?ªä??™å?å§‹ç???
        this.state.exchangeHistory = [this.state.exchangeHistory[0]];
        this.state.results = this.state.exchangeHistory[0];
        this.saveState();
        this.notifyListeners('reset', this.state);
        return true;
    }
    
    /**
     * ?å¾©?°æ?å®šç?æ­·å²?€??
     * @param {number} index - æ­·å²è¨˜é?ç´¢å?
     * @returns {boolean} ?¯å¦?å??å¾©
     */
    revertToHistoryState(index) {
        if (index < 0 || index >= this.state.exchangeHistory.length) {
            return false;
        }
        
        // ?ªæ–·æ­·å²è¨˜é??°æ?å®šç´¢å¼?
        this.state.exchangeHistory = this.state.exchangeHistory.slice(0, index + 1);
        this.state.results = this.state.exchangeHistory[index];
        this.saveState();
        this.notifyListeners('revert', this.state);
        return true;
    }
    
    /**
     * ?–å??¶å??€??
     * @returns {Object} ?¶å??€??
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * ?–å??¶å?çµæ?
     * @returns {Object|null} ?¶å?è¨ˆç?çµæ?
     */
    getCurrentResults() {
        return this.state.results;
    }
    
    /**
     * ?–å??€?°ç?å¾®èª¿çµæ?
     * @returns {Object|null} ?€?°ç?å¾®èª¿çµæ?
     */
    getLatestExchangeResult() {
        if (this.state.exchangeHistory.length > 0) {
            return this.state.exchangeHistory[this.state.exchangeHistory.length - 1];
        }
        return null;
    }
    
    /**
     * æ·»å??€?‹è??´ç›£?½å™¨
     * @param {Function} listener - ??½?¨å‡½??
     */
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }
    
    /**
     * ç§»é™¤?€?‹è??´ç›£?½å™¨
     * @param {Function} listener - è¦ç§»?¤ç???½?¨å‡½??
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    /**
     * ?šçŸ¥?€?‰ç›£?½å™¨?€?‹è???
     * @param {string} action - è®Šæ›´?•ä?é¡å?
     * @param {Object} state - ?°ç???
     * @private
     */
    notifyListeners(action, state) {
        this.listeners.forEach(listener => {
            try {
                listener(action, state);
            } catch (error) {
                console.error('?€?‹ç›£?½å™¨?·è??¯èª¤:', error);
            }
        });
    }
    
    /**
     * ?¯å‡º?€?‹ç‚º JSON
     * @returns {string} JSON ?¼å??„ç??‹è???
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
    
    /**
     * å¾?JSON ?¯å…¥?€??
     * @param {string} jsonState - JSON ?¼å??„ç??‹è???
     * @returns {boolean} ?¯å¦?å??¯å…¥
     */
    importState(jsonState) {
        try {
            const importedState = JSON.parse(jsonState);
            
            // é©—è??€?‹ç?æ§?
            if (this.validateStateStructure(importedState)) {
                this.state = importedState;
                this.saveState();
                this.notifyListeners('import', this.state);
                return true;
            } else {
                console.error('?¯å…¥?„ç??‹ç?æ§‹ç„¡??);
                return false;
            }
        } catch (error) {
            console.error('?¯å…¥?€?‹æ??¼ç??¯èª¤:', error);
            return false;
        }
    }
    
    /**
     * é©—è??€?‹ç?æ§‹ç??‰æ???
     * @param {Object} state - è¦é?è­‰ç??€??
     * @returns {boolean} ?¯å¦?‰æ?
     * @private
     */
    validateStateStructure(state) {
        // ?ºæœ¬çµæ?æª¢æŸ¥
        if (!state || typeof state !== 'object') {
            return false;
        }
        
        // æª¢æŸ¥å¿…è?å±¬æ€?
        if (!state.hasOwnProperty('inputs') || 
            !state.hasOwnProperty('results') || 
            !state.hasOwnProperty('exchangeHistory')) {
            return false;
        }
        
        // æª¢æŸ¥ inputs çµæ?
        if (state.inputs && typeof state.inputs === 'object') {
            for (const [denom, data] of Object.entries(state.inputs)) {
                if (!APP_CONFIG.DENOMINATIONS.includes(parseInt(denom, 10))) {
                    return false;
                }
                if (!data.hasOwnProperty('amount') || !data.hasOwnProperty('packages')) {
                    return false;
                }
            }
        }
        
        // æª¢æŸ¥ exchangeHistory çµæ?
        if (state.exchangeHistory && Array.isArray(state.exchangeHistory)) {
            for (const result of state.exchangeHistory) {
                if (!result.hasOwnProperty('distribution') || 
                    !result.hasOwnProperty('totalAmount')) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * ?–å??€?‹çµ±è¨ˆè?è¨?
     * @returns {Object} çµ±è?è³‡è?
     */
    getStateStats() {
        return {
            hasInputs: Object.keys(this.state.inputs).length > 0,
            hasResults: this.state.results !== null,
            exchangeCount: this.state.exchangeHistory.length,
            lastSaved: localStorage.getItem(this.stateKey + '_timestamp') || '?ªçŸ¥',
            stateSize: JSON.stringify(this.state).length
        };
    }
}

// === è¼¸å…¥?€?‹ç®¡?†å‡½??===

/**
 * å¾?DOM è¼¸å…¥?ƒç??´æ–°?€??
 * @param {StateManager} stateManager - ?€?‹ç®¡?†å™¨
 * @param {Object} domInputs - DOM è¼¸å…¥?ƒç??†å?
 */
function updateStateFromInputs(stateManager, domInputs) {
    const inputs = {};
    
    // ä½¿ç”¨?•æ??¢é??—è¡¨ï¼Œå??«æ“´å±•é¢é¡?
    [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS].forEach(denom => {
        const amountInput = domInputs.amountInputs[denom];
        const bagInput = domInputs.bagInputs[denom];
        
        if (amountInput) {
            inputs[denom] = {
                amount: parseInputValue(amountInput.value || '0'),
                packages: parseInputValue(bagInput ? bagInput.value : '0')
            };
        }
    });
    
    stateManager.updateInputs(inputs);
}

/**
 * å¾ç??‹æ¢å¾?DOM è¼¸å…¥?ƒç?
 * @param {Object} state - ?‰ç”¨ç¨‹å??€??
 * @param {Object} domInputs - DOM è¼¸å…¥?ƒç??†å?
 */
function restoreInputsFromState(state, domInputs) {
    if (!state.inputs) return;
    
    // ä½¿ç”¨?€?‰æ”¯?ç??¢é?ï¼Œå??«æ“´å±•é¢é¡?
    [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS].forEach(denom => {
        const inputData = state.inputs[denom];
        const amountInput = domInputs.amountInputs[denom];
        const bagInput = domInputs.bagInputs[denom];
        
        if (inputData && amountInput) {
            amountInput.value = formatNumber(inputData.amount || 0);
            
            if (bagInput && inputData.packages) {
                bagInput.value = inputData.packages.toString();
            }
        }
    });
}

// === å¿«ç…§ç®¡ç? ===

/**
 * å»ºç??€?‹å¿«??
 * @param {Object} state - è¦å¿«?§ç??€??
 * @returns {Object} ?€?‹å¿«??
 */
function createStateSnapshot(state) {
    return {
        timestamp: Date.now(),
        state: JSON.parse(JSON.stringify(state)),
        checksum: generateStateChecksum(state)
    };
}

/**
 * ?¢ç??€?‹æª¢?¥ç¢¼
 * @param {Object} state - ?€?‹ç‰©ä»?
 * @returns {string} æª¢æŸ¥ç¢?
 * @private
 */
function generateStateChecksum(state) {
    // ç°¡å–®?„æª¢?¥ç¢¼?Ÿæ?ï¼ˆå¯¦?›æ??¨ä¸­?¯ä½¿?¨æ›´å¼·ç??œæ?æ¼”ç?æ³•ï?
    const stateString = JSON.stringify(state);
    let hash = 0;
    
    for (let i = 0; i < stateString.length; i++) {
        const char = stateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // è½‰æ???32-bit ?´æ•¸
    }
    
    return hash.toString(16);
}

/**
 * é©—è??€?‹å¿«?§å??´æ€?
 * @param {Object} snapshot - ?€?‹å¿«??
 * @returns {boolean} ?¯å¦å®Œæ•´
 */
function validateSnapshot(snapshot) {
    if (!snapshot || !snapshot.state || !snapshot.checksum) {
        return false;
    }
    
    const currentChecksum = generateStateChecksum(snapshot.state);
    return currentChecksum === snapshot.checksum;
}

// === ?€?‹é·ç§»å‡½??===

/**
 * ?·ç§»?Šç??¬ç??‹åˆ°?°ç???
 * @param {Object} oldState - ?Šç??¬ç???
 * @returns {Object} ?·ç§»å¾Œç??€??
 */
function migrateState(oldState) {
    // æª¢æŸ¥?¯å¦?€è¦é·ç§?
    if (!oldState || oldState.version === APP_CONFIG.STATE_KEY) {
        return oldState;
    }
    
    let migratedState = { ...oldState };
    
    // æ·»å??ˆæœ¬æ¨™è?
    migratedState.version = APP_CONFIG.STATE_KEY;
    
    // ç¢ºä?å¿…è?å±¬æ€§å???
    if (!migratedState.inputs) {
        migratedState.inputs = {};
    }
    
    if (!migratedState.exchangeHistory) {
        migratedState.exchangeHistory = [];
    }
    
    // ?·ç§»è¼¸å…¥è³‡æ??¼å?ï¼ˆå??œé?è¦ï?
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        if (!migratedState.inputs[denom]) {
            migratedState.inputs[denom] = { amount: 0, packages: 0 };
        }
    });
    
    return migratedState;
}

// === å·¥å??½æ•¸ ===

/**
 * å»ºç??€?‹ç®¡?†å™¨å¯¦ä?
 * @param {string} stateKey - ?€?‹å„²å­˜éµ??
 * @returns {StateManager} ?€?‹ç®¡?†å™¨å¯¦ä?
 */
function createStateManager(stateKey) {
    return new StateManager(stateKey);
}

// === ?¯å‡º?½æ•¸ ===
if (typeof module !== 'undefined' && module.exports) {
    // Node.js ?°å?
    module.exports = {
        StateManager,
        updateStateFromInputs,
        restoreInputsFromState,
        createStateSnapshot,
        validateSnapshot,
        migrateState,
        createStateManager
    };
} else {
    // ?è¦½?¨ç’°å¢ƒï?å°‡å‡½?¸æš´?²åˆ°?¨å?ä½œç”¨??
    window.StateManager = StateManager;
    window.updateStateFromInputs = updateStateFromInputs;
    window.restoreInputsFromState = restoreInputsFromState;
    window.createStateSnapshot = createStateSnapshot;
    window.validateSnapshot = validateSnapshot;
    window.migrateState = migrateState;
    window.createStateManager = createStateManager;
}
