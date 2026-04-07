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
  box?: {
    width: number
    height: number
    borderWidth?: number
    borderColor?: { r: number; g: number; b: number }
    fillColor?: { r: number; g: number; b: number }
  }
  renderText?: boolean
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

  const sanitizeText = (text: string) =>
    text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[^\x09\x0A\x20-\x7E]/g, "")

  const splitLongWord = (word: string, font: any, size: number, maxWidth: number) => {
    if (font.widthOfTextAtSize(word, size) <= maxWidth) return [word]
    const parts: string[] = []
    let current = ""
    for (const char of word) {
      const next = current + char
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next
      } else {
        if (current) parts.push(current)
        current = char
      }
    }
    if (current) parts.push(current)
    return parts
  }

  const wrapText = (text: string, font: any, size: number, maxWidth: number, maxLines?: number) => {
    const words = text.split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let current = ""
    for (const word of words) {
      const wordParts = splitLongWord(word, font, size, maxWidth)
      for (const part of wordParts) {
        const next = current ? `${current} ${part}` : part
        if (font.widthOfTextAtSize(next, size) <= maxWidth) {
          current = next
        } else {
          if (current) lines.push(current)
          current = part
        }
        if (maxLines && lines.length >= maxLines) break
      }
      if (maxLines && lines.length >= maxLines) break
    }
    if (current && (!maxLines || lines.length < maxLines)) lines.push(current)
    return lines
  }

  const wrapMultilineText = (
    text: string,
    font: any,
    size: number,
    maxWidth?: number,
    maxLines?: number
  ) => {
    const clean = sanitizeText(text)
    if (!maxWidth) {
      const rawLines = clean.split("\n").map((line) => line.trim()).filter(Boolean)
      return rawLines.length ? rawLines : [clean]
    }
    const rawLines = clean.split("\n")
    const lines: string[] = []
    for (const raw of rawLines) {
      const segment = raw.trim()
      if (!segment) continue
      const wrapped = wrapText(segment, font, size, maxWidth, maxLines ? maxLines - lines.length : undefined)
      lines.push(...wrapped)
      if (maxLines && lines.length >= maxLines) break
    }
    if (!lines.length && clean) {
      return wrapText(clean, font, size, maxWidth, maxLines)
    }
    return lines
  }

  for (const [key, style] of Object.entries(params.fields)) {
    const value = params.values[key]
    if (style.box && value) {
      const { width, height, borderWidth, borderColor, fillColor } = style.box
      page.drawRectangle({
        x: style.x - width / 2,
        y: style.y - height / 2,
        width,
        height,
        borderWidth: borderWidth ?? 1,
        borderColor: borderColor ? rgb(borderColor.r, borderColor.g, borderColor.b) : undefined,
        color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
      })
      if (style.renderText === false) {
        continue
      }
    }
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

    const value = params.values[key]
    if (!value) continue

    const font = await getFont(style.font)
    let size = style.fontSize
    const minSize = style.minFontSize ?? Math.max(8, style.fontSize - 4)
    const maxWidth = style.maxWidth
    const maxLines = style.maxLines
    const lineHeight = style.lineHeight ?? Math.round(size * 1.2)

    let lines = wrapMultilineText(value, font, size, maxWidth, maxLines)

    if (maxWidth && maxLines) {
      while (size > minSize) {
        lines = wrapMultilineText(value, font, size, maxWidth, maxLines)
        if (lines.length <= maxLines) break
        size -= 1
      }
    } else if (maxWidth) {
      const cleanValue = sanitizeText(value)
      while (size > minSize && font.widthOfTextAtSize(cleanValue, size) > maxWidth) {
        size -= 1
      }
      lines = [cleanValue]
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
