import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

interface FieldStyle {
  x: number
  y: number
  align: "left" | "center" | "right"
  fontSize: number
  font: keyof typeof StandardFonts | string
  color?: { r: number; g: number; b: number }
  maxWidth?: number
  minFontSize?: number
}

export async function renderCertificatePdfBytes(params: {
  templatePdfBytes: Uint8Array
  values: Record<string, string>
  fields: Record<string, FieldStyle>
}) {
  const pdfDoc = await PDFDocument.load(params.templatePdfBytes)
  const page = pdfDoc.getPages()[0]

  const fontCache = new Map<string, any>()
  const getFont = async (fontName: string) => {
    const resolved = fontName in StandardFonts ? (StandardFonts as any)[fontName] : StandardFonts.Helvetica
    if (!fontCache.has(resolved)) {
      fontCache.set(resolved, await pdfDoc.embedFont(resolved))
    }
    return fontCache.get(resolved)
  }

  for (const [key, style] of Object.entries(params.fields)) {
    const value = params.values[key]
    if (!value) continue

    const font = await getFont(style.font)
    let size = style.fontSize
    if (style.maxWidth) {
      const minSize = style.minFontSize ?? Math.max(8, style.fontSize - 4)
      while (size > minSize && font.widthOfTextAtSize(value, size) > style.maxWidth) {
        size -= 1
      }
    }
    const textWidth = font.widthOfTextAtSize(value, size)
    let x = style.x
    if (style.align === "center") {
      x = style.x - textWidth / 2
    } else if (style.align === "right") {
      x = style.x - textWidth
    }

    const color = style.color ?? { r: 0, g: 0, b: 0 }
    page.drawText(value, {
      x,
      y: style.y,
      size,
      font,
      color: rgb(color.r, color.g, color.b),
    })
  }

  pdfDoc.setTitle("ProctorlyX Certificate")
  pdfDoc.setSubject("Certificate of Achievement")
  pdfDoc.setProducer("ProctorlyX")

  return pdfDoc.save()
}
