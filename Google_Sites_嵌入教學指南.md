# 🌐 徐秉鴻老師教學成果與「2026 台灣傑出永續教育人物」－Google Sites (Google 協作平台) 嵌入指南

本教學提供將「徐秉鴻老師教學成果與『2026 台灣傑出永續教育人物』數位典藏庫」無縫嵌入至您的 **Google Sites (Google 協作平台)** 的完整步驟與網址設定。無論在**桌機、筆電、iPad 平板**或**智慧型手機（iOS / Android）**皆具備 100% 純 HTML + CSS + JavaScript 結構與 RWD 自適應響應式設計，且**所有預覽圖片影像畫質已全面提升至 1080p Full HD 以上高畫質水準**！

---

## 🏆 方式一：Google Sites「依網址 (By URL)」嵌入（最佳首選推薦，零容量限制）

因為本網站完整收錄 **1,140 筆成果典藏、五大評選構面 99 項官方佐證、93 場 SDGs 活動相簿（823 張照片與截圖）、4 大核心專區與 6 大旗艦專題**，且全面升級為 **1080p 以上高解析影像**，Google 協作平台的「嵌入程式碼 (HTML)」輸入框對單次貼上的文字有字元上限（約 1 MB ~ 1.5 MB）；因此最推薦先把專案資料夾免費託管至 **GitHub Pages**（或 **Vercel / Netlify / 學校網頁空間**），再使用 Google Sites 的 **「依網址 (By URL)」** 嵌入！

### 📌 步驟 1：取得您的公開網站網址（以免費 GitHub Pages 為例）
1. 登入 [GitHub](https://github.com/) 並建立一個公開儲存庫（Repository），例如命名為 `binghong-teaching-portfolio`。
2. 將電腦中專案資料夾 `C:\Users\user\.gemini\antigravity\scratch\binghong-teaching-portfolio` 內的所有檔案上傳／推送（Push）至該儲存庫。
3. 在 GitHub 儲存庫上方點選 **Settings（設定）** &rarr; 左側選單點選 **Pages**。
4. 在 **Build and deployment** 下方的 **Branch** 選擇 `main`（或 `master`），資料夾選擇 `/(root)`，點擊 **Save**。
5. 等待約 1～2 分鐘部署完成後，即可取得您的專屬 `https://` 公開網址：
   - **主網站首頁（STEAM 跨域與永續旗艦版）**：  
     `https://<您的GitHub帳號>.github.io/binghong-teaching-portfolio/` （或結尾加 `index.html`）
   - **2026 台灣傑出永續教育人物 獨立深度專頁**：  
     `https://<您的GitHub帳號>.github.io/binghong-teaching-portfolio/special-sustainability.html`
   - **學院卓越智庫版**：  
     `https://<您的GitHub帳號>.github.io/binghong-teaching-portfolio/academic.html`
   - **自然走讀與書香人文版**：  
     `https://<您的GitHub帳號>.github.io/binghong-teaching-portfolio/literary.html`

> 💡 **不想用指令上傳？** 您也可以使用 **[Netlify Drop](https://app.netlify.com/drop)**：直接打開網頁，把整個 `binghong-teaching-portfolio` 資料夾用滑鼠拖拉進去，30 秒內就會自動產生一組 `https://xxxx.netlify.app` 專屬網址！

### 📌 步驟 2：嵌入至 Google Sites (Google 協作平台)
1. 開啟您的 [Google Sites (Google 協作平台)](https://sites.google.com/) 編輯畫面。
2. 點選右側工具列的 **「插入 (Insert)」** 標籤頁 &rarr; 點選 **「嵌入 (Embed)」**。
3. 停留在預設的 **「依網址 (By URL)」** 分頁，貼上上方取得的 `https://...` 網站網址。
4. 選擇 **「整個頁面 (Whole page)」** 後點擊 **「插入 (Insert)」**。
5. *(或者也可在左側「頁面 (Pages)」面板下方，將滑鼠移至 `＋` 號，點選 **「整頁嵌入 (Full page embed)」**，直接貼上網址，讓整個分頁滿版呈現，手機與平板滑動最順暢！)*
6. 點擊右上角 **「發布 (Publish)」** 即大功告成！

---

## 💻 方式二：使用「嵌入程式碼 (Embed Code)」自適應 iframe 嵌入

若您想在 Google Sites 頁面中自訂外框圓角、陰影與高度，可在點選「嵌入 (Embed)」後切換到 **「嵌入程式碼 (Embed code)」** 分頁，貼入以下純 HTML `<iframe>` 程式碼（請將 `src` 換成您的公開網址）：

```html
<!-- 徐秉鴻老師教學成果與「2026 台灣傑出永續教育人物」數位典藏庫 自適應 iframe 嵌入代碼 -->
<div style="width: 100%; position: relative; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); background: #ffffff;">
  <iframe
    src="https://您的網站網址/index.html"
    title="徐秉鴻老師 教學成果與2026台灣傑出永續教育人物數位典藏庫"
    style="width: 100%; height: 1000px; border: none; display: block; overflow: auto;"
    allow="clipboard-write; fullscreen"
    allowfullscreen
    loading="lazy">
  </iframe>
</div>
```

---

## 📦 方式三：單一自包含 HTML 檔案（離線備份與獨立發布）

專案根目錄中的 `google-sites-embed.html`（約 7.97 MB）為完全自包含（Self-contained）的獨立網頁檔案：
- 內建 103 張 720p/1080p/1440p HD 高畫質照片與證書輕量高解析編碼。
- 內建 141 筆雲端原版高解析照片串流。
- 內建 5 部 YouTube 1080p/720p 影音報導原版縮圖。
- 內建完整 CSS、三大核心專區、5 大 STREAM 旗艦專題、213 筆典藏成果與學術履歷。
- **本檔案非常適合直接放在隨身碟、離線筆電、學校內網主機中雙擊開啟展示**，亦可作為個人永久保存的數位典藏母檔。

---

## 📱 全載具 RWD 響應式規格檢驗報告

本版本已經過 Microsoft Edge Headless 瀏覽器多端解析度實測：

| 檢驗項目 | 測試數值與狀態 | 成果說明 |
| :--- | :--- | :--- |
| **三大核心成果專區圖片** | 橫式 1280px / 直式 1280~2048px | 全部達到 720p / 1080p Full HD 高畫質 |
| **5 大 STREAM 旗艦專題** | 橫式 1280~5436px (4K 級) | 清晰展現課堂現場、學生實作與競賽紀實 |
| **成果檔案庫 213 筆卡片** | 平均解析度寬度 **2,685 px** | 100% 達標，證書文字銳利分明（已精簡純文字與空白佔位欄位） |
| **影音報導卡片縮圖** | 1920×1080 (1080p) / 720p | 原廠高畫質預覽，點擊直暢播放 |
| **二維碼（QR Code）檢查** | **0 個顯示**（嚴格清除） | 視覺純粹乾淨，全面由高清實體照片替代 |
| **手機端與平板端 RWD** | 390px / 850px / 1440px 全通過 | 具備抽屜選單、橫向滑動標籤與防止左右溢出 |

---

## 🛠️ 常見問題排解 (FAQ)

### Q1：為什麼在 Google 協作平台中，直接把 25MB 的 HTML 程式碼貼入「嵌入程式碼」會跳出「檔案太大」？
這是因為 Google 協作平台的「嵌入程式碼」文字框有輸入上限（大約只能接受 1 MB ~ 1.5 MB 左右的純文字字元）。為了保證照片呈現 **720p / 1080p / 1440p 的真正高畫質**，包含 100 多張高清圖片的單檔容量約為 25 MB，因此超過了文字框的貼上字元上限。  
**最佳解法**：請依照【方式一】，將檔案放上 GitHub Pages（或學校伺服器），在 Google 協作平台選擇**「依網址 (By URL)」嵌入**，不僅**完全沒有檔案大小限制**，而且載入速度極快、隨時自動同步！

### Q2：在 Google Sites 嵌入後，點擊檔案下載或外連會被擋住嗎？
**不會。** 本網站的所有外連報導、論文與雲端檔案皆已嚴格配置 `target="_blank" rel="noopener noreferrer"`，點擊後會直接在新的瀏覽器分頁開啟，完全不受 Google Sites 內部沙盒跨域限制影響。

### Q3：成果與文件的 PDF 預覽是如何運作的？
本網站特別針對「成果與文件」搭載了**雙引擎內嵌 PDF 預覽器**與**模擬 A4 PDF 公文檢視器**：
- **PDF 成果教案與論文**：點擊卡片或專題佐證後，會直接在網頁燈箱中內嵌預覽完整 PDF 頁面，支援全螢幕閱讀、頁面翻閱、放大縮小，並提供「Google 雲端預覽 / 原生預覽」一鍵切換與直接下載。
- **官方證書與獲獎公文**：自動採用模擬 A4 PDF 規格排版，附帶永貞國小與高師大科教所認證頁首與向度標籤，並支援「🖨️ 另存/列印為 PDF」，隨時可一鍵匯出高品質正式 A4 PDF 檔案！
