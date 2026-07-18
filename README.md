# 旅行手帳 · 東京 7 天 6 夜（Phase 1）

日系溫暖極簡風格的雙人旅遊規劃 PWA。

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
npm run preview
```

## Phase 1 已完成

- 完整專案架構（React + Vite + TypeScript + Tailwind CSS + PWA）
- 日系溫暖極簡設計系統（色彩／字體／動畫 tokens）
- 首頁 Dashboard（旅行封面、倒數、天氣卡、預算卡、今日行程、旅伴）
- 底部 Tab Bar（首頁／行程／花費／行李／地圖／更多）
- 行程頁（Day 分頁 + 時間軸樣式）
- 花費頁（旅行帳本樣式框架）
- 行李頁（完整可用：新增／勾選／刪除／進度條）
- 地圖頁（依日期／分類／區域切換，Google Maps 一鍵導航）
- 更多頁（功能選單入口）
- Dark Mode（暖色系深色，非純黑）
- 共用元件：Card / ProgressBar / EmptyState / Skeleton / Toast / BottomSheet / FAB / StampBadge
- 資料層：LocalStorage 抽象化（`src/lib/storage.ts`），未來可直接替換為 Firebase / Supabase
