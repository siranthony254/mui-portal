import { defineType, defineField } from 'sanity'

export const curriculumSchema = defineType({
  name: 'curriculum',
  title: 'Cohort Curriculum',
  type: 'document',
  fields: [
    defineField({
      name: 'cohortId',
      title: 'Cohort ID',
      type: 'string',
      description: 'Link this curriculum to a specific cohort ID from Supabase.',
      validation: r => r.required()
    }),
    defineField({
      name: 'pillars',
      title: 'Pillars',
      type: 'array',
      of: [{
        type: 'object',
        name: 'pillar',
        fields: [
          defineField({ name: 'number', title: 'Pillar Number', type: 'number', validation: r => r.required() }),
          defineField({ name: 'name', title: 'Pillar Name', type: 'string', validation: r => r.required() }),
          defineField({ name: 'description', title: 'Pillar Description', type: 'text', rows: 3 }),
          defineField({
            name: 'modules',
            title: 'Modules (Weeks)',
            type: 'array',
            of: [{
              type: 'object',
              name: 'module',
              fields: [
                defineField({ name: 'weekNumber', title: 'Week Number', type: 'number', validation: r => r.required() }),
                defineField({ name: 'title', title: 'Module Title', type: 'string' }),
                defineField({
                    name: 'introduction',
                    title: 'Introduction',
                    type: 'array',
                    of: [{ type: 'block' }]
                }),
                defineField({
                  name: 'days',
                  title: 'Days (Daily Content)',
                  type: 'array',
                  of: [{
                    type: 'object',
                    name: 'day',
                    fields: [
                      defineField({ name: 'dayNumber', title: 'Day Number (1-7)', type: 'number', validation: r => r.min(1).max(7) }),
                      defineField({ name: 'title', title: 'Day Title', type: 'string' }),
                      defineField({
                        name: 'sessions',
                        title: 'Sessions',
                        type: 'array',
                        of: [{
                          type: 'object',
                          name: 'session',
                          fields: [
                            defineField({ name: 'sessionNumber', title: 'Session Number', type: 'number', validation: r => r.required() }),
                            defineField({ name: 'title', title: 'Session Title', type: 'string', validation: r => r.required() }),
                            defineField({
                              name: 'contentBlocks',
                              title: 'Content Blocks',
                              type: 'array',
                              of: [
                                { type: 'textBlock' },
                                { type: 'videoBlock' },
                                { type: 'imageBlock' },
                                { type: 'audioBlock', name: 'audioBlock', title: 'Audio' },
                                { type: 'fileBlock', name: 'fileBlock', title: 'File/PDF' }
                              ]
                            }),
                            defineField({
                              name: 'subsessions',
                              title: 'Subsessions',
                              type: 'array',
                              of: [{
                                type: 'object',
                                name: 'subsession',
                                fields: [
                                  defineField({ name: 'title', title: 'Subsession Title', type: 'string' }),
                                  defineField({ name: 'content', type: 'array', of: [{ type: 'block' }] })
                                ]
                              }]
                            }),
                            defineField({
                              name: 'journalPrompt',
                              title: 'Journal Prompt',
                              type: 'text',
                              rows: 3,
                              description: 'Optional prompt triggered after session completion.'
                            }),
                            defineField({
                              name: 'journalType',
                              title: 'Journal Type',
                              type: 'string',
                              options: {
                                list: [
                                  { title: '🔒 Private (Personal Reflection)', value: 'private' },
                                  { title: '👨‍🏫 Mentor (Sent to Mentor)', value: 'mentor' },
                                  { title: '👥 Group (Group Chat)', value: 'group' }
                                ],
                                layout: 'radio',
                                direction: 'horizontal'
                              },
                              initialValue: 'private',
                              description: 'Determines how the journal is handled after completion.',
                              hidden: ({ parent }) => !parent?.journalPrompt,
                              validation: r => r.required()
                            })
                          ]
                        }]
                      })
                    ]
                  }]
                })
              ]
            }]
          })
        ]
      }]
    })
  ],
  preview: {
    select: { title: 'cohortId' },
    prepare: ({ title }) => ({ title: `Curriculum for ${title}` })
  }
})

// Define reusable blocks if not already defined
export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Video Title', type: 'string' }),
    defineField({
      name: 'videoType',
      title: 'Video Source',
      type: 'string',
      options: { list: ['youtube', 'upload'], layout: 'radio' },
      initialValue: 'youtube'
    }),
    defineField({
      name: 'youtubeEmbed',
      title: 'YouTube Embed Code',
      type: 'text',
      rows: 4,
      description: 'Paste the full <iframe> embed code from YouTube.',
      hidden: ({ parent }) => parent?.videoType !== 'youtube'
    }),
    defineField({
      name: 'videoFile',
      title: 'Upload Video',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.videoType !== 'upload'
    }),
    defineField({ name: 'description', title: 'Video Description', type: 'text', rows: 2 })
  ]
})

export const fileBlock = defineType({
    name: 'fileBlock',
    title: 'File/PDF',
    type: 'object',
    fields: [
        defineField({ name: 'title', title: 'File Title', type: 'string' }),
        defineField({ name: 'file', title: 'Upload File', type: 'file' }),
        defineField({ name: 'externalUrl', title: 'External URL', type: 'url' })
    ]
})

export const audioBlock = defineType({
  name: 'audioBlock',
  title: 'Audio',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Audio Title', type: 'string' }),
    defineField({ name: 'audioFile', title: 'Upload Audio', type: 'file', options: { accept: 'audio/*' } }),
    defineField({ name: 'description', title: 'Audio Description', type: 'text', rows: 2 })
  ]
})
