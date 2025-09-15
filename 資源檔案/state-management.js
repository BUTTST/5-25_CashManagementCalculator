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
            exchangeHistory: [],  // 微調歷史記錄
            version: '3.9'        // 版本號
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
                console.log('狀態載入成功:', this.state);
                return true;
            }
        } catch (error) {
            console.error('載入狀態失敗:', error);
            localStorage.removeItem(this.stateKey);
        }
        return false;
    }
    
    /**
     * 保存狀態到 localStorage
     */
    saveState() {
        try {
            localStorage.setItem(this.stateKey, JSON.stringify(this.state));
            console.log('狀態已保存');
        } catch (error) {
            console.error('保存狀態失敗:', error);
        }
    }
    
    /**
     * 取得當前狀態
     * @returns {Object} 當前狀態對象
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * 更新輸入資料
     * @param {Object} inputs - 輸入資料
     */
    updateInputs(inputs) {
        this.state.inputs = { ...inputs };
        this.saveState();
        this.notifyListeners('input', this.state);
    }
    
    /**
     * 更新計算結果
     * @param {Object} results - 計算結果
     */
    updateResults(results) {
        this.state.results = { ...results };
        this.state.exchangeHistory = [JSON.parse(JSON.stringify(results))];
        this.saveState();
        this.notifyListeners('calculate', this.state);
    }
    
    /**
     * 清除所有狀態
     */
    clearState() {
        this.state = {
            inputs: {},
            results: null,
            exchangeHistory: [],
            version: this.state.version
        };
        this.saveState();
        this.notifyListeners('clear', this.state);
    }
    
    /**
     * 添加微調歷史記錄
     * @param {Object} result - 微調後的結果
     */
    addExchangeHistory(result) {
        // 添加時間戳記
        if (result.lastAction) {
            result.lastAction.time = new Date().toISOString();
        }
        
        this.state.exchangeHistory.push(JSON.parse(JSON.stringify(result)));
        this.state.results = { ...result };
        this.saveState();
        this.notifyListeners('exchange', this.state);
    }
    
    /**
     * 撤銷最後一次微調
     * @returns {boolean} 是否成功撤銷
     */
    undoLastExchange() {
        if (this.state.exchangeHistory.length <= 1) {
            return false;
        }
        
        this.state.exchangeHistory.pop();
        this.state.results = { ...this.state.exchangeHistory[this.state.exchangeHistory.length - 1] };
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
            return false;
        }
        
        this.state.exchangeHistory = [this.state.exchangeHistory[0]];
        this.state.results = { ...this.state.exchangeHistory[0] };
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
        
        this.state.exchangeHistory = this.state.exchangeHistory.slice(0, index + 1);
        this.state.results = { ...this.state.exchangeHistory[index] };
        this.saveState();
        this.notifyListeners('revert', this.state);
        return true;
    }
    
    /**
     * 取得最新的交換結果
     * @returns {Object} 最新的結果對象
     */
    getLatestExchangeResult() {
        if (this.state.exchangeHistory.length > 0) {
            return { ...this.state.exchangeHistory[this.state.exchangeHistory.length - 1] };
        }
        return this.state.results ? { ...this.state.results } : null;
    }
    
    /**
     * 取得交換歷史記錄
     * @returns {Array} 歷史記錄陣列
     */
    getExchangeHistory() {
        return [...this.state.exchangeHistory];
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
     * 通知所有監聽器
     * @param {string} action - 動作類型
     * @param {Object} state - 狀態對象
     */
    notifyListeners(action, state) {
        this.listeners.forEach(listener => {
            try {
                listener(action, state);
            } catch (error) {
                console.error('監聽器執行錯誤:', error);
            }
        });
    }
    
    /**
     * 匯出狀態為 JSON
     * @returns {string} JSON 字串
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
    
    /**
     * 從 JSON 匯入狀態
     * @param {string} jsonString - JSON 字串
     * @returns {boolean} 是否成功匯入
     */
    importState(jsonString) {
        try {
            const importedState = JSON.parse(jsonString);
            
            // 驗證匯入的狀態結構
            if (this.validateStateStructure(importedState)) {
                this.state = { ...this.state, ...importedState };
                this.saveState();
                this.notifyListeners('import', this.state);
                console.log('狀態匯入成功');
                return true;
            } else {
                console.error('匯入的狀態結構無效');
                return false;
            }
        } catch (error) {
            console.error('匯入狀態失敗:', error);
            return false;
        }
    }
    
    /**
     * 驗證狀態結構
     * @param {Object} state - 要驗證的狀態對象
     * @returns {boolean} 是否有效
     */
    validateStateStructure(state) {
        if (!state || typeof state !== 'object') {
            return false;
        }
        
        // 檢查必要的屬性
        const requiredProperties = ['inputs', 'results', 'exchangeHistory'];
        for (const prop of requiredProperties) {
            if (!(prop in state)) {
                return false;
            }
        }
        
        // 檢查 inputs 是否為對象
        if (typeof state.inputs !== 'object') {
            return false;
        }
        
        // 檢查 exchangeHistory 是否為陣列
        if (!Array.isArray(state.exchangeHistory)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 取得狀態統計資訊
     * @returns {Object} 統計資訊
     */
    getStateStats() {
        return {
            version: this.state.version,
            hasInputs: Object.keys(this.state.inputs).length > 0,
            hasResults: this.state.results !== null,
            exchangeHistoryLength: this.state.exchangeHistory.length,
            lastModified: this.getLastModifiedTime(),
            storageSize: new Blob([JSON.stringify(this.state)]).size
        };
    }
    
    /**
     * 取得最後修改時間
     * @returns {string|null} ISO 時間字串或 null
     */
    getLastModifiedTime() {
        if (this.state.exchangeHistory.length > 0) {
            const lastHistory = this.state.exchangeHistory[this.state.exchangeHistory.length - 1];
            if (lastHistory.lastAction && lastHistory.lastAction.time) {
                return lastHistory.lastAction.time;
            }
        }
        return null;
    }
    
    /**
     * 清理過時的歷史記錄
     * @param {number} maxHistory - 保留的最大歷史記錄數量
     */
    cleanupHistory(maxHistory = 50) {
        if (this.state.exchangeHistory.length > maxHistory) {
            // 保留第一條記錄（初始狀態）和最近的記錄
            const firstRecord = this.state.exchangeHistory[0];
            const recentRecords = this.state.exchangeHistory.slice(-maxHistory + 1);
            this.state.exchangeHistory = [firstRecord, ...recentRecords];
            this.saveState();
            this.notifyListeners('cleanup', this.state);
            console.log(`歷史記錄已清理，保留 ${maxHistory} 條記錄`);
        }
    }
    
    /**
     * 建立狀態快照
     * @param {string} name - 快照名稱
     * @returns {Object} 快照對象
     */
    createSnapshot(name = '') {
        return {
            name: name || `快照_${new Date().toISOString()}`,
            timestamp: new Date().toISOString(),
            state: JSON.parse(JSON.stringify(this.state))
        };
    }
    
    /**
     * 從快照恢復狀態
     * @param {Object} snapshot - 快照對象
     * @returns {boolean} 是否成功恢復
     */
    restoreFromSnapshot(snapshot) {
        if (!snapshot || !snapshot.state) {
            return false;
        }
        
        try {
            if (this.validateStateStructure(snapshot.state)) {
                this.state = { ...snapshot.state };
                this.saveState();
                this.notifyListeners('restore', this.state);
                console.log(`已從快照 "${snapshot.name}" 恢復狀態`);
                return true;
            }
        } catch (error) {
            console.error('從快照恢復失敗:', error);
        }
        
        return false;
    }
    
    /**
     * 重設狀態管理器
     */
    reset() {
        this.clearState();
        this.listeners = [];
        localStorage.removeItem(this.stateKey);
        console.log('狀態管理器已重設');
    }
}

// === 全域狀態管理實用函數 ===

/**
 * 建立新的狀態管理器實例
 * @param {string} stateKey - localStorage 鍵值
 * @returns {StateManager} 狀態管理器實例
 */
function createStateManager(stateKey) {
    return new StateManager(stateKey);
}

/**
 * 深度複製對象（避免狀態污染）
 * @param {Object} obj - 要複製的對象
 * @returns {Object} 複製後的對象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    
    return cloned;
}

/**
 * 比較兩個狀態對象是否相等
 * @param {Object} state1 - 狀態對象1
 * @param {Object} state2 - 狀態對象2
 * @returns {boolean} 是否相等
 */
function compareStates(state1, state2) {
    return JSON.stringify(state1) === JSON.stringify(state2);
}

/**
 * 合併狀態對象
 * @param {Object} currentState - 當前狀態
 * @param {Object} newState - 新狀態
 * @returns {Object} 合併後的狀態
 */
function mergeStates(currentState, newState) {
    return { ...currentState, ...newState };
}