import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { rewriteWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  const output = `audio-${Date.now()}.mp3`

  // 1. Download audio dari YT
  await new Promise((resolve, reject) => {
    const ytdl = spawn('yt-dlp', ['-x', '--audio-format', 'mp3', '-o', output, url])
    ytdl.on('close', resolve)
    ytdl.on('error', reject)
  })

  // 2. Jalankan whisper CLI (pastikan whisper diinstall)
  const whisperOut = `transcript-${Date.now()}.txt`
  await new Promise((resolve, reject) => {
    const whisper = spawn('whisper', [output, '--model', 'base', '--output_format', 'txt'])
    whisper.on('close', resolve)
    whisper.on('error', reject)
  })

  const transcriptPath = path.resolve(`${output.replace('.mp3', '')}.txt`)
  const rawText = fs.readFileSync(transcriptPath, 'utf-8')

  // 3. Rewrite dengan GPT
  const rewrittenText = await rewriteWithGemini(rawText)

  // Hapus file
  fs.unlinkSync(output)
  fs.unlinkSync(transcriptPath)

  return NextResponse.json({ text: rewrittenText })
}
