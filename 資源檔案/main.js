/* 現金管理計算工具 - 主控制器 */

// === 應用程式主類別 ===
class CashManagementApp {
    constructor() {
        // 初始化狀態管理器
        this.stateManager = new StateManager();
        
        // 初始化 DOM 元素管理
        this.domElements = this.initDOMElements();
        
        // 長按計時器相關
        this.longPressTimer = null;
        this.isLongPress = false;
        
        console.log("現金管理工具 v2.6 已初始化。");
    }
    
    /**
     * 初始化 DOM 元素引用
     * @returns {Object} DOM 元素集合
     */
    initDOMElements() {
        const dom = {
            // 主要控制按鈕
            calculateBtn: document.getElementById('calculate-btn'),
            clearBtn: document.getElementById('clear-btn'),
            clearBtnText: document.querySelector('#clear-btn .btn-text'),
            clearBtnProgress: document.querySelector('#clear-btn .progress-bar'),
            simulateBtn: document.getElementById('simulate-btn'),
            resultContainer: document.getElementById('result-container'),
            
            // 輸入元素集合
            amountInputs: {},
            bagInputs: {},
            errorMessages: {},
            
            // 彈窗元素
            modals: {
                package: document.getElementById('package-modal'),
                manual: document.getElementById('manual-modal'),
                exchange: document.getElementById('exchange-modal'),
                color: document.getElementById('color-modal'),
                changelog: document.getElementById('changelog-modal')
            },
            
            // 功能按鈕
            buttons: {
                showPackage: document.getElementById('show-package-info'),
                showManual: document.getElementById('show-manual'),
                showExchange: document.getElementById('show-exchange'),
                showColor: document.getElementById('custom-color-btn'),
                showChangelog: document.getElementById('show-changelog')
            },
            
            // 總額換算工具
            exchange: {
                amount: document.getElementById('exchange-amount'),
                from: document.getElementById('exchange-from'),
                to: document.getElementById('exchange-to'),
                confirm: document.getElementById('exchange-confirm'),
                fromCurrentAmount: document.getElementById('from-current-amount'),
                fromCurrentCount: document.getElementById('from-current-count'),
                fromNewAmount: document.getElementById('from-new-amount'),
                fromNewCount: document.getElementById('from-new-count'),
                toCurrentAmount: document.getElementById('to-current-amount'),
                toCurrentCount: document.getElementById('to-current-count'),
                toNewAmount: document.getElementById('to-new-amount'),
                toNewCount: document.getElementById('to-new-count')
            },
            
            // 顏色選擇器
            color: {
                pickers: {},
                hexes: {},
                resetBtn: document.getElementById('reset-colors'),
                closeBtn: document.getElementById('close-color-modal')
            },
            
            // 結果微調工具
            resultExchange: {
                container: document.getElementById('resultExchangeContent'),
                header: document.getElementById('resultExchangeHeader'),
                fromDenom: document.getElementById('result-exchange-from-denom'),
                fromCount: document.getElementById('result-exchange-from-count'),
                fromPreview: document.getElementById('result-exchange-from-preview'),
                toDenom: document.getElementById('result-exchange-to-denom'),
                toPreview: document.getElementById('result-exchange-to-preview'),
                performBtn: document.getElementById('perform-result-exchange-btn'),
                undoBtn: document.getElementById('undo-result-exchange-btn'),
                resetBtn: document.getElementById('reset-result-exchange-btn'),
                log: document.getElementById('result-exchange-history-log')
            },
            
            // 收納零錢對換工具
            coinConsolidation: {
                fromDenom: document.getElementById('coin-consolidation-from-denom'),
                fromCount: document.getElementById('coin-consolidation-from-count'),
                fromPreview: document.getElementById('coin-consolidation-from-preview'),
                toDenom: document.getElementById('coin-consolidation-to-denom'),
                toPreview: document.getElementById('coin-consolidation-to-preview'),
                performBtn: document.getElementById('perform-coin-consolidation-btn')
            }
        };
        
        // 初始化面額相關的 DOM 元素
        APP_CONFIG.DENOMINATIONS.forEach(denom => {
            dom.amountInputs[denom] = document.getElementById(`amount${denom}`);
            dom.errorMessages[denom] = document.getElementById(`error${denom}`);
            
            const bagInput = document.getElementById(`bag${denom}`) || 
                           document.getElementById(`bundle${denom}`);
            if (bagInput) dom.bagInputs[denom] = bagInput;
            
            dom.color.pickers[denom] = document.getElementById(`pick-${denom}`);
            dom.color.hexes[denom] = document.getElementById(`hex-${denom}`);
        });
        
        return dom;
    }
    
    /**
     * 初始化應用程式
     */
    init() {
        // 綁定事件監聽器
        this.bindEventListeners();
        
        // 載入儲存的狀態
        this.loadState();
        
        // 初始化顏色選擇器
        initColorPickers(this.domElements);
        
        // 設定狀態變更監聽器
        this.stateManager.addListener((action, state) => {
            this.handleStateChange(action, state);
        });
    }
    
    /**
     * 綁定所有事件監聽器
     */
    bindEventListeners() {
        const dom = this.domElements;
        
        // === 主要功能按鈕 ===
        dom.clearBtn.addEventListener('click', () => this.handleClearClick());
        dom.calculateBtn.addEventListener('click', () => this.handleCalculate());
        dom.simulateBtn.addEventListener('click', () => this.simulateValues());
        
        // === 長按重置功能 ===
        dom.clearBtn.addEventListener('mousedown', (e) => this.startHardResetTimer(e));
        dom.clearBtn.addEventListener('touchstart', (e) => this.startHardResetTimer(e), { passive: true });
        dom.clearBtn.addEventListener('mouseup', () => this.cancelHardResetTimer());
        dom.clearBtn.addEventListener('mouseleave', () => this.cancelHardResetTimer());
        dom.clearBtn.addEventListener('touchend', () => this.cancelHardResetTimer());
        
        // === 輸入欄位事件 ===
        Object.values(dom.amountInputs).forEach(input => {
            input.addEventListener('input', (e) => this.handleAmountInput(e));
            input.addEventListener('blur', (e) => this.handleAmountBlur(e));
        });
        
        Object.values(dom.bagInputs).forEach(input => {
            input.addEventListener('input', () => this.handleBagInput());
        });
        
        // === 摺疊面板 ===
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = document.getElementById(header.id.replace('Header', 'Content'));
                header.classList.toggle('collapsed');
                if (content) content.classList.toggle('active');
            });
        });
        
        // === 彈窗控制 ===
        dom.buttons.showPackage.onclick = () => dom.modals.package.style.display = 'block';
        dom.buttons.showManual.onclick = () => dom.modals.manual.style.display = 'block';
        dom.buttons.showExchange.onclick = () => {
            initExchangeModal(dom);
            dom.modals.exchange.style.display = 'block';
        };
        dom.buttons.showColor.onclick = () => dom.modals.color.style.display = 'block';
        dom.buttons.showChangelog.onclick = () => dom.modals.changelog.style.display = 'block';
        
        // 彈窗關閉按鈕
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.onclick = () => {
                Object.values(dom.modals).forEach(m => m.style.display = 'none');
            };
        });
        
        // 點擊彈窗背景關閉
        window.onclick = (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        };
        
        // === 總額換算工具 ===
        [dom.exchange.amount, dom.exchange.from, dom.exchange.to].forEach(el => {
            el.addEventListener('input', () => updateExchangeInfo(dom));
        });
        dom.exchange.confirm.addEventListener('click', () => this.performExchange());
        
        // === 顏色選擇器 ===
        Object.values(dom.color.pickers).forEach(picker => {
            picker.addEventListener('input', (e) => this.handleColorChange(e));
        });
        dom.color.resetBtn.addEventListener('click', () => resetColors(dom));
        dom.color.closeBtn.addEventListener('click', () => dom.modals.color.style.display = 'none');
        
        // === 步進器按鈕 ===
        document.querySelectorAll('.stepper-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetInput = document.getElementById(e.currentTarget.dataset.target);
                const step = parseInt(e.currentTarget.dataset.step, 10);
                if (targetInput) {
                    let currentValue = parseInt(targetInput.value, 10) || 0;
                    targetInput.value = Math.max(0, currentValue + step);
                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });
        
        // === 結果微調工具 ===
        const rex = dom.resultExchange;
        rex.performBtn.addEventListener('click', () => this.performResultExchange());
        rex.undoBtn.addEventListener('click', () => this.undoResultExchange());
        rex.resetBtn.addEventListener('click', () => this.resetResultExchanges());
        [rex.fromDenom, rex.fromCount, rex.toDenom].forEach(el => {
            el.addEventListener('input', () => this.updateResultExchangePreview());
        });
        rex.log.addEventListener('click', (e) => this.handleHistoryLogClick(e));
        
        // === 收納零錢對換工具 ===
        const cc = dom.coinConsolidation;
        cc.performBtn.addEventListener('click', () => this.performCoinConsolidation());
        [cc.fromDenom, cc.fromCount, cc.toDenom].forEach(el => {
            el.addEventListener('input', () => this.updateCoinConsolidationPreview());
        });
    }
    
    // === 事件處理函數 ===
    
    /**
     * 處理清除按鈕點擊
     */
    handleClearClick() {
        if (!this.isLongPress) {
            this.softClear();
        }
    }
    
    /**
     * 處理金額輸入
     * @param {Event} e - 輸入事件
     */
    handleAmountInput(e) {
        const input = e.target;
        const denomination = parseInt(input.dataset.denomination, 10);
        const rawValue = input.value.replace(/,/g, '');
        
        // 檢查是否為張數模式
        if (APP_CONFIG.COUNT_MODE_DENOMS.includes(denomination)) {
            input.dataset.isCountMode = /^\d{1,2}$/.test(rawValue) ? 'true' : 'false';
        }
        
        // 格式化輸入
        formatInputWithCommas(input);
        
        // 驗證並更新狀態
        this.validateAllInputs();
        this.updateStateFromInputs();
    }
    
    /**
     * 處理金額輸入失焦
     * @param {Event} e - 失焦事件
     */
    handleAmountBlur(e) {
        const input = e.target;
        
        // 如果是張數模式，轉換為金額
        if (input.dataset.isCountMode === 'true') {
            const denomination = parseInt(input.dataset.denomination, 10);
            const count = parseInputValue(input.value);
            input.value = formatNumber(count * denomination);
            input.dataset.isCountMode = 'false';
        }
        
        this.validateAllInputs();
        this.updateStateFromInputs();
    }
    
    /**
     * 處理袋/捆輸入
     */
    handleBagInput() {
        this.validateAllInputs();
        this.updateStateFromInputs();
    }
    
    /**
     * 處理計算按鈕點擊
     */
    handleCalculate() {
        if (!this.validateAllInputs()) {
            alert('部分金額輸入錯誤，請檢查紅色框標示的欄位！');
            return;
        }
        
        // 收集輸入資料
        const inputs = collectInputs(this.domElements);
        
        // 執行計算
        const results = calculateResults(inputs);
        
        // 更新狀態
        this.stateManager.updateResults(results);
        
        // 更新 UI
        updateUI(results);
        setupResultExchangeTool(this.domElements);
        setupCoinConsolidationTool(this.domElements);
        
        // 顯示結果區塊
        this.domElements.resultContainer.classList.add('active');
    }
    
    /**
     * 軟清除（僅清除輸入和結果）
     */
    softClear() {
        this.stateManager.clearState();
        
        // 清除輸入欄位
        Object.values(this.domElements.amountInputs).forEach(input => input.value = '');
        Object.values(this.domElements.bagInputs).forEach(input => input.value = '');
        
        // 清除錯誤狀態
        Object.values(this.domElements.errorMessages).forEach(el => el.classList.remove('active'));
        Object.values(this.domElements.amountInputs).forEach(el => el.classList.remove('input-error'));
        
        // 重置按鈕狀態
        this.domElements.calculateBtn.disabled = false;
        this.domElements.resultContainer.classList.remove('active');
    }
    
    /**
     * 硬重置（包含顏色設定）
     */
    hardReset() {
        this.softClear();
        resetColors(this.domElements);
        alert('已徹底重置工具並清除所有儲存的資料。');
    }
    
    /**
     * 驗證所有輸入
     * @returns {boolean} 是否所有輸入都有效
     */
    validateAllInputs() {
        const inputs = collectInputs(this.domElements);
        const isValid = validateAllInputs(this.domElements, inputs);
        
        this.domElements.calculateBtn.disabled = !isValid;
        return isValid;
    }
    
    /**
     * 從輸入更新狀態
     */
    updateStateFromInputs() {
        updateStateFromInputs(this.stateManager, this.domElements);
    }
    
    /**
     * 載入儲存的狀態
     */
    loadState() {
        if (this.stateManager.loadState()) {
            const state = this.stateManager.getState();
            
            // 恢復輸入欄位
            restoreInputsFromState(state, this.domElements);
            
            // 恢復結果顯示
            if (state.results) {
                updateUI(state.results);
                this.domElements.resultContainer.classList.add('active');
                
                if (state.exchangeHistory && state.exchangeHistory.length > 0) {
                    setupResultExchangeTool(this.domElements);
                    setupCoinConsolidationTool(this.domElements);
                    renderResultExchangeHistory(this.domElements, state);
                }
            }
            
            this.validateAllInputs();
        }
    }
    
    /**
     * 模擬數值輸入
     */
    simulateValues() {
        this.softClear();
        
        // 設定模擬數據
        const simulateData = {
            1000: '16000',
            500: '17000',
            100: '6100',
            50: '1400',
            10: '910',
            5: '410',
            1: '51'
        };
        
        // 填入模擬數據
        Object.entries(simulateData).forEach(([denom, value]) => {
            this.domElements.amountInputs[denom].value = formatNumber(value);
        });
        
        // 設定袋裝數據
        if (this.domElements.bagInputs[50]) this.domElements.bagInputs[50].value = '1';
        if (this.domElements.bagInputs[1]) this.domElements.bagInputs[1].value = '1';
        
        this.updateStateFromInputs();
        this.validateAllInputs();
    }
    
    // === 微調工具相關函數 ===
    
    /**
     * 執行結果微調
     */
    performResultExchange() {
        const rex = this.domElements.resultExchange;
        const fromDenom = parseInt(rex.fromDenom.value, 10);
        const toDenom = parseInt(rex.toDenom.value, 10);
        const fromCount = parseInt(rex.fromCount.value, 10);
        
        const lastResult = this.stateManager.getLatestExchangeResult();
        const swapPath = findValidSwapPath(fromDenom, toDenom, fromCount, lastResult.distribution);
        
        if (!swapPath.possible) {
            alert("無法執行此交換，請檢查數量與面額。");
            return;
        }
        
        // 建立新結果
        const newResult = JSON.parse(JSON.stringify(lastResult));
        const toCount = swapPath.countToReceive;
        
        // 執行交換
        newResult.distribution.pettyCash[fromDenom] -= fromCount;
        newResult.distribution.revenue[fromDenom] += fromCount;
        newResult.distribution.revenue[toDenom] -= toCount;
        newResult.distribution.pettyCash[toDenom] += toCount;
        
        // 記錄操作
        newResult.lastAction = {
            type: 'main_swap',
            text: `[預留]${fromDenom}元x${fromCount} ⇄ [上繳]${toDenom}元x${toCount}`
        };
        
        // 更新狀態
        this.stateManager.addExchangeHistory(newResult);
        
        // 更新 UI
        updateUI(newResult, { petty: true, revenue: true });
        this.updateResultExchangePreview();
    }
    
    /**
     * 撤銷結果微調
     */
    undoResultExchange() {
        if (this.stateManager.undoLastExchange()) {
            const lastResult = this.stateManager.getLatestExchangeResult();
            updateUI(lastResult);
            this.updateResultExchangePreview();
            this.updateCoinConsolidationPreview();
        }
    }
    
    /**
     * 重置所有結果微調
     */
    resetResultExchanges() {
        if (this.stateManager.resetAllExchanges()) {
            const initialResult = this.stateManager.getLatestExchangeResult();
            updateUI(initialResult);
            this.updateResultExchangePreview();
            this.updateCoinConsolidationPreview();
        }
    }
    
    /**
     * 更新結果微調預覽
     */
    updateResultExchangePreview() {
        updateResultExchangePreview(this.domElements, this.stateManager.getState());
    }
    
    /**
     * 更新收納零錢對換預覽
     */
    updateCoinConsolidationPreview() {
        updateCoinConsolidationPreview(this.domElements, this.stateManager.getState());
    }
    
    /**
     * 執行收納零錢對換
     */
    performCoinConsolidation() {
        const cc = this.domElements.coinConsolidation;
        const fromDenom = parseInt(cc.fromDenom.value, 10);
        const toDenom = parseInt(cc.toDenom.value, 10);
        const fromCount = parseInt(cc.fromCount.value, 10);
        
        const lastResult = this.stateManager.getLatestExchangeResult();
        const swapPath = findValidCoinSwapPath(fromDenom, toDenom, fromCount, lastResult.distribution);
        
        if (!swapPath.possible) {
            alert("無法執行此交換，請檢查數量與面額。");
            return;
        }
        
        // 建立新結果
        const newResult = JSON.parse(JSON.stringify(lastResult));
        const toCount = swapPath.countToReceive;
        
        // 執行交換
        newResult.distribution.revenue[fromDenom] -= fromCount;
        newResult.distribution.pettyCash[fromDenom] += fromCount;
        newResult.distribution.pettyCash[toDenom] -= toCount;
        newResult.distribution.revenue[toDenom] += toCount;
        
        // 記錄操作
        newResult.lastAction = {
            type: 'coin_consolidation',
            text: `[上繳]${fromDenom}元x${fromCount} ⇄ [打包]${toDenom}元x${toCount}`
        };
        
        // 更新狀態
        this.stateManager.addExchangeHistory(newResult);
        
        // 更新 UI
        updateUI(newResult, { revenue: true, packing: true });
        this.updateCoinConsolidationPreview();
    }
    
    /**
     * 處理歷史記錄點擊
     * @param {Event} e - 點擊事件
     */
    handleHistoryLogClick(e) {
        const item = e.target.closest('.history-log-item');
        if (item) {
            const index = parseInt(item.dataset.index, 10);
            this.revertToHistoryState(index);
        }
    }
    
    /**
     * 回復到歷史狀態
     * @param {number} index - 歷史記錄索引
     */
    revertToHistoryState(index) {
        if (this.stateManager.revertToHistoryState(index)) {
            const targetState = this.stateManager.getLatestExchangeResult();
            updateUI(targetState);
            this.updateResultExchangePreview();
            this.updateCoinConsolidationPreview();
        }
    }
    
    // === 其他工具函數 ===
    
    /**
     * 執行總額換算
     */
    performExchange() {
        const ex = this.domElements.exchange;
        const amount = parseInputValue(ex.amount.value);
        const fromDenom = parseInt(ex.from.value, 10);
        const toDenom = parseInt(ex.to.value, 10);
        const fromInput = this.domElements.amountInputs[fromDenom];
        const toInput = this.domElements.amountInputs[toDenom];
        const fromCurrentAmount = parseInputValue(fromInput.value);
        
        if (amount <= 0 || amount > fromCurrentAmount || amount % fromDenom !== 0) {
            alert('請輸入有效的轉換金額。');
            return;
        }
        
        // 執行轉換
        fromInput.value = formatNumber(fromCurrentAmount - amount);
        toInput.value = formatNumber(parseInputValue(toInput.value) + amount);
        
        // 關閉彈窗並更新狀態
        this.domElements.modals.exchange.style.display = 'none';
        this.updateStateFromInputs();
    }
    
    /**
     * 處理顏色變更
     * @param {Event} e - 顏色變更事件
     */
    handleColorChange(e) {
        const denom = parseInt(e.target.id.split('-')[1], 10);
        const color = e.target.value;
        applyColor(denom, color);
        this.domElements.color.hexes[denom].textContent = color.toUpperCase();
    }
    
    /**
     * 開始硬重置計時器
     * @param {Event} e - 事件對象
     */
    startHardResetTimer(e) {
        e.preventDefault();
        this.isLongPress = false;
        
        const progress = this.domElements.clearBtnProgress;
        progress.style.transition = `width ${APP_CONFIG.LONG_PRESS_DURATION / 1000}s linear`;
        progress.style.width = '100%';
        
        this.longPressTimer = setTimeout(() => {
            this.isLongPress = true;
            this.hardReset();
            this.cancelHardResetTimer();
        }, APP_CONFIG.LONG_PRESS_DURATION);
    }
    
    /**
     * 取消硬重置計時器
     */
    cancelHardResetTimer() {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
        
        const progress = this.domElements.clearBtnProgress;
        const text = this.domElements.clearBtnText;
        
        progress.style.transition = 'width 0.2s';
        progress.style.width = '0%';
        text.textContent = '清除數值';
        
        setTimeout(() => {
            this.isLongPress = false;
        }, 50);
    }
    
    /**
     * 處理狀態變更
     * @param {string} action - 變更動作
     * @param {Object} state - 新狀態
     */
    handleStateChange(action, state) {
        // 根據不同的狀態變更動作執行相應處理
        switch (action) {
            case 'exchange':
            case 'undo':
            case 'reset':
            case 'revert':
                renderResultExchangeHistory(this.domElements, state);
                break;
            default:
                // 其他狀態變更暫時不需要特殊處理
                break;
        }
    }
}

// === 應用程式啟動 ===
document.addEventListener('DOMContentLoaded', function() {
    // 建立並初始化應用程式
    const app = new CashManagementApp();
    app.init();
    
    // 將應用程式實例掛載到全域（僅供調試使用）
    if (typeof window !== 'undefined') {
        window.cashApp = app;
    }
});
