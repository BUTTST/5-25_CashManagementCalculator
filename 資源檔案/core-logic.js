/* 現金管理計算工具 - 核心邏輯模組 */

// === 常數定義 ===
const APP_CONFIG = {
    STATE_KEY: 'cashTool.v3.9.state',           // localStorage 儲存鍵
    PETTY_CASH_TARGET: 20000,                   // 預留零用金目標金額
    LONG_PRESS_DURATION: 5000,                  // 長按重置持續時間(毫秒)
    
    // 包裝規則：定義各面額包裝方式
    PACKAGING_RULES: { 
        'bundle2000': { value: 20000, count: 10 },  // 2000元10張一捆=20000元
        'bundle200': { value: 4000, count: 20 },    // 200元20張一捆=4000元
        'bundle100': { value: 2000, count: 20 },    // 100元20張一捆=2000元
        'bag50': { value: 2000, count: 40 },        // 50元40枚一袋=2000元
        'bag10': { value: 500, count: 50 },         // 10元50枚一袋=500元
        'bag5': { value: 250, count: 50 },          // 5元50枚一袋=250元
        'bag1': { value: 100, count: 100 }          // 1元100枚一袋=100元
    },
    
    // 面額設定
    BASE_DENOMINATIONS: [1000, 500, 100, 50, 10, 5, 1],  // 基本支援面額
    EXTENDED_DENOMINATIONS: [2000, 200],                  // 擴展面額（可選）
    COIN_DENOMINATIONS: [50, 10, 5, 1],                   // 硬幣面額
    COUNT_MODE_DENOMS: [2000, 1000, 500, 200, 100],       // 支援張數快輸模式面額
    REVENUE_ONLY_DENOMS: [2000, 200],                     // 只能放在營收面額
    
    // 應用程式設定
    SETTINGS: {
        showExtendedDenoms: false,  // 是否顯示2000、200面額
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
    
    // 可移動區塊清單
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

// 取得計算支援的面額清單（依據設定）
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
 * 收集輸入資料並計算總計
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
        
        // 解析金額輸入
        const amount = parseInputValue(amountInput.value);
        
        // 解析袋裝輸入（袋數/捆數）
        const bagInput = domInputs.bagInputs[denom];
        const packages = bagInput ? parseInputValue(bagInput.value) : 0;
        
        // 計算袋裝金額
        let packageAmount = 0;
        if (packages > 0 && bagInput) {
            const packageKey = `${bagInput.dataset.packageType}${denom}`;
            if (APP_CONFIG.PACKAGING_RULES[packageKey]) {
                packageAmount = packages * APP_CONFIG.PACKAGING_RULES[packageKey].value;
            }
        }
        
        // 計算總金額與張數
        const totalAmount = amount + packageAmount;
        inputs[denom] = { 
            totalAmount, 
            count: Math.floor(totalAmount / denom) 
        };
    });
    
    return inputs;
}

/**
 * 核心計算邏輯
 * @param {Object} inputs - 輸入資料
 * @returns {Object} 完整計算結果
 */
function calculateResults(inputs) {
    const results = {};
    
    // 保存原始輸入資料
    results.initialInputs = JSON.parse(JSON.stringify(inputs));
    
    // 計算總金額（使用動態面額清單）
    results.totalAmount = getSupportedDenominations().reduce(
        (sum, denom) => sum + (inputs[denom] ? inputs[denom].totalAmount : 0), 0
    );
    
    // === 零錢處理邏輯 ===
    // 計算四種硬幣總金額
    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce(
        (sum, denom) => sum + (inputs[denom] ? inputs[denom].totalAmount : 0), 0
    );
    
    // 計算需要移入營收的零頭（不足100的部分）
    results.movedCoinsAmount = totalCoinsAmount % 100;
    
    // 計算保留硬幣金額（可湊成百元的部分）
    results.keptCoinsAmount = totalCoinsAmount - results.movedCoinsAmount;
    
    // 計算零錢分解詳細資料
    results.movedCoinsBreakdown = getCoinsBreakdown(
        results.movedCoinsAmount, 
        {
            50: inputs[50] ? inputs[50].totalAmount : 0,
            10: inputs[10] ? inputs[10].totalAmount : 0,
            5: inputs[5] ? inputs[5].totalAmount : 0,
            1: inputs[1] ? inputs[1].totalAmount : 0
        }
    );
    
    // === 預留零用金邏輯 ===
    // 計算還需要多少現金才能達到目標金額
    const remainingCashNeeded = APP_CONFIG.PETTY_CASH_TARGET - results.keptCoinsAmount;
    
    let pettyCashPaperDetails = { used100: 0, used500: 0, amount: 0 };
    
    if (remainingCashNeeded > 0) {
        // 使用最佳組合演算法求出紙鈔組合
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
            // 無法完美湊齊，使用貪心法
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
    
    // 計算與目標差額
    results.balanceGap = APP_CONFIG.PETTY_CASH_TARGET - results.actualPettyCash;
    
    // === 各面額的分配結果 ===
    results.distribution = { pettyCash: {}, revenue: {} };
    
    getSupportedDenominations().forEach(denom => {
        if (!inputs[denom]) {
            results.distribution.pettyCash[denom] = 0;
            results.distribution.revenue[denom] = 0;
            return;
        }
        
        let pettyCashCount = 0;
        
        // 特殊面額只能放在營收中
        if (APP_CONFIG.REVENUE_ONLY_DENOMS && APP_CONFIG.REVENUE_ONLY_DENOMS.includes(denom)) {
            pettyCashCount = 0;
        } else {
        // 依照類別分配張數
        if (denom === 100) {
            pettyCashCount = pettyCashPaperDetails.used100;
        } else if (denom === 500) {
            pettyCashCount = pettyCashPaperDetails.used500;
        } else if (APP_CONFIG.COIN_DENOMINATIONS.includes(denom)) {
            // 硬幣：總張數減去移入營收的張數
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
 * 找出最佳的100和500組合來湊出目標金額
 * 策略：優先使用100，再用500填補
 * @param {number} remainingCashNeeded - 需要湊齊的金額
 * @param {number} available100Count - 可用100元張數
 * @param {number} available500Count - 可用500元張數
 * @returns {Object} 組合結果
 */
function findOptimalCombination(remainingCashNeeded, available100Count, available500Count) {
    // 從最多100開始嘗試，逐步減少
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
 * 使用貪心演算法分解零錢硬幣
 * @param {number} targetAmount - 目標金額
 * @param {Object} availableAmounts - 各面額可用金額
 * @returns {Object} 分解結果
 */
function getCoinsBreakdown(targetAmount, availableAmounts) {
    let remaining = targetAmount;
    const result = { 50: 0, 10: 0, 5: 0, 1: 0 };
    
    // 從大到小分解
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
 * 計算包裝資料（整包數與散裝數量）
 * @param {number} totalCount - 總數量
 * @param {number} denomination - 面額
 * @returns {Object} 包裝資料
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
    
    // 計算整包與散裝數量
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
 * 驗證所有輸入欄位
 * @param {Object} domInputs - DOM 輸入集合
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
            errorEl.textContent = `總額必須為 ${denom} 的倍數`;
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
 * 尋找有效交換路徑（預留↔營收）
 * @param {number} fromDenom - 轉出面額
 * @param {number} toDenom - 轉入面額
 * @param {number} fromCount - 轉出數量
 * @param {Object} distribution - 面額分配結果
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
 * 尋找有效硬幣交換路徑（上繳區→打包區）
 * @param {number} fromDenom - 轉出面額
 * @param {number} toDenom - 轉入面額
 * @param {number} fromCount - 轉出數量
 * @param {Object} distribution - 面額分配結果
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
    
    // 檢查預留區是否有足夠的散裝硬幣
    const packingHasEnough = calculatePackages(distribution.pettyCash[toDenom], toDenom).loose >= toCount;
    
    if (revenueHasEnough && packingHasEnough) {
        return { possible: true, countToReceive: toCount };
    }
    
    return { possible: false };
}

// === 工具函數 ===

/**
 * 從輸入值移除逗號並轉換為數字
 * @param {string} input - 輸入字串
 * @returns {number} 轉換後的數字
 */
function parseInputValue(input) {
    return parseInt(String(input).replace(/,/g, ''), 10) || 0;
}

/**
 * 格式化數字（添加千位逗號）
 * @param {number} number - 要格式化的數字
 * @returns {string} 格式化後的字串
 */
function formatNumber(number) {
    const num = parseFloat(String(number).replace(/,/g, ''));
    return isNaN(num) ? '' : new Intl.NumberFormat('zh-TW').format(num);
}

/**
 * 格式化金額（添加貨幣單位）
 * @param {number} number - 金額數字
 * @returns {string} 格式化後金額字串
 */
function formatMoney(number) {
    return new Intl.NumberFormat('zh-TW').format(number || 0) + ' 元';
}

/**
 * 為輸入框添加千位逗號格式化
 * @param {HTMLInputElement} input - 輸入框
 */
function formatInputWithCommas(input) {
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    
    // 格式化數字
    input.value = formatNumber(input.value.replace(/[^\d]/g, ''));
    
    // 調整游標位置
    const newLength = input.value.length;
    const newCursorPos = cursorPos + (newLength - originalLength);
    input.setSelectionRange(newCursorPos, newCursorPos);
}

// === 區塊移動邏輯 ===

/**
 * 移動區塊方向
 * @param {string} blockId - 區塊ID
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
        e.stopPropagation(); // 防止觸發折疊功能
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
 * 匯入代收加總後的金額到總金額欄位
 * 計算公式：報表總額 - 代收數值
 */
function importAfterCollectionAmount() {
    const collectionInput = document.getElementById('collection-amount');
    const reportInput = document.getElementById('report-total');
    const collectAmountInput = document.getElementById('collect-amount');

    if (!collectionInput || !reportInput || !collectAmountInput) return;

    const collectionAmount = parseInputValue(collectionInput.value);
    const reportTotal = parseInputValue(reportInput.value);

    // 確保代收和報表總額都有值
    if (collectionAmount > 0 && reportTotal > 0) {
        const afterAddition = reportTotal - collectionAmount;
        // 加總後金額必須為正數
        if (afterAddition >= 0) {
            collectAmountInput.value = formatNumber(afterAddition);
            // 觸發計算更新
            updateExtraCalc();
        } else {
            alert('代收加總後金額為負數，無法匯入！\n請檢查報表總額是否大於代收數值。');
        }
    } else {
        alert('請先輸入代收金額和報表總額！');
    }
}

/**
 * 更新代收計算結果
 * 計算公式：報表總額 - 代收數值 = 代收加總後數值
 * 即時偵測：當代收或報表總額有變動時立即更新顯示狀態
 * 
 * 獨立性說明：
 * - 代收計算只依賴「代收」和「報表總額」兩個欄位
 * - 與「總金額」和「PC」無關
 * - 顯示/隱藏邏輯完全獨立
 */
function updateCollectionCalc() {
    const collectionInput = document.getElementById('collection-amount');
    const reportInput = document.getElementById('report-total');
    const collectionResultEl = document.getElementById('collection-calc-result');
    const collectionAfterEl = document.getElementById('collection-after-deduction');
    const importAfterBtn = document.getElementById('import-after-collection-btn');

    if (!collectionInput || !reportInput || !collectionResultEl || !collectionAfterEl) return;

    // 獲取輸入值（包含空值檢測）
    const collectionValue = collectionInput.value.trim();
    const reportValue = reportInput.value.trim();
    const collectionAmount = parseInputValue(collectionValue);
    const reportTotal = parseInputValue(reportValue);

    // 即時偵測：只有當兩個欄位都有值且都為正數時才顯示結果
    if (collectionValue && reportValue && collectionAmount > 0 && reportTotal > 0) {
        const afterAddition = reportTotal - collectionAmount;
        collectionAfterEl.textContent = formatMoney(afterAddition);
        collectionResultEl.style.display = 'block';
        if (importAfterBtn) importAfterBtn.style.display = 'inline-block';
    } else {
        // 任一值為空或0時立即隱藏結果介面
        collectionResultEl.style.display = 'none';
        if (importAfterBtn) importAfterBtn.style.display = 'none';
    }
}

/**
 * 更新額外計算結果（最終計算）
 * 計算公式：總金額 - 報表總額 - PC金額
 * 
 * 相互影響說明：
 * 1. 只有代收：報表總額直接參與計算
 * 2. 只有PC：報表總額直接參與計算，PC扣除
 * 3. 同時有代收和PC：
 *    - 若使用「匯入(加總)」，總金額 = 代收加總後數值
 *    - 報表總額和PC都參與最終計算
 * 
 * 獨立性說明：
 * - 最終計算只依賴「總金額」、「報表總額」、「PC」三個欄位
 * - 與「代收」欄位無直接關係（除非透過匯入按鈕）
 * - 代收只是提供一個便捷的匯入選項
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
    
    // 計算公式：總金額 - 報表總額 - PC金額
    // 即使某些值為0也照常計算（例如沒有PC或代收的情況）
    const result = collectAmount - reportTotal - pcAmount;
    
    resultEl.textContent = `計算結果：${formatMoney(result)}`;
    
    // 同時更新代收計算（獨立運作）
    updateCollectionCalc();
}

/**
 * 切換額外計算區塊的鎖定狀態
 */
function toggleExtraCalcLock() {
    const lockBtn = document.getElementById('lock-btn');
    const inputs = document.querySelectorAll('.extra-calc-input');
    
    if (!lockBtn) {
        console.error('toggleExtraCalcLock: 找不到鎖定按鈕');
        return;
    }
    
    if (inputs.length === 0) {
        console.error('toggleExtraCalcLock: 找不到任何輸入框');
        return;
    }
    
    // 檢查當前是否已鎖定
    const isCurrentlyLocked = lockBtn.classList.contains('locked');
    
    console.log(`toggleExtraCalcLock: 當前狀態 = ${isCurrentlyLocked ? '已鎖定' : '未鎖定'}，準備切換到 ${isCurrentlyLocked ? '解鎖' : '鎖定'}`);
    
    // 切換鎖定狀態
    if (isCurrentlyLocked) {
        // 目前是鎖定，要解鎖
        lockBtn.classList.remove('locked');
        lockBtn.textContent = '🔓';
        lockBtn.title = '點擊鎖定輸入框';
        inputs.forEach(input => {
            input.disabled = false; // 解鎖：可以輸入
            input.style.backgroundColor = ''; // 移除內聯樣式，使用CSS樣式
        });
        console.log('toggleExtraCalcLock: 已解鎖，輸入框可編輯');
    } else {
        // 目前未鎖定，要鎖定
        lockBtn.classList.add('locked');
        lockBtn.textContent = '🔒';
        lockBtn.title = '點擊解鎖輸入框';
        inputs.forEach(input => {
            input.disabled = true; // 鎖定：不可輸入
        });
        console.log('toggleExtraCalcLock: 已鎖定，輸入框不可編輯');
    }
    
    // 更新計算結果
    updateExtraCalc();
}

/**
 * 初始化額外計算功能
 */
function initExtraCalc() {
    const container = document.getElementById('extraCalcContent');
    const lockBtn = document.getElementById('lock-btn');
    const inputs = document.querySelectorAll('.extra-calc-input');
    const collectionInput = document.getElementById('collection-amount');
    
    // 鎖定功能 - 重要：確保事件監聽器不重複綁定
    if (lockBtn) {
        // 移除可能存在的舊事件監聽器
        lockBtn.removeEventListener('click', toggleExtraCalcLock);
        // 添加新事件監聽器
        lockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleExtraCalcLock();
        });
        console.log('鎖定按鈕事件已綁定');
    } else {
        console.warn('找不到鎖定按鈕');
    }
    
    // 輸入框監聽
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            formatInputWithCommas(input);
            
            // 代收輸入框：限制只能輸入正數
            if (input.id === 'collection-amount') {
                let value = parseInputValue(input.value);
                if (value < 0) {
                    input.value = '0';
                    alert('代收金額只能輸入正數！');
                }
            }
            
            updateExtraCalc();
        });
    });
    
    // 初始化計算
    updateExtraCalc();
}

// === 匯出函數 ===
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
        importTotalAmount,
        importAfterCollectionAmount,
        updateCollectionCalc,
        updateExtraCalc,
        toggleExtraCalcLock,
        initExtraCalc
    };
} else {
    // 瀏覽器環境：將函數暴露到全域作用域
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
    window.importTotalAmount = importTotalAmount;
    window.importAfterCollectionAmount = importAfterCollectionAmount;
    window.updateCollectionCalc = updateCollectionCalc;
    window.updateExtraCalc = updateExtraCalc;
    window.toggleExtraCalcLock = toggleExtraCalcLock;
    window.initExtraCalc = initExtraCalc;
}
