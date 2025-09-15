# 現金管理計算工具 - 項目完整筆記

## 項目概述
這是一個專為零售、餐飲等需要頻繁處理現金場景設計的智慧計算工具，能自動計算每日預留零用金與上繳營收，並提供多種微調功能。

## 技術架構

### 核心技術棧
- **HTML5**: 結構化標記
- **CSS3**: 大量使用 CSS Custom Properties 實現主題化與顏色自訂
- **JavaScript (ES6+)**: 原生 JavaScript，無外部框架依賴

### 應用程式狀態管理
- **狀態機設計**: 中央 `state` 物件管理所有資料
  - `state.inputs`: 使用者輸入資料
  - `state.results`: 計算結果
  - `state.exchangeHistory`: 微調歷史紀錄
- **持久化**: 使用 `localStorage`，Key 為 `cashTool.v2.6.state`
- **狀態同步**: 所有狀態變更後自動觸發 `saveState()`

## 核心功能邏輯

### 1. 計算引擎 (Calculation Engine)
```javascript
// 計算流程：
// 1. 資料收集與驗證 (collectInputs)
// 2. 零錢處理 (calculateResults)
// 3. 預留金分配 (findOptimalCombination)
// 4. 營收上繳計算
```

#### 零錢處理邏輯
- 計算所有硬幣 (50, 10, 5, 1元) 總額
- 使用模數運算 `total_coins % 100` 取得零頭
- 零頭歸入「營收上繳」，餘額保留於「預留零用金」

#### 預留金分配演算法
- 目標金額: 20,000 元
- 策略: 優先使用 100 元，再用 500 元輔助
- `findOptimalCombination`: 找出最佳紙鈔組合

### 2. 輸入系統 (Input System)

#### 多模式輸入
- **總額模式**: 直接輸入金額 (如 12500)
- **張數模式**: 對於大面額 (1000/500/100)，可輸入張數 (如 15)
- **袋/捆模式**: 輸入整包數量，自動換算

#### 驗證機制
- 嚴格倍數驗證: 總額必須能被面額整除
- 即時錯誤提示: `.input-error` class 與錯誤訊息
- 按鈕狀態控制: 驗證失敗時禁用計算按鈕

### 3. 微調工具系統 (Adjustment Tools)

#### 結果微調工具 (預留/上繳交換)
- **核心邏輯**: `findValidSwapPath()` 確保等值交換
- **約束條件**: 只能在「預留金」與「上繳營收」間交換
- **即時預覽**: `updateResultExchangePreview()` 顯示可用數量

#### 收納零錢對換工具
- **目的**: 整理硬幣，方便湊成整袋
- **邏輯**: 交換「上繳區」散幣與「打包區」硬幣
- **驗證**: `findValidCoinSwapPath()` 確保可行性

#### 歷史紀錄系統
- **資料結構**: `state.exchangeHistory` 陣列儲存狀態快照
- **操作**: 支援 Undo/Redo 和任意時間點回復
- **UI**: 點擊式歷史紀錄導航

### 4. 使用者介面設計 (UI Design)

#### 響應式設計
- 桌面、平板、手機適配
- CSS Grid 和 Flexbox 佈局
- 媒體查詢優化小螢幕體驗

#### 視覺設計系統
- **CSS 變數**: 統一色彩管理
- **面額顏色**: 每個面額有專屬顏色標識
- **狀態指示**: 錯誤、警告、成功狀態視覺回饋

#### 互動設計
- **Stepper 按鈕**: `+/-` 按鈕方便數量調整
- **摺疊面板**: 可收合的功能區塊
- **Modal 彈窗**: 說明、設定等輔助功能
- **動畫回饋**: 更新提示動畫

## 重要常數與配置

### 包裝規則 (PACKAGING_RULES)
```javascript
{
  'bundle100': { value: 2000, count: 20 },  // 100元 20張一捆
  'bag50': { value: 2000, count: 40 },      // 50元 40枚一袋
  'bag10': { value: 500, count: 50 },       // 10元 50枚一袋
  'bag5': { value: 250, count: 50 },        // 5元 50枚一袋
  'bag1': { value: 100, count: 100 }        // 1元 100枚一袋
}
```

### 面額配置
- **紙鈔**: [1000, 500, 100]
- **硬幣**: [50, 10, 5, 1]
- **支援張數模式**: [1000, 500, 100]
- **目標預留金**: 20,000 元

### 預設顏色主題
```css
--note-1000: #3D93F0;  /* 藍 */
--note-500: #C6A27B;   /* 棕 */
--note-100: #DE4545;   /* 紅 */
--coin-50: #DAA520;    /* 金 */
--coin-10: #453A3A;    /* 深灰 */
--coin-5: #A3A3A3;     /* 灰 */
--coin-1: #790C0C;     /* 深紅 */
```

## 關鍵演算法詳解

### 1. 最佳組合演算法 (findOptimalCombination)
```javascript
// 目標: 用 100 元和 500 元湊出指定金額
// 策略: 從最多 100 元開始嘗試，找到第一個可行解
for (let i = available100Count; i >= 0; i--) {
  const amount100 = i * 100;
  const remainingFor500 = remainingCashNeeded - amount100;
  if (remainingFor500 >= 0 && remainingFor500 % 500 === 0) {
    const needed500Count = remainingFor500 / 500;
    if (needed500Count <= available500Count) {
      return { found: true, used100: i, used500: needed500Count };
    }
  }
}
```

### 2. 零錢分解演算法 (getCoinsBreakdown)
```javascript
// 貪心演算法: 從大面額開始分解
const result = { 50: 0, 10: 0, 5: 0, 1: 0 };
for (const denom of [50, 10, 5, 1]) {
  const availableCount = Math.floor(availableAmounts[denom] / denom);
  const neededCount = Math.floor(remaining / denom);
  const usedCount = Math.min(availableCount, neededCount);
  result[denom] = usedCount;
  remaining -= usedCount * denom;
}
```

### 3. 包裝計算 (calculatePackages)
```javascript
// 計算整包數和散裝數
const packages = Math.floor(totalCount / rule.count);
const loose = totalCount % rule.count;
return { packages, loose, looseAmount: loose * denomination };
```

## 事件處理機制

### 輸入事件流
1. `handleAmountInput`: 處理金額輸入，判斷張數模式
2. `handleAmountBlur`: 失焦時轉換張數為金額
3. `validateAllInputs`: 驗證所有輸入的有效性
4. `updateStateFromInputs`: 更新狀態並保存

### 計算事件流
1. `handleCalculate`: 觸發計算流程
2. `collectInputs`: 收集並加總所有輸入
3. `calculateResults`: 執行核心計算邏輯
4. `updateUI`: 更新界面顯示
5. `setupResultExchangeTool`: 初始化微調工具

### 微調事件流
1. `updateResultExchangePreview`: 即時預覽交換結果
2. `performResultExchange`: 執行交換操作
3. `renderResultExchangeHistory`: 更新歷史紀錄顯示
4. `saveState`: 保存新狀態

## 資料結構設計

### State 物件結構
```javascript
state = {
  inputs: {
    [denomination]: {
      amount: number,      // 金額輸入框的值
      packages: number     // 袋/捆輸入框的值
    }
  },
  results: {
    totalAmount: number,           // 總金額
    movedCoinsAmount: number,      // 移入營收的零錢
    keptCoinsAmount: number,       // 保留的硬幣金額
    actualPettyCash: number,       // 實際預留零用金
    revenueAmount: number,         // 營收金額
    balanceGap: number,           // 與目標的差額
    distribution: {               // 分配結果
      pettyCash: { [denom]: count },
      revenue: { [denom]: count }
    },
    movedCoinsBreakdown: { [denom]: count }
  },
  exchangeHistory: [results]       // 微調歷史
}
```

### DOM 元素管理
```javascript
const dom = {
  calculateBtn, clearBtn, simulateBtn,
  amountInputs: { [denom]: element },
  bagInputs: { [denom]: element },
  errorMessages: { [denom]: element },
  modals: { package, manual, exchange, color },
  // ... 其他 DOM 元素分組
};
```

## 樣式系統架構

### CSS 變數系統
- 色彩變數: 主色調、面額色、狀態色
- 尺寸變數: 邊距、圓角、陰影
- 響應式斷點

### 組件化樣式
- `.card`: 卡片容器
- `.btn`: 按鈕系統 (primary, clear, simulate)
- `.input-group`: 輸入組件
- `.result-row`: 結果顯示行
- `.modal`: 彈窗系統

### 動畫系統
- `fadeIn`: 淡入動畫
- `pulse-error`: 錯誤脈動
- `flash-highlight`: 更新提示
- `slideDown`: 彈窗滑入

## 效能考量

### 狀態管理效能
- 避免頻繁 DOM 查詢: 集中管理 DOM 元素
- 最小化重繪: 批次更新 UI
- 記憶體管理: 適時清理事件監聽器

### 計算效能
- 貪心演算法: O(n) 時間複雜度
- 快取計算結果: 避免重複計算
- 延遲驗證: 使用 debounce 減少驗證頻率

## 擴展性設計

### 新增面額
1. 更新 `DENOMINATIONS` 陣列
2. 添加對應的 CSS 變數
3. 更新包裝規則 (如需要)
4. 添加 HTML 輸入元素

### 新增功能模組
1. 在 `dom` 物件中添加相關元素
2. 實現核心邏輯函數
3. 綁定事件監聽器
4. 更新狀態結構 (如需要)

### 國際化準備
- 字串常數化
- 數字格式化函數
- 貨幣符號配置

## 測試考量

### 單元測試重點
- 計算邏輯函數
- 驗證函數
- 狀態管理函數
- 演算法正確性

### 整合測試重點
- 完整計算流程
- 微調工具操作
- 狀態持久化
- 錯誤處理

### 使用者測試重點
- 各種輸入組合
- 邊界條件測試
- 響應式設計驗證
- 無障礙功能

## 維護注意事項

### 版本升級
- 狀態結構變更時需要遷移邏輯
- CSS 變數名稱變更需要向下相容
- localStorage Key 版本管理

### 效能監控
- 大數據量輸入的處理
- 長時間使用的記憶體洩漏
- 移動裝置的觸控響應

### 安全考量
- 輸入驗證與淨化
- XSS 防護 (雖然是靜態工具)
- 資料隱私 (localStorage 清理)
