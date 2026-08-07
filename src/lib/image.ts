/**
 * 將圖片檔案縮小並轉成 base64 dataURL，避免 LocalStorage 空間被過大的原圖塞爆。
 */
export function resizeImageFile(file: File, maxWidth = 800, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('讀取圖片失敗'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('圖片載入失敗'))
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('無法建立畫布'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
