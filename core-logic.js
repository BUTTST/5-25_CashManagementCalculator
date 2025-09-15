/* 現金管理計算工具 - 核心邏輯模組 */

// === 常數與配置 ===
const APP_CONFIG = {
    STATE_KEY: 'cashTool.v2.6.state',           // localStorage 儲存鍵值
    PETTY_CASH_TARGET: 20000,                   // 預留零用金目標金額
    LONG_PRESS_DURATION: 5000,                  // 長按重置的持續時間（毫秒）
    
    // 包裝規則：定義各面額的包裝方式
    PACKAGING_RULES: { 
        'bundle100': { value: 2000, count: 20 },    // 100元：20張一捆，價值2000元
        'bag50': { value: 2000, count: 40 },        // 50元：40枚一袋，價值2000元
        'bag10': { value: 500, count: 50 },         // 10元：50枚一袋，價值500元
        'bag5': { value: 250, count: 50 },          // 5元：50枚一袋，價值250元
        'bag1': { value: 100, count: 100 }          // 1元：100枚一袋，價值100元
    },
    
    // 面額配置
    DENOMINATIONS: [1000, 500, 100, 50, 10, 5, 1],     // 所有支援的面額
    COIN_DENOMINATIONS: [50, 10, 5, 1],                 // 硬幣面額
    COUNT_MODE_DENOMS: [1000, 500, 100],                // 支援張數快輸模式的面額
    
    // 預設顏色主題
    DEFAULT_COLORS: { 
        1000: '#3D93F0',    // 藍色
        500: '#C6A27B',     // 棕色
        100: '#DE4545',     // 紅色
        50: '#DAA520',      // 金色
        10: '#453A3A',      // 深灰
        5: '#A3A3A3',       // 灰色
        1: '#790C0C'        // 深紅
    }
};

// === 核心計算函數 ===

/**
 * 收集所有輸入資料並進行加總計算
 * @param {Object} domInputs - DOM 輸入元素集合
 * @returns {Object} 處理後的輸入資料
 */
function collectInputs(domInputs) {
    const inputs = {};
    
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        // 取得金額輸入值
        const amount = parseInputValue(domInputs.amountInputs[denom].value);
        
        // 取得包裝輸入值（袋/捆數量）
        const packages = domInputs.bagInputs[denom] ? 
            parseInputValue(domInputs.bagInputs[denom].value) : 0;
        
        // 計算包裝金額
        let packageAmount = 0;
        if (packages > 0 && domInputs.bagInputs[denom]) {
            const packageKey = `${domInputs.bagInputs[denom].dataset.packageType}${denom}`;
            if (APP_CONFIG.PACKAGING_RULES[packageKey]) {
                packageAmount = packages * APP_CONFIG.PACKAGING_RULES[packageKey].value;
            }
        }
        
        // 計算總金額和數量
        const totalAmount = amount + packageAmount;
        inputs[denom] = { 
            totalAmount, 
            count: Math.floor(totalAmount / denom) 
        };
    });
    
    return inputs;
}

/**
 * 執行核心計算邏輯
 * @param {Object} inputs - 輸入資料
 * @returns {Object} 完整的計算結果
 */
function calculateResults(inputs) {
    const results = {};
    
    // 保存原始輸入資料
    results.initialInputs = JSON.parse(JSON.stringify(inputs));
    
    // 計算總金額
    results.totalAmount = APP_CONFIG.DENOMINATIONS.reduce(
        (sum, denom) => sum + inputs[denom].totalAmount, 0
    );
    
    // === 零錢處理邏輯 ===
    // 計算所有硬幣的總金額
    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce(
        (sum, denom) => sum + inputs[denom].totalAmount, 0
    );
    
    // 計算需要移入營收的零頭（不足100元的部分）
    results.movedCoinsAmount = totalCoinsAmount % 100;
    
    // 計算保留的硬幣金額（可湊成百元的部分）
    results.keptCoinsAmount = totalCoinsAmount - results.movedCoinsAmount;
    
    // 計算零錢的詳細分解
    results.movedCoinsBreakdown = getCoinsBreakdown(
        results.movedCoinsAmount, 
        {
            50: inputs[50].totalAmount,
            10: inputs[10].totalAmount,
            5: inputs[5].totalAmount,
            1: inputs[1].totalAmount
        }
    );
    
    // === 預留零用金分配邏輯 ===
    // 計算還需要多少現金才能達到目標預留金
    const remainingCashNeeded = APP_CONFIG.PETTY_CASH_TARGET - results.keptCoinsAmount;
    
    let pettyCashPaperDetails = { used100: 0, used500: 0, amount: 0 };
    
    if (remainingCashNeeded > 0) {
        // 使用最佳組合演算法找出紙鈔分配方案
        const combo = findOptimalCombination(
            remainingCashNeeded, 
            inputs[100].count, 
            inputs[500].count
        );
        
        if (combo.found) {
            // 找到完美組合
            pettyCashPaperDetails = { 
                used100: combo.used100, 
                used500: combo.used500, 
                amount: combo.amount100 + combo.amount500 
            };
        } else {
            // 無法完美湊齊，使用貪心策略
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
    
    // 計算實際預留零用金總額
    results.actualPettyCash = results.keptCoinsAmount + pettyCashPaperDetails.amount;
    
    // 計算營收上繳金額
    results.revenueAmount = results.totalAmount - results.actualPettyCash;
    
    // 計算與目標的差額
    results.balanceGap = APP_CONFIG.PETTY_CASH_TARGET - results.actualPettyCash;
    
    // === 各面額分配結果 ===
    results.distribution = { pettyCash: {}, revenue: {} };
    
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        let pettyCashCount = 0;
        
        // 根據面額類型分配數量
        if (denom === 100) {
            pettyCashCount = pettyCashPaperDetails.used100;
        } else if (denom === 500) {
            pettyCashCount = pettyCashPaperDetails.used500;
        } else if (APP_CONFIG.COIN_DENOMINATIONS.includes(denom)) {
            // 硬幣：總數減去移入營收的數量
            pettyCashCount = inputs[denom].count - (results.movedCoinsBreakdown[denom] || 0);
        }
        
        results.distribution.pettyCash[denom] = pettyCashCount;
        results.distribution.revenue[denom] = inputs[denom].count - pettyCashCount;
    });
    
    return results;
}

/**
 * 找出最佳的100元和500元組合來湊出指定金額
 * 策略：優先使用100元，再用500元輔助
 * @param {number} remainingCashNeeded - 需要湊出的金額
 * @param {number} available100Count - 可用的100元張數
 * @param {number} available500Count - 可用的500元張數
 * @returns {Object} 組合結果
 */
function findOptimalCombination(remainingCashNeeded, available100Count, available500Count) {
    // 從最多100元開始嘗試，逐步減少
    for (let i = available100Count; i >= 0; i--) {
        const amount100 = i * 100;
        const remainingFor500 = remainingCashNeeded - amount100;
        
        // 檢查剩餘金額是否能被500整除
        if (remainingFor500 >= 0 && remainingFor500 % 500 === 0) {
            const needed500Count = remainingFor500 / 500;
            
            // 檢查是否有足夠的500元
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
 * 使用貪心演算法將指定金額分解為硬幣
 * @param {number} targetAmount - 目標金額
 * @param {Object} availableAmounts - 各面額可用金額
 * @returns {Object} 分解結果
 */
function getCoinsBreakdown(targetAmount, availableAmounts) {
    let remaining = targetAmount;
    const result = { 50: 0, 10: 0, 5: 0, 1: 0 };
    
    // 從大面額開始分解
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
 * 計算包裝資訊（整包數和散裝數）
 * @param {number} totalCount - 總數量
 * @param {number} denomination - 面額
 * @returns {Object} 包裝資訊
 */
function calculatePackages(totalCount, denomination) {
    let packageKey = '';
    
    // 確定包裝類型
    if (denomination === 100) {
        packageKey = 'bundle100';
    } else if (denomination <= 50) {
        packageKey = `bag${denomination}`;
    } else {
        // 不支援包裝的面額
        return { 
            packages: 0, 
            loose: totalCount, 
            looseAmount: totalCount * denomination 
        };
    }
    
    const rule = APP_CONFIG.PACKAGING_RULES[packageKey];
    if (!rule) {
        return { 
            packages: 0, 
            loose: totalCount, 
            looseAmount: totalCount * denomination 
        };
    }
    
    // 計算整包數和散裝數
    const packages = Math.floor(totalCount / rule.count);
    const loose = totalCount % rule.count;
    
    return { 
        packages, 
        loose, 
        looseAmount: loose * denomination 
    };
}

// === 輸入驗證函數 ===

/**
 * 驗證所有輸入的有效性
 * @param {Object} domInputs - DOM 輸入元素
 * @param {Object} inputs - 處理後的輸入資料
 * @returns {boolean} 是否所有輸入都有效
 */
function validateAllInputs(domInputs, inputs) {
    let allValid = true;
    
    for (const denomStr in inputs) {
        const denom = parseInt(denomStr, 10);
        const { totalAmount } = inputs[denom];
        const inputEl = domInputs.amountInputs[denom];
        const errorEl = domInputs.errorMessages[denom];
        
        // 檢查總額是否為面額的倍數
        if (totalAmount % denom !== 0) {
            allValid = false;
            inputEl.classList.add('input-error');
            errorEl.textContent = `總額必須是 ${denom} 的倍數`;
            errorEl.classList.add('active');
        } else {
            inputEl.classList.remove('input-error');
            errorEl.classList.remove('active');
        }
    }
    
    return allValid;
}

// === 微調工具邏輯 ===

/**
 * 尋找有效的交換路徑（預留金 ⇄ 營收）
 * @param {number} fromDenom - 轉出面額
 * @param {number} toDenom - 轉入面額
 * @param {number} fromCount - 轉出數量
 * @param {Object} distribution - 當前分配狀況
 * @returns {Object} 交換可行性結果
 */
function findValidSwapPath(fromDenom, toDenom, fromCount, distribution) {
    // 基本驗證
    if (fromCount <= 0 || fromDenom === toDenom) {
        return { possible: false };
    }
    
    const amountToSwap = fromCount * fromDenom;
    
    // 檢查是否能整除
    if (amountToSwap % toDenom !== 0) {
        return { possible: false };
    }
    
    const toCount = amountToSwap / toDenom;
    
    // 檢查庫存是否足夠
    if (distribution.pettyCash[fromDenom] >= fromCount && 
        distribution.revenue[toDenom] >= toCount) {
        return { possible: true, countToReceive: toCount };
    }
    
    return { possible: false };
}

/**
 * 尋找有效的硬幣交換路徑（上繳區 ⇄ 打包區）
 * @param {number} fromDenom - 轉出面額
 * @param {number} toDenom - 轉入面額
 * @param {number} fromCount - 轉出數量
 * @param {Object} distribution - 當前分配狀況
 * @returns {Object} 交換可行性結果
 */
function findValidCoinSwapPath(fromDenom, toDenom, fromCount, distribution) {
    // 基本驗證
    if (fromCount <= 0 || fromDenom === toDenom) {
        return { possible: false };
    }
    
    const amountToSwap = fromCount * fromDenom;
    
    // 檢查是否能整除
    if (amountToSwap % toDenom !== 0) {
        return { possible: false };
    }
    
    const toCount = amountToSwap / toDenom;
    
    // 檢查上繳區是否有足夠數量
    const revenueHasEnough = distribution.revenue[fromDenom] >= fromCount;
    
    // 檢查打包區是否有足夠的散裝硬幣
    const packingHasEnough = calculatePackages(distribution.pettyCash[toDenom], toDenom).loose >= toCount;
    
    if (revenueHasEnough && packingHasEnough) {
        return { possible: true, countToReceive: toCount };
    }
    
    return { possible: false };
}

// === 工具函數 ===

/**
 * 解析輸入值，移除逗號並轉換為數字
 * @param {string} input - 輸入字串
 * @returns {number} 解析後的數字
 */
function parseInputValue(input) {
    return parseInt(String(input).replace(/,/g, ''), 10) || 0;
}

/**
 * 格式化數字，添加千分位逗號
 * @param {number} number - 要格式化的數字
 * @returns {string} 格式化後的字串
 */
function formatNumber(number) {
    const num = parseFloat(String(number).replace(/,/g, ''));
    return isNaN(num) ? '' : new Intl.NumberFormat('zh-TW').format(num);
}

/**
 * 格式化金額，添加貨幣單位
 * @param {number} number - 金額數字
 * @returns {string} 格式化後的金額字串
 */
function formatMoney(number) {
    return new Intl.NumberFormat('zh-TW').format(number || 0) + ' 元';
}

/**
 * 為輸入框添加千分位逗號格式化
 * @param {HTMLInputElement} input - 輸入元素
 */
function formatInputWithCommas(input) {
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    
    // 格式化數值
    input.value = formatNumber(input.value.replace(/[^\d]/g, ''));
    
    // 調整游標位置
    const newLength = input.value.length;
    const newCursorPos = cursorPos + (newLength - originalLength);
    input.setSelectionRange(newCursorPos, newCursorPos);
}

// === 匯出核心函數 ===
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 環境
    module.exports = {
        APP_CONFIG,
        collectInputs,
        calculateResults,
        findOptimalCombination,
        getCoinsBreakdown,
        calculatePackages,
        validateAllInputs,
        findValidSwapPath,
        findValidCoinSwapPath,
        parseInputValue,
        formatNumber,
        formatMoney,
        formatInputWithCommas
    };
} else {
    // 瀏覽器環境：將函數暴露到全局作用域
    window.APP_CONFIG = APP_CONFIG;
    window.collectInputs = collectInputs;
    window.calculateResults = calculateResults;
    window.findOptimalCombination = findOptimalCombination;
    window.getCoinsBreakdown = getCoinsBreakdown;
    window.calculatePackages = calculatePackages;
    window.validateAllInputs = validateAllInputs;
    window.findValidSwapPath = findValidSwapPath;
    window.findValidCoinSwapPath = findValidCoinSwapPath;
    window.parseInputValue = parseInputValue;
    window.formatNumber = formatNumber;
    window.formatMoney = formatMoney;
    window.formatInputWithCommas = formatInputWithCommas;
}
