/* 現金管理計算工具 - UI 組件模組 */

// === UI 更新與渲染函數 ===

/**
 * 更新整個使用者介面
 * @param {Object} results - 計算結果
 * @param {Object} highlights - 高亮顯示設置
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
    
    // 處理高亮顯示
    handleHighlights(highlights);
}

/**
 * 更新總覽區塊
 * @param {Object} results - 計算結果
 */
function updateSummarySection(results) {
    // 更新四個總覽數值
    document.getElementById('total-amount').textContent = formatMoney(results.totalAmount);
    document.getElementById('summary-small-coins').textContent = formatMoney(results.movedCoinsAmount);
    document.getElementById('petty-cash-actual').textContent = formatMoney(results.actualPettyCash);
    document.getElementById('summary-revenue').textContent = formatMoney(results.revenueAmount);
    
    // 預留零用金狀態標示
    const pettyCashBox = document.getElementById('petty-cash-box');
    if (pettyCashBox) {
        pettyCashBox.classList.toggle('error', results.balanceGap !== 0);
    }
}

/**
 * 更新營收上繳區塊
 * @param {Object} results - 計算結果
 */
function updateRevenueSection(results) {
    const supportedDenoms = getSupportedDenominations();
    
    let revenueNotesHTML = '';
    let revenueCoinsHTML = '';
    
    // 分類顯示紙鈔和硬幣
    supportedDenoms.forEach(denom => {
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
    
    document.getElementById('revenue-notes').innerHTML = revenueNotesHTML || '<p class="item">無</p>';
    document.getElementById('revenue-coins').innerHTML = revenueCoinsHTML || '<p class="item">無</p>';
    document.getElementById('revenue-amount').textContent = formatMoney(results.revenueAmount);
}

/**
 * 更新預留零用金區塊
 * @param {Object} results - 計算結果
 */
function updatePettyCashSection(results) {
    const supportedDenoms = getSupportedDenominations();
    
    let pettyNotesHTML = '';
    let pettyCoinsHTML = '';
    
    // 分類顯示紙鈔和硬幣
    supportedDenoms.forEach(denom => {
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
    
    document.getElementById('paper-money-detail').innerHTML = pettyNotesHTML || '<p class="item">無</p>';
    document.getElementById('kept-coins-detail').innerHTML = pettyCoinsHTML || '<p class="item">無</p>';
    document.getElementById('petty-cash-final').textContent = formatMoney(results.actualPettyCash);
    
    // 處理警告訊息
    const warningEl = document.getElementById('balance-warning');
    if (results.balanceGap !== 0) {
        document.getElementById('balance-warning-text').innerHTML = `預留零用金與目標相差 <strong>${formatMoney(Math.abs(results.balanceGap))}</strong>`;
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
    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce((sum, d) => 
        sum + results.initialInputs[d].totalAmount, 0);
    
    document.getElementById('total-coins').textContent = formatMoney(totalCoinsAmount);
    document.getElementById('remainder-coins').textContent = formatMoney(results.movedCoinsAmount);
    document.getElementById('moved-coins').textContent = formatMoney(results.movedCoinsAmount);
    
    // 更新硬幣分解詳情
    let coinBreakdownHTML = '';
    if (results.movedCoinsAmount > 0) {
        const parts = [];
        APP_CONFIG.COIN_DENOMINATIONS.forEach(denom => { 
            if (results.movedCoinsBreakdown[denom] > 0) {
                parts.push(`<span class="denom-icon d${denom}" style="width:24px;height:24px;line-height:24px;font-size:0.8rem;margin:0 2px;">${denom}</span>x${results.movedCoinsBreakdown[denom]}`); 
            }
        });
        coinBreakdownHTML = `<div style="text-align:center;">${formatMoney(results.movedCoinsAmount)} = ${parts.join(' + ')}</div>`;
    } else { 
        coinBreakdownHTML = '<div style="text-align:center;">無零錢移入營收</div>'; 
    }
    document.getElementById('coin-breakdown').innerHTML = coinBreakdownHTML;
}

/**
 * 更新硬幣打包區塊
 * @param {Object} results - 計算結果
 */
function updateCoinPackSection(results) {
    let coinPackHTML = '';
    
    APP_CONFIG.COIN_DENOMINATIONS.forEach(denom => {
        const packageInfo = calculatePackages(results.distribution.pettyCash[denom], denom);
        if (packageInfo.loose > 0) { 
            coinPackHTML += createDenomItemHTML(denom, packageInfo.loose, true); 
        }
    });
    
    document.getElementById('coin-pack-block').innerHTML = coinPackHTML || '<p class="item">無散裝硬幣</p>';
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
        return `<li class="item"><div class="denom-icon d${denom}">${denom}</div><div class="coin-pack-value-container"><span class="highlight-amount-pack">${formatNumber(amount)}</span><span class="coin-pack-loose-count">(${count}枚)</span></div></li>`;
    }
    
    const packageInfo = calculatePackages(count, denom);
    let metaText = '';
    
    if (denom >= 100) { 
        metaText = packageInfo.packages > 0 ? `${packageInfo.packages}捆` + (packageInfo.loose > 0 ? ` + ${packageInfo.loose}張` : '') : `${count}張`; 
    } else { 
        metaText = packageInfo.packages > 0 ? `${packageInfo.packages}袋` + (packageInfo.loose > 0 ? ` + ${packageInfo.loose}枚` : '') : `${count}枚`; 
    }
    
    return `<li class="item"><div class="denom-icon d${denom}">${denom}</div><div class="item-content"><div class="amount money-amount-${denom}">${formatMoney(amount)}</div></div><div class="meta">${metaText}</div></li>`;
}

/**
 * 處理高亮顯示效果
 * @param {Object} highlights - 高亮設置
 */
function handleHighlights(highlights) {
    if (highlights.revenue) flashElement(document.getElementById('revenue-section'));
    if (highlights.petty) flashElement(document.getElementById('petty-cash-section'));
    if (highlights.packing) flashElement(document.getElementById('coin-pack-section'));
}

/**
 * 閃爍動畫效果
 * @param {HTMLElement} el - 要閃爍的元素
 */
function flashElement(el) {
    if (!el) return;
    el.classList.remove('update-highlight');
    void el.offsetWidth; // 觸發重繪
    el.classList.add('update-highlight');
}

// === 微調工具 UI 函數 ===

/**
 * 設定結果微調工具
 * @param {Object} domElements - DOM 元素集合
 */
function setupResultExchangeTool(domElements) {
    const rex = domElements.resultExchange;
    const supportedDenoms = getSupportedDenominations();
    
    let optionsHTML = supportedDenoms.map(denom => `<option value="${denom}">${denom}元</option>`).join('');
    rex.fromDenom.innerHTML = optionsHTML;
    rex.toDenom.innerHTML = optionsHTML;
    
    rex.fromDenom.value = '100';
    rex.toDenom.value = '50';
    rex.fromCount.value = '';
    
    updateResultExchangePreview(domElements, {});
}

/**
 * 設定收納零錢對換工具
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 當前狀態
 */
function setupCoinConsolidationTool(domElements, state) {
    const cc = domElements.coinConsolidation;
    
    let optionsHTML = APP_CONFIG.COIN_DENOMINATIONS.map(denom => `<option value="${denom}">${denom}元</option>`).join('');
    cc.fromDenom.innerHTML = optionsHTML;
    cc.toDenom.innerHTML = optionsHTML;
    
    cc.fromDenom.value = '5';
    cc.toDenom.value = '10';
    cc.fromCount.value = '';
    
    updateCoinConsolidationPreview(domElements, state);
}

/**
 * 更新結果微調預覽
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 當前狀態
 */
function updateResultExchangePreview(domElements, state) {
    const rex = domElements.resultExchange;
    
    if (!state.exchangeHistory || state.exchangeHistory.length === 0) return;
    
    const currentResults = state.exchangeHistory[state.exchangeHistory.length - 1];
    if (!currentResults) return;
    
    const fromDenom = parseInt(rex.fromDenom.value, 10);
    const toDenom = parseInt(rex.toDenom.value, 10);
    const fromCountInput = parseInt(rex.fromCount.value, 10) || 0;
    
    const fromPettyCount = currentResults.distribution.pettyCash[fromDenom] || 0;
    rex.fromPreview.innerHTML = `可用: ${fromPettyCount} 張/枚`;
    
    const toRevenueCount = currentResults.distribution.revenue[toDenom] || 0;
    rex.toPreview.innerHTML = `可用: ${toRevenueCount} 張/枚`;
    
    const swapPath = findValidSwapPath(fromDenom, toDenom, fromCountInput, currentResults.distribution);
    if (fromCountInput > 0) {
        if (swapPath.possible) {
            rex.toPreview.innerHTML += `<br><span class="swap-path possible">✔ 可換入 ${swapPath.countToReceive} 張/枚</span>`;
        } else {
            rex.toPreview.innerHTML += `<br><span class="swap-path impossible">✖ 無法完成此交換</span>`;
        }
    }
    
    rex.performBtn.disabled = !swapPath.possible || fromCountInput <= 0;
}

/**
 * 更新收納零錢對換預覽
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 當前狀態
 */
function updateCoinConsolidationPreview(domElements, state) {
    const cc = domElements.coinConsolidation;
    
    if (!state.exchangeHistory || state.exchangeHistory.length === 0) return;
    
    const currentResults = state.exchangeHistory[state.exchangeHistory.length - 1];
    if (!currentResults) return;

    const fromDenom = parseInt(cc.fromDenom.value, 10);
    const toDenom = parseInt(cc.toDenom.value, 10);
    const fromCountInput = parseInt(cc.fromCount.value, 10) || 0;
    
    const fromRevenueCount = currentResults.distribution.revenue[fromDenom] || 0;
    cc.fromPreview.innerHTML = `可用: ${fromRevenueCount} 枚`;

    const toPackingCount = calculatePackages(currentResults.distribution.pettyCash[toDenom] || 0, toDenom).loose;
    cc.toPreview.innerHTML = `可用: ${toPackingCount} 枚`;
    
    const swapPath = findValidCoinSwapPath(fromDenom, toDenom, fromCountInput, currentResults.distribution);

    if (fromCountInput > 0) {
        if (swapPath.possible) {
            cc.toPreview.innerHTML += `<br><span class="swap-path possible">✔ 可換入 ${swapPath.countToReceive} 枚</span>`;
        } else {
            cc.toPreview.innerHTML += `<br><span class="swap-path impossible">✖ 無法完成此交換</span>`;
        }
    }
    
    cc.performBtn.disabled = !swapPath.possible || fromCountInput <= 0;
}

/**
 * 渲染結果微調歷史記錄
 * @param {Object} domElements - DOM 元素集合
 * @param {Object} state - 當前狀態
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
    
    logEl.innerHTML = html || '<p style="text-align:center; color: var(--gray);">尚無微調紀錄</p>';
}

// === 總額換算工具 UI 函數 ===

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
 * 更新換算資訊顯示
 * @param {Object} domElements - DOM 元素集合
 */
function updateExchangeInfo(domElements) {
    const ex = domElements.exchange;
    const amount = parseInputValue(ex.amount.value);
    const fromDenom = parseInt(ex.from.value, 10);
    const toDenom = parseInt(ex.to.value, 10);
    
    const fromInput = domElements.amountInputs[fromDenom];
    const toInput = domElements.amountInputs[toDenom];
    
    if (!fromInput || !toInput) return;
    
    const fromCurrentAmount = parseInputValue(fromInput.value);
    const fromCurrentCount = Math.floor(fromCurrentAmount / fromDenom);
    const toCurrentAmount = parseInputValue(toInput.value);
    const toCurrentCount = Math.floor(toCurrentAmount / toDenom);
    
    ex.fromCurrentAmount.textContent = formatNumber(fromCurrentAmount);
    ex.fromCurrentCount.textContent = fromCurrentCount;
    ex.toCurrentAmount.textContent = formatNumber(toCurrentAmount);
    ex.toCurrentCount.textContent = toCurrentCount;
    
    let fromNewAmount = fromCurrentAmount;
    let toNewAmount = toCurrentAmount;
    
    // 驗證：必須為正數、不得超出來源、同時能被來源面額與目標面額整除
    const canConvert = amount > 0 &&
        amount <= fromCurrentAmount &&
        amount % fromDenom === 0 &&
        amount % toDenom === 0;

    if (canConvert) {
        fromNewAmount -= amount;
        toNewAmount += amount;
        // 啟用確認按鈕（如果存在）
        if (ex.confirm) {
            ex.confirm.disabled = false;
            ex.confirm.title = '';
        }
    } else {
        // 禁用確認按鈕並提供提示
        if (ex.confirm) {
            ex.confirm.disabled = true;
            if (amount > 0) {
                if (amount > fromCurrentAmount) {
                    ex.confirm.title = '轉換金額超出來源可用金額';
                } else if (amount % fromDenom !== 0) {
                    ex.confirm.title = '轉換金額必須為來源面額的整數倍';
                } else if (amount % toDenom !== 0) {
                    ex.confirm.title = '轉換金額必須能被目標面額整除';
                } else {
                    ex.confirm.title = '請確認轉換參數';
                }
            } else {
                ex.confirm.title = '請輸入轉換金額';
            }
        }
    }
    
    ex.fromNewAmount.textContent = formatNumber(fromNewAmount);
    ex.fromNewCount.textContent = Math.floor(fromNewAmount / fromDenom);
    ex.toNewAmount.textContent = formatNumber(toNewAmount);
    ex.toNewCount.textContent = Math.floor(toNewAmount / toDenom);
}

// === 其他 UI 工具函數 ===

/**
 * 顯示載入狀態
 * @param {boolean} show - 是否顯示載入狀態
 */
function showLoadingState(show) {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

/**
 * 顯示錯誤訊息
 * @param {string} message - 錯誤訊息
 */
function showErrorMessage(message) {
    alert(`錯誤：${message}`);
}

/**
 * 顯示成功訊息
 * @param {string} message - 成功訊息
 */
function showSuccessMessage(message) {
    // 可以用更優雅的通知方式替代 alert
    alert(`成功：${message}`);
}

/**
 * 建立通知彈出框
 * @param {string} message - 訊息內容
 * @param {string} type - 訊息類型 ('success', 'error', 'info')
 */
function createNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 自動消失
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * 滾動到指定元素
 * @param {HTMLElement} element - 目標元素
 */
function scrollToElement(element) {
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}