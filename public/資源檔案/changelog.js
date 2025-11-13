/* 現金管理計算工具 - 歷史更新紀錄模組 */

/**
 * 取得歷史更新紀錄 HTML 內容
 * @returns {string} HTML 字串
 */
function getChangelogHTML() {
    return `
        <div class="changelog-container">
            <!-- 2025/11/13 -->
            <div class="changelog-entry">
                <div class="changelog-date">2025/11/13</div>
                <div class="changelog-content">
                    <div class="changelog-section">
                        <h5 class="changelog-category">🔧 介面優化</h5>
                        <ul class="changelog-list">
                            <li><strong>區塊清理</strong>：刪除了「📝 點核區塊」和「PC與代收統計」等不必要的區塊，簡化介面結構。</li>
                            <li><strong>按鈕位置統一</strong>：統一了所有區塊的上下移動按鈕位置至左上角，確保排版位置與大小統一，提升使用體驗的一致性。</li>
                            <li><strong>更新記錄更名</strong>：將「每日更新紀錄」更名為「歷史更新紀錄」，更準確反映功能定位。</li>
                        </ul>
                    </div>
                    
                    <div class="changelog-section">
                        <h5 class="changelog-category">✨ 歷史記錄功能增強</h5>
                        <ul class="changelog-list">
                            <li><strong>面額換算工具獨立歷史記錄</strong>：為「面額換算工具 (總額)」新增獨立的歷史記錄系統，支援恢復上一步、重置所有換算，以及點擊歷史記錄一鍵復原。</li>
                            <li><strong>對換零錢湊整獨立歷史記錄</strong>：為「對換零錢湊整（上繳 ↔ 打包）」新增獨立的歷史記錄系統，與「[預留/上繳] 跨區等值交換」功能一致，各自擁有獨立的歷史記錄，互不干擾。</li>
                            <li><strong>一鍵復原功能</strong>：所有歷史記錄功能均支援點擊歷史記錄項目直接復原到該狀態，操作更加便捷。</li>
                        </ul>
                    </div>
                    
                    <div class="changelog-section">
                        <h5 class="changelog-category">🚀 部署修復</h5>
                        <ul class="changelog-list">
                            <li><strong>Vercel 部署問題解決</strong>：修正了靜態文件結構，將所有靜態文件移至 public 目錄，解決了部署後 404 錯誤的問題。</li>
                            <li><strong>PWA 圖標適配</strong>：確保所有 PWA 圖標和 manifest 文件正確載入，提升離線使用體驗。</li>
                            <li><strong>資源路徑優化</strong>：統一了資源文件的路徑引用，確保所有資源都能正常訪問。</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <hr class="changelog-divider">
            
            <!-- 2025/7/2 -->
            <div class="changelog-entry">
                <div class="changelog-date">2025/7/2</div>
                <div class="changelog-content">
                    <div class="changelog-section">
                        <h5 class="changelog-category">🎉 重點更新</h5>
                        <ul class="changelog-list">
                            <li><strong>README 文件完善</strong>：更新了完整的功能說明文件，詳細介紹工具的使用方式和技術特色。</li>
                            <li><strong>更新報告整理</strong>：新增了版本對比報告，記錄從 v1.0 到 v2.6 的完整演進過程。</li>
                            <li><strong>核心功能穩定</strong>：確認所有主要功能運作正常，包括計算引擎、微調工具、狀態持久化等。</li>
                        </ul>
                    </div>
                    
                    <div class="changelog-section">
                        <h5 class="changelog-category">🔧 文件改進</h5>
                        <ul class="changelog-list">
                            <li><strong>使用說明優化</strong>：在 README 中新增了詳細的使用步驟和功能亮點說明。</li>
                            <li><strong>技術文件完整</strong>：補充了核心演算法邏輯的技術說明，方便開發者理解。</li>
                            <li><strong>版本歷程記錄</strong>：建立了完整的版本更新紀錄，追蹤功能演進。</li>
                        </ul>
                    </div>
                    
                    <div class="changelog-section">
                        <h5 class="changelog-category">📊 功能特色</h5>
                        <ul class="changelog-list">
                            <li><strong>智慧計算引擎</strong>：自動處理零錢分配和預留金計算。</li>
                            <li><strong>便利輸入模式</strong>：支援張數快輸和袋/捆加總功能。</li>
                            <li><strong>強大微調工具</strong>：提供預留/上繳交換和零錢收納對換。</li>
                            <li><strong>狀態自動保存</strong>：使用 localStorage 技術保存使用者資料。</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <hr class="changelog-divider">
            
            <!-- 2025/6/4 -->
            <div class="changelog-entry">
                <div class="changelog-date">2025/6/4</div>
                <div class="changelog-content">
                    <div class="changelog-section">
                        <h5 class="changelog-category">🎉 重點更新</h5>
                        <ul class="changelog-list">
                            <li><strong>核心程式完成</strong>：完成主要的現金管理計算功能開發。</li>
                            <li><strong>檔案結構整理</strong>：上傳了完整的專案檔案，包含主程式和說明文件。</li>
                            <li><strong>功能測試驗證</strong>：驗證了計算邏輯的正確性和使用者介面的完整性。</li>
                        </ul>
                    </div>
                    
                    <div class="changelog-section">
                        <h5 class="changelog-category">🔧 技術實現</h5>
                        <ul class="changelog-list">
                            <li><strong>計算邏輯完善</strong>：實現了零錢處理、預留金分配、營收上繳的完整計算流程。</li>
                            <li><strong>介面設計優化</strong>：完成了響應式設計，支援各種裝置的良好顯示效果。</li>
                            <li><strong>狀態管理系統</strong>：建立了完整的應用程式狀態管理機制。</li>
                        </ul>
                    </div>
                    
                    <div class="changelog-section">
                        <h5 class="changelog-category">💰 業務邏輯</h5>
                        <ul class="changelog-list">
                            <li><strong>預留零用金目標</strong>：設定為 20,000 元的標準目標。</li>
                            <li><strong>包裝規則定義</strong>：建立了完整的硬幣袋裝和紙鈔捆裝規則。</li>
                            <li><strong>面額處理邏輯</strong>：支援 7 種面額 (1000, 500, 100, 50, 10, 5, 1) 的完整處理。</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <hr class="changelog-divider">
            
            <!-- 2025/6/2 -->
            <div class="changelog-entry">
                <div class="changelog-date">2025/6/2</div>
                <div class="changelog-content">
                    <div class="changelog-section">
                        <h5 class="changelog-category">🔧 功能調整</h5>
                        <ul class="changelog-list">
                            <li><strong>介面優化</strong>：針對使用者體驗進行了介面調整和優化。</li>
                            <li><strong>計算邏輯調整</strong>：微調了部分計算邏輯，提升準確性。</li>
                            <li><strong>錯誤處理改進</strong>：加強了輸入驗證和錯誤提示機制。</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <hr class="changelog-divider">
            
            <!-- 2025/5/29 -->
            <div class="changelog-entry">
                <div class="changelog-date">2025/5/29</div>
                <div class="changelog-content">
                    <div class="changelog-section">
                        <h5 class="changelog-category">🎉 專案啟動</h5>
                        <ul class="changelog-list">
                            <li><strong>專案初始化</strong>：建立了現金管理計算工具的基礎架構。</li>
                            <li><strong>核心概念確立</strong>：定義了預留零用金、營收上繳、零錢處理的核心業務邏輯。</li>
                            <li><strong>技術架構規劃</strong>：選定了純前端技術棧 (HTML5 + CSS3 + JavaScript)。</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- 版本演進總覽 -->
            <div class="changelog-summary">
                <h5 class="summary-title">版本演進總覽</h5>
                <div class="version-timeline">
                    <div class="version-item">
                        <span class="version-tag">v4.1</span>
                        <span class="version-date">(2025/11/13)</span>
                        <span class="version-desc">介面優化與歷史記錄功能增強</span>
                    </div>
                    <div class="version-item">
                        <span class="version-tag">v2.6</span>
                        <span class="version-date">(2025/7/2)</span>
                        <span class="version-desc">文件完善，功能穩定</span>
                    </div>
                    <div class="version-item">
                        <span class="version-tag">v2.0-2.5</span>
                        <span class="version-date">(2025/6/2-6/4)</span>
                        <span class="version-desc">核心功能開發與優化</span>
                    </div>
                    <div class="version-item">
                        <span class="version-tag">v1.0</span>
                        <span class="version-date">(2025/5/29)</span>
                        <span class="version-desc">專案啟動與基礎建設</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 初始化更新記錄彈窗
 */
function initChangelogModal() {
    const modal = document.getElementById('changelog-modal');
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = getChangelogHTML();
    }
}

// 匯出函數
if (typeof window !== 'undefined') {
    window.getChangelogHTML = getChangelogHTML;
    window.initChangelogModal = initChangelogModal;
}

