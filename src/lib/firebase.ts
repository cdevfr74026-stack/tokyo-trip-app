import { initializeApp, getApps } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAAkhI5ZEr8TalpTawQorfZ_bxc3UwB0LI',
  authDomain: 'tokyo-trip-b082d.firebaseapp.com',
  projectId: 'tokyo-trip-b082d',
  storageBucket: 'tokyo-trip-b082d.firebasestorage.app',
  messagingSenderId: '289764351781',
  appId: '1:289764351781:web:60687d34ec5ca8ff62c4cc',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// ignoreUndefinedProperties: true 讓 Firestore 自動忽略選填但沒填寫的欄位（undefined），
// 避免寫入失敗導致資料「存了但又消失」的問題。
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true })

export const auth = getAuth(app)
