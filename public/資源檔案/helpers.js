/* 現金管理計算工具 - 輔助函數模組 */

// === 狀態恢復函數 ===

/**
 * 從狀態恢復輸入欄位的值
 * @param {Object} state - 狀態對象
 * @param {Object} domElements - DOM 元素集合
 */
function restoreInputsFromState(state, domElements) {
    if (!state || !state.inputs) return;
    
    // 恢復各面額的輸入值
    Object.entries(state.inputs).forEach(([denom, data]) => {
        const input = domElements.amountInputs[denom];
        if (input && data.totalAmount) {
            input.value = formatNumber(data.totalAmount);
        }
    });
}

/**
 * 從輸入欄位更新狀態
 * @param {StateManager} stateManager - 狀態管理器
 * @param {Object} domElements - DOM 元素集合
 */
function updateStateFromInputs(stateManager, domElements) {
    try {
        const inputs = collectInputs(domElements);
        stateManager.updateInputs(inputs);
    } catch (error) {
        console.error('更新狀態失敗:', error);
    }
}

// === 顏色管理函數 ===

/**
 * 初始化顏色選擇器
 * @param {Object} domElements - DOM 元素集合
 */
function initColorPickers(domElements) {
    const denoms = [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS];
    
    denoms.forEach(denom => {
        const picker = domElements.color.pickers[denom];
        const hex = domElements.color.hexes[denom];
        
        if (picker && hex) {
            // 從 localStorage 載入顏色或使用預設值
            const savedColor = localStorage.getItem(`color-${denom}`) || APP_CONFIG.DEFAULT_COLORS[denom];
            picker.value = savedColor;
            hex.textContent = savedColor.toUpperCase();
            applyColor(denom, savedColor);
        }
    });
}

/**
 * 應用顏色到指定面額
 * @param {number} denom - 面額
 * @param {string} color - 顏色代碼
 */
function applyColor(denom, color) {
    const varName = denom >= 100 ? `--note-${denom}` : `--coin-${denom}`;
    document.documentElement.style.setProperty(varName, color);
    localStorage.setItem(`color-${denom}`, color);
}

/**
 * 重置所有顏色為預設值
 * @param {Object} domElements - DOM 元素集合
 */
function resetColors(domElements) {
    const denoms = [...APP_CONFIG.BASE_DENOMINATIONS, ...APP_CONFIG.EXTENDED_DENOMINATIONS];
    
    denoms.forEach(denom => {
        const defaultColor = APP_CONFIG.DEFAULT_COLORS[denom];
        applyColor(denom, defaultColor);
        
        const picker = domElements.color.pickers[denom];
        const hex = domElements.color.hexes[denom];
        
        if (picker) picker.value = defaultColor;
        if (hex) hex.textContent = defaultColor.toUpperCase();
    });
    
    console.log('顏色已重置為預設值');
}

// === 主題管理函數 ===

/**
 * 切換深色模式
 * @param {boolean} isDark - 是否啟用深色模式
 */
function toggleDarkMode(isDark) {
    APP_CONFIG.SETTINGS.darkMode = isDark;
    
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // 更新主題切換按鈕圖示
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const icon = themeBtn.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }
    }
    
    console.log(`深色模式已${isDark ? '啟用' : '停用'}`);
}

// === 擴展面額管理 ===

/**
 * 切換擴展面額顯示
 * @param {boolean} show - 是否顯示擴展面額
 */
function toggleExtendedDenominations(show) {
    APP_CONFIG.SETTINGS.showExtendedDenoms = show;
    
    // 更新輸入組的顯示
    const input2000Group = document.getElementById('input-group-2000');
    const input200Group = document.getElementById('input-group-200');
    
    if (input2000Group) {
        input2000Group.style.display = show ? 'block' : 'none';
    }
    if (input200Group) {
        input200Group.style.display = show ? 'block' : 'none';
    }
    
    // 更新下拉選單選項
    document.querySelectorAll('.extended-option').forEach(option => {
        option.style.display = show ? 'block' : 'none';
    });
    
    // 更新顏色選擇器
    document.querySelectorAll('.extended-color').forEach(colorGroup => {
        colorGroup.style.display = show ? 'flex' : 'none';
    });
    
    console.log(`擴展面額已${show ? '啟用' : '停用'}`);
}

// === 驗證區塊功能 ===

/**
 * 初始化驗證區塊
 */
function initVerificationBlock() {
    const checkboxes = document.querySelectorAll('.verify-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateVerificationStatus();
        });
    });
    
    updateVerificationStatus();
}

/**
 * 更新驗證狀態顯示
 */
function updateVerificationStatus() {
    const checkboxes = document.querySelectorAll('.verify-checkbox');
    const countEl = document.getElementById('verification-count');
    
    if (!countEl) return;
    
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    
    countEl.textContent = `${checkedCount}/${totalCount}`;
    
    // 如果全部完成，添加視覺效果
    const statusEl = document.getElementById('verification-status');
    if (statusEl) {
        if (checkedCount === totalCount) {
            statusEl.style.background = 'rgba(52, 168, 83, 0.1)';
            statusEl.style.borderColor = 'var(--success)';
        } else {
            statusEl.style.background = 'rgba(13, 71, 161, 0.1)';
            statusEl.style.borderColor = 'rgba(13, 71, 161, 0.2)';
        }
    }
}

// === 通知系統 ===

/**
 * 顯示通知訊息
 * @param {string} message - 訊息內容
 * @param {string} type - 訊息類型 ('success', 'error', 'warning', 'info')
 * @param {number} duration - 顯示時長(毫秒)，預設3000
 */
function showNotification(message, type = 'info', duration = 3000) {
    // 移除舊通知
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // 創建新通知
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        font-weight: 600;
    `;
    
    // 根據類型設置背景色
    const colors = {
        success: '#d4edda',
        error: '#f8d7da',
        warning: '#fff3cd',
        info: '#d1ecf1'
    };
    const textColors = {
        success: '#155724',
        error: '#721c24',
        warning: '#856404',
        info: '#0c5460'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.style.color = textColors[type] || textColors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 自動消失
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// 添加動畫樣式
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// === 匯出函數 ===
if (typeof window !== 'undefined') {
    window.restoreInputsFromState = restoreInputsFromState;
    window.updateStateFromInputs = updateStateFromInputs;
    window.initColorPickers = initColorPickers;
    window.applyColor = applyColor;
    window.resetColors = resetColors;
    window.toggleDarkMode = toggleDarkMode;
    window.toggleExtendedDenominations = toggleExtendedDenominations;
    window.initVerificationBlock = initVerificationBlock;
    window.updateVerificationStatus = updateVerificationStatus;
    window.showNotification = showNotification;
}

