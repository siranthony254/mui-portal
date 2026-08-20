'use client'

import { useState, useRef } from 'react'
import { Plus, X, Video, FileText, Headphones, FileDown, Globe, Play, Image as ImageIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

interface MediaPickerProps {
    onFileSelect: (file: File | null) => void
    accept?: string
    label?: string
    type?: 'video' | 'image' | 'audio' | 'pdf' | 'all'
    className?: string
}

export function MediaPicker({ onFileSelect, accept, label, type = 'all', className }: MediaPickerProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        if (file) {
            onFileSelect(file)
            setFileName(file.name)
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPreview(reader.result as string)
                }
                reader.readAsDataURL(file)
            } else {
                setPreview(null)
            }
        }
    }

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        onFileSelect(null)
        setPreview(null)
        setFileName(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const triggerInput = () => {
        fileInputRef.current?.click()
    }

    const getTypeIcon = () => {
        switch (type) {
            case 'video': return <Video className="w-8 h-8" />
            case 'image': return <ImageIcon className="w-8 h-8" />
            case 'audio': return <Headphones className="w-8 h-8" />
            case 'pdf': return <FileDown className="w-8 h-8" />
            default: return <Plus className="w-8 h-8" />
        }
    }

    return (
        <div
            onClick={triggerInput}
            className={cn(
                "group relative w-full aspect-video md:aspect-auto md:min-h-[160px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all overflow-hidden",
                className
            )}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
            />

            {preview ? (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                        onClick={clearFile}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : fileName ? (
                <div className="text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        {getTypeIcon()}
                    </div>
                    <p className="text-xs font-bold text-gray-700 truncate max-w-[200px] mb-1">{fileName}</p>
                    <button
                        onClick={clearFile}
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <div className="text-center p-4">
                    <div className="text-gray-300 group-hover:text-blue-500 transition-colors mb-2 flex justify-center">
                        {getTypeIcon()}
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                        {label || `Select ${type}`}
                    </p>
                </div>
            )}
        </div>
    )
}
