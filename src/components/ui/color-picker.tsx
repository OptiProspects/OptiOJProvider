import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { hexToRgb, rgbToHex } from "@/lib/utils"

interface ColorPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (value: string) => void
}

function RGBInput({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const rgb = React.useMemo(() => hexToRgb(value), [value])
  const [r, setR] = React.useState(rgb?.r.toString() || "0")
  const [g, setG] = React.useState(rgb?.g.toString() || "0")
  const [b, setB] = React.useState(rgb?.b.toString() || "0")

  React.useEffect(() => {
    const rgb = hexToRgb(value)
    if (rgb) {
      setR(rgb.r.toString())
      setG(rgb.g.toString())
      setB(rgb.b.toString())
    }
  }, [value])

  const handleChange = (component: 'r' | 'g' | 'b', val: string) => {
    let num = parseInt(val)
    if (isNaN(num)) num = 0
    if (num > 255) num = 255
    if (num < 0) num = 0

    const newValue = num.toString()
    
    if (component === 'r') setR(newValue)
    if (component === 'g') setG(newValue)
    if (component === 'b') setB(newValue)

    const rNum = parseInt(component === 'r' ? newValue : r)
    const gNum = parseInt(component === 'g' ? newValue : g)
    const bNum = parseInt(component === 'b' ? newValue : b)

    if (!isNaN(rNum) && !isNaN(gNum) && !isNaN(bNum)) {
      const hex = rgbToHex(rNum, gNum, bNum)
      onChange(hex)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">R</label>
        <Input
          value={r}
          onChange={(e) => handleChange('r', e.target.value)}
          className="text-center"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">G</label>
        <Input
          value={g}
          onChange={(e) => handleChange('g', e.target.value)}
          className="text-center"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">B</label>
        <Input
          value={b}
          onChange={(e) => handleChange('b', e.target.value)}
          className="text-center"
        />
      </div>
    </div>
  )
}

function ColorArea({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const rgb = React.useMemo(() => hexToRgb(color) || { r: 255, g: 0, b: 0 }, [color])

  const handlePointerMove = React.useCallback((event: PointerEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))

    // 计算颜色
    const s = x
    const v = 1 - y
    const h = rgbToHsv(rgb.r, rgb.g, rgb.b).h
    const { r, g, b } = hsvToRgb(h, s, v)
    onChange(rgbToHex(r, g, b))
  }, [isDragging, rgb, onChange])

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-lg cursor-pointer select-none touch-none overflow-hidden"
      style={{
        backgroundColor: `hsl(${rgbToHsv(rgb.r, rgb.g, rgb.b).h}deg, 100%, 50%)`
      }}
      onPointerDown={(e) => {
        e.preventDefault()
        setIsDragging(true)
        handlePointerMove(e.nativeEvent)
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black rounded-lg" />
      <div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full shadow"
        style={{
          left: `${rgbToHsv(rgb.r, rgb.g, rgb.b).s * 100}%`,
          top: `${(1 - rgbToHsv(rgb.r, rgb.g, rgb.b).v) * 100}%`,
          backgroundColor: color
        }}
      />
    </div>
  )
}

function HueSlider({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const rgb = React.useMemo(() => hexToRgb(color) || { r: 255, g: 0, b: 0 }, [color])
  const hsv = React.useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb])

  const handlePointerMove = React.useCallback((event: PointerEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    const h = x * 360
    const { r, g, b } = hsvToRgb(h, hsv.s, hsv.v)
    onChange(rgbToHex(r, g, b))
  }, [isDragging, hsv.s, hsv.v, onChange])

  const handlePointerUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  return (
    <div
      ref={containerRef}
      className="relative h-6 rounded-lg cursor-pointer select-none touch-none"
      style={{
        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
      }}
      onPointerDown={(e) => {
        e.preventDefault()
        setIsDragging(true)
        handlePointerMove(e.nativeEvent)
      }}
    >
      <div
        className="absolute w-2 h-full -translate-x-1/2 border-2 border-white rounded-sm shadow"
        style={{
          left: `${(hsv.h / 360) * 100}%`,
          backgroundColor: `hsl(${hsv.h}deg, 100%, 50%)`
        }}
      />
    </div>
  )
}

// HSV/RGB 转换函数
function rgbToHsv(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s, v }
}

function hsvToRgb(h: number, s: number, v: number) {
  h /= 360
  let r = 0, g = 0, b = 0

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      r = v; g = t; b = p
      break
    case 1:
      r = q; g = v; b = p
      break
    case 2:
      r = p; g = v; b = t
      break
    case 3:
      r = p; g = q; b = v
      break
    case 4:
      r = t; g = p; b = v
      break
    case 5:
      r = v; g = p; b = q
      break
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

export function ColorPicker({ open, onOpenChange, value, onChange }: ColorPickerProps) {
  const [localValue, setLocalValue] = React.useState(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleColorChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>选择颜色</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-[200px]">
                <ColorArea color={localValue} onChange={handleColorChange} />
              </div>
              <HueSlider color={localValue} onChange={handleColorChange} />
            </div>
            <div className="w-20">
              <div
                className="w-full h-20 rounded-lg border shadow-sm"
                style={{ backgroundColor: localValue }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">十六进制</label>
              <Input
                value={localValue.toUpperCase()}
                onChange={(e) => handleColorChange(e.target.value.toUpperCase())}
                placeholder="#000000"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">RGB</label>
              <RGBInput
                value={localValue}
                onChange={handleColorChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 