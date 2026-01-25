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
        
        // 保存相關
        this.saveHistory = [];
        
        // 初始化保存機台選擇
        this.currentSaveMachineNumber = null;
        
        console.log("現金管理工具 v4.1 已初始化。");
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
                changelog: document.getElementById('changelog-modal'),
                settings: document.getElementById('settings-modal'),
                save: document.getElementById('save-modal'),
                export: document.getElementById('export-modal')
            },
            
            // 功能按鈕
            buttons: {
                showPackage: document.getElementById('show-package-info'),
                showManual: document.getElementById('show-manual'),
                showExchange: document.getElementById('show-exchange'),
                showColor: document.getElementById('custom-color-btn'),
                showChangelog: document.getElementById('show-changelog'),
                themeToggle: document.getElementById('theme-toggle'),
                settings: document.getElementById('settings-btn'),
                save: document.getElementById('save-btn'),
                export: document.getElementById('export-btn')
            },
            
            // 總額換算工具
            exchange: {
                amount: document.getElementById('exchange-amount'),
                from: document.getElementById('exchange-from'),
                to: document.getElementById('exchange-to'),
                confirm: document.getElementById('exchange-confirm'),
                undoBtn: document.getElementById('undo-exchange-tool-btn'),
                resetBtn: document.getElementById('reset-exchange-tool-btn'),
                log: document.getElementById('exchange-tool-history-log'),
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
                performBtn: document.getElementById('perform-coin-consolidation-btn'),
                undoBtn: document.getElementById('undo-coin-consolidation-btn'),
                resetBtn: document.getElementById('reset-coin-consolidation-btn'),
                log: document.getElementById('coin-consolidation-history-log')
            },
            
            // 設定相關
            settings: {
                showExtendedDenoms: document.getElementById('show-extended-denoms'),
                machine1: document.getElementById('machine-1'),
                machine2: document.getElementById('machine-2'),
                staffList: document.getElementById('staff-list'),
                newStaffName: document.getElementById('new-staff-name'),
                addStaffBtn: document.getElementById('add-staff-btn'),
                saveSettingsBtn: document.getElementById('save-settings-btn'),
                resetSettingsBtn: document.getElementById('reset-settings-btn')
            },
            
            // 保存相關
            save: {
                timestamp: document.getElementById('save-timestamp'),
                machine1: document.getElementById('save-machine-1'),
                machine2: document.getElementById('save-machine-2'),
                staffSelect: document.getElementById('save-staff-select'),
                confirmBtn: document.getElementById('confirm-save-btn'),
                cancelBtn: document.getElementById('cancel-save-btn'),
                gotoSettingsLink: document.getElementById('goto-settings-link')
            },
            
            // 導出相關
            export: {
                settingsBtn: document.getElementById('export-settings-btn'),
                historyBtn: document.getElementById('export-history-btn'),
                allBtn: document.getElementById('export-all-btn'),
                result: document.getElementById('export-result'),
                text: document.getElementById('export-text'),
                copyBtn: document.getElementById('copy-export-btn'),
                downloadBtn: document.getElementById('download-export-btn')
            }
        };
        
        // 初始化面額相關的 DOM 元素（包含擴展面額）
        [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS].forEach(denom => {
            const amountInput = document.getElementById(`amount${denom}`);
            const errorMessage = document.getElementById(`error${denom}`);
            const picker = document.getElementById(`pick-${denom}`);
            const hex = document.getElementById(`hex-${denom}`);
            
            // 只儲存存在的元素
            if (amountInput) dom.amountInputs[denom] = amountInput;
            if (errorMessage) dom.errorMessages[denom] = errorMessage;
            if (picker) dom.color.pickers[denom] = picker;
            if (hex) dom.color.hexes[denom] = hex;
            
            const bagInput = document.getElementById(`bag${denom}`) || 
                           document.getElementById(`bundle${denom}`);
            if (bagInput) dom.bagInputs[denom] = bagInput;
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

        // 初始化新功能
        this.initNewFeatures();
        
        // 載入保存歷史並初始化設定
        this.loadSaveHistory();
        this.initSettings();
        
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
        // 移除長按清除功能，避免行動裝置點按失效問題
        
        // === 輸入欄位事件 ===
        Object.values(dom.amountInputs).forEach(input => {
            if (input) {
            input.addEventListener('input', (e) => this.handleAmountInput(e));
            input.addEventListener('blur', (e) => this.handleAmountBlur(e));
            }
        });
        
        Object.values(dom.bagInputs).forEach(input => {
            if (input) {
            input.addEventListener('input', () => this.handleBagInput());
            }
        });
        
        // === 摺疊面板 ===
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', (e) => {
                // 如果點擊的是鎖定按鈕或按鈕內的元素，不要觸發折疊
                if (e.target.id === 'lock-btn' || e.target.closest('#lock-btn')) {
                    return;
                }
                const content = document.getElementById(header.id.replace('Header', 'Content'));
                header.classList.toggle('collapsed');
                if (content) content.classList.toggle('collapsed');
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
        dom.buttons.showChangelog.onclick = () => {
            if (typeof initChangelogModal !== 'undefined') {
                initChangelogModal();
            }
            dom.modals.changelog.style.display = 'block';
        };
        
        // === 新增功能按鈕 ===
        if (dom.buttons.themeToggle) {
            dom.buttons.themeToggle.onclick = () => this.handleThemeToggle();
        }
        if (dom.buttons.settings) {
            dom.buttons.settings.onclick = () => this.handleSettingsClick();
        }
        if (dom.buttons.save) {
            dom.buttons.save.onclick = () => this.handleSaveClick();
        }
        if (dom.buttons.export) {
            dom.buttons.export.onclick = () => this.handleExportClick();
        }
        
        // === 設定功能事件綁定 ===
        const blockMovementToggle = document.getElementById('enable-block-movement');
        if (blockMovementToggle) {
            blockMovementToggle.addEventListener('change', (e) => {
                this.toggleBlockMovement(e.target.checked);
            });
        }
        
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
        if (cc.undoBtn) {
            cc.undoBtn.addEventListener('click', () => this.undoCoinConsolidation());
        }
        if (cc.resetBtn) {
            cc.resetBtn.addEventListener('click', () => this.resetCoinConsolidations());
        }
        if (cc.log) {
            cc.log.addEventListener('click', (e) => this.handleCoinConsolidationHistoryClick(e));
        }
        
        // === 新增功能事件綁定 ===
        
        // 設定相關事件
        if (dom.settings.showExtendedDenoms) {
            dom.settings.showExtendedDenoms.addEventListener('change', (e) => this.handleExtendedDenomsToggle(e));
        }
        if (dom.settings.machine1) {
            dom.settings.machine1.addEventListener('click', () => this.handleMachineSelect(1));
        }
        if (dom.settings.machine2) {
            dom.settings.machine2.addEventListener('click', () => this.handleMachineSelect(2));
        }
        if (dom.settings.addStaffBtn) {
            dom.settings.addStaffBtn.addEventListener('click', () => this.handleAddStaff());
        }
        if (dom.settings.saveSettingsBtn) {
            dom.settings.saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
        }
        if (dom.settings.resetSettingsBtn) {
            dom.settings.resetSettingsBtn.addEventListener('click', () => this.handleResetSettings());
        }
        
        // 保存相關事件
        if (dom.save.confirmBtn) {
            dom.save.confirmBtn.addEventListener('click', () => this.handleConfirmSave());
        }
        if (dom.save.cancelBtn) {
            dom.save.cancelBtn.addEventListener('click', () => this.handleCancelSave());
        }
        if (dom.save.machine1) {
            dom.save.machine1.addEventListener('click', () => this.handleSaveMachineSelect(1));
        }
        if (dom.save.machine2) {
            dom.save.machine2.addEventListener('click', () => this.handleSaveMachineSelect(2));
        }
        if (dom.save.gotoSettingsLink) {
            dom.save.gotoSettingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.domElements.modals.save.style.display = 'none';
                this.handleSettingsClick();
            });
        }
        
        // 導出相關事件
        if (dom.export.settingsBtn) {
            dom.export.settingsBtn.addEventListener('click', () => this.handleExportSettings());
        }
        if (dom.export.historyBtn) {
            dom.export.historyBtn.addEventListener('click', () => this.handleExportHistory());
        }
        if (dom.export.allBtn) {
            dom.export.allBtn.addEventListener('click', () => this.handleExportAll());
        }
        if (dom.export.copyBtn) {
            dom.export.copyBtn.addEventListener('click', () => this.handleCopyExport());
        }
        if (dom.export.downloadBtn) {
            dom.export.downloadBtn.addEventListener('click', () => this.handleDownloadExport());
        }
    }
    
    // === 事件處理函數 ===
    
    /**
     * 處理清除按鈕點擊
     */
    handleClearClick() {
        this.softClear();
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
        console.log('開始計算...');
        
        if (!this.validateAllInputs()) {
            createNotification('部分金額輸入錯誤，請檢查紅色框標示的欄位！', 'error');
            return;
        }
        
        try {
        // 收集輸入資料
        const inputs = collectInputs(this.domElements);
            console.log('輸入資料:', inputs);
        
        // 執行計算
        const results = calculateResults(inputs);
            console.log('計算結果:', results);
        
        // 更新狀態
        this.stateManager.updateResults(results);
        
            // 更新 UI - 注意：必須先更新UI再設定工具，確保狀態正確傳遞
        updateUI(results);
        setupResultExchangeTool(this.domElements);
            // 重要：setupCoinConsolidationTool需要狀態資料，必須傳入完整的狀態對象
            setupCoinConsolidationTool(this.domElements, this.stateManager.getState());
        
        // 初始化對換零錢湊整歷史記錄
        this.stateManager.initCoinConsolidationHistory(results);
        
        // 渲染歷史記錄
        this.renderCoinConsolidationHistory();
        
            // 確保結果區塊和代收PC計算區塊顯示
            setTimeout(() => {
        this.domElements.resultContainer.classList.add('active');
                this.domElements.resultContainer.style.display = 'block';
                
                // 顯示代收PC計算區塊
                const extraCalcSection = document.getElementById('extra-calc-section');
                if (extraCalcSection) {
                    extraCalcSection.style.display = 'block';
                }
                
                console.log('結果區塊和代收PC計算區塊已顯示');
            }, 100);
            
        } catch (error) {
            console.error('計算過程發生錯誤:', error);
            createNotification('計算過程發生錯誤，請重新嘗試。', 'error');
        }
    }
    
    /**
     * 軟清除（僅清除輸入和結果）
     */
    softClear() {
        this.stateManager.clearState();
        
        // 清除輸入欄位
        Object.values(this.domElements.amountInputs).forEach(input => {
            if (input) input.value = '';
        });
        Object.values(this.domElements.bagInputs).forEach(input => {
            if (input) input.value = '';
        });
        
        // 清除錯誤狀態
        Object.values(this.domElements.errorMessages).forEach(el => {
            if (el) el.classList.remove('active');
        });
        Object.values(this.domElements.amountInputs).forEach(el => {
            if (el) el.classList.remove('input-error');
        });
        
        // 重置按鈕狀態
        this.domElements.calculateBtn.disabled = false;
        
        // 隱藏結果區塊及後續所有區域 - 重要：恢復清除按鈕的完整功能
        this.domElements.resultContainer.classList.remove('active');
        this.domElements.resultContainer.style.display = 'none';
        
        // 隱藏代收PC計算區塊
        const extraCalcSection = document.getElementById('extra-calc-section');
        if (extraCalcSection) {
            extraCalcSection.style.display = 'none';
        }
        
        console.log('結果區塊、代收PC計算區塊及後續區域已隱藏');
    }
    
    /**
     * 硬重置（包含顏色設定）
     */
    hardReset() {
        this.softClear();
        resetColors(this.domElements);
        createNotification('已徹底重置工具並清除所有儲存的資料。', 'success');
    }
    
    /**
     * 驗證所有輸入
     * @returns {boolean} 是否所有輸入都有效
     */
    validateAllInputs() {
        // 調用 core-logic.js 中的 validateAllInputs 函數（提供解析後 inputs）
        const processedInputs = window.collectInputs ? window.collectInputs(this.domElements) : {};
        const isValid = window.validateAllInputs ? 
            window.validateAllInputs(this.domElements, processedInputs) : true;
        
        if (this.domElements.calculateBtn) {
        this.domElements.calculateBtn.disabled = !isValid;
        }
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
                    setupCoinConsolidationTool(this.domElements, state);
                    renderResultExchangeHistory(this.domElements, state);
                }
                
                // 恢復對換零錢湊整歷史記錄顯示
                if (state.coinConsolidationHistory && state.coinConsolidationHistory.length > 0) {
                    this.renderCoinConsolidationHistory();
                }
                
                // 恢復面額換算工具歷史記錄顯示
                if (state.exchangeToolHistory && state.exchangeToolHistory.length > 0) {
                    this.renderExchangeToolHistory();
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
        
        // 如果啟用了擴展面額，添加模擬數據
        if (APP_CONFIG.SETTINGS.showExtendedDenoms) {
            simulateData[2000] = '10000';
            simulateData[200] = '2400';
        }
        
        // 填入模擬數據
        Object.entries(simulateData).forEach(([denom, value]) => {
            const input = this.domElements.amountInputs[denom];
            if (input) {
                input.value = formatNumber(value);
            }
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
            createNotification('無法執行此交換，請檢查數量與面額。', 'error');
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
        createNotification(`[預留]${fromDenom}元x${fromCount} ⇄ [上繳]${toDenom}元x${toCount} 已完成`, 'success');
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
            createNotification('已撤銷最後一次微調操作', 'info');
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
        
        // 使用對換零錢湊整的歷史記錄
        let lastResult = this.stateManager.getLatestCoinConsolidationResult();
        if (!lastResult) {
            // 如果沒有歷史記錄，使用exchangeHistory的最後結果
            lastResult = this.stateManager.getLatestExchangeResult();
            // 初始化對換零錢湊整歷史記錄
            if (lastResult) {
                this.stateManager.initCoinConsolidationHistory(lastResult);
            }
        }
        
        if (!lastResult) {
            createNotification('請先進行計算！', 'error');
            return;
        }
        
        const swapPath = findValidCoinSwapPath(fromDenom, toDenom, fromCount, lastResult.distribution);
        
        if (!swapPath.possible) {
            createNotification('無法執行此交換，請檢查數量與面額。', 'error');
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
        
        // 更新狀態（使用獨立歷史記錄）
        this.stateManager.addCoinConsolidationHistory(newResult);
        
        // 更新 UI
        updateUI(newResult, { revenue: true, packing: true });
        this.updateCoinConsolidationPreview();
        this.renderCoinConsolidationHistory();
        createNotification(`[上繳]${fromDenom}元x${fromCount} ⇄ [打包]${toDenom}元x${toCount} 已完成`, 'success');
    }
    
    /**
     * 撤銷對換零錢湊整最後一次操作
     */
    undoCoinConsolidation() {
        if (this.stateManager.undoLastCoinConsolidation()) {
            const lastResult = this.stateManager.getLatestCoinConsolidationResult();
            updateUI(lastResult);
            this.updateCoinConsolidationPreview();
            this.renderCoinConsolidationHistory();
            createNotification('已撤銷收納零錢對換最後一次操作', 'info');
        }
    }
    
    /**
     * 重置所有對換零錢湊整操作
     */
    resetCoinConsolidations() {
        if (confirm('確定要重置所有交換操作嗎？')) {
            if (this.stateManager.resetAllCoinConsolidations()) {
                const initialResult = this.stateManager.getLatestCoinConsolidationResult();
                updateUI(initialResult);
                this.updateCoinConsolidationPreview();
                this.renderCoinConsolidationHistory();
            }
        }
    }
    
    /**
     * 處理對換零錢湊整歷史記錄點擊
     */
    handleCoinConsolidationHistoryClick(e) {
        const item = e.target.closest('.history-log-item');
        if (item) {
            const index = parseInt(item.dataset.index, 10);
            if (this.stateManager.revertToCoinConsolidationHistory(index)) {
                const targetResult = this.stateManager.getLatestCoinConsolidationResult();
                updateUI(targetResult);
                this.updateCoinConsolidationPreview();
                this.renderCoinConsolidationHistory();
            }
        }
    }
    
    /**
     * 渲染對換零錢湊整歷史記錄
     */
    renderCoinConsolidationHistory() {
        const logEl = this.domElements.coinConsolidation.log;
        const history = this.stateManager.getCoinConsolidationHistory();
        
        if (!logEl || !history || history.length <= 1) {
            if (logEl) {
                logEl.innerHTML = '<p style="text-align:center; color: var(--gray);">尚無交換紀錄</p>';
            }
            return;
        }
        
        let html = '';
        const activeIndex = history.length - 1;
        
        history.forEach((item, index) => {
            if (index > 0) {
                const actionText = item.lastAction ? item.lastAction.text : '未知操作';
                const timeText = item.lastAction && item.lastAction.time ? 
                    new Date(item.lastAction.time).toLocaleTimeString('zh-TW', { hour12: false }) : '';
                
                let displayText = actionText;
                if (timeText) {
                    displayText = `<span class="history-timestamp">${timeText}</span> <span class="history-action">${actionText}</span>`;
                }
                
                html += `<div class="history-log-item ${index === activeIndex ? 'active' : ''}" data-index="${index}">${displayText}</div>`;
            }
        });
        
        logEl.innerHTML = html || '<p style="text-align:center; color: var(--gray);">尚無交換紀錄</p>';
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
        
        // 基本驗證：正數、不得超出來源、必須為來源面額的整數倍
        if (amount <= 0 || amount > fromCurrentAmount || amount % fromDenom !== 0) {
            createNotification('請輸入有效的轉換金額（必須為來源面額的整倍數且不可超出來源可用金額）。', 'error');
            return;
        }

        // 目標面額可整除性檢查：確保轉換後能換成整數張數的目標面額
        if (amount % toDenom !== 0) {
            createNotification('轉換金額必須能轉成整數張數的目標面額，請調整金額或目標面額。', 'error');
            return;
        }
        
        // 初始化歷史記錄（如果還沒有）
        const currentInputs = collectInputs(this.domElements);
        if (this.stateManager.getState().exchangeToolHistory.length === 0) {
            this.stateManager.initExchangeToolHistory(currentInputs);
        }
        
        // 執行轉換
        fromInput.value = formatNumber(fromCurrentAmount - amount);
        toInput.value = formatNumber(parseInputValue(toInput.value) + amount);
        
        // 更新狀態並記錄歷史
        this.updateStateFromInputs();
        const newInputs = collectInputs(this.domElements);
        this.stateManager.addExchangeToolHistory(newInputs);
        
        // 更新歷史記錄顯示
        this.renderExchangeToolHistory();
        
        // 顯示成功通知並關閉彈窗
        createNotification('面額換算已完成', 'success');
        this.domElements.modals.exchange.style.display = 'none';
    }
    
    /**
     * 撤銷面額換算工具最後一次操作
     */
    undoExchangeTool() {
        if (this.stateManager.undoLastExchangeTool()) {
            const latestInputs = this.stateManager.getLatestExchangeToolInputs();
            restoreInputsFromState({ inputs: latestInputs }, this.domElements);
            this.updateStateFromInputs();
            this.renderExchangeToolHistory();
            createNotification('已撤銷換算工具最後一次操作', 'info');
        }
    }
    
    /**
     * 重置所有面額換算工具操作
     */
    resetExchangeTools() {
        if (confirm('確定要重置所有換算操作嗎？')) {
            if (this.stateManager.resetAllExchangeTools()) {
                const initialInputs = this.stateManager.getState().exchangeToolHistory[0].inputs;
                restoreInputsFromState({ inputs: initialInputs }, this.domElements);
                this.updateStateFromInputs();
                this.renderExchangeToolHistory();
            }
        }
    }
    
    /**
     * 處理面額換算工具歷史記錄點擊
     */
    handleExchangeToolHistoryClick(e) {
        const item = e.target.closest('.history-log-item');
        if (item) {
            const index = parseInt(item.dataset.index, 10);
            if (this.stateManager.revertToExchangeToolHistory(index)) {
                const targetInputs = this.stateManager.getState().exchangeToolHistory[index].inputs;
                restoreInputsFromState({ inputs: targetInputs }, this.domElements);
                this.updateStateFromInputs();
                this.renderExchangeToolHistory();
            }
        }
    }
    
    /**
     * 渲染面額換算工具歷史記錄
     */
    renderExchangeToolHistory() {
        const logEl = this.domElements.exchange.log;
        const history = this.stateManager.getExchangeToolHistory();
        
        if (!logEl || !history || history.length <= 1) {
            if (logEl) {
                logEl.innerHTML = '<p style="text-align:center; color: var(--gray);">尚無換算紀錄</p>';
            }
            return;
        }
        
        let html = '';
        const activeIndex = history.length - 1;
        
        history.forEach((item, index) => {
            if (index > 0) {
                const timeText = item.time ? 
                    new Date(item.time).toLocaleTimeString('zh-TW', { hour12: false }) : '';
                const displayText = timeText ? 
                    `<span class="history-timestamp">${timeText}</span> <span class="history-action">換算操作</span>` : 
                    '換算操作';
                
                html += `<div class="history-log-item ${index === activeIndex ? 'active' : ''}" data-index="${index}">${displayText}</div>`;
            }
        });
        
        logEl.innerHTML = html || '<p style="text-align:center; color: var(--gray);">尚無換算紀錄</p>';
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
    
    // 已移除清除按鈕長按計時器相關邏輯
    
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
            case 'coinConsolidation':
            case 'undoCoinConsolidation':
            case 'resetCoinConsolidation':
            case 'revertCoinConsolidation':
                this.renderCoinConsolidationHistory();
                break;
            case 'exchangeTool':
            case 'undoExchangeTool':
            case 'resetExchangeTool':
            case 'revertExchangeTool':
                this.renderExchangeToolHistory();
                break;
            default:
                // 其他狀態變更暫時不需要特殊處理
                break;
        }
    }
    
    // === 新增功能事件處理 ===
    
    /**
     * 處理主題切換
     */
    handleThemeToggle() {
        const isDark = !APP_CONFIG.SETTINGS.darkMode;
        toggleDarkMode(isDark);
        this.saveSettings();
    }
    
    /**
     * 處理設定按鈕點擊
     */
    handleSettingsClick() {
        this.updateSettingsModal();
        this.domElements.modals.settings.style.display = 'block';
    }
    
    /**
     * 處理保存按鈕點擊
     */
    handleSaveClick() {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        this.domElements.save.timestamp.textContent = timestamp;
        
        // 初始化機號和人員選擇
        this.currentSaveMachineNumber = APP_CONFIG.SETTINGS.machineNumber;
        this.updateSaveMachineButtons();
        this.updateSaveStaffSelect();
            
        this.domElements.modals.save.style.display = 'block';
    }
    
    /**
     * 處理導出按鈕點擊
     */
    handleExportClick() {
        if (this.domElements.export.result) {
            this.domElements.export.result.style.display = 'none';
        }
        this.domElements.modals.export.style.display = 'block';
    }
    
    /**
     * 更新設定彈窗
     */
    updateSettingsModal() {
        if (this.domElements.settings.showExtendedDenoms) {
            this.domElements.settings.showExtendedDenoms.checked = APP_CONFIG.SETTINGS.showExtendedDenoms;
        }
        if (this.domElements.settings.machine1) {
            this.domElements.settings.machine1.classList.toggle('active', APP_CONFIG.SETTINGS.machineNumber === 1);
        }
        if (this.domElements.settings.machine2) {
            this.domElements.settings.machine2.classList.toggle('active', APP_CONFIG.SETTINGS.machineNumber === 2);
        }
        this.renderStaffList();
    }
    
    /**
     * 處理擴展面額切換
     */
    handleExtendedDenomsToggle(e) {
        const show = e.target.checked;
        
        // 如果關閉且有數值，警示使用者
        if (!show && this.hasExtendedDenomsValues()) {
            const confirmed = confirm('關閉顯示將清空 2000 和 200 面額的輸入值，是否繼續？');
            if (!confirmed) {
                e.target.checked = true;
                return;
            }
            
            // 清空數值
            if (this.domElements.amountInputs[2000]) {
                this.domElements.amountInputs[2000].value = '';
            }
            if (this.domElements.amountInputs[200]) {
                this.domElements.amountInputs[200].value = '';
            }
        }
        
        if (typeof toggleExtendedDenominations !== 'undefined') {
            toggleExtendedDenominations(show);
        }
        this.saveSettings();
    }
    
    /**
     * 檢查是否有擴展面額的數值
     */
    hasExtendedDenomsValues() {
        const val2000 = this.domElements.amountInputs[2000] ? parseInputValue(this.domElements.amountInputs[2000].value) : 0;
        const val200 = this.domElements.amountInputs[200] ? parseInputValue(this.domElements.amountInputs[200].value) : 0;
        return val2000 > 0 || val200 > 0;
    }
    
    /**
     * 處理機台選擇
     */
    handleMachineSelect(machineNumber) {
        APP_CONFIG.SETTINGS.machineNumber = machineNumber;
        
        if (this.domElements.settings.machine1) {
            this.domElements.settings.machine1.classList.toggle('active', machineNumber === 1);
        }
        if (this.domElements.settings.machine2) {
            this.domElements.settings.machine2.classList.toggle('active', machineNumber === 2);
        }
        
        this.saveSettings();
    }
    
    /**
     * 處理新增人員
     */
    handleAddStaff() {
        const nameInput = this.domElements.settings.newStaffName;
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        if (name && !APP_CONFIG.SETTINGS.staffList.includes(name)) {
            APP_CONFIG.SETTINGS.staffList.push(name);
            this.renderStaffList();
            nameInput.value = '';
            this.saveSettings();
        }
    }
    
    /**
     * 處理刪除人員
     */
    handleRemoveStaff(index) {
        if (APP_CONFIG.SETTINGS.staffList.length > 1) {
            APP_CONFIG.SETTINGS.staffList.splice(index, 1);
            this.renderStaffList();
            this.saveSettings();
        }
    }
    
    /**
     * 處理保存設定
     */
    handleSaveSettings() {
        this.saveSettings();
        createNotification('設定已保存！', 'success');
        this.domElements.modals.settings.style.display = 'none';
    }
    
    /**
     * 處理重置設定
     */
    handleResetSettings() {
        if (confirm('確定要恢復所有設定為預設值嗎？')) {
            this.resetSettings();
            this.updateSettingsModal();
            createNotification('設定已重置！', 'success');
        }
    }
    
    /**
     * 處理確認保存
     */
    handleConfirmSave() {
        const timestamp = this.domElements.save.timestamp.textContent;
        const machine = this.currentSaveMachineNumber || APP_CONFIG.SETTINGS.machineNumber;
        const staffIndex = parseInt(this.domElements.save.staffSelect.value);
        const staff = APP_CONFIG.SETTINGS.staffList[staffIndex];
        
        if (!this.stateManager.getState().results) {
            createNotification('請先進行計算再保存！', 'error');
            return;
        }
        
        const saveData = {
            id: Date.now().toString(),
            timestamp,
            machine,
            staff,
            inputs: this.stateManager.getState().inputs,
            results: this.stateManager.getState().results,
            exchangeHistory: this.stateManager.getState().exchangeHistory,
            settings: { ...APP_CONFIG.SETTINGS }
        };
        
        this.saveHistory.push(saveData);
        this.saveSaveHistory();
        
        // 更新設定中的保存記錄預覽
        this.updateSettingsSavePreview();
        
        createNotification(`記錄已保存！\\n時間: ${timestamp}\\n機號: ①${machine}\\n人員: ${staff}`, 'success');
        this.renderSaveHistory();
        
        // 重要：確保保存記錄功能完整更新
        console.log('保存記錄已更新，當前記錄數量:', this.saveHistory.length);
        
        this.domElements.modals.save.style.display = 'none';
    }
    
    /**
     * 處理取消保存
     */
    handleCancelSave() {
        this.domElements.modals.save.style.display = 'none';
    }
    
    /**
     * 處理導出設定
     */
    handleExportSettings() {
        const settingsData = {
            settings: { ...APP_CONFIG.SETTINGS },
            colors: this.getCurrentColors(),
            version: '4.1',
            exportTime: new Date().toISOString()
        };
        
        this.showExportResult(JSON.stringify(settingsData, null, 2), '設定資料');
    }
    
    /**
     * 處理導出歷史
     */
    handleExportHistory() {
        const historyData = {
            saveHistory: this.saveHistory,
            version: '4.1',
            exportTime: new Date().toISOString()
        };
        
        this.showExportResult(JSON.stringify(historyData, null, 2), '歷史資料');
    }
    
    /**
     * 處理導出所有
     */
    handleExportAll() {
        const allData = {
            settings: { ...APP_CONFIG.SETTINGS },
            colors: this.getCurrentColors(),
            saveHistory: this.saveHistory,
            currentState: this.stateManager.getState(),
            version: '4.1',
            exportTime: new Date().toISOString()
        };
        
        this.showExportResult(JSON.stringify(allData, null, 2), '完整資料');
    }
    
    /**
     * 處理複製導出
     */
    handleCopyExport() {
        const text = this.domElements.export.text.value;
        navigator.clipboard.writeText(text).then(() => {
            createNotification('已複製到剪貼板！', 'success');
        }).catch(() => {
            // 備用方案
            this.domElements.export.text.select();
            document.execCommand('copy');
            createNotification('已複製到剪貼板！', 'success');
        });
    }
    
    /**
     * 處理下載導出
     */
    handleDownloadExport() {
        const text = this.domElements.export.text.value;
        const filename = this.currentExportFilename || 'export.json';
        
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * 顯示導出結果
     */
    showExportResult(data, type) {
        this.domElements.export.text.value = data;
        this.currentExportFilename = `cash-tool-${type}-${new Date().toISOString().slice(0, 10)}.json`;
        this.domElements.export.result.style.display = 'block';
    }
    
    /**
     * 重置設定
     */
    resetSettings() {
        APP_CONFIG.SETTINGS = {
            showExtendedDenoms: false,
            darkMode: false,
            machineNumber: 1,
            staffList: ['1號', '2號', '3號']
        };
        
        if (typeof toggleDarkMode !== 'undefined') {
            toggleDarkMode(false);
        }
        if (typeof toggleExtendedDenominations !== 'undefined') {
            toggleExtendedDenominations(false);
        }
        this.saveSettings();
    }
    
    /**
     * 取得當前顏色
     */
    getCurrentColors() {
        const colors = {};
        [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS].forEach(denom => {
            const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
            colors[denom] = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        });
        return colors;
    }
    
    // === 保存功能相關 ===
    
    /**
     * 處理保存機台選擇
     */
    handleSaveMachineSelect(machineNumber) {
        this.currentSaveMachineNumber = machineNumber;
        this.updateSaveMachineButtons();
    }
    
    /**
     * 更新保存機台按鈕狀態
     */
    updateSaveMachineButtons() {
        const machine = this.currentSaveMachineNumber || APP_CONFIG.SETTINGS.machineNumber;
        if (this.domElements.save.machine1) {
            this.domElements.save.machine1.classList.toggle('active', machine === 1);
        }
        if (this.domElements.save.machine2) {
            this.domElements.save.machine2.classList.toggle('active', machine === 2);
        }
    }
    
    /**
     * 更新保存人員選擇
     */
    updateSaveStaffSelect() {
        if (!this.domElements.save.staffSelect) return;
        
        const selectEl = this.domElements.save.staffSelect;
        selectEl.innerHTML = APP_CONFIG.SETTINGS.staffList
            .map((staff, index) => `<option value="${index}">${staff}</option>`)
            .join('');
    }
    
    /**
     * 初始化新增功能
     */
    initNewFeatures() {
        // 初始化区块移动功能
        if (typeof initializeMovableBlocks !== 'undefined') {
            initializeMovableBlocks();
        }
        
        // 初始化額外計算功能
        if (typeof initExtraCalc !== 'undefined') {
            initExtraCalc();
        }
        
        // 初始化設定
        this.loadSettings();
        
        // 載入保存歷史
        this.loadSaveHistory();
        
        // 初始化人員清單
        this.renderStaffList();
    }
    
    /**
     * 載入設定
     */
    loadSettings() {
        const saved = localStorage.getItem('cashTool.settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.assign(APP_CONFIG.SETTINGS, settings);
                
                // 應用設定
                if (typeof toggleDarkMode !== 'undefined') {
                    toggleDarkMode(APP_CONFIG.SETTINGS.darkMode);
                }
                if (typeof toggleExtendedDenominations !== 'undefined') {
                    toggleExtendedDenominations(APP_CONFIG.SETTINGS.showExtendedDenoms);
                }
            } catch (error) {
                console.error('載入設定失敗:', error);
            }
        }
    }
    
    /**
     * 保存設定
     */
    saveSettings() {
        localStorage.setItem('cashTool.settings', JSON.stringify(APP_CONFIG.SETTINGS));
    }
    
    /**
     * 渲染人員清單
     */
    renderStaffList() {
        if (!this.domElements.settings || !this.domElements.settings.staffList) return;
        
        const listEl = this.domElements.settings.staffList;
        listEl.innerHTML = APP_CONFIG.SETTINGS.staffList.map((staff, index) => `
            <div class="staff-item">
                <span>${staff}</span>
                <button onclick="cashApp.handleRemoveStaff(${index})" class="btn btn-clear" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">刪除</button>
            </div>
        `).join('');
    }
    
    /**
     * 載入保存歷史
     */
    loadSaveHistory() {
        const saved = localStorage.getItem('cashTool.saveHistory');
        if (saved) {
            try {
                this.saveHistory = JSON.parse(saved);
            } catch (error) {
                console.error('載入保存歷史失敗:', error);
                this.saveHistory = [];
            }
        }
        // 更新設定中的保存記錄預覽
        this.updateSettingsSavePreview();
    }
    
    /**
     * 切換區塊移動功能
     * @param {boolean} enabled - 是否啟用
     */
    toggleBlockMovement(enabled) {
        const moveButtons = document.querySelectorAll('.move-buttons');
        moveButtons.forEach(buttons => {
            buttons.style.display = enabled ? 'flex' : 'none';
        });
        
        // 保存設定到 localStorage
        localStorage.setItem('cashTool.blockMovementEnabled', enabled);
        console.log(`區塊移動功能已${enabled ? '啟用' : '停用'}`);
    }
    
    /**
     * 更新設定中的保存記錄預覽 - 重要：確保保存記錄功能完整可用
     */
    updateSettingsSavePreview() {
        const countEl = document.getElementById('settings-save-count');
        const previewEl = document.getElementById('settings-save-preview');
        
        if (!countEl || !previewEl) {
            console.warn('找不到保存記錄預覽元素');
            return;
        }
        
        console.log('更新保存記錄預覽，當前記錄數量:', this.saveHistory.length);
        
        countEl.textContent = `(${this.saveHistory.length})`;
        
        if (this.saveHistory.length === 0) {
            previewEl.innerHTML = '<p class="no-saves">尚無保存記錄</p>';
        } else {
            const recentSaves = this.saveHistory.slice(-5).reverse(); // 顯示最近5筆，最新的在上
            previewEl.innerHTML = recentSaves.map(save => `
                <div class="save-preview-item" data-save-id="${save.id}">
                    <div>
                        <div class="save-preview-time">${save.timestamp}</div>
                        <div class="save-preview-info">機號${save.machine || save.machineNumber} | ${save.staff || save.staffName}</div>
                    </div>
                    <div style="display:flex;gap:.5rem;margin-top:.25rem;">
                        <button class="btn btn-simulate btn-restore" data-save-id="${save.id}" style="padding:.2rem .6rem;">復現</button>
                        <button class="btn btn-clear btn-delete" data-save-id="${save.id}" style="padding:.2rem .6rem;">刪除</button>
                    </div>
                </div>
            `).join('');

            // 綁定事件（委派）
            previewEl.onclick = (e) => {
                const restoreBtn = e.target.closest('.btn-restore');
                const deleteBtn = e.target.closest('.btn-delete');
                if (restoreBtn) {
                    const id = restoreBtn.getAttribute('data-save-id');
                    this.restoreFromSave(id);
                } else if (deleteBtn) {
                    const id = deleteBtn.getAttribute('data-save-id');
                    this.deleteSave(id);
                }
            };
        }
        
        console.log('保存記錄預覽已更新');
    }

    /**
     * 渲染保存歷史（目前透過設定預覽呈現）
     */
    renderSaveHistory() {
        this.updateSettingsSavePreview();
    }

    /**
     * 復現指定保存紀錄
     * @param {string} saveId
     */
    restoreFromSave(saveId) {
        const target = this.saveHistory.find(s => s.id === saveId);
        if (!target) {
            createNotification('找不到指定的保存紀錄', 'error');
            return;
        }

        // 套用設定
        if (target.settings) {
            Object.assign(APP_CONFIG.SETTINGS, target.settings);
            this.saveSettings();
            if (typeof toggleDarkMode !== 'undefined') {
                toggleDarkMode(APP_CONFIG.SETTINGS.darkMode);
            }
            if (typeof toggleExtendedDenominations !== 'undefined') {
                toggleExtendedDenominations(APP_CONFIG.SETTINGS.showExtendedDenoms);
            }
            this.updateSettingsModal();
        }

        // 套用狀態（輸入、結果、微調歷史）
        this.stateManager.state.inputs = target.inputs || {};
        this.stateManager.state.results = target.results || null;
        this.stateManager.state.exchangeHistory = Array.isArray(target.exchangeHistory) ? target.exchangeHistory : [];
        this.stateManager.saveState();

        // 恢復輸入
        restoreInputsFromState(this.stateManager.getState(), this.domElements);

        // 恢復結果顯示與工具
        if (this.stateManager.getState().results) {
            updateUI(this.stateManager.getState().results);
            this.domElements.resultContainer.classList.add('active');
            this.domElements.resultContainer.style.display = 'block';
            setupResultExchangeTool(this.domElements);
            setupCoinConsolidationTool(this.domElements, this.stateManager.getState());
            renderResultExchangeHistory(this.domElements, this.stateManager.getState());
        }

        this.validateAllInputs();
        createNotification('已復現所選保存紀錄', 'success');
    }

    /**
     * 刪除指定保存紀錄
     * @param {string} saveId
     */
    deleteSave(saveId) {
        const idx = this.saveHistory.findIndex(s => s.id === saveId);
        if (idx === -1) return;
        this.saveHistory.splice(idx, 1);
        this.saveSaveHistory();
        this.updateSettingsSavePreview();
        showNotification('已刪除保存紀錄', 'warning');
    }
    
    /**
     * 保存保存歷史
     */
    saveSaveHistory() {
        localStorage.setItem('cashTool.saveHistory', JSON.stringify(this.saveHistory));
    }
    
    /**
     * 初始化設定功能
     */
    initSettings() {
        // 載入區塊移動功能設定
        const blockMovementEnabled = localStorage.getItem('cashTool.blockMovementEnabled');
        const toggle = document.getElementById('enable-block-movement');
        
        if (toggle) {
            const enabled = blockMovementEnabled !== 'false'; // 預設為true
            toggle.checked = enabled;
            this.toggleBlockMovement(enabled);
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