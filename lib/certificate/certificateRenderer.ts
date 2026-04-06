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
  maxLines?: number
  lineHeight?: number
  width?: number
  height?: number
  color?: { r: number; g: number; b: number }
}

export async function renderCertificatePdfBytes(params: {
  templatePdfBytes: Uint8Array
  values: Record<string, string>
  fields: Record<string, FieldStyle>
  images?: Record<string, { bytes: Uint8Array; type: "png" | "jpg" }>
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

  const wrapText = (text: string, font: any, size: number, maxWidth: number, maxLines?: number) => {
    const words = text.split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let current = ""
    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next
      } else {
        if (current) lines.push(current)
        current = word
      }
      if (maxLines && lines.length >= maxLines) break
    }
    if (current && (!maxLines || lines.length < maxLines)) lines.push(current)
    return lines
  }

  for (const [key, style] of Object.entries(params.fields)) {
    const image = params.images?.[key]
    if (image && style.width && style.height) {
      const embedded =
        image.type === "png"
          ? await pdfDoc.embedPng(image.bytes)
          : await pdfDoc.embedJpg(image.bytes)
      page.drawImage(embedded, {
        x: style.x - style.width / 2,
        y: style.y - style.height / 2,
        width: style.width,
        height: style.height,
      })
      continue
    }

    if (style.width && style.height && key.endsWith("_mask")) {
      const fill = style.color ?? { r: 1, g: 1, b: 1 }
      page.drawRectangle({
        x: style.x - style.width / 2,
        y: style.y - style.height / 2,
        width: style.width,
        height: style.height,
        color: rgb(fill.r, fill.g, fill.b),
      })
      continue
    }

    const value = params.values[key]
    if (!value) continue

    const font = await getFont(style.font)
    let size = style.fontSize
    const minSize = style.minFontSize ?? Math.max(8, style.fontSize - 4)
    const maxWidth = style.maxWidth
    const maxLines = style.maxLines
    const lineHeight = style.lineHeight ?? Math.round(size * 1.2)

    let lines = value.includes("\n")
      ? value.split("\n").filter(Boolean)
      : maxWidth
        ? wrapText(value, font, size, maxWidth, maxLines)
        : [value]

    if (maxWidth && maxLines) {
      while (size > minSize) {
        lines = value.includes("\n")
          ? value.split("\n").filter(Boolean)
          : wrapText(value, font, size, maxWidth, maxLines)
        if (lines.length <= maxLines) break
        size -= 1
      }
    } else if (maxWidth) {
      while (size > minSize && font.widthOfTextAtSize(value, size) > maxWidth) {
        size -= 1
      }
      lines = [value]
    }

    const color = style.color ?? { r: 0, g: 0, b: 0 }
    lines.forEach((line, index) => {
      const textWidth = font.widthOfTextAtSize(line, size)
      let x = style.x
      if (style.align === "center") {
        x = style.x - textWidth / 2
      } else if (style.align === "right") {
        x = style.x - textWidth
      }
      const y = style.y - index * lineHeight
      page.drawText(line, {
        x,
        y,
        size,
        font,
        color: rgb(color.r, color.g, color.b),
      })
    })
  }

  pdfDoc.setTitle("ProctorlyX Certificate")
  pdfDoc.setSubject("Certificate of Achievement")
  pdfDoc.setProducer("ProctorlyX")

  return pdfDoc.save()
}
