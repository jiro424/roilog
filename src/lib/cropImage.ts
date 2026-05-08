// 切り抜き処理ユーティリティ
// react-easy-crop が返す croppedAreaPixels を元に、Canvasで実際に切り抜いてBlob/DataURLを返す

export type Area = {
  x: number
  y: number
  width: number
  height: number
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (err) => reject(err))
    img.crossOrigin = 'anonymous'
    img.src = url
  })

/**
 * 指定範囲で画像を切り抜き、DataURL(JPEG)を返す
 * @param imageSrc 元画像（DataURL or URL）
 * @param crop    react-easy-crop の croppedAreaPixels
 * @param maxSize 出力時の最大幅（縮小用、シェアカード用は1080px推奨）
 */
export async function getCroppedImg(
  imageSrc: string,
  crop: Area,
  maxSize = 1080
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  // 出力サイズ：crop幅がmaxSizeを超える場合は縮小
  const scale = crop.width > maxSize ? maxSize / crop.width : 1
  canvas.width = Math.round(crop.width * scale)
  canvas.height = Math.round(crop.height * scale)

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return canvas.toDataURL('image/jpeg', 0.9)
}
