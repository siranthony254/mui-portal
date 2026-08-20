# Plan: Voice Features Integration (Journaling & Chat)

Add voice recording capabilities for students and mentors, with permanent storage in Sanity.

## 1. Sanity Schema Updates
- **File**: `sanity/schemas/index.ts`
- Add `voiceJournal` document schema:
  - `studentId` (string)
  - `weekNumber` (number)
  - `pillarNumber` (number)
  - `audioFile` (file asset)
  - `duration` (number)
  - `publishedAt` (datetime)
- (Optional) Add `chatVoiceMessage` schema if full document storage is required, but recommendation is to use Sanity Assets for the file and Supabase for the message record to maintain real-time performance.

## 2. Reusable Voice Recorder Component
- **File**: `src/components/ui/VoiceRecorder.tsx`
- **Features**:
  - Start/Stop recording using `MediaRecorder` API.
  - Live duration timer.
  - Waveform visualization (simple CSS-based or canvas).
  - Playback preview before sending.
  - `onUpload(blob)` callback.

## 3. Voice Journaling Implementation
- **File**: `src/components/cohort/JournalClient.tsx`
- **Actions**: Create `uploadVoiceJournal` in `src/lib/actions/sanity.ts`.
- **UI**: 
  - Add a "Record Reflection" toggle/button next to the text editor.
  - When recorded, upload to Sanity.
  - Fetch and display existing voice journals for the selected week.

## 4. Voice Chat Implementation
- **File**: `src/components/chat/MessagesClient.tsx`
- **Actions**: Update `sendMessage` in `src/lib/actions/messages.ts` to handle audio URLs.
- **UI**:
  - Replace the current placeholder `🎤 [Voice Note Sent]` logic with the new `VoiceRecorder`.
  - On record finish:
    1. Upload blob to Sanity Assets via `writeClient.assets.upload`.
    2. Get the asset URL.
    3. Send a Supabase message with `content: "[Audio Message]"` and a new `metadata` field or just append the URL to the content.
  - Update message rendering to show an `<audio>` player if the message contains an audio link.

## 5. Verification
- Test recording a 10-second journal entry and verify it appears in Sanity Studio.
- Test sending a voice note in a 1-on-1 chat and verify the mentor can play it back.
- Verify notifications still work for voice messages.
