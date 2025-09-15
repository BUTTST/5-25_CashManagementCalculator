/* 現金管理計算工具 - 狀態管理模組 */

// === 狀態管理類別 ===

/**
 * 應用程式狀態管理器
 */
class StateManager {
    constructor(stateKey = APP_CONFIG.STATE_KEY) {
        this.stateKey = stateKey;
        this.state = {
            inputs: {},           // 使用者輸入資料
            results: null,        // 計算結果
            exchangeHistory: []   // 微調歷史記錄
        };
        this.listeners = [];      // 狀態變更監聽器
    }
    
    /**
     * 從 localStorage 載入狀態
     * @returns {boolean} 是否成功載入
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
            console.error('無法載入狀態:', error);
            this.clearState();
        }
        return false;
    }
    
    /**
     * 儲存狀態到 localStorage
     * @returns {boolean} 是否成功儲存
     */
    saveState() {
        try {
            localStorage.setItem(this.stateKey, JSON.stringify(this.state));
            this.notifyListeners('save', this.state);
            return true;
        } catch (error) {
            console.error('無法儲存狀態:', error);
            return false;
        }
    }
    
    /**
     * 清除狀態
     */
    clearState() {
        this.state = {
            inputs: {},
            results: null,
            exchangeHistory: []
        };
        localStorage.removeItem(this.stateKey);
        this.notifyListeners('clear', this.state);
    }
    
    /**
     * 更新輸入資料
     * @param {Object} inputs - 新的輸入資料
     */
    updateInputs(inputs) {
        this.state.inputs = { ...inputs };
        this.saveState();
        this.notifyListeners('inputs', this.state);
    }
    
    /**
     * 更新計算結果
     * @param {Object} results - 計算結果
     */
    updateResults(results) {
        this.state.results = results;
        // 重置微調歷史，將新結果作為初始狀態
        this.state.exchangeHistory = [JSON.parse(JSON.stringify(results))];
        this.saveState();
        this.notifyListeners('results', this.state);
    }
    
    /**
     * 添加微調歷史記錄
     * @param {Object} newResult - 新的結果狀態
     */
    addExchangeHistory(newResult) {
        // 添加時間戳記
        if (newResult.lastAction) {
            newResult.lastAction.time = Date.now();
        }
        
        this.state.exchangeHistory.push(JSON.parse(JSON.stringify(newResult)));
        this.state.results = newResult; // 更新當前結果
        this.saveState();
        this.notifyListeners('exchange', this.state);
    }
    
    /**
     * 撤銷最後一次微調
     * @returns {boolean} 是否成功撤銷
     */
    undoLastExchange() {
        if (this.state.exchangeHistory.length <= 1) {
            return false; // 無法撤銷初始狀態
        }
        
        this.state.exchangeHistory.pop();
        this.state.results = this.state.exchangeHistory[this.state.exchangeHistory.length - 1];
        this.saveState();
        this.notifyListeners('undo', this.state);
        return true;
    }
    
    /**
     * 重置所有微調
     * @returns {boolean} 是否成功重置
     */
    resetAllExchanges() {
        if (this.state.exchangeHistory.length <= 1) {
            return false; // 沒有微調需要重置
        }
        
        // 只保留初始狀態
        this.state.exchangeHistory = [this.state.exchangeHistory[0]];
        this.state.results = this.state.exchangeHistory[0];
        this.saveState();
        this.notifyListeners('reset', this.state);
        return true;
    }
    
    /**
     * 回復到指定的歷史狀態
     * @param {number} index - 歷史記錄索引
     * @returns {boolean} 是否成功回復
     */
    revertToHistoryState(index) {
        if (index < 0 || index >= this.state.exchangeHistory.length) {
            return false;
        }
        
        // 截斷歷史記錄到指定索引
        this.state.exchangeHistory = this.state.exchangeHistory.slice(0, index + 1);
        this.state.results = this.state.exchangeHistory[index];
        this.saveState();
        this.notifyListeners('revert', this.state);
        return true;
    }
    
    /**
     * 取得當前狀態
     * @returns {Object} 當前狀態
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * 取得當前結果
     * @returns {Object|null} 當前計算結果
     */
    getCurrentResults() {
        return this.state.results;
    }
    
    /**
     * 取得最新的微調結果
     * @returns {Object|null} 最新的微調結果
     */
    getLatestExchangeResult() {
        if (this.state.exchangeHistory.length > 0) {
            return this.state.exchangeHistory[this.state.exchangeHistory.length - 1];
        }
        return null;
    }
    
    /**
     * 添加狀態變更監聽器
     * @param {Function} listener - 監聽器函數
     */
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }
    
    /**
     * 移除狀態變更監聽器
     * @param {Function} listener - 要移除的監聽器函數
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    /**
     * 通知所有監聽器狀態變更
     * @param {string} action - 變更動作類型
     * @param {Object} state - 新狀態
     * @private
     */
    notifyListeners(action, state) {
        this.listeners.forEach(listener => {
            try {
                listener(action, state);
            } catch (error) {
                console.error('狀態監聽器執行錯誤:', error);
            }
        });
    }
    
    /**
     * 匯出狀態為 JSON
     * @returns {string} JSON 格式的狀態資料
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
    
    /**
     * 從 JSON 匯入狀態
     * @param {string} jsonState - JSON 格式的狀態資料
     * @returns {boolean} 是否成功匯入
     */
    importState(jsonState) {
        try {
            const importedState = JSON.parse(jsonState);
            
            // 驗證狀態結構
            if (this.validateStateStructure(importedState)) {
                this.state = importedState;
                this.saveState();
                this.notifyListeners('import', this.state);
                return true;
            } else {
                console.error('匯入的狀態結構無效');
                return false;
            }
        } catch (error) {
            console.error('匯入狀態時發生錯誤:', error);
            return false;
        }
    }
    
    /**
     * 驗證狀態結構的有效性
     * @param {Object} state - 要驗證的狀態
     * @returns {boolean} 是否有效
     * @private
     */
    validateStateStructure(state) {
        // 基本結構檢查
        if (!state || typeof state !== 'object') {
            return false;
        }
        
        // 檢查必要屬性
        if (!state.hasOwnProperty('inputs') || 
            !state.hasOwnProperty('results') || 
            !state.hasOwnProperty('exchangeHistory')) {
            return false;
        }
        
        // 檢查 inputs 結構
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
        
        // 檢查 exchangeHistory 結構
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
     * 取得狀態統計資訊
     * @returns {Object} 統計資訊
     */
    getStateStats() {
        return {
            hasInputs: Object.keys(this.state.inputs).length > 0,
            hasResults: this.state.results !== null,
            exchangeCount: this.state.exchangeHistory.length,
            lastSaved: localStorage.getItem(this.stateKey + '_timestamp') || '未知',
            stateSize: JSON.stringify(this.state).length
        };
    }
}

// === 輸入狀態管理函數 ===

/**
 * 從 DOM 輸入元素更新狀態
 * @param {StateManager} stateManager - 狀態管理器
 * @param {Object} domInputs - DOM 輸入元素集合
 */
function updateStateFromInputs(stateManager, domInputs) {
    const inputs = {};
    
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        const amountInput = domInputs.amountInputs[denom];
        const bagInput = domInputs.bagInputs[denom];
        
        inputs[denom] = {
            amount: parseInputValue(amountInput ? amountInput.value : '0'),
            packages: parseInputValue(bagInput ? bagInput.value : '0')
        };
    });
    
    stateManager.updateInputs(inputs);
}

/**
 * 從狀態恢復 DOM 輸入元素
 * @param {Object} state - 應用程式狀態
 * @param {Object} domInputs - DOM 輸入元素集合
 */
function restoreInputsFromState(state, domInputs) {
    if (!state.inputs) return;
    
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        const inputData = state.inputs[denom];
        if (inputData) {
            const amountInput = domInputs.amountInputs[denom];
            const bagInput = domInputs.bagInputs[denom];
            
            if (amountInput) {
                amountInput.value = formatNumber(inputData.amount || 0);
            }
            
            if (bagInput && inputData.packages) {
                bagInput.value = inputData.packages.toString();
            }
        }
    });
}

// === 快照管理 ===

/**
 * 建立狀態快照
 * @param {Object} state - 要快照的狀態
 * @returns {Object} 狀態快照
 */
function createStateSnapshot(state) {
    return {
        timestamp: Date.now(),
        state: JSON.parse(JSON.stringify(state)),
        checksum: generateStateChecksum(state)
    };
}

/**
 * 產生狀態檢查碼
 * @param {Object} state - 狀態物件
 * @returns {string} 檢查碼
 * @private
 */
function generateStateChecksum(state) {
    // 簡單的檢查碼生成（實際應用中可使用更強的雜湊演算法）
    const stateString = JSON.stringify(state);
    let hash = 0;
    
    for (let i = 0; i < stateString.length; i++) {
        const char = stateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 轉換為 32-bit 整數
    }
    
    return hash.toString(16);
}

/**
 * 驗證狀態快照完整性
 * @param {Object} snapshot - 狀態快照
 * @returns {boolean} 是否完整
 */
function validateSnapshot(snapshot) {
    if (!snapshot || !snapshot.state || !snapshot.checksum) {
        return false;
    }
    
    const currentChecksum = generateStateChecksum(snapshot.state);
    return currentChecksum === snapshot.checksum;
}

// === 狀態遷移函數 ===

/**
 * 遷移舊版本狀態到新版本
 * @param {Object} oldState - 舊版本狀態
 * @returns {Object} 遷移後的狀態
 */
function migrateState(oldState) {
    // 檢查是否需要遷移
    if (!oldState || oldState.version === APP_CONFIG.STATE_KEY) {
        return oldState;
    }
    
    let migratedState = { ...oldState };
    
    // 添加版本標記
    migratedState.version = APP_CONFIG.STATE_KEY;
    
    // 確保必要屬性存在
    if (!migratedState.inputs) {
        migratedState.inputs = {};
    }
    
    if (!migratedState.exchangeHistory) {
        migratedState.exchangeHistory = [];
    }
    
    // 遷移輸入資料格式（如果需要）
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        if (!migratedState.inputs[denom]) {
            migratedState.inputs[denom] = { amount: 0, packages: 0 };
        }
    });
    
    return migratedState;
}

// === 工廠函數 ===

/**
 * 建立狀態管理器實例
 * @param {string} stateKey - 狀態儲存鍵值
 * @returns {StateManager} 狀態管理器實例
 */
function createStateManager(stateKey) {
    return new StateManager(stateKey);
}

// === 匯出函數 ===
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 環境
    module.exports = {
        StateManager,
        updateStateFromInputs,
        restoreInputsFromState,
        createStateSnapshot,
        validateSnapshot,
        migrateState,
        createStateManager
    };
}
