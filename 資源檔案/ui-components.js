/* ?æÈ?ÁÆ°Á?Ë®àÁ?Â∑•ÂÖ∑ - UI ÁµÑ‰ª∂Ê®°Á? */

// === UI ?¥Êñ∞?áÊ∏≤?ìÂáΩ??===

/**
 * ?¥Êñ∞?¥ÂÄã‰Ωø?®ËÄÖ‰??? * @param {Object} results - Ë®àÁ?ÁµêÊ?
 * @param {Object} highlights - È´ò‰∫Æ?êÁ§∫?çÁΩÆ
 */
function updateUI(results, highlights = {}) {
    // ?¥Êñ∞Á∏ΩË¶Ω?ÄÂ°?    updateSummarySection(results);
    
    // ?¥Êñ∞?üÊî∂‰∏äÁπ≥?ÄÂ°?    updateRevenueSection(results);
    
    // ?¥Êñ∞?êÁ??∂Áî®?ëÂ?Â°?    updatePettyCashSection(results);
    
    // ?¥Êñ∞?∂Èå¢?ïÁ??ÄÂ°?    updateSmallCoinsSection(results);
    
    // ?¥Êñ∞Á°¨Âπ£?ìÂ??ÄÂ°?    updateCoinPackSection(results);
    
    // ?ïÁ?È´ò‰∫Æ?êÁ§∫
    handleHighlights(highlights);
}

/**
 * ?¥Êñ∞Á∏ΩË¶Ω?ÄÂ°? * @param {Object} results - Ë®àÁ?ÁµêÊ?
 */
function updateSummarySection(results) {
    // ?¥Êñ∞?ÑÈ?Á∏ΩË¶Ω?∏Ê?
    document.getElementById('total-amount').textContent = formatMoney(results.totalAmount);
    document.getElementById('summary-small-coins').textContent = formatMoney(results.movedCoinsAmount);
    document.getElementById('petty-cash-actual').textContent = formatMoney(results.actualPettyCash);
    document.getElementById('summary-revenue').textContent = formatMoney(results.revenueAmount);
    
    // ?πÊ?È§òÈ?Â∑ÆÁï∞Ë®≠Â??ØË™§?Ä??    const pettyCashBox = document.getElementById('petty-cash-box');
    pettyCashBox.classList.toggle('error', results.balanceGap !== 0);
}

/**
 * ?¥Êñ∞?üÊî∂‰∏äÁπ≥?ÄÂ°? * @param {Object} results - Ë®àÁ?ÁµêÊ?
 */
function updateRevenueSection(results) {
    let revenueNotesHTML = '';
    let revenueCoinsHTML = '';
    
    // ?ÜÂà•?ïÁ?Á¥ôÈ??åÁ°¨Âπ?    getSupportedDenominations().forEach(denom => {
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
    
    // ?¥Êñ∞ DOM ?ÉÁ?
    document.getElementById('revenue-notes').innerHTML = revenueNotesHTML || '<p class="item">??/p>';
    document.getElementById('revenue-coins').innerHTML = revenueCoinsHTML || '<p class="item">??/p>';
    document.getElementById('revenue-amount').textContent = formatMoney(results.revenueAmount);
}

/**
 * ?¥Êñ∞?êÁ??∂Áî®?ëÂ?Â°? * @param {Object} results - Ë®àÁ?ÁµêÊ?
 */
function updatePettyCashSection(results) {
    let pettyNotesHTML = '';
    let pettyCoinsHTML = '';
    
    // ?ÜÂà•?ïÁ?Á¥ôÈ??åÁ°¨Âπ???íÈô§?ÖÁ??∂Èù¢È°çÔ?
    getSupportedDenominations().forEach(denom => {
        // Ë∑≥È??ÖÁ??∂Èù¢È°?        if (APP_CONFIG.REVENUE_ONLY_DENOMS && APP_CONFIG.REVENUE_ONLY_DENOMS.includes(denom)) {
            return;
        }
        
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
    
    // ?¥Êñ∞ DOM ?ÉÁ?
    document.getElementById('paper-money-detail').innerHTML = pettyNotesHTML || '<p class="item">??/p>';
    document.getElementById('kept-coins-detail').innerHTML = pettyCoinsHTML || '<p class="item">??/p>';
    document.getElementById('petty-cash-final').textContent = formatMoney(results.actualPettyCash);
    
    // ?ïÁ?È§òÈ?Ë≠¶Â?
    updateBalanceWarning(results);
}

/**
 * ?¥Êñ∞È§òÈ?Ë≠¶Â??ÄÂ°? * @param {Object} results - Ë®àÁ?ÁµêÊ?
 */
function updateBalanceWarning(results) {
    const warningEl = document.getElementById('balance-warning');
    
    if (results.balanceGap !== 0) {
        const warningText = `?êÁ??∂Áî®?ëË??ÆÊ??∏Â∑Æ <strong>${formatMoney(results.balanceGap)}</strong>`;
        document.getElementById('balance-warning-text').innerHTML = warningText;
        warningEl.style.display = 'block';
    } else {
        warningEl.style.display = 'none';
    }
}

/**
 * ?¥Êñ∞?∂Èå¢?ïÁ??ÄÂ°? * @param {Object} results - Ë®àÁ?ÁµêÊ?
 */
function updateSmallCoinsSection(results) {
    // Ë®àÁ?Á°¨Âπ£Á∏ΩÈ?
    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce(
        (sum, d) => sum + (results.initialInputs[d] ? results.initialInputs[d].totalAmount : 0), 0
    );
    
    // ?¥Êñ∞?∫Êú¨Ë≥áË?
    document.getElementById('total-coins').textContent = formatMoney(totalCoinsAmount);
    document.getElementById('remainder-coins').textContent = formatMoney(results.movedCoinsAmount);
    document.getElementById('moved-coins').textContent = formatMoney(results.movedCoinsAmount);
    
    // ?¢Á??∂Èå¢?ÜËß£Ë©≥Ê?
    const coinBreakdownHTML = generateCoinBreakdownHTML(results);
    document.getElementById('coin-breakdown').innerHTML = coinBreakdownHTML;
}

/**
 * ?¢Á??∂Èå¢?ÜËß£??HTML
 * @param {Object} results - Ë®àÁ?ÁµêÊ?
 * @returns {string} HTML Â≠ó‰∏≤
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
        return '<div style="text-align:center;">?°Èõ∂?¢Áßª?•Á???/div>';
    }
}

/**
 * ?¥Êñ∞Á°¨Âπ£?ìÂ??ÄÂ°? * @param {Object} results - Ë®àÁ?ÁµêÊ?
 */
function updateCoinPackSection(results) {
    let coinPackHTML = '';
    
    // ?ïÁ??ÑÁ°¨Âπ?ù¢È°çÁ?????∏È?
    APP_CONFIG.COIN_DENOMINATIONS.forEach(denom => {
        const packageInfo = calculatePackages(results.distribution.pettyCash[denom], denom);
        if (packageInfo.loose > 0) {
            coinPackHTML += createDenomItemHTML(denom, packageInfo.loose, true);
        }
    });
    
    // ?¥Êñ∞ DOM ?ÉÁ?
    const packBlock = document.getElementById('coin-pack-block');
    packBlock.innerHTML = coinPackHTML || '<p class="item">?°Êï£Ë£ùÁ°¨Âπ?/p>';
}


/**
 * ?¥Êñ∞È©óË??ÄÂ°äÁ???- ?çË?ÔºöÊ≠§?ΩÊï∏Ë≤†Ë≤¨?≥Ê??¥Êñ∞ÈªûÊ†∏?Ä?ãÈ°ØÁ§? */
function updateVerificationStatus() {
    const checkboxes = document.querySelectorAll('.verify-checkbox');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    
    console.log(`È©óË??Ä?ãÊõ¥?? ${checkedCount}/${totalCount} ?ÖÁõÆÂ∑≤Â??ê`);
    
    const countElement = document.getElementById('verification-count');
    if (countElement) {
        countElement.textContent = `${checkedCount}/${totalCount}`;
    }
    
    // ?¥Êñ∞?Ä?ãÈ°ØÁ§?    const statusElement = document.getElementById('verification-status');
    if (statusElement) {
        const statusText = statusElement.querySelector('.status-text');
        
        if (checkedCount === totalCount) {
            statusElement.style.background = 'rgba(52, 168, 83, 0.1)';
            statusElement.style.borderColor = 'rgba(52, 168, 83, 0.3)';
            if (statusText) statusText.style.color = 'var(--secondary)';
            console.log('?Ä?âÈ?Ë≠âÈ??ÆÂ∑≤ÂÆåÊ?');
        } else {
            statusElement.style.background = 'rgba(13, 71, 161, 0.1)';
            statusElement.style.borderColor = 'rgba(13, 71, 161, 0.2)';
            if (statusText) statusText.style.color = 'var(--primary)';
        }
    } else {
        console.warn('?æ‰??∞È?Ë≠âÁ??ãÂ?Á¥?);
    }
}

/**
 * Âª∫Á??¢È??ÖÁõÆ??HTML
 * @param {number} denom - ?¢È?
 * @param {number} count - ?∏È?
 * @param {boolean} isPackView - ?ØÂê¶?∫Ê??ÖÊ™¢Ë¶? * @returns {string} HTML Â≠ó‰∏≤
 */
function createDenomItemHTML(denom, count, isPackView = false) {
    const amount = count * denom;
    
    if (isPackView) {
        // ?ìÂ?Ê™¢Ë?ÔºöÈ°ØÁ§∫Êï£Ë£ùÁ°¨Âπ?        return `
            <li class="item">
                <div class="denom-icon d${denom}">${denom}</div>
                <div class="coin-pack-value-container">
                    <span class="highlight-amount-pack">${formatNumber(amount)}</span>
                    <span class="coin-pack-loose-count">(${count}??</span>
                </div>
            </li>
        `;
    }
    
    // ‰∏Ä?¨Ê™¢Ë¶ñÔ?È°ØÁ§∫?ëÈ??åÂ?Ë£ùË?Ë®?    const packageInfo = calculatePackages(count, denom);
    let metaText = '';
    
    if (denom >= 100) {
        // Á¥ôÈ??ÖË?Ë≥áË?
        metaText = packageInfo.packages > 0 ? 
            `${packageInfo.packages}?Ü` + (packageInfo.loose > 0 ? ` + ${packageInfo.loose}Âºµ` : '') : 
            `${count}Âºµ`;
    } else {
        // Á°¨Âπ£?ÖË?Ë≥áË?
        metaText = packageInfo.packages > 0 ? 
            `${packageInfo.packages}Ë¢ã` + (packageInfo.loose > 0 ? ` + ${packageInfo.loose}?ö` : '') : 
            `${count}?ö`;
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
 * ?ïÁ?È´ò‰∫Æ?êÁ§∫?àÊ?
 * @param {Object} highlights - È´ò‰∫Æ?çÁΩÆ
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
 * ?ÉÁ??ÉÁ?‰ª•Ê?Á§∫Êõ¥?? * @param {HTMLElement} el - Ë¶ÅÈ??çÁ??ÉÁ?
 */
function flashElement(el) {
    if (!el) return;
    
    // ?àÁßª?§Â??´È??•Ô?Ëß∏Áôº?çÊ?ÔºåÂ?Ê∑ªÂ?
    el.classList.remove('update-highlight');
    void el.offsetWidth; // Âº∑Âà∂?çÊ?
    el.classList.add('update-highlight');
}

// === ÂæÆË™øÂ∑•ÂÖ∑ UI ?ΩÊï∏ ===

/**
 * Ë®≠Â?ÁµêÊ?ÂæÆË™øÂ∑•ÂÖ∑
 * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 */
function setupResultExchangeTool(domElements) {
    const rex = domElements.resultExchange;
    
    // Âª∫Á??¢È??∏È?ÔºàÊ??§Â??üÊî∂?¢È?Ôº?    const availableDenoms = APP_CONFIG.DENOMINATIONS.filter(denom => 
        !APP_CONFIG.REVENUE_ONLY_DENOMS.includes(denom)
    );
    
    const optionsHTML = availableDenoms
        .map(denom => {
            const className = APP_CONFIG.EXTENDED_DENOMINATIONS.includes(denom) ? 
                (APP_CONFIG.SETTINGS.showExtendedDenoms ? 'extended-option show' : 'extended-option') :
                '';
            const style = APP_CONFIG.EXTENDED_DENOMINATIONS.includes(denom) && !APP_CONFIG.SETTINGS.showExtendedDenoms ? 
                'style="display: none;"' : '';
            return `<option value="${denom}" class="${className}" ${style}>${denom}??/option>`;
        })
        .join('');
    
    rex.fromDenom.innerHTML = optionsHTML;
    rex.toDenom.innerHTML = optionsHTML;
    
    // Ë®≠Â??êË®≠??    rex.fromDenom.value = '100';
    rex.toDenom.value = '50';
    rex.fromCount.value = '';
    
    // Ê™¢Êü•?ØÂê¶?âÁ??ãÂ?Ë™øÁî®?êË¶Ω?¥Êñ∞
    if (window.cashApp && window.cashApp.stateManager) {
        const state = window.cashApp.stateManager.getState();
        if (state.exchangeHistory && state.exchangeHistory.length > 0) {
            updateResultExchangePreview(domElements, state);
            renderResultExchangeHistory(domElements, state);
        }
    }
}

/**
 * ?¥Êñ∞ÁµêÊ?ÂæÆË™ø?êË¶Ω
 * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 * @param {Object} state - ?âÁî®Á®ãÂ??Ä?? */
function updateResultExchangePreview(domElements, state) {
    const rex = domElements.resultExchange;
    const currentResults = state.exchangeHistory[state.exchangeHistory.length - 1];
    
    if (!currentResults) return;
    
    const fromDenom = parseInt(rex.fromDenom.value, 10);
    const toDenom = parseInt(rex.toDenom.value, 10);
    const fromCountInput = parseInt(rex.fromCount.value, 10) || 0;
    
    // È°ØÁ§∫?ØÁî®?∏È?
    const fromPettyCount = currentResults.distribution.pettyCash[fromDenom] || 0;
    rex.fromPreview.innerHTML = `?ØÁî®: ${fromPettyCount} Âº??ö`;
    
    const toRevenueCount = currentResults.distribution.revenue[toDenom] || 0;
    rex.toPreview.innerHTML = `?ØÁî®: ${toRevenueCount} Âº??ö`;
    
    // Ê™¢Êü•‰∫§Ê??ØË???    const swapPath = findValidSwapPath(fromDenom, toDenom, fromCountInput, currentResults.distribution);
    
    if (fromCountInput > 0) {
        if (swapPath.possible) {
            rex.toPreview.innerHTML += `<br><span class="swap-path possible">???ØÊ???${swapPath.countToReceive} Âº???/span>`;
        } else {
            rex.toPreview.innerHTML += `<br><span class="swap-path impossible">???°Ê?ÂÆåÊ?Ê≠§‰∫§??/span>`;
        }
    }
    
    // ?ßÂà∂?âÈ??Ä??    rex.performBtn.disabled = !swapPath.possible;
}

/**
 * Ë®≠Â??∂Á??∂Èå¢Â∞çÊ?Â∑•ÂÖ∑
 * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 * @param {Object} state - ?âÁî®Á®ãÂ??Ä?ãÔ?ÂøÖÈ??≥ÂÖ•‰ª•ÈÅø?çundefined?ØË™§Ôº? */
function setupCoinConsolidationTool(domElements, state) {
    const cc = domElements.coinConsolidation;
    
    // Âª∫Á?Á°¨Âπ£?¢È??∏È?
    const optionsHTML = APP_CONFIG.COIN_DENOMINATIONS
        .map(denom => `<option value="${denom}">${denom}??/option>`)
        .join('');
    
    cc.fromDenom.innerHTML = optionsHTML;
    cc.toDenom.innerHTML = optionsHTML;
    
    // Ë®≠Â??êË®≠??    cc.fromDenom.value = '5';
    cc.toDenom.value = '10';
    cc.fromCount.value = '';
    
    // ?çË?ÔºöÂ??àÂÇ≥?•Á??ãÂ?Ë±°‰ª•?øÂ?exchangeHistory?™Â?Áæ©ÈåØË™?    if (state && state.exchangeHistory && state.exchangeHistory.length > 0) {
        updateCoinConsolidationPreview(domElements, state);
    }
}

/**
 * ?¥Êñ∞?∂Á??∂Èå¢Â∞çÊ??êË¶Ω
 * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 * @param {Object} state - ?âÁî®Á®ãÂ??Ä?? */
function updateCoinConsolidationPreview(domElements, state) {
    const cc = domElements.coinConsolidation;
    const currentResults = state.exchangeHistory[state.exchangeHistory.length - 1];
    
    if (!currentResults) return;
    
    const fromDenom = parseInt(cc.fromDenom.value, 10);
    const toDenom = parseInt(cc.toDenom.value, 10);
    const fromCountInput = parseInt(cc.fromCount.value, 10) || 0;
    
    // È°ØÁ§∫‰∏äÁπ≥?Ä?ØÁî®?∏È?
    const fromRevenueCount = currentResults.distribution.revenue[fromDenom] || 0;
    cc.fromPreview.innerHTML = `?ØÁî®: ${fromRevenueCount} ?ö`;
    
    // È°ØÁ§∫?ìÂ??Ä?ØÁî®?∏È?ÔºàÊï£Ë£ùÔ?
    const toPackingCount = calculatePackages(currentResults.distribution.pettyCash[toDenom] || 0, toDenom).loose;
    cc.toPreview.innerHTML = `?ØÁî®: ${toPackingCount} ?ö`;
    
    // Ê™¢Êü•‰∫§Ê??ØË???    const swapPath = findValidCoinSwapPath(fromDenom, toDenom, fromCountInput, currentResults.distribution);
    
    if (fromCountInput > 0) {
        if (swapPath.possible) {
            cc.toPreview.innerHTML += `<br><span class="swap-path possible">???ØÊ???${swapPath.countToReceive} ??/span>`;
        } else {
            cc.toPreview.innerHTML += `<br><span class="swap-path impossible">???°Ê?ÂÆåÊ?Ê≠§‰∫§??/span>`;
        }
    }
    
    // ?ßÂà∂?âÈ??Ä??    cc.performBtn.disabled = !swapPath.possible;
}

/**
 * Ê∏≤Ê?ÁµêÊ?ÂæÆË™øÊ≠∑Âè≤Ë®òÈ?
 * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 * @param {Object} state - ?âÁî®Á®ãÂ??Ä?? */
function renderResultExchangeHistory(domElements, state) {
    const logEl = domElements.resultExchange.log;
    
    if (!state.exchangeHistory || state.exchangeHistory.length <= 1) {
        logEl.innerHTML = '<p style="text-align:center; color: var(--gray);">Â∞öÁÑ°ÂæÆË™øÁ¥Ä??/p>';
        return;
    }
    
    let html = '';
    const activeIndex = state.exchangeHistory.length - 1;
    
    state.exchangeHistory.forEach((item, index) => {
        if (index > 0) { // Ë∑≥È??ùÂ??Ä??            const timestamp = item.lastAction && item.lastAction.time ? 
                new Date(item.lastAction.time).toLocaleTimeString('zh-TW', { hour12: false }) : 
                '?™Áü•?ÇÈ?';
            
            const actionText = `
                <span class="history-timestamp">${timestamp}</span> 
                <span class="history-action">${item.lastAction ? item.lastAction.text : '?™Áü•?ç‰?'}</span>
            `;
            
            const activeClass = index === activeIndex ? 'active' : '';
            html += `<div class="history-log-item ${activeClass}" data-index="${index}">${actionText}</div>`;
        }
    });
    
    logEl.innerHTML = html || '<p style="text-align:center; color: var(--gray);">Â∞öÁÑ°ÂæÆË™øÁ¥Ä??/p>';
}

// === È°èËâ≤ÁÆ°Á??ΩÊï∏ ===

/**
 * ?ùÂ??ñÈ??≤ÈÅ∏?áÂô®
 * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 */
function initColorPickers(domElements) {
    [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS].forEach(denom => {
        const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
        const currentColor = getComputedStyle(document.documentElement)
            .getPropertyValue(varName).trim() || APP_CONFIG.DEFAULT_COLORS[denom];
        
        const picker = domElements.color.pickers[denom];
        const hexDisplay = domElements.color.hexes[denom];
        
        if (picker && hexDisplay) {
            picker.value = currentColor;
            hexDisplay.textContent = currentColor.toUpperCase();
        }
        
        // ?ßÂà∂?¥Â??¢È??ÑÈ??≤ÈÅ∏?áÂô®È°ØÁ§∫
        if (APP_CONFIG.EXTENDED_DENOMINATIONS.includes(denom)) {
            const colorElement = document.getElementById(`color-picker-${denom}`);
            if (colorElement) {
                colorElement.classList.toggle('show', APP_CONFIG.SETTINGS.showExtendedDenoms);
            }
        }
    });
}

/**
 * Â•óÁî®È°èËâ≤??CSS ËÆäÊï∏
 * @param {number} denom - ?¢È?
 * @param {string} color - È°èËâ≤?? */
function applyColor(denom, color) {
    const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
    document.documentElement.style.setProperty(varName, color);
}

/**
 * ?çÁΩÆ?Ä?âÈ??≤ÁÇ∫?êË®≠?? * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 */
function resetColors(domElements) {
    Object.entries(APP_CONFIG.DEFAULT_COLORS).forEach(([denom, color]) => {
        applyColor(parseInt(denom, 10), color);
    });
    
    if (domElements) {
        initColorPickers(domElements);
    }
}

/**
 * ?áÊ??¥Â??¢È?È°ØÁ§∫
 * @param {boolean} show - ?ØÂê¶È°ØÁ§∫
 */
function toggleExtendedDenominations(show) {
    // ?¥Êñ∞Ë®≠Â?
    APP_CONFIG.SETTINGS.showExtendedDenoms = show;
    
    // ?¥Êñ∞Ëº∏ÂÖ•Ê¨Ñ‰?
    document.querySelectorAll('.extended-denom').forEach(el => {
        el.classList.toggle('show', show);
    });
    
    // ?¥Êñ∞?∏È?
    document.querySelectorAll('.extended-option').forEach(el => {
        el.classList.toggle('show', show);
        el.style.display = show ? 'block' : 'none';
    });
    
    // ?¥Êñ∞È°èËâ≤?∏Ê???    document.querySelectorAll('.extended-color').forEach(el => {
        el.classList.toggle('show', show);
    });
    
    // ?¥Êñ∞?¢È??õÁ?Â∑•ÂÖ∑
    updateExchangeOptions();
}

/**
 * ?¥Êñ∞?õÁ?Â∑•ÂÖ∑?ÑÈÅ∏?? */
function updateExchangeOptions() {
    const selects = document.querySelectorAll('#exchange-from, #exchange-to');
    selects.forEach(select => {
        const options = select.querySelectorAll('.extended-option');
        options.forEach(option => {
            option.style.display = APP_CONFIG.SETTINGS.showExtendedDenoms ? 'block' : 'none';
        });
    });
}

/**
 * ?áÊ??óËâ≤Ê®°Â?
 * @param {boolean} isDark - ?ØÂê¶?∫Ê??≤Ê®°Âº? */
function toggleDarkMode(isDark) {
    APP_CONFIG.SETTINGS.darkMode = isDark;
    document.body.classList.toggle('dark-mode', isDark);
    
    // ?¥Êñ∞?âÈ??ñÁ§∫
    const themeIcon = document.querySelector('#theme-toggle .theme-icon');
    if (themeIcon) {
        themeIcon.textContent = isDark ? '??' : '??';
    }
}

/**
 * ?ùÂ??ñÈ?Ë≠âÂ?Â°?- ?çË?ÔºöÁ¢∫‰øùÂç≥?ÇÊõ¥?∞Â??ΩÊ≠£Â∏∏È?‰Ω? */
function initVerificationBlock() {
    const checkboxes = document.querySelectorAll('.verify-checkbox');
    console.log(`?æÂà∞ ${checkboxes.length} ?ãÈ?Ë≠âÊ†∏?ñÊñπÂ°ä`);
    
    checkboxes.forEach((checkbox, index) => {
        // ÁßªÈô§?äÁ?‰∫ã‰ª∂??ÅΩ?®Ô?Â¶ÇÊ?Â≠òÂú®Ôº?        checkbox.removeEventListener('change', updateVerificationStatus);
        
        // Ê∑ªÂ??∞Á?‰∫ã‰ª∂??ÅΩ??        checkbox.addEventListener('change', (e) => {
            console.log(`?∏Â??πÂ? ${index + 1} ?Ä?ãË???`, e.target.checked);
            updateVerificationStatus();
        });
        
        // Á¢∫‰??ùÂ??Ä?ãÊ≠£Á¢?        checkbox.checked = false;
    });
    
    // ?ùÂ??ñÁ??ãÈ°ØÁ§?    updateVerificationStatus();
    console.log('È©óË??ÄÂ°äÂ?ÂßãÂ?ÂÆåÊ?');
}

// === Á∏ΩÈ??õÁ?Â∑•ÂÖ∑ ===

/**
 * ?ùÂ??ñÁ∏ΩÈ°çÊ?ÁÆóÂ?Á™? * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 */
function initExchangeModal(domElements) {
    const ex = domElements.exchange;
    ex.amount.value = '';
    updateExchangeInfo(domElements);
}

/**
 * ?¥Êñ∞Á∏ΩÈ??õÁ?Ë≥áË?
 * @param {Object} domElements - DOM ?ÉÁ??ÜÂ?
 */
function updateExchangeInfo(domElements) {
    const ex = domElements.exchange;
    const amount = parseInputValue(ex.amount.value);
    const fromDenom = parseInt(ex.from.value, 10);
    const toDenom = parseInt(ex.to.value, 10);
    
    // ?ñÂ??∂Â??ëÈ?
    const fromCurrentAmount = parseInputValue(domElements.amountInputs[fromDenom].value);
    const fromCurrentCount = Math.floor(fromCurrentAmount / fromDenom);
    const toCurrentAmount = parseInputValue(domElements.amountInputs[toDenom].value);
    const toCurrentCount = Math.floor(toCurrentAmount / toDenom);
    
    // ?¥Êñ∞?∂Â?Ë≥áË?
    ex.fromCurrentAmount.textContent = formatNumber(fromCurrentAmount);
    ex.fromCurrentCount.textContent = fromCurrentCount;
    ex.toCurrentAmount.textContent = formatNumber(toCurrentAmount);
    ex.toCurrentCount.textContent = toCurrentCount;
    
    // Ë®àÁ?ËΩâÊ?ÂæåÁ??ëÈ?
    let fromNewAmount = fromCurrentAmount;
    let toNewAmount = toCurrentAmount;
    
    if (amount > 0 && amount <= fromCurrentAmount && amount % fromDenom === 0) {
        fromNewAmount -= amount;
        toNewAmount += amount;
    }
    
    // ?¥Êñ∞ËΩâÊ?ÂæåË?Ë®?    ex.fromNewAmount.textContent = formatNumber(fromNewAmount);
    ex.fromNewCount.textContent = Math.floor(fromNewAmount / fromDenom);
    ex.toNewAmount.textContent = formatNumber(toNewAmount);
    ex.toNewCount.textContent = Math.floor(toNewAmount / toDenom);
}

// === ?ØÂá∫?ΩÊï∏ ===
if (typeof module !== 'undefined' && module.exports) {
    // Node.js ?∞Â?
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
        updateExchangeInfo,
        toggleExtendedDenominations,
        toggleDarkMode,
        initVerificationBlock,
        updateVerificationStatus
    };
} else {
    // ?èË¶Ω?®Áí∞Â¢ÉÔ?Â∞áÂáΩ?∏Êö¥?≤Âà∞?®Â?‰ΩúÁî®??    window.updateUI = updateUI;
    window.updateSummarySection = updateSummarySection;
    window.updateRevenueSection = updateRevenueSection;
    window.updatePettyCashSection = updatePettyCashSection;
    window.updateSmallCoinsSection = updateSmallCoinsSection;
    window.updateCoinPackSection = updateCoinPackSection;
    window.createDenomItemHTML = createDenomItemHTML;
    window.flashElement = flashElement;
    window.setupResultExchangeTool = setupResultExchangeTool;
    window.updateResultExchangePreview = updateResultExchangePreview;
    window.setupCoinConsolidationTool = setupCoinConsolidationTool;
    window.updateCoinConsolidationPreview = updateCoinConsolidationPreview;
    window.renderResultExchangeHistory = renderResultExchangeHistory;
    window.initColorPickers = initColorPickers;
    window.applyColor = applyColor;
    window.resetColors = resetColors;
    window.initExchangeModal = initExchangeModal;
    window.updateExchangeInfo = updateExchangeInfo;
    window.toggleExtendedDenominations = toggleExtendedDenominations;
    window.toggleDarkMode = toggleDarkMode;
    window.initVerificationBlock = initVerificationBlock;
    window.updateVerificationStatus = updateVerificationStatus;
}
