/* 現金管理計算工具 - 核心邏輯模組 */

// === 常數配置 ===
const APP_CONFIG = {
    STATE_KEY: 'cashTool.v3.9.state',           // localStorage 鍵值
    PETTY_CASH_TARGET: 20000,                   // 預留零用金目標金額
    LONG_PRESS_DURATION: 5000,                  // 長按重置持續時間（毫秒）
    
    // 包裝規則：定義各種面額包裝方式
    PACKAGING_RULES: { 
        'bundle2000': { value: 20000, count: 10 },  // 2000元10張一捆，20000元
        'bundle200': { value: 4000, count: 20 },    // 200元20張一捆，4000元
        'bundle100': { value: 2000, count: 20 },    // 100元20張一捆，2000元
        'bag50': { value: 2000, count: 40 },        // 50元40枚一袋，2000元
        'bag10': { value: 500, count: 50 },         // 10元50枚一袋，500元
        'bag5': { value: 250, count: 50 },          // 5元50枚一袋，250元
        'bag1': { value: 100, count: 100 }          // 1元100枚一袋，100元
    },
    
    // 面額配置
    BASE_DENOMINATIONS: [1000, 500, 100, 50, 10, 5, 1],  // 基本支援的面額
    EXTENDED_DENOMINATIONS: [2000, 200],                  // 擴展面額（可選）
    COIN_DENOMINATIONS: [50, 10, 5, 1],                   // 硬幣面額
    COUNT_MODE_DENOMS: [2000, 1000, 500, 200, 100],       // 支援張數快輸模式的面額
    REVENUE_ONLY_DENOMS: [2000, 200],                     // 僅能放在營收的面額
    
    // 應用程式設定
    SETTINGS: {
        showExtendedDenoms: false,  // 是否顯示2000和200面額
        darkMode: false,            // 深色模式
        machineNumber: 1,           // 機號
        staffList: ['1號', '2號', '3號']  // 人員清單
    },
    
    // 預設顏色主題
    DEFAULT_COLORS: { 
        2000: '#8e24aa',    // 紫色
        1000: '#3D93F0',    // 藍色
        500: '#C6A27B',     // 棕色
        200: '#ff7043',     // 橙色
        100: '#DE4545',     // 紅色
        50: '#DAA520',      // 金色
        10: '#453A3A',      // 深灰
        5: '#A3A3A3',       // 灰色
        1: '#790C0C'        // 深紅
    }
};

/**
 * 取得目前支援的面額列表（包括動態擴展面額）
 * @returns {Array} 支援的面額陣列
 */
function getSupportedDenominations() {
    let denoms = [...APP_CONFIG.BASE_DENOMINATIONS];
    if (APP_CONFIG.SETTINGS.showExtendedDenoms) {
        denoms = [...APP_CONFIG.EXTENDED_DENOMINATIONS, ...denoms];
        denoms.sort((a, b) => b - a); // 從大到小排序
    }
    return denoms;
}

// === 輸入驗證函數 ===

/**
 * 驗證所有輸入是否有效
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 當前狀態
 * @returns {boolean} 是否所有輸入都有效
 */
function validateAllInputs(domElements, state) {
    let allValid = true;
    const supportedDenoms = getSupportedDenominations();
    
    supportedDenoms.forEach(denom => {
        const inputEl = domElements.amountInputs[denom];
        const errorEl = domElements.errorMessages[denom];
        
        if (!inputEl || !errorEl) return;
        
        const amount = parseInputValue(inputEl.value);
        const bagInput = domElements.bagInputs[denom];
        let packageAmount = 0;
        
        if (bagInput) {
            const packages = parseInputValue(bagInput.value);
            if (packages > 0) {
                const packageKey = `${bagInput.dataset.packageType}${denom}`;
                if (APP_CONFIG.PACKAGING_RULES[packageKey]) {
                    packageAmount = packages * APP_CONFIG.PACKAGING_RULES[packageKey].value;
                }
            }
        }
        
        const totalAmount = amount + packageAmount;
        
        if (totalAmount > 0 && totalAmount % denom !== 0) {
            allValid = false;
            inputEl.classList.add('input-error');
            errorEl.textContent = `總額必須是 ${denom} 的倍數`;
            errorEl.classList.add('active');
        } else {
            inputEl.classList.remove('input-error');
            errorEl.classList.remove('active');
        }
    });
    
    return allValid;
}

/**
 * 收集所有輸入資料
 * @param {Object} domElements - DOM 元素集合
 * @returns {Object} 收集到的輸入資料
 */
function collectInputs(domElements) {
    const inputs = {};
    const supportedDenoms = getSupportedDenominations();
    
    supportedDenoms.forEach(denom => {
        const amountInput = domElements.amountInputs[denom];
        const bagInput = domElements.bagInputs[denom];
        
        if (!amountInput) return;
        
        const amount = parseInputValue(amountInput.value);
        const packages = bagInput ? parseInputValue(bagInput.value) : 0;
        
        let packageAmount = 0;
        if (packages > 0 && bagInput) {
            const packageKey = `${bagInput.dataset.packageType}${denom}`;
            if (APP_CONFIG.PACKAGING_RULES[packageKey]) {
                packageAmount = packages * APP_CONFIG.PACKAGING_RULES[packageKey].value;
            }
        }
        
        const totalAmount = amount + packageAmount;
        inputs[denom] = { 
            amount: amount,
            packages: packages,
            packageAmount: packageAmount,
            totalAmount: totalAmount,
            count: Math.floor(totalAmount / denom) 
        };
    });
    
    return inputs;
}

// === 計算邏輯函數 ===

/**
 * 執行主要計算邏輯
 * @param {Object} inputs - 輸入資料
 * @returns {Object} 計算結果
 */
function calculateResults(inputs) {
    const results = {};
    const supportedDenoms = getSupportedDenominations();
    
    // 儲存初始輸入
    results.initialInputs = JSON.parse(JSON.stringify(inputs));
    
    // 計算總金額
    results.totalAmount = supportedDenoms.reduce((sum, denom) => sum + inputs[denom].totalAmount, 0);
    
    // 計算硬幣相關資料
    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce((sum, denom) => sum + inputs[denom].totalAmount, 0);
    results.movedCoinsAmount = totalCoinsAmount % 100;
    results.keptCoinsAmount = totalCoinsAmount - results.movedCoinsAmount;
    
    // 取得硬幣分解詳情
    results.movedCoinsBreakdown = getCoinsBreakdown(
        results.movedCoinsAmount, 
        APP_CONFIG.COIN_DENOMINATIONS.reduce((acc, denom) => {
            acc[denom] = inputs[denom].totalAmount;
            return acc;
        }, {})
    );
    
    // 計算預留零用金的紙鈔需求
    const remainingCashNeeded = APP_CONFIG.PETTY_CASH_TARGET - results.keptCoinsAmount;
    let pettyCashPaperDetails = { used100: 0, used500: 0, amount: 0 };
    
    if (remainingCashNeeded > 0) {
        const combo = findOptimalCombination(
            remainingCashNeeded, 
            inputs[100].count, 
            inputs[500].count
        );
        
        if (combo.found) {
            pettyCashPaperDetails = { 
                used100: combo.used100, 
                used500: combo.used500, 
                amount: combo.amount100 + combo.amount500 
            };
        } else {
            // 備用方案：盡量使用可用的紙鈔
            const used500 = Math.min(inputs[500].count, Math.floor(remainingCashNeeded / 500));
            const stillNeeded = remainingCashNeeded - (used500 * 500);
            const used100 = Math.min(inputs[100].count, Math.floor(stillNeeded / 100));
            pettyCashPaperDetails = { 
                used100, 
                used500, 
                amount: (used100 * 100) + (used500 * 500) 
            };
        }
    }
    
    // 計算最終結果
    results.actualPettyCash = results.keptCoinsAmount + pettyCashPaperDetails.amount;
    results.revenueAmount = results.totalAmount - results.actualPettyCash;
    results.balanceGap = APP_CONFIG.PETTY_CASH_TARGET - results.actualPettyCash;
    
    // 分配各面額到預留金和營收
    results.distribution = { pettyCash: {}, revenue: {} };
    
    supportedDenoms.forEach(denom => {
        let pettyCashCount = 0;
        
        // 特殊處理：2000和200面額只能放在營收
        if (APP_CONFIG.REVENUE_ONLY_DENOMS.includes(denom)) {
            pettyCashCount = 0;
        } else if (denom === 100) {
            pettyCashCount = pettyCashPaperDetails.used100;
        } else if (denom === 500) {
            pettyCashCount = pettyCashPaperDetails.used500;
        } else if (APP_CONFIG.COIN_DENOMINATIONS.includes(denom)) {
            pettyCashCount = inputs[denom].count - (results.movedCoinsBreakdown[denom] || 0);
        }
        
        results.distribution.pettyCash[denom] = pettyCashCount;
        results.distribution.revenue[denom] = inputs[denom].count - pettyCashCount;
    });
    
    return results;
}

/**
 * 找到硬幣分解的最佳組合
 * @param {number} targetAmount - 目標金額
 * @param {Object} availableAmounts - 可用的硬幣金額
 * @returns {Object} 分解結果
 */
function getCoinsBreakdown(targetAmount, availableAmounts) {
    let remaining = targetAmount;
    const result = { 50: 0, 10: 0, 5: 0, 1: 0 };
    
    for (const denom of APP_CONFIG.COIN_DENOMINATIONS) {
        const availableCount = Math.floor(availableAmounts[denom] / denom);
        const neededCount = Math.floor(remaining / denom);
        const usedCount = Math.min(availableCount, neededCount);
        
        result[denom] = usedCount;
        remaining -= usedCount * denom;
        
        if (remaining <= 0) break;
    }
    
    return result;
}

/**
 * 找到最優的紙鈔組合
 * @param {number} remainingCashNeeded - 需要的現金數量
 * @param {number} available100Count - 可用的100元張數
 * @param {number} available500Count - 可用的500元張數
 * @returns {Object} 組合結果
 */
function findOptimalCombination(remainingCashNeeded, available100Count, available500Count) {
    // 嘗試各種100元的數量，找到能被500元整除的組合
    for (let i = available100Count; i >= 0; i--) {
        const amount100 = i * 100;
        const remainingFor500 = remainingCashNeeded - amount100;
        
        if (remainingFor500 >= 0 && remainingFor500 % 500 === 0) {
            const needed500Count = remainingFor500 / 500;
            
            if (needed500Count <= available500Count) {
                return { 
                    found: true, 
                    used100: i, 
                    used500: needed500Count, 
                    amount100, 
                    amount500: remainingFor500 
                };
            }
        }
    }
    
    return { found: false };
}

/**
 * 計算包裝資訊
 * @param {number} totalCount - 總數量
 * @param {number} denomination - 面額
 * @returns {Object} 包裝資訊
 */
function calculatePackages(totalCount, denomination) {
    let packageKey = '';
    
    if (denomination === 2000) packageKey = 'bundle2000';
    else if (denomination === 200) packageKey = 'bundle200';
    else if (denomination === 100) packageKey = 'bundle100';
    else if (denomination <= 50) packageKey = `bag${denomination}`;
    else return { packages: 0, loose: totalCount, looseAmount: totalCount * denomination };
    
    const rule = APP_CONFIG.PACKAGING_RULES[packageKey];
    if (!rule) return { packages: 0, loose: totalCount, looseAmount: totalCount * denomination };
    
    const packages = Math.floor(totalCount / rule.count);
    const loose = totalCount % rule.count;
    
    return { 
        packages, 
        loose, 
        looseAmount: loose * denomination 
    };
}

// === 微調工具邏輯 ===

/**
 * 找到有效的交換路徑（預留金 ⇄ 營收）
 * @param {number} fromDenom - 來源面額
 * @param {number} toDenom - 目標面額
 * @param {number} fromCount - 交換數量
 * @param {Object} distribution - 當前分配
 * @returns {Object} 交換可行性結果
 */
function findValidSwapPath(fromDenom, toDenom, fromCount, distribution) {
    if (fromCount <= 0 || fromDenom === toDenom) {
        return { possible: false };
    }
    
    const amountToSwap = fromCount * fromDenom;
    if (amountToSwap % toDenom !== 0) {
        return { possible: false };
    }
    
    const toCount = amountToSwap / toDenom;
    
    // 檢查預留金中是否有足夠的fromDenom，以及營收中是否有足夠的toDenom
    if (distribution.pettyCash[fromDenom] >= fromCount && distribution.revenue[toDenom] >= toCount) {
        return { possible: true, countToReceive: toCount };
    }
    
    return { possible: false };
}

/**
 * 找到有效的硬幣交換路徑（上繳區 ⇄ 打包區）
 * @param {number} fromDenom - 來源面額
 * @param {number} toDenom - 目標面額
 * @param {number} fromCount - 交換數量
 * @param {Object} distribution - 當前分配
 * @returns {Object} 交換可行性結果
 */
function findValidCoinSwapPath(fromDenom, toDenom, fromCount, distribution) {
    if (fromCount <= 0 || fromDenom === toDenom) {
        return { possible: false };
    }
    
    const amountToSwap = fromCount * fromDenom;
    if (amountToSwap % toDenom !== 0) {
        return { possible: false };
    }
    
    const toCount = amountToSwap / toDenom;
    
    // 檢查上繳區是否有足夠的fromDenom
    const revenueHasEnough = distribution.revenue[fromDenom] >= fromCount;
    
    // 檢查打包區是否有足夠的toDenom（考慮包裝後的散裝數量）
    const packingHasEnough = calculatePackages(distribution.pettyCash[toDenom], toDenom).loose >= toCount;
    
    if (revenueHasEnough && packingHasEnough) {
        return { possible: true, countToReceive: toCount };
    }
    
    return { possible: false };
}

// === 工具函數 ===

/**
 * 格式化金額顯示
 * @param {number} number - 數字
 * @returns {string} 格式化的金額字串
 */
function formatMoney(number) { 
    return new Intl.NumberFormat('zh-TW').format(number || 0) + ' 元'; 
}

/**
 * 格式化數字顯示
 * @param {number} number - 數字
 * @returns {string} 格式化的數字字串
 */
function formatNumber(number) { 
    const num = parseFloat(String(number).replace(/,/g, '')); 
    return isNaN(num) ? '' : new Intl.NumberFormat('zh-TW').format(num); 
}

/**
 * 解析輸入值為數字
 * @param {string} input - 輸入字串
 * @returns {number} 解析後的數字
 */
function parseInputValue(input) { 
    return parseInt(String(input).replace(/,/g, ''), 10) || 0; 
}

/**
 * 格式化輸入框為千分位格式
 * @param {HTMLElement} input - 輸入框元素
 */
function formatInputWithCommas(input) { 
    const cursorPos = input.selectionStart; 
    const originalLength = input.value.length; 
    input.value = formatNumber(input.value.replace(/[^\d]/g, '')); 
    const newLength = input.value.length; 
    input.setSelectionRange(
        cursorPos + (newLength - originalLength), 
        cursorPos + (newLength - originalLength)
    ); 
}

/**
 * 應用顏色到CSS變數
 * @param {number} denom - 面額
 * @param {string} color - 顏色值
 */
function applyColor(denom, color) {
    const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
    document.documentElement.style.setProperty(varName, color);
}

/**
 * 重置顏色為預設值
 * @param {Object} domElements - DOM 元素集合
 */
function resetColors(domElements) {
    Object.entries(APP_CONFIG.DEFAULT_COLORS).forEach(([denom, color]) => {
        applyColor(parseInt(denom), color);
    });
    // 如果顏色選擇器存在，也要更新它們的值
    if (domElements && domElements.color) {
        initColorPickers(domElements);
    }
}

/**
 * 初始化顏色選擇器
 * @param {Object} domElements - DOM 元素集合
 */
function initColorPickers(domElements) {
    const supportedDenoms = getSupportedDenominations();
    supportedDenoms.forEach(denom => {
        const picker = domElements.color.pickers[denom];
        const hex = domElements.color.hexes[denom];
        
        if (picker && hex) {
            const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
            const color = getComputedStyle(document.documentElement)
                          .getPropertyValue(varName).trim() || APP_CONFIG.DEFAULT_COLORS[denom];
            picker.value = color;
            hex.textContent = color.toUpperCase();
        }
    });
}

// === 狀態管理輔助函數 ===

/**
 * 從輸入更新狀態
 * @param {Object} stateManager - 狀態管理器
 * @param {Object} domElements - DOM 元素集合
 */
function updateStateFromInputs(stateManager, domElements) {
    const inputs = {};
    const supportedDenoms = getSupportedDenominations();
    
    supportedDenoms.forEach(denom => {
        const amountInput = domElements.amountInputs[denom];
        const bagInput = domElements.bagInputs[denom];
        
        if (amountInput) {
            inputs[denom] = { 
                amount: parseInputValue(amountInput.value),
                packages: bagInput ? parseInputValue(bagInput.value) : 0 
            };
        }
    });
    
    stateManager.updateInputs(inputs);
}

/**
 * 從狀態恢復輸入欄位
 * @param {Object} state - 狀態對象
 * @param {Object} domElements - DOM 元素集合
 */
function restoreInputsFromState(state, domElements) {
    if (!state.inputs) return;
    
    Object.entries(state.inputs).forEach(([denom, data]) => {
        const amountInput = domElements.amountInputs[denom];
        const bagInput = domElements.bagInputs[denom];
        
        if (amountInput && data.amount) {
            amountInput.value = formatNumber(data.amount);
        }
        if (bagInput && data.packages) {
            bagInput.value = data.packages.toString();
        }
    });
}

// === 擴展面額管理 ===

/**
 * 切換擴展面額的顯示
 * @param {boolean} show - 是否顯示
 */
function toggleExtendedDenominations(show) {
    APP_CONFIG.SETTINGS.showExtendedDenoms = show;
    
    // 更新 UI 顯示
    document.querySelectorAll('.extended-denom').forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
    
    document.querySelectorAll('.extended-option').forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
    
    document.querySelectorAll('.extended-color').forEach(el => {
        el.style.display = show ? 'flex' : 'none';
    });
}

/**
 * 切換深色模式
 * @param {boolean} isDark - 是否為深色模式
 */
function toggleDarkMode(isDark) {
    APP_CONFIG.SETTINGS.darkMode = isDark;
    
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-icon').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelector('.theme-icon').textContent = '🌙';
    }
}

// === 區塊移動功能 ===

/**
 * 初始化可移動區塊功能
 */
function initializeMovableBlocks() {
    addMoveButtons();
    bindMoveEvents();
}

/**
 * 為所有可移動區塊添加移動按鈕
 */
function addMoveButtons() {
    const movableBlocks = document.querySelectorAll('.movable-block');
    movableBlocks.forEach((block, index) => {
        // 跳過輸入區塊
        if (block.id === 'input-section') return;
        
        const moveButtons = document.createElement('div');
        moveButtons.className = 'move-buttons';
        moveButtons.innerHTML = `
            <button class="move-btn move-up" title="向上移動" data-direction="up">▲</button>
            <button class="move-btn move-down" title="向下移動" data-direction="down">▼</button>
        `;
        
        block.appendChild(moveButtons);
    });
}

/**
 * 綁定移動事件
 */
function bindMoveEvents() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('move-btn')) {
            const direction = e.target.dataset.direction;
            const block = e.target.closest('.movable-block');
            moveBlock(block, direction);
        }
    });
}

/**
 * 移動區塊
 * @param {HTMLElement} block - 要移動的區塊
 * @param {string} direction - 移動方向 ('up' 或 'down')
 */
function moveBlock(block, direction) {
    const parent = block.parentNode;
    const siblings = Array.from(parent.children).filter(child => 
        child.classList.contains('movable-block') && child.id !== 'input-section'
    );
    
    const currentIndex = siblings.indexOf(block);
    
    if (direction === 'up' && currentIndex > 0) {
        parent.insertBefore(block, siblings[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
        parent.insertBefore(siblings[currentIndex + 1], block);
    }
}

// === 驗證功能 ===

/**
 * 初始化驗證區塊
 */
function initVerificationBlock() {
    const checkboxes = document.querySelectorAll('.verify-checkbox');
    console.log(`找到 ${checkboxes.length} 個驗證核取方塊`);

    checkboxes.forEach((checkbox, index) => {
        // 移除舊的事件監聽器（如果存在）
        checkbox.removeEventListener('change', updateVerificationStatus);

        // 添加新的事件監聽器
        checkbox.addEventListener('change', (e) => {
            console.log(`核取方塊 ${index + 1} 狀態變更:`, e.target.checked);
            updateVerificationStatus();
        });

        // 確保初始狀態正確
        checkbox.checked = false;
    });

    // 初始化狀態顯示
    updateVerificationStatus();
    console.log('驗證區塊初始化完成');
}

/**
 * 更新驗證狀態顯示
 */
function updateVerificationStatus() {
    const checkboxes = document.querySelectorAll('.verify-checkbox');
    const countEl = document.getElementById('verification-count');
    
    if (!countEl) {
        console.warn('找不到驗證計數元素');
        return;
    }
    
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    
    countEl.textContent = `${checkedCount}/${totalCount}`;
    console.log(`驗證狀態已更新: ${checkedCount}/${totalCount}`);
}

// === 額外計算功能 ===

/**
 * 初始化額外計算功能
 */
function initExtraCalc() {
    const container = document.getElementById('extraCalcContent');
    const lockBtn = document.getElementById('lock-btn');
    const inputs = document.querySelectorAll('.extra-calc-input');

    // 鎖定功能 - 重要：確保事件監聽器正確綁定
    if (lockBtn) {
        // 移除可能存在的舊監聽器
        lockBtn.removeEventListener('click', toggleExtraCalcLock);
        // 添加新的監聽器
        lockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleExtraCalcLock();
        });
        console.log('鎖定按鈕事件監聽器已綁定');
    } else {
        console.warn('找不到鎖定按鈕元素');
    }

    // 輸入框事件
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            formatInputWithCommas(input);
            updateExtraCalc();
        });
    });

    // 初始化狀態
    updateExtraCalc();
}

/**
 * 切換額外計算鎖定狀態
 */
function toggleExtraCalcLock() {
    const inputs = document.querySelectorAll('.extra-calc-input');
    const lockBtn = document.getElementById('lock-btn');
    
    if (!lockBtn) return;
    
    const isLocked = lockBtn.textContent === '🔒';
    
    inputs.forEach(input => {
        input.disabled = !isLocked;
    });
    
    lockBtn.textContent = isLocked ? '🔓' : '🔒';
    console.log('額外計算鎖定狀態:', isLocked ? '已解鎖' : '已鎖定');
}

/**
 * 更新額外計算結果
 */
function updateExtraCalc() {
    const reportTotalEl = document.getElementById('report-total');
    const collectAmountEl = document.getElementById('collect-amount');
    const pcAmountEl = document.getElementById('pc-amount');
    const resultEl = document.getElementById('extra-calc-result');
    
    if (!reportTotalEl || !collectAmountEl || !pcAmountEl || !resultEl) return;
    
    const reportTotal = parseInputValue(reportTotalEl.value);
    const collectAmount = parseInputValue(collectAmountEl.value);
    const pcAmount = parseInputValue(pcAmountEl.value);
    
    // 修正計算邏輯：
    // 1. 帳表總額會減去總金額的欄位數值：reportTotal - collectAmount
    // 2. PC的部分則是：pcAmount - collectAmount
    // 3. 最終結果考慮同時輸入的可能性
    let result = 0;

    // 代收計算：總金額超出報表總額的部分（正數表示多收）
    const collectionDiff = collectAmount - reportTotal;

    // PC計算：PC金額與總金額的差額（負數表示需要從帳表扣除）
    const pcDiff = pcAmount - collectAmount;

    // 綜合計算結果
    result = collectionDiff + pcDiff;
    resultEl.textContent = `計算結果：${formatMoney(result)}`;
}

/**
 * 匯入總金額到額外計算
 */
function importTotalAmount() {
    const totalAmountEl = document.getElementById('total-amount');
    const collectAmountEl = document.getElementById('collect-amount');
    
    if (!totalAmountEl || !collectAmountEl) return;
    
    const totalAmount = parseInputValue(totalAmountEl.textContent.replace(' 元', ''));
    collectAmountEl.value = formatNumber(totalAmount);
    updateExtraCalc();
}

// === 匯出全域函數供 HTML 使用 ===
window.importTotalAmount = importTotalAmount;