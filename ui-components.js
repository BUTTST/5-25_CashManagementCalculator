/* 現金管理計算工具 - UI 組件模組 */

// === UI 更新與渲染函數 ===

/**
 * 更新整個使用者介面
 * @param {Object} results - 計算結果
 * @param {Object} highlights - 高亮提示配置
 */
function updateUI(results, highlights = {}) {
    // 更新總覽區塊
    updateSummarySection(results);
    
    // 更新營收上繳區塊
    updateRevenueSection(results);
    
    // 更新預留零用金區塊
    updatePettyCashSection(results);
    
    // 更新零錢處理區塊
    updateSmallCoinsSection(results);
    
    // 更新硬幣打包區塊
    updateCoinPackSection(results);
    
    // 處理高亮提示
    handleHighlights(highlights);
}

/**
 * 更新總覽區塊
 * @param {Object} results - 計算結果
 */
function updateSummarySection(results) {
    // 更新各項總覽數據
    document.getElementById('total-amount').textContent = formatMoney(results.totalAmount);
    document.getElementById('summary-small-coins').textContent = formatMoney(results.movedCoinsAmount);
    document.getElementById('petty-cash-actual').textContent = formatMoney(results.actualPettyCash);
    document.getElementById('summary-revenue').textContent = formatMoney(results.revenueAmount);
    
    // 根據餘額差異設定錯誤狀態
    const pettyCashBox = document.getElementById('petty-cash-box');
    pettyCashBox.classList.toggle('error', results.balanceGap !== 0);
}

/**
 * 更新營收上繳區塊
 * @param {Object} results - 計算結果
 */
function updateRevenueSection(results) {
    let revenueNotesHTML = '';
    let revenueCoinsHTML = '';
    
    // 分別處理紙鈔和硬幣
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        const count = results.distribution.revenue[denom];
        if (count > 0) {
            const html = createDenomItemHTML(denom, count);
            if (denom >= 100) {
                revenueNotesHTML += html;
            } else {
                revenueCoinsHTML += html;
            }
        }
    });
    
    // 更新 DOM 元素
    document.getElementById('revenue-notes').innerHTML = revenueNotesHTML || '<p class="item">無</p>';
    document.getElementById('revenue-coins').innerHTML = revenueCoinsHTML || '<p class="item">無</p>';
    document.getElementById('revenue-amount').textContent = formatMoney(results.revenueAmount);
}

/**
 * 更新預留零用金區塊
 * @param {Object} results - 計算結果
 */
function updatePettyCashSection(results) {
    let pettyNotesHTML = '';
    let pettyCoinsHTML = '';
    
    // 分別處理紙鈔和硬幣
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        const count = results.distribution.pettyCash[denom];
        if (count > 0) {
            const html = createDenomItemHTML(denom, count);
            if (denom >= 100) {
                pettyNotesHTML += html;
            } else {
                pettyCoinsHTML += html;
            }
        }
    });
    
    // 更新 DOM 元素
    document.getElementById('paper-money-detail').innerHTML = pettyNotesHTML || '<p class="item">無</p>';
    document.getElementById('kept-coins-detail').innerHTML = pettyCoinsHTML || '<p class="item">無</p>';
    document.getElementById('petty-cash-final').textContent = formatMoney(results.actualPettyCash);
    
    // 處理餘額警告
    updateBalanceWarning(results);
}

/**
 * 更新餘額警告區塊
 * @param {Object} results - 計算結果
 */
function updateBalanceWarning(results) {
    const warningEl = document.getElementById('balance-warning');
    
    if (results.balanceGap !== 0) {
        const warningText = `預留零用金與目標相差 <strong>${formatMoney(results.balanceGap)}</strong>`;
        document.getElementById('balance-warning-text').innerHTML = warningText;
        warningEl.style.display = 'block';
    } else {
        warningEl.style.display = 'none';
    }
}

/**
 * 更新零錢處理區塊
 * @param {Object} results - 計算結果
 */
function updateSmallCoinsSection(results) {
    // 計算硬幣總額
    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce(
        (sum, d) => sum + results.initialInputs[d].totalAmount, 0
    );
    
    // 更新基本資訊
    document.getElementById('total-coins').textContent = formatMoney(totalCoinsAmount);
    document.getElementById('remainder-coins').textContent = formatMoney(results.movedCoinsAmount);
    document.getElementById('moved-coins').textContent = formatMoney(results.movedCoinsAmount);
    
    // 產生零錢分解詳情
    const coinBreakdownHTML = generateCoinBreakdownHTML(results);
    document.getElementById('coin-breakdown').innerHTML = coinBreakdownHTML;
}

/**
 * 產生零錢分解的 HTML
 * @param {Object} results - 計算結果
 * @returns {string} HTML 字串
 */
function generateCoinBreakdownHTML(results) {
    if (results.movedCoinsAmount > 0) {
        const parts = [];
        APP_CONFIG.COIN_DENOMINATIONS.forEach(denom => {
            if (results.movedCoinsBreakdown[denom] > 0) {
                const iconHTML = `<span class="denom-icon d${denom}" style="width:24px;height:24px;line-height:24px;font-size:0.8rem;margin:0 2px;">${denom}</span>`;
                parts.push(`${iconHTML}x${results.movedCoinsBreakdown[denom]}`);
            }
        });
        return `<div style="text-align:center;">${formatMoney(results.movedCoinsAmount)} = ${parts.join(' + ')}</div>`;
    } else {
        return '<div style="text-align:center;">無零錢移入營收</div>';
    }
}

/**
 * 更新硬幣打包區塊
 * @param {Object} results - 計算結果
 */
function updateCoinPackSection(results) {
    let coinPackHTML = '';
    
    // 處理各硬幣面額的散裝數量
    APP_CONFIG.COIN_DENOMINATIONS.forEach(denom => {
        const packageInfo = calculatePackages(results.distribution.pettyCash[denom], denom);
        if (packageInfo.loose > 0) {
            coinPackHTML += createDenomItemHTML(denom, packageInfo.loose, true);
        }
    });
    
    // 更新 DOM 元素
    const packBlock = document.getElementById('coin-pack-block');
    packBlock.innerHTML = coinPackHTML || '<p class="item">無散裝硬幣</p>';
}

/**
 * 建立面額項目的 HTML
 * @param {number} denom - 面額
 * @param {number} count - 數量
 * @param {boolean} isPackView - 是否為打包檢視
 * @returns {string} HTML 字串
 */
function createDenomItemHTML(denom, count, isPackView = false) {
    const amount = count * denom;
    
    if (isPackView) {
        // 打包檢視：顯示散裝硬幣
        return `
            <li class="item">
                <div class="denom-icon d${denom}">${denom}</div>
                <div class="coin-pack-value-container">
                    <span class="highlight-amount-pack">${formatNumber(amount)}</span>
                    <span class="coin-pack-loose-count">(${count}枚)</span>
                </div>
            </li>
        `;
    }
    
    // 一般檢視：顯示金額和包裝資訊
    const packageInfo = calculatePackages(count, denom);
    let metaText = '';
    
    if (denom >= 100) {
        // 紙鈔包裝資訊
        metaText = packageInfo.packages > 0 ? 
            `${packageInfo.packages}捆` + (packageInfo.loose > 0 ? ` + ${packageInfo.loose}張` : '') : 
            `${count}張`;
    } else {
        // 硬幣包裝資訊
        metaText = packageInfo.packages > 0 ? 
            `${packageInfo.packages}袋` + (packageInfo.loose > 0 ? ` + ${packageInfo.loose}枚` : '') : 
            `${count}枚`;
    }
    
    return `
        <li class="item">
            <div class="denom-icon d${denom}">${denom}</div>
            <div class="item-content">
                <div class="amount money-amount-${denom}">${formatMoney(amount)}</div>
            </div>
            <div class="meta">${metaText}</div>
        </li>
    `;
}

/**
 * 處理高亮提示效果
 * @param {Object} highlights - 高亮配置
 */
function handleHighlights(highlights) {
    if (highlights.revenue) {
        flashElement(document.getElementById('revenue-card'));
    }
    if (highlights.petty) {
        flashElement(document.getElementById('petty-cash-card'));
    }
    if (highlights.packing) {
        flashElement(document.getElementById('coin-pack-card'));
    }
}

/**
 * 閃爍元素以提示更新
 * @param {HTMLElement} el - 要閃爍的元素
 */
function flashElement(el) {
    if (!el) return;
    
    // 先移除動畫類別，觸發重排，再添加
    el.classList.remove('update-highlight');
    void el.offsetWidth; // 強制重排
    el.classList.add('update-highlight');
}

// === 微調工具 UI 函數 ===

/**
 * 設定結果微調工具
 * @param {Object} domElements - DOM 元素集合
 */
function setupResultExchangeTool(domElements) {
    const rex = domElements.resultExchange;
    
    // 建立面額選項
    const optionsHTML = APP_CONFIG.DENOMINATIONS
        .map(denom => `<option value="${denom}">${denom}元</option>`)
        .join('');
    
    rex.fromDenom.innerHTML = optionsHTML;
    rex.toDenom.innerHTML = optionsHTML;
    
    // 設定預設值
    rex.fromDenom.value = '100';
    rex.toDenom.value = '50';
    rex.fromCount.value = '';
    
    updateResultExchangePreview(domElements);
    renderResultExchangeHistory(domElements);
}

/**
 * 更新結果微調預覽
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 應用程式狀態
 */
function updateResultExchangePreview(domElements, state) {
    const rex = domElements.resultExchange;
    const currentResults = state.exchangeHistory[state.exchangeHistory.length - 1];
    
    if (!currentResults) return;
    
    const fromDenom = parseInt(rex.fromDenom.value, 10);
    const toDenom = parseInt(rex.toDenom.value, 10);
    const fromCountInput = parseInt(rex.fromCount.value, 10) || 0;
    
    // 顯示可用數量
    const fromPettyCount = currentResults.distribution.pettyCash[fromDenom] || 0;
    rex.fromPreview.innerHTML = `可用: ${fromPettyCount} 張/枚`;
    
    const toRevenueCount = currentResults.distribution.revenue[toDenom] || 0;
    rex.toPreview.innerHTML = `可用: ${toRevenueCount} 張/枚`;
    
    // 檢查交換可行性
    const swapPath = findValidSwapPath(fromDenom, toDenom, fromCountInput, currentResults.distribution);
    
    if (fromCountInput > 0) {
        if (swapPath.possible) {
            rex.toPreview.innerHTML += `<br><span class="swap-path possible">✔ 可換入 ${swapPath.countToReceive} 張/枚</span>`;
        } else {
            rex.toPreview.innerHTML += `<br><span class="swap-path impossible">✖ 無法完成此交換</span>`;
        }
    }
    
    // 控制按鈕狀態
    rex.performBtn.disabled = !swapPath.possible;
}

/**
 * 設定收納零錢對換工具
 * @param {Object} domElements - DOM 元素集合
 */
function setupCoinConsolidationTool(domElements) {
    const cc = domElements.coinConsolidation;
    
    // 建立硬幣面額選項
    const optionsHTML = APP_CONFIG.COIN_DENOMINATIONS
        .map(denom => `<option value="${denom}">${denom}元</option>`)
        .join('');
    
    cc.fromDenom.innerHTML = optionsHTML;
    cc.toDenom.innerHTML = optionsHTML;
    
    // 設定預設值
    cc.fromDenom.value = '5';
    cc.toDenom.value = '10';
    cc.fromCount.value = '';
    
    updateCoinConsolidationPreview(domElements);
}

/**
 * 更新收納零錢對換預覽
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 應用程式狀態
 */
function updateCoinConsolidationPreview(domElements, state) {
    const cc = domElements.coinConsolidation;
    const currentResults = state.exchangeHistory[state.exchangeHistory.length - 1];
    
    if (!currentResults) return;
    
    const fromDenom = parseInt(cc.fromDenom.value, 10);
    const toDenom = parseInt(cc.toDenom.value, 10);
    const fromCountInput = parseInt(cc.fromCount.value, 10) || 0;
    
    // 顯示上繳區可用數量
    const fromRevenueCount = currentResults.distribution.revenue[fromDenom] || 0;
    cc.fromPreview.innerHTML = `可用: ${fromRevenueCount} 枚`;
    
    // 顯示打包區可用數量（散裝）
    const toPackingCount = calculatePackages(currentResults.distribution.pettyCash[toDenom] || 0, toDenom).loose;
    cc.toPreview.innerHTML = `可用: ${toPackingCount} 枚`;
    
    // 檢查交換可行性
    const swapPath = findValidCoinSwapPath(fromDenom, toDenom, fromCountInput, currentResults.distribution);
    
    if (fromCountInput > 0) {
        if (swapPath.possible) {
            cc.toPreview.innerHTML += `<br><span class="swap-path possible">✔ 可換入 ${swapPath.countToReceive} 枚</span>`;
        } else {
            cc.toPreview.innerHTML += `<br><span class="swap-path impossible">✖ 無法完成此交換</span>`;
        }
    }
    
    // 控制按鈕狀態
    cc.performBtn.disabled = !swapPath.possible;
}

/**
 * 渲染結果微調歷史記錄
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 應用程式狀態
 */
function renderResultExchangeHistory(domElements, state) {
    const logEl = domElements.resultExchange.log;
    
    if (!state.exchangeHistory || state.exchangeHistory.length <= 1) {
        logEl.innerHTML = '<p style="text-align:center; color: var(--gray);">尚無微調紀錄</p>';
        return;
    }
    
    let html = '';
    const activeIndex = state.exchangeHistory.length - 1;
    
    state.exchangeHistory.forEach((item, index) => {
        if (index > 0) { // 跳過初始狀態
            const timestamp = item.lastAction && item.lastAction.time ? 
                new Date(item.lastAction.time).toLocaleTimeString('zh-TW', { hour12: false }) : 
                '未知時間';
            
            const actionText = `
                <span class="history-timestamp">${timestamp}</span> 
                <span class="history-action">${item.lastAction ? item.lastAction.text : '未知操作'}</span>
            `;
            
            const activeClass = index === activeIndex ? 'active' : '';
            html += `<div class="history-log-item ${activeClass}" data-index="${index}">${actionText}</div>`;
        }
    });
    
    logEl.innerHTML = html || '<p style="text-align:center; color: var(--gray);">尚無微調紀錄</p>';
}

// === 顏色管理函數 ===

/**
 * 初始化顏色選擇器
 * @param {Object} domElements - DOM 元素集合
 */
function initColorPickers(domElements) {
    APP_CONFIG.DENOMINATIONS.forEach(denom => {
        const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
        const currentColor = getComputedStyle(document.documentElement)
            .getPropertyValue(varName).trim() || APP_CONFIG.DEFAULT_COLORS[denom];
        
        const picker = domElements.color.pickers[denom];
        const hexDisplay = domElements.color.hexes[denom];
        
        if (picker && hexDisplay) {
            picker.value = currentColor;
            hexDisplay.textContent = currentColor.toUpperCase();
        }
    });
}

/**
 * 套用顏色到 CSS 變數
 * @param {number} denom - 面額
 * @param {string} color - 顏色值
 */
function applyColor(denom, color) {
    const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
    document.documentElement.style.setProperty(varName, color);
}

/**
 * 重置所有顏色為預設值
 * @param {Object} domElements - DOM 元素集合
 */
function resetColors(domElements) {
    Object.entries(APP_CONFIG.DEFAULT_COLORS).forEach(([denom, color]) => {
        applyColor(parseInt(denom, 10), color);
    });
    
    if (domElements) {
        initColorPickers(domElements);
    }
}

// === 總額換算工具 ===

/**
 * 初始化總額換算彈窗
 * @param {Object} domElements - DOM 元素集合
 */
function initExchangeModal(domElements) {
    const ex = domElements.exchange;
    ex.amount.value = '';
    updateExchangeInfo(domElements);
}

/**
 * 更新總額換算資訊
 * @param {Object} domElements - DOM 元素集合
 */
function updateExchangeInfo(domElements) {
    const ex = domElements.exchange;
    const amount = parseInputValue(ex.amount.value);
    const fromDenom = parseInt(ex.from.value, 10);
    const toDenom = parseInt(ex.to.value, 10);
    
    // 取得當前金額
    const fromCurrentAmount = parseInputValue(domElements.amountInputs[fromDenom].value);
    const fromCurrentCount = Math.floor(fromCurrentAmount / fromDenom);
    const toCurrentAmount = parseInputValue(domElements.amountInputs[toDenom].value);
    const toCurrentCount = Math.floor(toCurrentAmount / toDenom);
    
    // 更新當前資訊
    ex.fromCurrentAmount.textContent = formatNumber(fromCurrentAmount);
    ex.fromCurrentCount.textContent = fromCurrentCount;
    ex.toCurrentAmount.textContent = formatNumber(toCurrentAmount);
    ex.toCurrentCount.textContent = toCurrentCount;
    
    // 計算轉換後的金額
    let fromNewAmount = fromCurrentAmount;
    let toNewAmount = toCurrentAmount;
    
    if (amount > 0 && amount <= fromCurrentAmount && amount % fromDenom === 0) {
        fromNewAmount -= amount;
        toNewAmount += amount;
    }
    
    // 更新轉換後資訊
    ex.fromNewAmount.textContent = formatNumber(fromNewAmount);
    ex.fromNewCount.textContent = Math.floor(fromNewAmount / fromDenom);
    ex.toNewAmount.textContent = formatNumber(toNewAmount);
    ex.toNewCount.textContent = Math.floor(toNewAmount / toDenom);
}

// === 匯出函數 ===
if (typeof module !== 'undefined' && module.exports) {
    // Node.js 環境
    module.exports = {
        updateUI,
        updateSummarySection,
        updateRevenueSection,
        updatePettyCashSection,
        updateSmallCoinsSection,
        updateCoinPackSection,
        createDenomItemHTML,
        flashElement,
        setupResultExchangeTool,
        updateResultExchangePreview,
        setupCoinConsolidationTool,
        updateCoinConsolidationPreview,
        renderResultExchangeHistory,
        initColorPickers,
        applyColor,
        resetColors,
        initExchangeModal,
        updateExchangeInfo
    };
}
