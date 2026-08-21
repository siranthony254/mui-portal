import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getYouTubeEmbed(urlOrId: string): string {
  const id = getYouTubeId(urlOrId) || urlOrId
  // rel=0 ensures that when the video finishes, suggestions are limited to the same channel
  // modestbranding=1 removes the YouTube logo from the control bar
  // iv_load_policy=3 hides video annotations
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&iv_load_policy=3`
}

export function getYouTubeThumbnail(urlOrId: string): string {
  const id = getYouTubeId(urlOrId) || urlOrId
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function parseYouTubeEmbed(input: string): string | null {
  // If it's just an ID or URL, use standard extraction
  const directId = getYouTubeId(input)
  if (directId) return directId

  // If it's a full iframe tag, extract the src
  const srcMatch = input.match(/src=["']([^"']+)["']/)
  if (srcMatch) {
    const url = srcMatch[1]
    return getYouTubeId(url)
  }

  return null
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}
