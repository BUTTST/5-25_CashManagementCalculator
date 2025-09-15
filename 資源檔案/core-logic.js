/* ?æÈ?ÁÆ°Á?Ë®àÁ?Â∑•ÂÖ∑ - ?∏Â??èËºØÊ®°Á? */

// === Â∏∏Êï∏?áÈ?ÁΩ?===
const APP_CONFIG = {
    STATE_KEY: 'cashTool.v3.9.state',           // localStorage ?≤Â??µÂÄ?    PETTY_CASH_TARGET: 20000,                   // ?êÁ??∂Áî®?ëÁõÆÊ®ôÈ?È°?    LONG_PRESS_DURATION: 5000,                  // ?∑Ê??çÁΩÆ?ÑÊ?Á∫åÊ??ìÔ?ÊØ´Á?Ôº?    
    // ?ÖË?Ë¶èÂ?ÔºöÂ?Áæ©Â??¢È??ÑÂ?Ë£ùÊñπÂº?    PACKAGING_RULES: { 
        'bundle2000': { value: 20000, count: 10 },  // 2000?ÉÔ?10Âºµ‰??ÜÔ??πÂÄ?0000??        'bundle200': { value: 4000, count: 20 },    // 200?ÉÔ?20Âºµ‰??ÜÔ??πÂÄ?000??        'bundle100': { value: 2000, count: 20 },    // 100?ÉÔ?20Âºµ‰??ÜÔ??πÂÄ?000??        'bag50': { value: 2000, count: 40 },        // 50?ÉÔ?40?ö‰?Ë¢ãÔ??πÂÄ?000??        'bag10': { value: 500, count: 50 },         // 10?ÉÔ?50?ö‰?Ë¢ãÔ??πÂÄ?00??        'bag5': { value: 250, count: 50 },          // 5?ÉÔ?50?ö‰?Ë¢ãÔ??πÂÄ?50??        'bag1': { value: 100, count: 100 }          // 1?ÉÔ?100?ö‰?Ë¢ãÔ??πÂÄ?00??    },
    
    // ?¢È??çÁΩÆ
    BASE_DENOMINATIONS: [1000, 500, 100, 50, 10, 5, 1],  // ?∫Á??ØÊè¥?ÑÈù¢È°?    EXTENDED_DENOMINATIONS: [2000, 200],                  // ?¥Â??¢È?ÔºàÂèØ?∏Ô?
    COIN_DENOMINATIONS: [50, 10, 5, 1],                   // Á°¨Âπ£?¢È?
    COUNT_MODE_DENOMS: [2000, 1000, 500, 200, 100],       // ?ØÊè¥ÂºµÊï∏Âø´Ëº∏Ê®°Â??ÑÈù¢È°?    REVENUE_ONLY_DENOMS: [2000, 200],                     // ?ÖËÉΩ?æÂú®?üÊî∂?ÑÈù¢È°?    
    // ?âÁî®Á®ãÂ?Ë®≠Â?
    SETTINGS: {
        showExtendedDenoms: false,  // ?ØÂê¶È°ØÁ§∫2000??00?¢È?
        darkMode: false,            // Ê∑±Ëâ≤Ê®°Â?
        machineNumber: 1,           // Ê©üË?
        staffList: ['1??, '2??, '3??]  // ‰∫∫Âì°Ê∏ÖÂñÆ
    },
    
    // ?êË®≠È°èËâ≤‰∏ªÈ?
    DEFAULT_COLORS: { 
        2000: '#8e24aa',    // Á¥´Ëâ≤
        1000: '#3D93F0',    // ?çËâ≤
        500: '#C6A27B',     // Ê£ïËâ≤
        200: '#ff7043',     // Ê©ôËâ≤
        100: '#DE4545',     // Á¥ÖËâ≤
        50: '#DAA520',      // ?ëËâ≤
        10: '#453A3A',      // Ê∑±ÁÅ∞
        5: '#A3A3A3',       // ?∞Ëâ≤
        1: '#790C0C'        // Ê∑±Á?
    },
    
    // ?ØÁßª?ïÂ?Â°äÈ?ÁΩ?    MOVABLE_BLOCKS: [
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

// ?ïÊ?Ë®àÁ??ØÊè¥?ÑÈù¢È°çÔ??πÊ?Ë®≠Â?Ôº?function getSupportedDenominations() {
    let denoms = [...APP_CONFIG.BASE_DENOMINATIONS];
    if (APP_CONFIG.SETTINGS.showExtendedDenoms) {
        denoms = [...APP_CONFIG.EXTENDED_DENOMINATIONS, ...denoms];
        denoms.sort((a, b) => b - a);
    }
    return denoms;
}

// ?¥Êñ∞ DENOMINATIONS Â±¨ÊÄß‰ª•?ØÊè¥?ïÊ?Ë®≠Â?
Object.defineProperty(APP_CONFIG, 'DENOMINATIONS', {
    get: function() {
        return getSupportedDenominations();
    }
});

// === ?∏Â?Ë®àÁ??ΩÊï∏ ===

/**
 * ?∂È??Ä?âËº∏?•Ë??ô‰∏¶?≤Ë??†Á∏ΩË®àÁ?
 * @param {Object} domInputs - DOM Ëº∏ÂÖ•?ÉÁ??ÜÂ?
 * @returns {Object} ?ïÁ?ÂæåÁ?Ëº∏ÂÖ•Ë≥áÊ?
 */
function collectInputs(domInputs) {
    const inputs = {};
    
    getSupportedDenominations().forEach(denom => {
        // Ê™¢Êü•DOM?ÉÁ??ØÂê¶Â≠òÂú®
        const amountInput = domInputs.amountInputs[denom];
        if (!amountInput) {
            inputs[denom] = { totalAmount: 0, count: 0 };
            return;
        }
        
        // ?ñÂ??ëÈ?Ëº∏ÂÖ•??        const amount = parseInputValue(amountInput.value);
        
        // ?ñÂ??ÖË?Ëº∏ÂÖ•?ºÔ?Ë¢??ÜÊï∏?èÔ?
        const bagInput = domInputs.bagInputs[denom];
        const packages = bagInput ? parseInputValue(bagInput.value) : 0;
        
        // Ë®àÁ??ÖË??ëÈ?
        let packageAmount = 0;
        if (packages > 0 && bagInput) {
            const packageKey = `${bagInput.dataset.packageType}${denom}`;
            if (APP_CONFIG.PACKAGING_RULES[packageKey]) {
                packageAmount = packages * APP_CONFIG.PACKAGING_RULES[packageKey].value;
            }
        }
        
        // Ë®àÁ?Á∏ΩÈ?È°çÂ??∏È?
        const totalAmount = amount + packageAmount;
        inputs[denom] = { 
            totalAmount, 
            count: Math.floor(totalAmount / denom) 
        };
    });
    
    return inputs;
}

/**
 * ?∑Ë??∏Â?Ë®àÁ??èËºØ
 * @param {Object} inputs - Ëº∏ÂÖ•Ë≥áÊ?
 * @returns {Object} ÂÆåÊï¥?ÑË?ÁÆóÁ??? */
function calculateResults(inputs) {
    const results = {};
    
    // ‰øùÂ??üÂ?Ëº∏ÂÖ•Ë≥áÊ?
    results.initialInputs = JSON.parse(JSON.stringify(inputs));
    
    // Ë®àÁ?Á∏ΩÈ?È°çÔ?‰ΩøÁî®?ïÊ??¢È??óË°®Ôº?    results.totalAmount = getSupportedDenominations().reduce(
        (sum, denom) => sum + (inputs[denom] ? inputs[denom].totalAmount : 0), 0
    );
    
    // === ?∂Èå¢?ïÁ??èËºØ ===
    // Ë®àÁ??Ä?âÁ°¨Âπ??Á∏ΩÈ?È°?    const totalCoinsAmount = APP_CONFIG.COIN_DENOMINATIONS.reduce(
        (sum, denom) => sum + (inputs[denom] ? inputs[denom].totalAmount : 0), 0
    );
    
    // Ë®àÁ??ÄË¶ÅÁßª?•Á??∂Á??∂È†≠Ôºà‰?Ë∂?00?ÉÁ??®Â?Ôº?    results.movedCoinsAmount = totalCoinsAmount % 100;
    
    // Ë®àÁ?‰øùÁ??ÑÁ°¨Âπ??È°çÔ??ØÊ??êÁôæ?ÉÁ??®Â?Ôº?    results.keptCoinsAmount = totalCoinsAmount - results.movedCoinsAmount;
    
    // Ë®àÁ??∂Èå¢?ÑË©≥Á¥∞Â?Ëß?    results.movedCoinsBreakdown = getCoinsBreakdown(
        results.movedCoinsAmount, 
        {
            50: inputs[50] ? inputs[50].totalAmount : 0,
            10: inputs[10] ? inputs[10].totalAmount : 0,
            5: inputs[5] ? inputs[5].totalAmount : 0,
            1: inputs[1] ? inputs[1].totalAmount : 0
        }
    );
    
    // === ?êÁ??∂Áî®?ëÂ??çÈ?Ëº?===
    // Ë®àÁ??ÑÈ?Ë¶ÅÂ?Â∞ëÁèæ?ëÊ??ΩÈ??∞ÁõÆÊ®ôÈ??ôÈ?
    const remainingCashNeeded = APP_CONFIG.PETTY_CASH_TARGET - results.keptCoinsAmount;
    
    let pettyCashPaperDetails = { used100: 0, used500: 0, amount: 0 };
    
    if (remainingCashNeeded > 0) {
        // ‰ΩøÁî®?Ä‰Ω≥Á??àÊ?ÁÆóÊ??æÂá∫Á¥ôÈ??ÜÈ??πÊ?
        const combo = findOptimalCombination(
            remainingCashNeeded, 
            inputs[100] ? inputs[100].count : 0, 
            inputs[500] ? inputs[500].count : 0
        );
        
        if (combo.found) {
            // ?æÂà∞ÂÆåÁ?ÁµÑÂ?
            pettyCashPaperDetails = { 
                used100: combo.used100, 
                used500: combo.used500, 
                amount: combo.amount100 + combo.amount500 
            };
        } else {
            // ?°Ê?ÂÆåÁ?ÊπäÈ?Ôºå‰Ωø?®Ë≤™ÂøÉÁ???            const available500 = inputs[500] ? inputs[500].count : 0;
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
    
    // Ë®àÁ?ÂØ¶È??êÁ??∂Áî®?ëÁ∏ΩÈ°?    results.actualPettyCash = results.keptCoinsAmount + pettyCashPaperDetails.amount;
    
    // Ë®àÁ??üÊî∂‰∏äÁπ≥?ëÈ?
    results.revenueAmount = results.totalAmount - results.actualPettyCash;
    
    // Ë®àÁ??áÁõÆÊ®ôÁ?Â∑ÆÈ?
    results.balanceGap = APP_CONFIG.PETTY_CASH_TARGET - results.actualPettyCash;
    
    // === ?ÑÈù¢È°çÂ??çÁ???===
    results.distribution = { pettyCash: {}, revenue: {} };
    
    getSupportedDenominations().forEach(denom => {
        if (!inputs[denom]) {
            results.distribution.pettyCash[denom] = 0;
            results.distribution.revenue[denom] = 0;
            return;
        }
        
        let pettyCashCount = 0;
        
        // ?ÖÁ??∂Èù¢È°ç‰??æÂú®?êÁ??ë‰∏≠
        if (APP_CONFIG.REVENUE_ONLY_DENOMS && APP_CONFIG.REVENUE_ONLY_DENOMS.includes(denom)) {
            pettyCashCount = 0;
        } else {
        // ?πÊ??¢È?È°ûÂ??ÜÈ??∏È?
        if (denom === 100) {
            pettyCashCount = pettyCashPaperDetails.used100;
        } else if (denom === 500) {
            pettyCashCount = pettyCashPaperDetails.used500;
        } else if (APP_CONFIG.COIN_DENOMINATIONS.includes(denom)) {
            // Á°¨Âπ£ÔºöÁ∏Ω?∏Ê??ªÁßª?•Á??∂Á??∏È?
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
 * ?æÂá∫?Ä‰Ω≥Á?100?ÉÂ?500?ÉÁ??à‰?ÊπäÂá∫?áÂ??ëÈ?
 * Á≠ñÁï•ÔºöÂÑ™?à‰Ωø??00?ÉÔ??çÁî®500?ÉË??? * @param {number} remainingCashNeeded - ?ÄË¶ÅÊ??∫Á??ëÈ?
 * @param {number} available100Count - ?ØÁî®??00?ÉÂºµ?? * @param {number} available500Count - ?ØÁî®??00?ÉÂºµ?? * @returns {Object} ÁµÑÂ?ÁµêÊ?
 */
function findOptimalCombination(remainingCashNeeded, available100Count, available500Count) {
    // ÂæûÊ?Â§?00?ÉÈ?ÂßãÂ?Ë©¶Ô??êÊ≠•Ê∏õÂ?
    for (let i = available100Count; i >= 0; i--) {
        const amount100 = i * 100;
        const remainingFor500 = remainingCashNeeded - amount100;
        
        // Ê™¢Êü•?©È??ëÈ??ØÂê¶?ΩË¢´500?¥Èô§
        if (remainingFor500 >= 0 && remainingFor500 % 500 === 0) {
            const needed500Count = remainingFor500 / 500;
            
            // Ê™¢Êü•?ØÂê¶?âË∂≥Â§†Á?500??            if (needed500Count <= available500Count) {
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
 * ‰ΩøÁî®Ë≤™Â?ÊºîÁ?Ê≥ïÂ??áÂ??ëÈ??ÜËß£?∫Á°¨Âπ? * @param {number} targetAmount - ?ÆÊ??ëÈ?
 * @param {Object} availableAmounts - ?ÑÈù¢È°çÂèØ?®È?È°? * @returns {Object} ?ÜËß£ÁµêÊ?
 */
function getCoinsBreakdown(targetAmount, availableAmounts) {
    let remaining = targetAmount;
    const result = { 50: 0, 10: 0, 5: 0, 1: 0 };
    
    // ÂæûÂ§ß?¢È??ãÂ??ÜËß£
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
 * Ë®àÁ??ÖË?Ë≥áË?ÔºàÊï¥?ÖÊï∏?åÊï£Ë£ùÊï∏Ôº? * @param {number} totalCount - Á∏ΩÊï∏?? * @param {number} denomination - ?¢È?
 * @returns {Object} ?ÖË?Ë≥áË?
 */
function calculatePackages(totalCount, denomination) {
    let packageKey = '';
    
    // Á¢∫Â??ÖË?È°ûÂ?
    if (denomination === 100) {
        packageKey = 'bundle100';
    } else if (denomination <= 50) {
        packageKey = `bag${denomination}`;
    } else {
        // ‰∏çÊîØ?¥Â?Ë£ùÁ??¢È?
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
    
    // Ë®àÁ??¥Â??∏Â??????    const packages = Math.floor(totalCount / rule.count);
    const loose = totalCount % rule.count;
    
    return { 
        packages, 
        loose, 
        looseAmount: loose * denomination 
    };
}

// === Ëº∏ÂÖ•È©óË??ΩÊï∏ ===

/**
 * È©óË??Ä?âËº∏?•Á??âÊ??? * @param {Object} domInputs - DOM Ëº∏ÂÖ•?ÉÁ?
 * @param {Object} inputs - ?ïÁ?ÂæåÁ?Ëº∏ÂÖ•Ë≥áÊ?
 * @returns {boolean} ?ØÂê¶?Ä?âËº∏?•ÈÉΩ?âÊ?
 */
function validateAllInputs(domInputs, inputs) {
    let allValid = true;
    
    for (const denomStr in inputs) {
        const denom = parseInt(denomStr, 10);
        const { totalAmount } = inputs[denom];
        const inputEl = domInputs.amountInputs[denom];
        const errorEl = domInputs.errorMessages[denom];
        
        // Ë∑≥È?‰∏çÂ??®Á?DOM?ÉÁ?
        if (!inputEl || !errorEl) continue;
        
        // Ê™¢Êü•Á∏ΩÈ??ØÂê¶?∫Èù¢È°çÁ??çÊï∏
        if (totalAmount % denom !== 0) {
            allValid = false;
            inputEl.classList.add('input-error');
            errorEl.textContent = `Á∏ΩÈ?ÂøÖÈ???${denom} ?ÑÂÄçÊï∏`;
            errorEl.classList.add('active');
        } else {
            inputEl.classList.remove('input-error');
            errorEl.classList.remove('active');
        }
    }
    
    return allValid;
}

// === ÂæÆË™øÂ∑•ÂÖ∑?èËºØ ===

/**
 * Â∞ãÊâæ?âÊ??Ñ‰∫§?õË∑ØÂæëÔ??êÁ??????üÊî∂Ôº? * @param {number} fromDenom - ËΩâÂá∫?¢È?
 * @param {number} toDenom - ËΩâÂÖ•?¢È?
 * @param {number} fromCount - ËΩâÂá∫?∏È?
 * @param {Object} distribution - ?∂Â??ÜÈ??ÄÊ≥? * @returns {Object} ‰∫§Ê??ØË??ßÁ??? */
function findValidSwapPath(fromDenom, toDenom, fromCount, distribution) {
    // ?∫Êú¨È©óË?
    if (fromCount <= 0 || fromDenom === toDenom) {
        return { possible: false };
    }
    
    const amountToSwap = fromCount * fromDenom;
    
    // Ê™¢Êü•?ØÂê¶?ΩÊï¥??    if (amountToSwap % toDenom !== 0) {
        return { possible: false };
    }
    
    const toCount = amountToSwap / toDenom;
    
    // Ê™¢Êü•Â∫´Â??ØÂê¶Ë∂≥Â?
    if (distribution.pettyCash[fromDenom] >= fromCount && 
        distribution.revenue[toDenom] >= toCount) {
        return { possible: true, countToReceive: toCount };
    }
    
    return { possible: false };
}

/**
 * Â∞ãÊâæ?âÊ??ÑÁ°¨Âπ?∫§?õË∑ØÂæëÔ?‰∏äÁπ≥?Ä ???ìÂ??ÄÔº? * @param {number} fromDenom - ËΩâÂá∫?¢È?
 * @param {number} toDenom - ËΩâÂÖ•?¢È?
 * @param {number} fromCount - ËΩâÂá∫?∏È?
 * @param {Object} distribution - ?∂Â??ÜÈ??ÄÊ≥? * @returns {Object} ‰∫§Ê??ØË??ßÁ??? */
function findValidCoinSwapPath(fromDenom, toDenom, fromCount, distribution) {
    // ?∫Êú¨È©óË?
    if (fromCount <= 0 || fromDenom === toDenom) {
        return { possible: false };
    }
    
    const amountToSwap = fromCount * fromDenom;
    
    // Ê™¢Êü•?ØÂê¶?ΩÊï¥??    if (amountToSwap % toDenom !== 0) {
        return { possible: false };
    }
    
    const toCount = amountToSwap / toDenom;
    
    // Ê™¢Êü•‰∏äÁπ≥?Ä?ØÂê¶?âË∂≥Â§†Êï∏??    const revenueHasEnough = distribution.revenue[fromDenom] >= fromCount;
    
    // Ê™¢Êü•?ìÂ??Ä?ØÂê¶?âË∂≥Â§†Á????Á°¨Âπ£
    const packingHasEnough = calculatePackages(distribution.pettyCash[toDenom], toDenom).loose >= toCount;
    
    if (revenueHasEnough && packingHasEnough) {
        return { possible: true, countToReceive: toCount };
    }
    
    return { possible: false };
}

// === Â∑•ÂÖ∑?ΩÊï∏ ===

/**
 * Ëß??Ëº∏ÂÖ•?ºÔ?ÁßªÈô§?óË?‰∏¶Ë??õÁÇ∫?∏Â?
 * @param {string} input - Ëº∏ÂÖ•Â≠ó‰∏≤
 * @returns {number} Ëß??ÂæåÁ??∏Â?
 */
function parseInputValue(input) {
    return parseInt(String(input).replace(/,/g, ''), 10) || 0;
}

/**
 * ?ºÂ??ñÊï∏Â≠óÔ?Ê∑ªÂ??ÉÂ?‰ΩçÈÄóË?
 * @param {number} number - Ë¶ÅÊ†ºÂºèÂ??ÑÊï∏Â≠? * @returns {string} ?ºÂ??ñÂ??ÑÂ?‰∏? */
function formatNumber(number) {
    const num = parseFloat(String(number).replace(/,/g, ''));
    return isNaN(num) ? '' : new Intl.NumberFormat('zh-TW').format(num);
}

/**
 * ?ºÂ??ñÈ?È°çÔ?Ê∑ªÂ?Ë≤®Âπ£?Æ‰?
 * @param {number} number - ?ëÈ??∏Â?
 * @returns {string} ?ºÂ??ñÂ??ÑÈ?È°çÂ?‰∏? */
function formatMoney(number) {
    return new Intl.NumberFormat('zh-TW').format(number || 0) + ' ??;
}

/**
 * ?∫Ëº∏?•Ê?Ê∑ªÂ??ÉÂ?‰ΩçÈÄóË??ºÂ??? * @param {HTMLInputElement} input - Ëº∏ÂÖ•?ÉÁ?
 */
function formatInputWithCommas(input) {
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    
    // ?ºÂ??ñÊï∏??    input.value = formatNumber(input.value.replace(/[^\d]/g, ''));
    
    // Ë™øÊï¥Ê∏∏Ê?‰ΩçÁΩÆ
    const newLength = input.value.length;
    const newCursorPos = cursorPos + (newLength - originalLength);
    input.setSelectionRange(newCursorPos, newCursorPos);
}

// === ?ÄÂ°äÁßª?ïÂ???===

/**
 * ÁßªÂ??ÄÂ°ä‰?ÁΩ? * @param {string} blockId - ?ÄÂ°?ID
 * @param {string} direction - ÁßªÂ??πÂ? ('up' | 'down')
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
 * ?∫Â?Â°äÊ∑ª?†Áßª?ïÊ??? * @param {HTMLElement} block - ?ÄÂ°äÂ?Á¥? */
function addMoveButtons(block) {
    if (!block || block.classList.contains('has-move-buttons')) return;
    
    const header = block.querySelector('.section-title');
    if (!header) return;
    
    // Ê™¢Êü•?ØÂê¶Â∑≤Á??âÁßª?ïÊ???    if (header.querySelector('.move-buttons')) return;
    
    const moveButtonsContainer = document.createElement('div');
    moveButtonsContainer.className = 'move-buttons';
    moveButtonsContainer.innerHTML = `
        <button class="move-btn move-up" data-block-id="${block.id}" data-direction="up" title="?ë‰?ÁßªÂ?">
            <span class="move-icon">??/span>
        </button>
        <button class="move-btn move-down" data-block-id="${block.id}" data-direction="down" title="?ë‰?ÁßªÂ?">
            <span class="move-icon">??/span>
        </button>
    `;
    
    header.appendChild(moveButtonsContainer);
    block.classList.add('has-move-buttons');
    
    // Á∂ÅÂ?ÈªûÊ?‰∫ã‰ª∂
    moveButtonsContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // ?≤Ê≠¢Ëß∏Áôº?∫Á??üËÉΩ
        const btn = e.target.closest('.move-btn');
        if (btn) {
            const blockId = btn.dataset.blockId;
            const direction = btn.dataset.direction;
            if (moveBlock(blockId, direction)) {
                // ÁßªÂ??êÂ?ÂæåÁ?Ë¶ñË¶∫?ûÈ?
                block.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    block.style.transform = '';
                }, 200);
            }
        }
    });
}

/**
 * ?ùÂ??ñÊ??âÂèØÁßªÂ??ÄÂ°äÁ?ÁßªÂ??âÈ?
 */
function initializeMovableBlocks() {
    APP_CONFIG.MOVABLE_BLOCKS.forEach(blockId => {
        const block = document.getElementById(blockId);
        if (block) {
            addMoveButtons(block);
        }
    });
}

// === È°çÂ?Ë®àÁ??üËÉΩ ===

/**
 * ?ØÂÖ•?®ÈÉ®Á∏ΩÈ?È°çÂà∞È°çÂ?Ë®àÁ??ÑÁ∏Ω?ëÈ?Ê¨Ñ‰?
 */
function importTotalAmount() {
    const totalEl = document.getElementById('total-amount');
    if (!totalEl) return;
    
    const num = parseInt(totalEl.textContent.replace(/[^0-9]/g, '')) || 0;
    const collectAmountInput = document.getElementById('collect-amount');
    if (collectAmountInput) {
        collectAmountInput.value = formatNumber(num);
        // Ëß∏ÁôºË®àÁ??¥Êñ∞
        updateExtraCalc();
    }
}

/**
 * ?¥Êñ∞È°çÂ?Ë®àÁ?ÁµêÊ?
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
    
    // ‰øÆÊ≠£Ë®àÁ??èËºØÔº?    // 1. Â∏≥Ë°®Á∏ΩÈ??ÉÊ??ªÁ∏Ω?ëÈ??ÑÊ?‰ΩçÊï∏?ºÔ?reportTotal - collectAmount
    // 2. PC?ÑÈÉ®?ÜÂ??ØÔ?pcAmount - collectAmount
    // 3. ?ÄÁµÇÁ??úËÄÉÊÖÆ?åÊ?Ëº∏ÂÖ•?ÑÂèØ?ΩÊÄ?    let result = 0;
    
    // ‰ª?î∂Ë®àÁ?ÔºöÁ∏Ω?ëÈ?Ë∂ÖÂá∫?±Ë°®Á∏ΩÈ??ÑÈÉ®?ÜÔ?Ê≠?ï∏Ë°®Á§∫Â§öÊî∂Ôº?    const collectionDiff = collectAmount - reportTotal;
    
    // PCË®àÁ?ÔºöPC?ëÈ??áÁ∏Ω?ëÈ??ÑÂ∑ÆÈ°çÔ?Ë≤†Êï∏Ë°®Á§∫?ÄË¶ÅÂ?Â∏≥Ë°®??ô§Ôº?    const pcDiff = pcAmount - collectAmount;
    
    // Á∂úÂ?Ë®àÁ?ÁµêÊ?
    result = collectionDiff + pcDiff;
    resultEl.textContent = `Ë®àÁ?ÁµêÊ?Ôº?{formatMoney(result)}`;
}

/**
 * ?áÊ?È°çÂ?Ë®àÁ??ÄÂ°äÁ??ñÂ??Ä?? */
function toggleExtraCalcLock() {
    const lockBtn = document.getElementById('lock-btn');
    const inputs = document.querySelectorAll('.extra-calc-input');
    
    if (!lockBtn) return;
    
    const isLocked = lockBtn.classList.contains('locked');
    
    lockBtn.classList.toggle('locked');
    lockBtn.textContent = isLocked ? '??' : '??';
    lockBtn.title = isLocked ? '?ñÂ?/Ëß??Ëº∏ÂÖ•Ê°? : 'ÈªûÊ?Ëß??Ëº∏ÂÖ•Ê°?;
    
    inputs.forEach(input => {
        input.disabled = !isLocked;
    });
    
    // Â¶ÇÊ?Ëß??ÔºåÁ??≥Êõ¥?∞Ë?ÁÆóÁ???    if (isLocked) {
        updateExtraCalc();
    }
}

/**
 * ?ùÂ??ñÈ?Â§ñË?ÁÆóÂ??? */
function initExtraCalc() {
    const container = document.getElementById('extraCalcContent');
    const lockBtn = document.getElementById('lock-btn');
    const inputs = document.querySelectorAll('.extra-calc-input');
    
    // ?ñÂ??üËÉΩ - ?çË?ÔºöÁ¢∫‰øù‰?‰ª∂Áõ£?ΩÂô®Ê≠?¢∫Á∂ÅÂ?
    if (lockBtn) {
        // ÁßªÈô§?ØËÉΩÂ≠òÂú®?ÑË???ÅΩ??        lockBtn.removeEventListener('click', toggleExtraCalcLock);
        // Ê∑ªÂ??∞Á???ÅΩ??        lockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleExtraCalcLock();
        });
        console.log('?ñÂ??âÈ?‰∫ã‰ª∂??ÅΩ?®Â∑≤Á∂ÅÂ?');
    } else {
        console.warn('?æ‰??∞È?ÂÆöÊ??ïÂ?Á¥?);
    }
    
    // Ëº∏ÂÖ•Ê°Ü‰?‰ª?    inputs.forEach(input => {
        input.addEventListener('input', () => {
            formatInputWithCommas(input);
            updateExtraCalc();
        });
    });
    
    // ?ùÂ??ñÁ???    updateExtraCalc();
}

// === ?ØÂá∫?∏Â??ΩÊï∏ ===
if (typeof module !== 'undefined' && module.exports) {
    // Node.js ?∞Â?
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
        updateExtraCalc,
        toggleExtraCalcLock,
        initExtraCalc
    };
} else {
    // ?èË¶Ω?®Áí∞Â¢ÉÔ?Â∞áÂáΩ?∏Êö¥?≤Âà∞?®Â?‰ΩúÁî®??    window.APP_CONFIG = APP_CONFIG;
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
    window.updateExtraCalc = updateExtraCalc;
    window.toggleExtraCalcLock = toggleExtraCalcLock;
    window.initExtraCalc = initExtraCalc;
}
