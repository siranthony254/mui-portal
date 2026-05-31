import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { contentSchema, courseSchema, announcementSchema, taskPromptSchema } from './sanity/schemas'

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  '8851zfxm'

const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  'production'

export default defineConfig({
  name:'mui-portal', title:'MUI Portal CMS',
  projectId,
  dataset,
  plugins:[
    structureTool({structure:(S)=>S.list().title('MUI Content').items([
      S.listItem().title('Content Blocks').child(S.documentTypeList('content').title('All Content')),
      S.listItem().title('Courses').child(S.documentTypeList('course').title('All Courses')),
      S.listItem().title('Task Prompts').child(S.documentTypeList('taskPrompt').title('Task Prompts')),
      S.listItem().title('Announcements').child(S.documentTypeList('announcement').title('Announcements')),
    ])}),
    visionTool(),
  ],
  schema:{ types:[contentSchema,courseSchema,announcementSchema,taskPromptSchema] },
})
