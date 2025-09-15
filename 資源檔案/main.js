/* ?��?管�?計�?工具 - 主控?�器 */

// === ?�用程�?主�???===
class CashManagementApp {
    constructor() {
        // ?��??��??�管?�器
        this.stateManager = new StateManager();
        
        // ?��???DOM ?��?管�?
        this.domElements = this.initDOMElements();
        
        // ?��?計�??�相??        this.longPressTimer = null;
        this.isLongPress = false;
        
        // 保�??��?
        this.saveHistory = [];
        
        // ?��??��?存�??�選??        this.currentSaveMachineNumber = null;
        
        console.log("?��?管�?工具 v3.9 已�?始�???);
    }
    
    /**
     * ?��???DOM ?��?引用
     * @returns {Object} DOM ?��??��?
     */
    initDOMElements() {
        const dom = {
            // 主�??�制?��?
            calculateBtn: document.getElementById('calculate-btn'),
            clearBtn: document.getElementById('clear-btn'),
            clearBtnText: document.querySelector('#clear-btn .btn-text'),
            clearBtnProgress: document.querySelector('#clear-btn .progress-bar'),
            simulateBtn: document.getElementById('simulate-btn'),
            resultContainer: document.getElementById('result-container'),
            
            // 輸入?��??��?
            amountInputs: {},
            bagInputs: {},
            errorMessages: {},
            
            // 彈�??��?
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
            
            // ?�能?��?
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
            
            // 總�??��?工具
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
            
            // 顏色?��???            color: {
                pickers: {},
                hexes: {},
                resetBtn: document.getElementById('reset-colors'),
                closeBtn: document.getElementById('close-color-modal')
            },
            
            // 結�?微調工具
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
            
            // ?��??�錢對�?工具
            coinConsolidation: {
                fromDenom: document.getElementById('coin-consolidation-from-denom'),
                fromCount: document.getElementById('coin-consolidation-from-count'),
                fromPreview: document.getElementById('coin-consolidation-from-preview'),
                toDenom: document.getElementById('coin-consolidation-to-denom'),
                toPreview: document.getElementById('coin-consolidation-to-preview'),
                performBtn: document.getElementById('perform-coin-consolidation-btn')
            },
            
            // 設�??��?
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
            
            // 保�??��?
            save: {
                timestamp: document.getElementById('save-timestamp'),
                machine1: document.getElementById('save-machine-1'),
                machine2: document.getElementById('save-machine-2'),
                staffSelect: document.getElementById('save-staff-select'),
                confirmBtn: document.getElementById('confirm-save-btn'),
                cancelBtn: document.getElementById('cancel-save-btn'),
                gotoSettingsLink: document.getElementById('goto-settings-link')
            },
            
            // 導出?��?
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
        
        // ?��??�面額相?��? DOM ?��?（�??�擴展面額�?
        [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS].forEach(denom => {
            const amountInput = document.getElementById(`amount${denom}`);
            const errorMessage = document.getElementById(`error${denom}`);
            const picker = document.getElementById(`pick-${denom}`);
            const hex = document.getElementById(`hex-${denom}`);
            
            // ?�儲存�??��??��?
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
     * ?��??��??��?�?     */
    init() {
        // 綁�?事件??��??        this.bindEventListeners();
        
        // 載入?��??��???        this.loadState();
        
        // ?��??��??�選?�器
        initColorPickers(this.domElements);

        // ?��??�新?�能
        this.initNewFeatures();
        
        // 載入保�?歷史並�?始�?設�?
        this.loadSaveHistory();
        this.initSettings();
        
        // 設�??�?��??�監?�器
        this.stateManager.addListener((action, state) => {
            this.handleStateChange(action, state);
        });
    }
    
    /**
     * 綁�??�?��?件監?�器
     */
    bindEventListeners() {
        const dom = this.domElements;
        
        // === 主�??�能?��? ===
        dom.clearBtn.addEventListener('click', () => this.handleClearClick());
        dom.calculateBtn.addEventListener('click', () => this.handleCalculate());
        dom.simulateBtn.addEventListener('click', () => this.simulateValues());
        
        // === ?��??�置?�能 ===
        // 注�?：mousedown?�touchstart不能設為passive，�??��?要preventDefault來阻止�?認�???        // ?�是?��??�止?��??�觸?�其他瀏覽?��?認�??��?如選?��?字、右?�選?��?�?        dom.clearBtn.addEventListener('mousedown', (e) => this.startHardResetTimer(e));
        dom.clearBtn.addEventListener('touchstart', (e) => this.startHardResetTimer(e), { passive: false });
        dom.clearBtn.addEventListener('mouseup', () => this.cancelHardResetTimer());
        dom.clearBtn.addEventListener('mouseleave', () => this.cancelHardResetTimer());
        dom.clearBtn.addEventListener('touchend', () => this.cancelHardResetTimer());
        
        // === 輸入欄�?事件 ===
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
        
        // === ?��??�板 ===
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', (e) => {
                // 如�?點�??�是?��??��?，�?要觸?��???                if (e.target.classList.contains('lock-btn') || e.target.closest('.lock-btn')) {
                    return;
                }
                const content = document.getElementById(header.id.replace('Header', 'Content'));
                header.classList.toggle('collapsed');
                if (content) content.classList.toggle('active');
            });
        });
        
        // === 彈�??�制 ===
        dom.buttons.showPackage.onclick = () => dom.modals.package.style.display = 'block';
        dom.buttons.showManual.onclick = () => dom.modals.manual.style.display = 'block';
        dom.buttons.showExchange.onclick = () => {
            initExchangeModal(dom);
            dom.modals.exchange.style.display = 'block';
        };
        dom.buttons.showColor.onclick = () => dom.modals.color.style.display = 'block';
        dom.buttons.showChangelog.onclick = () => dom.modals.changelog.style.display = 'block';
        
        // === ?��??�能?��? ===
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
        
        // === 設�??�能事件綁�? ===
        const blockMovementToggle = document.getElementById('enable-block-movement-toggle');
        if (blockMovementToggle) {
            blockMovementToggle.addEventListener('change', (e) => {
                this.toggleBlockMovement(e.target.checked);
            });
        }
        
        // 彈�??��??��?
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.onclick = () => {
                Object.values(dom.modals).forEach(m => m.style.display = 'none');
            };
        });
        
        // 點�?彈�??�景?��?
        window.onclick = (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        };
        
        // === 總�??��?工具 ===
        [dom.exchange.amount, dom.exchange.from, dom.exchange.to].forEach(el => {
            el.addEventListener('input', () => updateExchangeInfo(dom));
        });
        dom.exchange.confirm.addEventListener('click', () => this.performExchange());
        
        // === 顏色?��???===
        Object.values(dom.color.pickers).forEach(picker => {
            picker.addEventListener('input', (e) => this.handleColorChange(e));
        });
        dom.color.resetBtn.addEventListener('click', () => resetColors(dom));
        dom.color.closeBtn.addEventListener('click', () => dom.modals.color.style.display = 'none');
        
        // === 步進器?��? ===
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
        
        // === 結�?微調工具 ===
        const rex = dom.resultExchange;
        rex.performBtn.addEventListener('click', () => this.performResultExchange());
        rex.undoBtn.addEventListener('click', () => this.undoResultExchange());
        rex.resetBtn.addEventListener('click', () => this.resetResultExchanges());
        [rex.fromDenom, rex.fromCount, rex.toDenom].forEach(el => {
            el.addEventListener('input', () => this.updateResultExchangePreview());
        });
        rex.log.addEventListener('click', (e) => this.handleHistoryLogClick(e));
        
        // === ?��??�錢對�?工具 ===
        const cc = dom.coinConsolidation;
        cc.performBtn.addEventListener('click', () => this.performCoinConsolidation());
        [cc.fromDenom, cc.fromCount, cc.toDenom].forEach(el => {
            el.addEventListener('input', () => this.updateCoinConsolidationPreview());
        });
        
        // === ?��??�能事件綁�? ===
        
        // 設�??��?事件
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
        
        // 保�??��?事件
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
        
        // 導出?��?事件
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
    
    // === 事件?��??�數 ===
    
    /**
     * ?��?清除?��?點�?
     */
    handleClearClick() {
        if (!this.isLongPress) {
            this.softClear();
        }
    }
    
    /**
     * ?��??��?輸入
     * @param {Event} e - 輸入事件
     */
    handleAmountInput(e) {
        const input = e.target;
        const denomination = parseInt(input.dataset.denomination, 10);
        const rawValue = input.value.replace(/,/g, '');
        
        // 檢查?�否?�張?�模�?        if (APP_CONFIG.COUNT_MODE_DENOMS.includes(denomination)) {
            input.dataset.isCountMode = /^\d{1,2}$/.test(rawValue) ? 'true' : 'false';
        }
        
        // ?��??�輸??        formatInputWithCommas(input);
        
        // 驗�?並更?��???        this.validateAllInputs();
        this.updateStateFromInputs();
    }
    
    /**
     * ?��??��?輸入失焦
     * @param {Event} e - 失焦事件
     */
    handleAmountBlur(e) {
        const input = e.target;
        
        // 如�??�張?�模式�?轉�??��?�?        if (input.dataset.isCountMode === 'true') {
            const denomination = parseInt(input.dataset.denomination, 10);
            const count = parseInputValue(input.value);
            input.value = formatNumber(count * denomination);
            input.dataset.isCountMode = 'false';
        }
        
        this.validateAllInputs();
        this.updateStateFromInputs();
    }
    
    /**
     * ?��?�??�輸??     */
    handleBagInput() {
        this.validateAllInputs();
        this.updateStateFromInputs();
    }
    
    /**
     * ?��?計�??��?點�?
     */
    handleCalculate() {
        console.log('?��?計�?...');
        
        if (!this.validateAllInputs()) {
            alert('?��??��?輸入?�誤，�?檢查紅色框�?示�?欄�?�?);
            return;
        }
        
        try {
        // ?��?輸入資�?
        const inputs = collectInputs(this.domElements);
            console.log('輸入資�?:', inputs);
        
        // ?��?計�?
        const results = calculateResults(inputs);
            console.log('計�?結�?:', results);
        
        // ?�新?�??        this.stateManager.updateResults(results);
        
            // ?�新 UI - 注�?：�??��??�新UI?�設定工?��?確�??�?�正確傳??        updateUI(results);
        setupResultExchangeTool(this.domElements);
            // ?��?：setupCoinConsolidationTool?�要�??��??��?必�??�入完整?��??��?�?            setupCoinConsolidationTool(this.domElements, this.stateManager.getState());
        
            // 確�?結�??�塊顯�?            setTimeout(() => {
        this.domElements.resultContainer.classList.add('active');
                this.domElements.resultContainer.style.display = 'block';
                console.log('結�??�塊已顯示');
            }, 100);
            
        } catch (error) {
            console.error('計�??��??��??�誤:', error);
            alert('計�??��??��??�誤，�??�新?�試??);
        }
    }
    
    /**
     * 軟�??��??��??�輸?��?結�?�?     */
    softClear() {
        this.stateManager.clearState();
        
        // 清除輸入欄�?
        Object.values(this.domElements.amountInputs).forEach(input => {
            if (input) input.value = '';
        });
        Object.values(this.domElements.bagInputs).forEach(input => {
            if (input) input.value = '';
        });
        
        // 清除?�誤?�??        Object.values(this.domElements.errorMessages).forEach(el => {
            if (el) el.classList.remove('active');
        });
        Object.values(this.domElements.amountInputs).forEach(el => {
            if (el) el.classList.remove('input-error');
        });
        
        // ?�置?��??�??        this.domElements.calculateBtn.disabled = false;
        
        // ?��?結�??�塊�?後�??�?��???- ?��?：恢復�??��??��?完整?�能
        this.domElements.resultContainer.classList.remove('active');
        this.domElements.resultContainer.style.display = 'none';
        console.log('結�??�塊�?後�??�?�已?��?');
        
        // ?�置驗�??�??        document.querySelectorAll('.verify-checkbox').forEach(cb => {
            cb.checked = false;
        });
        if (typeof updateVerificationStatus !== 'undefined') {
            updateVerificationStatus();
        }
    }
    
    /**
     * 硬�?置�??�含顏色設�?�?     */
    hardReset() {
        this.softClear();
        resetColors(this.domElements);
        alert('已徹底�?置工?�並清除?�?�儲存�?資�???);
    }
    
    /**
     * 驗�??�?�輸??     * @returns {boolean} ?�否?�?�輸?�都?��?
     */
    validateAllInputs() {
        // 調用 core-logic.js 中�? validateAllInputs ?�數
        const isValid = window.validateAllInputs ? 
            window.validateAllInputs(this.domElements, {}) : true;
        
        if (this.domElements.calculateBtn) {
        this.domElements.calculateBtn.disabled = !isValid;
        }
        return isValid;
    }
    
    /**
     * 從輸?�更?��???     */
    updateStateFromInputs() {
        updateStateFromInputs(this.stateManager, this.domElements);
    }
    
    /**
     * 載入?��??��???     */
    loadState() {
        if (this.stateManager.loadState()) {
            const state = this.stateManager.getState();
            
            // ?�復輸入欄�?
            restoreInputsFromState(state, this.domElements);
            
            // ?�復結�?顯示
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
     * 模擬?�值輸??     */
    simulateValues() {
        this.softClear();
        
        // 設�?模擬?��?
        const simulateData = {
            1000: '16000',
            500: '17000',
            100: '6100',
            50: '1400',
            10: '910',
            5: '410',
            1: '51'
        };
        
        // 如�??�用了擴展面額�?添�?模擬?��?
        if (APP_CONFIG.SETTINGS.showExtendedDenoms) {
            simulateData[2000] = '10000';
            simulateData[200] = '2400';
        }
        
        // 填入模擬?��?
        Object.entries(simulateData).forEach(([denom, value]) => {
            const input = this.domElements.amountInputs[denom];
            if (input) {
                input.value = formatNumber(value);
            }
        });
        
        // 設�?袋�??��?
        if (this.domElements.bagInputs[50]) this.domElements.bagInputs[50].value = '1';
        if (this.domElements.bagInputs[1]) this.domElements.bagInputs[1].value = '1';
        
        this.updateStateFromInputs();
        this.validateAllInputs();
    }
    
    // === 微調工具?��??�數 ===
    
    /**
     * ?��?結�?微調
     */
    performResultExchange() {
        const rex = this.domElements.resultExchange;
        const fromDenom = parseInt(rex.fromDenom.value, 10);
        const toDenom = parseInt(rex.toDenom.value, 10);
        const fromCount = parseInt(rex.fromCount.value, 10);
        
        const lastResult = this.stateManager.getLatestExchangeResult();
        const swapPath = findValidSwapPath(fromDenom, toDenom, fromCount, lastResult.distribution);
        
        if (!swapPath.possible) {
            alert("?��??��?此交?��?請檢?�數?��??��???);
            return;
        }
        
        // 建�??��???        const newResult = JSON.parse(JSON.stringify(lastResult));
        const toCount = swapPath.countToReceive;
        
        // ?��?交�?
        newResult.distribution.pettyCash[fromDenom] -= fromCount;
        newResult.distribution.revenue[fromDenom] += fromCount;
        newResult.distribution.revenue[toDenom] -= toCount;
        newResult.distribution.pettyCash[toDenom] += toCount;
        
        // 記�??��?
        newResult.lastAction = {
            type: 'main_swap',
            text: `[?��?]${fromDenom}?�x${fromCount} ??[上繳]${toDenom}?�x${toCount}`
        };
        
        // ?�新?�??        this.stateManager.addExchangeHistory(newResult);
        
        // ?�新 UI
        updateUI(newResult, { petty: true, revenue: true });
        this.updateResultExchangePreview();
    }
    
    /**
     * ?�銷結�?微調
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
     * ?�置?�?��??�微�?     */
    resetResultExchanges() {
        if (this.stateManager.resetAllExchanges()) {
            const initialResult = this.stateManager.getLatestExchangeResult();
            updateUI(initialResult);
            this.updateResultExchangePreview();
            this.updateCoinConsolidationPreview();
        }
    }
    
    /**
     * ?�新結�?微調?�覽
     */
    updateResultExchangePreview() {
        updateResultExchangePreview(this.domElements, this.stateManager.getState());
    }
    
    /**
     * ?�新?��??�錢對�??�覽
     */
    updateCoinConsolidationPreview() {
        updateCoinConsolidationPreview(this.domElements, this.stateManager.getState());
    }
    
    /**
     * ?��??��??�錢對�?
     */
    performCoinConsolidation() {
        const cc = this.domElements.coinConsolidation;
        const fromDenom = parseInt(cc.fromDenom.value, 10);
        const toDenom = parseInt(cc.toDenom.value, 10);
        const fromCount = parseInt(cc.fromCount.value, 10);
        
        const lastResult = this.stateManager.getLatestExchangeResult();
        const swapPath = findValidCoinSwapPath(fromDenom, toDenom, fromCount, lastResult.distribution);
        
        if (!swapPath.possible) {
            alert("?��??��?此交?��?請檢?�數?��??��???);
            return;
        }
        
        // 建�??��???        const newResult = JSON.parse(JSON.stringify(lastResult));
        const toCount = swapPath.countToReceive;
        
        // ?��?交�?
        newResult.distribution.revenue[fromDenom] -= fromCount;
        newResult.distribution.pettyCash[fromDenom] += fromCount;
        newResult.distribution.pettyCash[toDenom] -= toCount;
        newResult.distribution.revenue[toDenom] += toCount;
        
        // 記�??��?
        newResult.lastAction = {
            type: 'coin_consolidation',
            text: `[上繳]${fromDenom}?�x${fromCount} ??[?��?]${toDenom}?�x${toCount}`
        };
        
        // ?�新?�??        this.stateManager.addExchangeHistory(newResult);
        
        // ?�新 UI
        updateUI(newResult, { revenue: true, packing: true });
        this.updateCoinConsolidationPreview();
    }
    
    /**
     * ?��?歷史記�?點�?
     * @param {Event} e - 點�?事件
     */
    handleHistoryLogClick(e) {
        const item = e.target.closest('.history-log-item');
        if (item) {
            const index = parseInt(item.dataset.index, 10);
            this.revertToHistoryState(index);
        }
    }
    
    /**
     * ?�復?�歷?��???     * @param {number} index - 歷史記�?索�?
     */
    revertToHistoryState(index) {
        if (this.stateManager.revertToHistoryState(index)) {
            const targetState = this.stateManager.getLatestExchangeResult();
            updateUI(targetState);
            this.updateResultExchangePreview();
            this.updateCoinConsolidationPreview();
        }
    }
    
    // === ?��?工具?�數 ===
    
    /**
     * ?��?總�??��?
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
            alert('請輸?��??��?轉�??��???);
            return;
        }
        
        // ?��?轉�?
        fromInput.value = formatNumber(fromCurrentAmount - amount);
        toInput.value = formatNumber(parseInputValue(toInput.value) + amount);
        
        // ?��?彈�?並更?��???        this.domElements.modals.exchange.style.display = 'none';
        this.updateStateFromInputs();
    }
    
    /**
     * ?��?顏色變更
     * @param {Event} e - 顏色變更事件
     */
    handleColorChange(e) {
        const denom = parseInt(e.target.id.split('-')[1], 10);
        const color = e.target.value;
        applyColor(denom, color);
        this.domElements.color.hexes[denom].textContent = color.toUpperCase();
    }
    
    /**
     * ?��?硬�?置�??�器
     * @param {Event} e - 事件對象
     * 
     * ?��?：此?�數?�要preventDefault來阻止瀏覽?��?認�???     * ?�此對�??��?件監?�器不能設為passive: true
     */
    startHardResetTimer(e) {
        // ?�止默�?行為（�??��??��??�右?�選?��?�?        e.preventDefault();
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
     * ?��?硬�?置�??�器
     */
    cancelHardResetTimer() {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
        
        const progress = this.domElements.clearBtnProgress;
        const text = this.domElements.clearBtnText;
        
        progress.style.transition = 'width 0.2s';
        progress.style.width = '0%';
        text.textContent = '清除?��?;
        
        setTimeout(() => {
            this.isLongPress = false;
        }, 50);
    }
    
    /**
     * ?��??�?��???     * @param {string} action - 變更?��?
     * @param {Object} state - ?��???     */
    handleStateChange(action, state) {
        // ?��?不�??��??��??��?作執行相?��???        switch (action) {
            case 'exchange':
            case 'undo':
            case 'reset':
            case 'revert':
                renderResultExchangeHistory(this.domElements, state);
                break;
            default:
                // ?��??�?��??�暫?��??�要特殊�???                break;
        }
    }
    
    // === ?��??�能事件?��? ===
    
    /**
     * ?��?主�??��?
     */
    handleThemeToggle() {
        const isDark = !APP_CONFIG.SETTINGS.darkMode;
        toggleDarkMode(isDark);
        this.saveSettings();
    }
    
    /**
     * ?��?設�??��?點�?
     */
    handleSettingsClick() {
        this.updateSettingsModal();
        this.domElements.modals.settings.style.display = 'block';
    }
    
    /**
     * ?��?保�??��?點�?
     */
    handleSaveClick() {
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        this.domElements.save.timestamp.textContent = timestamp;
        
        // ?��??��??��?人員?��?
        this.currentSaveMachineNumber = APP_CONFIG.SETTINGS.machineNumber;
        this.updateSaveMachineButtons();
        this.updateSaveStaffSelect();
            
        this.domElements.modals.save.style.display = 'block';
    }
    
    /**
     * ?��?導出?��?點�?
     */
    handleExportClick() {
        if (this.domElements.export.result) {
            this.domElements.export.result.style.display = 'none';
        }
        this.domElements.modals.export.style.display = 'block';
    }
    
    /**
     * ?�新設�?彈�?
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
     * ?��??��??��??��?
     */
    handleExtendedDenomsToggle(e) {
        const show = e.target.checked;
        
        // 如�??��?且�??�值�?警示使用??        if (!show && this.hasExtendedDenomsValues()) {
            const confirmed = confirm('?��?顯示將�?�?2000 ??200 ?��??�輸?�值�??�否繼�?�?);
            if (!confirmed) {
                e.target.checked = true;
                return;
            }
            
            // 清空?��?            if (this.domElements.amountInputs[2000]) {
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
     * 檢查?�否?�擴展面額�??��?     */
    hasExtendedDenomsValues() {
        const val2000 = this.domElements.amountInputs[2000] ? parseInputValue(this.domElements.amountInputs[2000].value) : 0;
        const val200 = this.domElements.amountInputs[200] ? parseInputValue(this.domElements.amountInputs[200].value) : 0;
        return val2000 > 0 || val200 > 0;
    }
    
    /**
     * ?��?機台?��?
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
     * ?��??��?人員
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
     * ?��??�除人員
     */
    handleRemoveStaff(index) {
        if (APP_CONFIG.SETTINGS.staffList.length > 1) {
            APP_CONFIG.SETTINGS.staffList.splice(index, 1);
            this.renderStaffList();
            this.saveSettings();
        }
    }
    
    /**
     * ?��?保�?設�?
     */
    handleSaveSettings() {
        this.saveSettings();
        alert('設�?已�?存�?');
        this.domElements.modals.settings.style.display = 'none';
    }
    
    /**
     * ?��??�置設�?
     */
    handleResetSettings() {
        if (confirm('確�?要恢復�??�設定為?�設?��?�?)) {
            this.resetSettings();
            this.updateSettingsModal();
            alert('設�?已�?置�?');
        }
    }
    
    /**
     * ?��?確�?保�?
     */
    handleConfirmSave() {
        const timestamp = this.domElements.save.timestamp.textContent;
        const machine = this.currentSaveMachineNumber || APP_CONFIG.SETTINGS.machineNumber;
        const staffIndex = parseInt(this.domElements.save.staffSelect.value);
        const staff = APP_CONFIG.SETTINGS.staffList[staffIndex];
        
        if (!this.stateManager.getState().results) {
            alert('請�??��?計�??��?存�?');
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
        
        // ?�新設�?中�?保�?記�??�覽
        this.updateSettingsSavePreview();
        
        alert(`記�?已�?存�?\\n?��?: ${timestamp}\\n機�?: ??{machine}\\n人員: ${staff}`);
        this.renderSaveHistory();
        
        // ?��?：確保�?存�??��??��??�更??        console.log('保�?記�?已更?��??��?記�??��?:', this.saveHistory.length);
        
        this.domElements.modals.save.style.display = 'none';
    }
    
    /**
     * ?��??��?保�?
     */
    handleCancelSave() {
        this.domElements.modals.save.style.display = 'none';
    }
    
    /**
     * ?��?導出設�?
     */
    handleExportSettings() {
        const settingsData = {
            settings: { ...APP_CONFIG.SETTINGS },
            colors: this.getCurrentColors(),
            version: '3.4',
            exportTime: new Date().toISOString()
        };
        
        this.showExportResult(JSON.stringify(settingsData, null, 2), '設�?資�?');
    }
    
    /**
     * ?��?導出歷史
     */
    handleExportHistory() {
        const historyData = {
            saveHistory: this.saveHistory,
            version: '3.4',
            exportTime: new Date().toISOString()
        };
        
        this.showExportResult(JSON.stringify(historyData, null, 2), '歷史資�?');
    }
    
    /**
     * ?��?導出?�??     */
    handleExportAll() {
        const allData = {
            settings: { ...APP_CONFIG.SETTINGS },
            colors: this.getCurrentColors(),
            saveHistory: this.saveHistory,
            currentState: this.stateManager.getState(),
            version: '3.4',
            exportTime: new Date().toISOString()
        };
        
        this.showExportResult(JSON.stringify(allData, null, 2), '完整資�?');
    }
    
    /**
     * ?��?複製導出
     */
    handleCopyExport() {
        const text = this.domElements.export.text.value;
        navigator.clipboard.writeText(text).then(() => {
            alert('已�?製到?�貼?��?');
        }).catch(() => {
            // ?�用?��?
            this.domElements.export.text.select();
            document.execCommand('copy');
            alert('已�?製到?�貼?��?');
        });
    }
    
    /**
     * ?��?下�?導出
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
     * 顯示導出結�?
     */
    showExportResult(data, type) {
        this.domElements.export.text.value = data;
        this.currentExportFilename = `cash-tool-${type}-${new Date().toISOString().slice(0, 10)}.json`;
        this.domElements.export.result.style.display = 'block';
    }
    
    /**
     * ?�置設�?
     */
    resetSettings() {
        APP_CONFIG.SETTINGS = {
            showExtendedDenoms: false,
            darkMode: false,
            machineNumber: 1,
            staffList: ['1??, '2??, '3??]
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
     * ?��??��?顏色
     */
    getCurrentColors() {
        const colors = {};
        [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS].forEach(denom => {
            const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
            colors[denom] = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        });
        return colors;
    }
    
    // === 保�??�能?��? ===
    
    /**
     * ?��?保�?機台?��?
     */
    handleSaveMachineSelect(machineNumber) {
        this.currentSaveMachineNumber = machineNumber;
        this.updateSaveMachineButtons();
    }
    
    /**
     * ?�新保�?機台?��??�??     */
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
     * ?��?保�??��?人員
     */
    handleSaveAddStaff() {
        // ?�段?�輯已被移至設�?彈�???handleAddStaff
        // 保�?彈�?不�??��??��?人員?�能
    }
    
    /**
     * 渲�?保�?人員清單
     */
    renderSaveStaffList() {
        // 此�??�已不�??�要�??�為保�?彈�?不顯示可編輯?�表
    }
    
    /**
     * ?�新保�?人員?��?
     */
    updateSaveStaffSelect() {
        if (!this.domElements.save.staffSelect) return;
        
        const selectEl = this.domElements.save.staffSelect;
        selectEl.innerHTML = APP_CONFIG.SETTINGS.staffList
            .map((staff, index) => `<option value="${index}">${staff}</option>`)
            .join('');
    }
    
    /**
     * 編輯保�?人員?�稱
     */
    editSaveStaffName(index) {
        // 此�??�已移至設�?彈�?
    }
    
    /**
     * ?�除保�?人員
     */
    deleteSaveStaff(index) {
        // 此�??�已移至設�?彈�???handleRemoveStaff
    }
    
    /**
     * 渲�?保�?歷史
     */
    renderSaveHistory() {
        if (!this.domElements.save.historyList) return;
        
        const listEl = this.domElements.save.historyList;
        const countEl = this.domElements.save.historyCount;
        
        if (this.saveHistory.length === 0) {
            listEl.innerHTML = '<p class="no-history">尚無保�?記�?</p>';
            countEl.textContent = '(0)';
            return;
        }
        
        countEl.textContent = `(${this.saveHistory.length})`;
        
        listEl.innerHTML = this.saveHistory.map((record, index) => `
            <div class="history-record">
                <div class="history-info">
                    <div class="history-timestamp">${record.timestamp}</div>
                    <div class="history-details">機�?: ??{record.machine} | 人員: ${record.staff}</div>
                </div>
                <div class="history-actions">
                    <button class="restore-btn" onclick="cashApp.restoreSaveRecord(${index})">復�?</button>
                    <button class="delete-history-btn" onclick="cashApp.deleteSaveRecord(${index})">?�除</button>
                </div>
            </div>
        `).reverse().join('');
    }
    
    /**
     * 復�?保�?記�?
     */
    restoreSaveRecord(index) {
        const record = this.saveHistory[index];
        if (!record) return;
        
        if (confirm(`確�?要復?�到 ${record.timestamp} ?��??��?？\\n?��?清除?��??�輸?��?結�??�`)) {
            // 復�?輸入資�?
            this.restoreInputsFromRecord(record);
            
            // 復�?計�?結�?
            if (record.results) {
                this.stateManager.updateResults(record.results);
                if (record.exchangeHistory) {
                    this.stateManager.state.exchangeHistory = [...record.exchangeHistory];
                }
                
                // ?�新 UI
                updateUI(record.results);
                setupResultExchangeTool(this.domElements);
                setupCoinConsolidationTool(this.domElements);
                this.domElements.resultContainer.classList.add('active');
                this.domElements.resultContainer.style.display = 'block';
            }
            
            // 復�?設�?
            if (record.settings) {
                Object.assign(APP_CONFIG.SETTINGS, record.settings);
                if (typeof toggleDarkMode !== 'undefined') {
                    toggleDarkMode(APP_CONFIG.SETTINGS.darkMode);
                }
                if (typeof toggleExtendedDenominations !== 'undefined') {
                    toggleExtendedDenominations(APP_CONFIG.SETTINGS.showExtendedDenoms);
                }
                this.saveSettings();
            }
            
            alert(`已復?�到 ${record.timestamp} ?��??��?`);
            this.domElements.modals.save.style.display = 'none';
        }
    }
    
    /**
     * 從�??�復?�輸?��???     */
    restoreInputsFromRecord(record) {
        if (!record.inputs) return;
        
        // 清空?�?�輸??        Object.values(this.domElements.amountInputs).forEach(input => {
            if (input) input.value = '';
        });
        Object.values(this.domElements.bagInputs).forEach(input => {
            if (input) input.value = '';
        });
        
        // 復�?輸入?��?
        Object.entries(record.inputs).forEach(([denom, data]) => {
            const amountInput = this.domElements.amountInputs[denom];
            const bagInput = this.domElements.bagInputs[denom];
            
            if (amountInput && data.amount) {
                amountInput.value = formatNumber(data.amount);
            }
            if (bagInput && data.packages) {
                bagInput.value = data.packages.toString();
            }
        });
        
        // ?�新?�??        this.updateStateFromInputs();
        this.validateAllInputs();
    }
    
    /**
     * ?�除保�?記�?
     */
    deleteSaveRecord(index) {
        const record = this.saveHistory[index];
        if (!record) return;
        
        if (confirm(`確�?要刪??${record.timestamp} ?��??��?？`)) {
            this.saveHistory.splice(index, 1);
            this.saveSaveHistory();
            this.renderSaveHistory();
        }
    }
    
    /**
     * ?��??�新增�???     */
    initNewFeatures() {
        // ?��??�区?�移?��???        if (typeof initializeMovableBlocks !== 'undefined') {
            initializeMovableBlocks();
        }
        
        // ?��??��?證�?�?        if (typeof initVerificationBlock !== 'undefined') {
            initVerificationBlock();
        }
        
        // ?��??��?外�?算�???        if (typeof initExtraCalc !== 'undefined') {
            initExtraCalc();
        }
        
        // ?��??�設�?        this.loadSettings();
        
        // 載入保�?歷史
        this.loadSaveHistory();
        
        // ?��??�人?��???        this.renderStaffList();
    }
    
    /**
     * 載入設�?
     */
    loadSettings() {
        const saved = localStorage.getItem('cashTool.settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.assign(APP_CONFIG.SETTINGS, settings);
                
                // ?�用設�?
                if (typeof toggleDarkMode !== 'undefined') {
                    toggleDarkMode(APP_CONFIG.SETTINGS.darkMode);
                }
                if (typeof toggleExtendedDenominations !== 'undefined') {
                    toggleExtendedDenominations(APP_CONFIG.SETTINGS.showExtendedDenoms);
                }
            } catch (error) {
                console.error('載入設�?失�?:', error);
            }
        }
    }
    
    /**
     * 保�?設�?
     */
    saveSettings() {
        localStorage.setItem('cashTool.settings', JSON.stringify(APP_CONFIG.SETTINGS));
    }
    
    /**
     * 渲�?人員清單
     */
    renderStaffList() {
        if (!this.domElements.settings || !this.domElements.settings.staffList) return;
        
        const listEl = this.domElements.settings.staffList;
        listEl.innerHTML = APP_CONFIG.SETTINGS.staffList.map((staff, index) => `
            <div class="staff-item">
                <span>${staff}</span>
                <button onclick="cashApp.handleRemoveStaff(${index})" class="btn btn-clear" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">?�除</button>
            </div>
        `).join('');
    }
    
    /**
     * 載入保�?歷史
     */
    loadSaveHistory() {
        const saved = localStorage.getItem('cashTool.saveHistory');
        if (saved) {
            try {
                this.saveHistory = JSON.parse(saved);
            } catch (error) {
                console.error('載入保�?歷史失�?:', error);
                this.saveHistory = [];
            }
        }
        // ?�新設�?中�?保�?記�??�覽
        this.updateSettingsSavePreview();
    }
    
    /**
     * ?��??�塊移?��???     * @param {boolean} enabled - ?�否?�用
     */
    toggleBlockMovement(enabled) {
        const moveButtons = document.querySelectorAll('.move-buttons');
        moveButtons.forEach(buttons => {
            buttons.style.display = enabled ? 'flex' : 'none';
        });
        
        // 保�?設�???localStorage
        localStorage.setItem('cashTool.blockMovementEnabled', enabled);
        console.log(`?�塊移?��??�已${enabled ? '?�用' : '?�用'}`);
    }
    
    /**
     * ?�新設�?中�?保�?記�??�覽 - ?��?：確保�?存�??��??��??�可??     */
    updateSettingsSavePreview() {
        const countEl = document.getElementById('settings-save-count');
        const previewEl = document.getElementById('settings-save-preview');
        
        if (!countEl || !previewEl) {
            console.warn('?��??��?存�??��?覽�?�?);
            return;
        }
        
        console.log('?�新保�?記�??�覽，當?��??�數??', this.saveHistory.length);
        
        countEl.textContent = `(${this.saveHistory.length})`;
        
        if (this.saveHistory.length === 0) {
            previewEl.innerHTML = '<p class="no-saves">尚無保�?記�?</p>';
        } else {
            const recentSaves = this.saveHistory.slice(-5).reverse(); // 顯示?��?筆�??�?��??��?
            previewEl.innerHTML = recentSaves.map(save => `
                <div class="save-preview-item">
                    <div>
                        <div class="save-preview-time">${save.timestamp}</div>
                        <div class="save-preview-info">機�?${save.machine || save.machineNumber} | ${save.staff || save.staffName}</div>
                    </div>
                </div>
            `).join('');
        }
        
        console.log('保�?記�??�覽已更??);
    }
    
    /**
     * 保�?保�?歷史
     */
    saveSaveHistory() {
        localStorage.setItem('cashTool.saveHistory', JSON.stringify(this.saveHistory));
    }
    
    /**
     * ?��??�設定�???     */
    initSettings() {
        // 載入?�塊移?��??�設�?        const blockMovementEnabled = localStorage.getItem('cashTool.blockMovementEnabled');
        const toggle = document.getElementById('enable-block-movement-toggle');
        
        if (toggle) {
            const enabled = blockMovementEnabled !== 'false'; // ?�設?�true
            toggle.checked = enabled;
            this.toggleBlockMovement(enabled);
        }
    }
}

// === ?�用程�??��? ===
document.addEventListener('DOMContentLoaded', function() {
    // 建�?並�?始�??�用程�?
    const app = new CashManagementApp();
    app.init();
    
    // 將�??��?式實例�?載到?��?（�?供調試使?��?
    if (typeof window !== 'undefined') {
        window.cashApp = app;
    }
});
