import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// ============================================================
// Firebase 設定
// 步驟：
// 1. 到 https://console.firebase.google.com 建立專案
// 2. 專案設定 > 新增網頁應用程式，複製產生的設定物件
// 3. 把下面的值換成你自己的（Firebase Web 設定值本身不是機密，
//    真正的保護來自 Firestore 安全性規則，所以直接寫在這裡沒問題）
// ============================================================

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

// 避免在開發模式下（React StrictMode 重複渲染）重複初始化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
