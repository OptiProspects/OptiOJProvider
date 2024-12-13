'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RotateCcw, RotateCw, ZoomIn } from 'lucide-react'
import Cropper, { Point, Area } from 'react-easy-crop'

interface AvatarCropperProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  onCropComplete: (croppedImage: File) => void
}

export function AvatarCropper({
  open,
  onClose,
  imageUrl,
  onCropComplete,
}: AvatarCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useEffect(() => {
    if (imageUrl) {
      const image = new Image()
      image.src = imageUrl
      image.onload = () => {
        const { width, height } = image
        const aspectRatio = width / height
        const minZoom = aspectRatio > 1 ? 1 : 1 / aspectRatio
        setMinZoom(minZoom)
        setZoom(minZoom)
      }
    }
  }, [imageUrl])

  const createCroppedImage = async () => {
    try {
      const image = await fetch(imageUrl)
      const imageBlob = await image.blob()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx || !croppedAreaPixels) return

      const img = new Image()
      img.src = imageUrl
      
      await new Promise((resolve) => {
        img.onload = resolve
      })

      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      )

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'avatar.png', { type: 'image/png' })
          onCropComplete(file)
          onClose()
        }
      }, 'image/png', 1.0)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>裁剪头像</DialogTitle>
        </DialogHeader>
        <div className="relative h-[400px]">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            minZoom={minZoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedAreaPixels) => {
              setCroppedAreaPixels(croppedAreaPixels)
            }}
          />
        </div>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4" />
            <Slider
              value={[zoom]}
              min={minZoom}
              max={3}
              step={0.1}
              onValueChange={([value]) => setZoom(value)}
              className="flex-1"
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRotation((r) => r - 90)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRotation((r) => r + 90)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={createCroppedImage}>
            确认
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 