/* 現金管理計算工具 - 核心邏輯模組 */

// === 常數與配置 ===
const APP_CONFIG = {
    STATE_KEY: 'cashTool.v3.5.state',           // localStorage 儲存鍵值
    PETTY_CASH_TARGET: 20000,                   // 預留零用金目標金額
    LONG_PRESS_DURATION: 5000,                  // 長按重置的持續時間（毫秒）
    
    // 包裝規則：定義各面額的包裝方式
    PACKAGING_RULES: { 
        'bundle2000': { value: 20000, count: 10 },  // 2000元：10張一捆，價值20000元
        'bundle200': { value: 4000, count: 20 },    // 200元：20張一捆，價值4000元
        'bundle100': { value: 2000, count: 20 },    // 100元：20張一捆，價值2000元
        'bag50': { value: 2000, count: 40 },        // 50元：40枚一袋，價值2000元
        'bag10': { value: 500, count: 50 },         // 10元：50枚一袋，價值500元
        'bag5': { value: 250, count: 50 },          // 5元：50枚一袋，價值250元
        'bag1': { value: 100, count: 100 }          // 1元：100枚一袋，價值100元
    },
    
    // 面額配置
    BASE_DENOMINATIONS: [1000, 500, 100, 50, 10, 5, 1],  // 基礎支援的面額
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
    },
    
    // 可移動區塊配置
    MOVABLE_BLOCKS: [
        'summary-section',
        'pc-collection-section', 
        'revenue-section',
        'petty-cash-section',
        'small-coins-section',
        'result-exchange-section',
        'coin-consolidation-section',
        'coin-pack-section',
        'verification-section'
    ]
};

// 動態計算支援的面額（根據設定）
function getSupportedDenominations() {
    let denoms = [...APP_CONFIG.BASE_DENOMINATIONS];
    if (APP_CONFIG.SETTINGS.showExtendedDenoms) {
        denoms = [...APP_CONFIG.EXTENDED_DENOMINATIONS, ...denoms];
        denoms.sort((a, b) => b - a);
    }
    return denoms;
}

// 更新 DENOMINATIONS 屬性以支援動態設定
Object.defineProperty(APP_CONFIG, 'DENOMINATIONS', {
    get: function() {
        return getSupportedDenominations();
    }
});

// === 核心計算函數 ===

/**
 * 收集所有輸入資料並進行加總計算
 * @param {Object} domInputs - DOM 輸入元素集合
 * @returns {Object} 處理後的輸入資料
 */
function collectInputs(domInputs) {
    const inputs = {};
    
    getSupportedDenominations().forEach(denom => {
        // 檢查DOM元素是否存在
        const amountInput = domInputs.amountInputs[denom];
        if (!amountInput) {
            inputs[denom] = { totalAmount: 0, count: 0 };
            return;
        }
        
        // 取得金額輸入值
        const amount = parseInputValue(amountInput.value);
        
        // 取得包裝輸入值（袋/捆數量）
        const bagInput = domInputs.bagInputs[denom];
        const packages = bagInput ? parseInputValue(bagInput.value) : 0;
        
        // 計算包裝金額
        let packageAmount = 0;
        if (packages > 0 && bagInput) {
            const packageKey = `${bagInput.dataset.packageType}${denom}`;
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
    
    // 計算總金額（使用動態面額列表）
    results.totalAmount = getSupportedDenominations().reduce(
        (sum, denom) => sum + (inputs[denom] ? inputs[denom].totalAmount : 0), 0
    );
    
    // === 零錢處理邏輯 ===
    // 計算所有硬幣的總金額
    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce(
        (sum, denom) => sum + (inputs[denom] ? inputs[denom].totalAmount : 0), 0
    );
    
    // 計算需要移入營收的零頭（不足100元的部分）
    results.movedCoinsAmount = totalCoinsAmount % 100;
    
    // 計算保留的硬幣金額（可湊成百元的部分）
    results.keptCoinsAmount = totalCoinsAmount - results.movedCoinsAmount;
    
    // 計算零錢的詳細分解
    results.movedCoinsBreakdown = getCoinsBreakdown(
        results.movedCoinsAmount, 
        {
            50: inputs[50] ? inputs[50].totalAmount : 0,
            10: inputs[10] ? inputs[10].totalAmount : 0,
            5: inputs[5] ? inputs[5].totalAmount : 0,
            1: inputs[1] ? inputs[1].totalAmount : 0
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
            inputs[100] ? inputs[100].count : 0, 
            inputs[500] ? inputs[500].count : 0
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
            const available500 = inputs[500] ? inputs[500].count : 0;
            const available100 = inputs[100] ? inputs[100].count : 0;
            
            const used500 = Math.min(available500, Math.floor(remainingCashNeeded / 500));
            const stillNeeded = remainingCashNeeded - (used500 * 500);
            const used100 = Math.min(available100, Math.floor(stillNeeded / 100));
            
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
    
    getSupportedDenominations().forEach(denom => {
        if (!inputs[denom]) {
            results.distribution.pettyCash[denom] = 0;
            results.distribution.revenue[denom] = 0;
            return;
        }
        
        let pettyCashCount = 0;
        
        // 僅營收面額不放在預留金中
        if (APP_CONFIG.REVENUE_ONLY_DENOMS && APP_CONFIG.REVENUE_ONLY_DENOMS.includes(denom)) {
            pettyCashCount = 0;
        } else {
            // 根據面額類型分配數量
            if (denom === 100) {
                pettyCashCount = pettyCashPaperDetails.used100;
            } else if (denom === 500) {
                pettyCashCount = pettyCashPaperDetails.used500;
            } else if (APP_CONFIG.COIN_DENOMINATIONS.includes(denom)) {
                // 硬幣：總數減去移入營收的數量
                const totalCount = inputs[denom] ? inputs[denom].count : 0;
                pettyCashCount = totalCount - (results.movedCoinsBreakdown[denom] || 0);
            }
        }
        
        results.distribution.pettyCash[denom] = pettyCashCount;
        const totalCount = inputs[denom] ? inputs[denom].count : 0;
        results.distribution.revenue[denom] = totalCount - pettyCashCount;
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
        
        // 跳過不存在的DOM元素
        if (!inputEl || !errorEl) continue;
        
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

// === 區塊移動功能 ===

/**
 * 移動區塊位置
 * @param {string} blockId - 區塊 ID
 * @param {string} direction - 移動方向 ('up' | 'down')
 */
function moveBlock(blockId, direction) {
    const container = document.getElementById('result-container');
    const currentBlock = document.getElementById(blockId);
    
    if (!currentBlock || !container) return false;
    
    const allBlocks = Array.from(container.children).filter(child => 
        APP_CONFIG.MOVABLE_BLOCKS.includes(child.id)
    );
    
    const currentIndex = allBlocks.indexOf(currentBlock);
    
    if (direction === 'up' && currentIndex > 0) {
        container.insertBefore(currentBlock, allBlocks[currentIndex - 1]);
        return true;
    } else if (direction === 'down' && currentIndex < allBlocks.length - 1) {
        container.insertBefore(allBlocks[currentIndex + 1], currentBlock);
        return true;
    }
    
    return false;
}

/**
 * 為區塊添加移動按鈕
 * @param {HTMLElement} block - 區塊元素
 */
function addMoveButtons(block) {
    if (!block || block.classList.contains('has-move-buttons')) return;
    
    const header = block.querySelector('.section-title');
    if (!header) return;
    
    // 檢查是否已經有移動按鈕
    if (header.querySelector('.move-buttons')) return;
    
    const moveButtonsContainer = document.createElement('div');
    moveButtonsContainer.className = 'move-buttons';
    moveButtonsContainer.innerHTML = `
        <button class="move-btn move-up" data-block-id="${block.id}" data-direction="up" title="向上移動">
            <span class="move-icon">▲</span>
        </button>
        <button class="move-btn move-down" data-block-id="${block.id}" data-direction="down" title="向下移動">
            <span class="move-icon">▼</span>
        </button>
    `;
    
    header.appendChild(moveButtonsContainer);
    block.classList.add('has-move-buttons');
    
    // 綁定點擊事件
    moveButtonsContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止觸發摺疊功能
        const btn = e.target.closest('.move-btn');
        if (btn) {
            const blockId = btn.dataset.blockId;
            const direction = btn.dataset.direction;
            if (moveBlock(blockId, direction)) {
                // 移動成功後的視覺回饋
                block.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    block.style.transform = '';
                }, 200);
            }
        }
    });
}

/**
 * 初始化所有可移動區塊的移動按鈕
 */
function initializeMovableBlocks() {
    APP_CONFIG.MOVABLE_BLOCKS.forEach(blockId => {
        const block = document.getElementById(blockId);
        if (block) {
            addMoveButtons(block);
        }
    });
}

// === PC與代收相關功能 ===

/**
 * 計算PC與代收相關數據
 * @param {Object} results - 計算結果
 * @returns {Object} PC與代收統計
 */
function calculatePCCollection(results) {
    // 計算需要上繳的總紙鈔數量
    let totalNotes = 0;
    let totalCoins = 0;
    
    getSupportedDenominations().forEach(denom => {
        const count = results.distribution.revenue[denom] || 0;
        if (denom >= 100) {
            totalNotes += count;
        } else {
            totalCoins += count;
        }
    });
    
    return {
        totalNotes,
        totalCoins,
        totalAmount: results.revenueAmount,
        pettyCashAmount: results.actualPettyCash
    };
}

// === 額外計算功能 ===

/**
 * 匯入全部總金額到額外計算的總金額欄位
 */
function importTotalAmount() {
    const totalEl = document.getElementById('total-amount');
    if (!totalEl) return;
    
    const num = parseInt(totalEl.textContent.replace(/[^0-9]/g, '')) || 0;
    const collectAmountInput = document.getElementById('collect-amount');
    if (collectAmountInput) {
        collectAmountInput.value = formatNumber(num);
        // 觸發計算更新
        updateExtraCalc();
    }
}

/**
 * 更新額外計算結果
 */
function updateExtraCalc() {
    const reportInput = document.getElementById('report-total');
    const collectInput = document.getElementById('collect-amount');
    const pcInput = document.getElementById('pc-amount');
    const resultEl = document.getElementById('extra-calc-result');
    
    if (!reportInput || !collectInput || !pcInput || !resultEl) return;
    
    const reportTotal = parseInputValue(reportInput.value);
    const collectAmount = parseInputValue(collectInput.value);
    const pcAmount = parseInputValue(pcInput.value);
    
    // 計算差額：(總金額 - 報表總額) - PC金額
    const diff = (collectAmount - reportTotal) - pcAmount;
    resultEl.textContent = `計算結果：${formatMoney(diff)}`;
}

/**
 * 切換額外計算區塊的鎖定狀態
 */
function toggleExtraCalcLock() {
    const lockBtn = document.getElementById('lock-btn');
    const inputs = document.querySelectorAll('.extra-calc-input');
    
    if (!lockBtn) return;
    
    const isLocked = lockBtn.classList.contains('locked');
    
    lockBtn.classList.toggle('locked');
    lockBtn.textContent = isLocked ? '🔓' : '🔒';
    lockBtn.title = isLocked ? '鎖定/解鎖輸入框' : '點擊解鎖輸入框';
    
    inputs.forEach(input => {
        input.disabled = !isLocked;
    });
    
    // 如果解鎖，立即更新計算結果
    if (isLocked) {
        updateExtraCalc();
    }
}

/**
 * 初始化額外計算功能
 */
function initExtraCalc() {
    const header = document.getElementById('extraCalcHeader');
    const container = document.getElementById('extraCalcContainer');
    const icon = document.getElementById('extraCalcIcon');
    const lockBtn = document.getElementById('lock-btn');
    const inputs = document.querySelectorAll('.extra-calc-input');
    
    // 折疊/展開功能
    if (header && container && icon) {
        header.addEventListener('click', (e) => {
            // 確保點擊的不是鎖定按鈕
            if (!e.target.closest('#lock-btn')) {
                container.classList.toggle('collapsed');
                icon.classList.toggle('collapsed');
            }
        });
    }
    
    // 鎖定功能
    if (lockBtn) {
        lockBtn.addEventListener('click', toggleExtraCalcLock);
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

// === 匯出核心函數 ===
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 環境
    module.exports = {
        APP_CONFIG,
        getSupportedDenominations,
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
        formatInputWithCommas,
        moveBlock,
        addMoveButtons,
        initializeMovableBlocks,
        calculatePCCollection,
        importTotalAmount,
        updateExtraCalc,
        toggleExtraCalcLock,
        initExtraCalc
    };
} else {
    // 瀏覽器環境：將函數暴露到全局作用域
    window.APP_CONFIG = APP_CONFIG;
    window.getSupportedDenominations = getSupportedDenominations;
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
    window.moveBlock = moveBlock;
    window.addMoveButtons = addMoveButtons;
    window.initializeMovableBlocks = initializeMovableBlocks;
    window.calculatePCCollection = calculatePCCollection;
    window.importTotalAmount = importTotalAmount;
    window.updateExtraCalc = updateExtraCalc;
    window.toggleExtraCalcLock = toggleExtraCalcLock;
    window.initExtraCalc = initExtraCalc;
}
