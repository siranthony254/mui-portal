'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic2, Square, Trash2, Send, Play, Pause, RotateCcw } from '@/components/icons'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onUpload: (file: File) => void
  onCancel?: () => void
  compact?: boolean
  label?: string
}

export function VoiceRecorder({ onUpload, onCancel, compact = false, label }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Failed to start recording:", err)
      alert("Please allow microphone access to record voice notes.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleReset = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setIsPlaying(false)
    if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioBlob) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleUpload = () => {
    if (!audioBlob) return
    const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' })
    onUpload(file)
    handleReset()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (compact) {
    return (
        <div className="flex items-center gap-2">
            {isRecording ? (
                <div className="flex items-center gap-3 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{formatTime(recordingTime)}</span>
                    <button type="button" onClick={stopRecording} className="text-red-700 hover:text-red-900 transition-colors">
                        <Square className="w-4 h-4 fill-current" />
                    </button>
                </div>
            ) : audioBlob ? (
                <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                    <button type="button" onClick={togglePlayback} className="text-teal-700">
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <span className="text-[10px] font-bold text-teal-700">{formatTime(recordingTime)}</span>
                    <button type="button" onClick={handleReset} className="text-gray-400 hover:text-red-500">
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={handleUpload} className="bg-teal-600 text-white p-1 rounded-full hover:bg-teal-700 transition-colors ml-1">
                        <Send className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={startRecording}
                    className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all active:scale-95"
                    title={label || "Record Voice"}
                >
                    <Mic2 className="w-5 h-5" />
                </button>
            )}
            <audio ref={audioRef} hidden onEnded={() => setIsPlaying(false)} />
        </div>
    )
  }

  return (
    <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 flex flex-col items-center justify-center space-y-6 transition-all hover:border-teal-500/50">
      <audio ref={audioRef} hidden onEnded={() => setIsPlaying(false)} />

      {!isRecording && !audioBlob && (
        <>
            <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-teal-600 cursor-pointer hover:scale-105 active:scale-95 transition-all group" onClick={startRecording}>
                <Mic2 className="w-10 h-10 group-hover:animate-pulse" />
            </div>
            <div className="text-center">
                <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{label || "Voice Journaling"}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium italic">Click to start recording your reflection.</p>
            </div>
        </>
      )}

      {isRecording && (
        <>
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20" />
                    <Square className="w-8 h-8 fill-current" />
                </div>
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">REC</div>
            </div>
            <div className="text-center">
                <p className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">{formatTime(recordingTime)}</p>
                <button
                    onClick={stopRecording}
                    className="mt-4 bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                    Stop Recording
                </button>
            </div>
        </>
      )}

      {audioBlob && (
        <>
            <div className="flex items-center gap-6">
                <button onClick={togglePlayback} className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xl hover:bg-teal-700 transition-all">
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 tabular-nums">{formatTime(recordingTime)}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ready to deploy</span>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-red-500 transition-all"
                >
                    <Trash2 className="w-4 h-4" /> Discard
                </button>
                <button
                    onClick={handleUpload}
                    className="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30"
                >
                    <Send className="w-4 h-4" /> Save Voice Entry
                </button>
            </div>
        </>
      )}
    </div>
  )
}
