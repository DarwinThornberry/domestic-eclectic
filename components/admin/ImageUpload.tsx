'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

interface Props {
  label: string
  helpText: string
  bucket: 'artwork-public' | 'artwork-hires'
  accept?: string
  maxMB?: number
  showPreview?: boolean
  onUpload: (url: string) => void
  initialUrl?: string | null
}

export function ImageUpload({
  label,
  helpText,
  bucket,
  accept = 'image/*',
  maxMB = 50,
  showPreview = false,
  onUpload,
  initialUrl,
}: Props) {
  const [state, setState] = useState<UploadState>(initialUrl ? 'done' : 'idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)

    if (file.size > maxMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxMB} MB.`)
      return
    }

    setFileName(file.name)
    setFileSize(`${(file.size / 1024 / 1024).toFixed(1)} MB`)
    setState('uploading')
    setProgress(0)

    // Show local preview immediately
    if (showPreview) {
      setPreviewUrl(URL.createObjectURL(file))
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)

      // Use XMLHttpRequest to track upload progress
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        })
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            resolve(data.url)
          } else {
            reject(new Error(JSON.parse(xhr.responseText)?.error ?? 'Upload failed'))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
        xhr.open('POST', '/api/admin/upload')
        xhr.send(formData)
      })

      setPreviewUrl(showPreview ? previewUrl : null)
      setState('done')
      setProgress(100)
      onUpload(url)
    } catch (e: any) {
      setState('error')
      setError(e.message ?? 'Upload failed. Please try again.')
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleReset() {
    setState('idle')
    setPreviewUrl(null)
    setFileName(null)
    setFileSize(null)
    setError(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1.5">{label}</label>

      {/* Preview (images only) */}
      {showPreview && previewUrl && state === 'done' && (
        <div className="relative mb-3 w-40 h-40 border border-border overflow-hidden">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleReset}
            className="absolute top-1 right-1 bg-ink text-bone rounded-full p-0.5 hover:bg-terracotta transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* File info (non-image files) */}
      {!showPreview && state === 'done' && fileName && (
        <div className="flex items-center justify-between border border-border px-4 py-3 mb-3">
          <div>
            <p className="text-sm text-ink">{fileName}</p>
            <p className="text-xs text-ink-muted">{fileSize}</p>
          </div>
          <button onClick={handleReset} className="text-ink-muted hover:text-ink transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      {(state === 'idle' || state === 'error') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-ink bg-bone-dark' : 'border-border hover:border-border-dark'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          <Upload size={20} className="mx-auto mb-2 text-ink-muted" strokeWidth={1.5} />
          <p className="text-sm text-ink-muted">
            Drop a file here or <span className="text-ink underline">browse</span>
          </p>
        </div>
      )}

      {/* Uploading */}
      {state === 'uploading' && (
        <div className="border border-border px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 size={14} className="animate-spin text-ink-muted" />
            <p className="text-sm text-ink-muted">Uploading… {progress}%</p>
          </div>
          <div className="w-full bg-bone-dark rounded-full h-1">
            <div
              className="bg-terracotta h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-terracotta mt-2">{error}</p>
      )}

      <p className="text-xs text-ink-muted mt-2 leading-relaxed">{helpText}</p>
    </div>
  )
}
