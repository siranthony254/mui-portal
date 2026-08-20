import { defineType, defineField } from 'sanity'
export { curriculumSchema, videoBlock, fileBlock } from './curriculum'

export const textBlock = defineType({
  name: 'textBlock',
  title: 'Text Content',
  type: 'object',
  fields: [
    defineField({ name: 'body', title: 'Text content', type: 'array', of: [{ type: 'block' }] })
  ],
  preview: { prepare: () => ({ title: 'Text Block' }) }
})

export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: r => r.required() }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' })
  ],
  preview: { select: { media: 'image', title: 'caption' }, prepare: ({ media, title }) => ({ title: title || 'Image Block', media }) }
})

export const resourceSchema = defineType({
  name:'resource', title:'Supplementary Resource', type:'document',
  fields:[
    defineField({name:'title',title:'Title',type:'string',validation:r=>r.required()}),
    defineField({name:'description',title:'Description',type:'text',rows:3}),
    defineField({name:'contentType',title:'Content Type',type:'string',options:{list:['video','article','audio','pdf','image'],layout:'radio'},validation:r=>r.required()}),
    defineField({name:'url',title:'URL / Link',type:'url'}),
    defineField({name:'body',title:'Content Body (if typed)',type:'array',of:[{type:'block'}]}),
    defineField({name:'cohortId',title:'Cohort ID (optional)',type:'string', description: 'Leave empty for global resources'}),
    defineField({name:'tags',title:'Tags',type:'array',of:[{type:'string'}]}),
    defineField({name:'publishedAt',title:'Published At',type:'datetime',initialValue:()=>new Date().toISOString()}),
  ]
})

export const contentSchema = defineType({
  name:'content', title:'Standalone Content', type:'document',
  fields:[
    defineField({name:'title',title:'Title',type:'string',validation:r=>r.required()}),
    defineField({name:'description',title:'Description',type:'text',rows:3}),
    defineField({name:'contentType',title:'Content Type',type:'string',options:{list:['video','article','audio','pdf','image'],layout:'radio'},validation:r=>r.required()}),
    defineField({name:'url',title:'URL / Link',type:'url',description:'For YouTube: paste full URL.',hidden:({document})=>document?.contentType==='article'}),
    defineField({name:'youtubeId',title:'YouTube Video ID',type:'string',hidden:({document})=>document?.contentType!=='video'}),
    defineField({name:'body',title:'Article Body',type:'array',of:[{type:'block'},{type:'image',options:{hotspot:true}}],hidden:({document})=>document?.contentType!=='article'}),
    defineField({name:'pillarNumber',title:'Pillar',type:'number',options:{list:[{title:'1 - Identity',value:1},{title:'2 - Understanding',value:2},{title:'3 - Awareness',value:3},{title:'4 - Solution Thinking',value:4},{title:'5 - Voice & Responsibility',value:5}]},validation:r=>r.required()}),
    defineField({name:'weekNumber',title:'Week',type:'number',options:{list:Array.from({length:12},(_,i)=>({title:`Week ${i+1}`,value:i+1}))},validation:r=>r.required()}),
    defineField({name:'durationMinutes',title:'Duration (minutes)',type:'number'}),
    defineField({name:'isRequired',title:'Required content?',type:'boolean',initialValue:true}),
    defineField({name:'tags',title:'Tags',type:'array',of:[{type:'string'}]}),
    defineField({name:'publishedAt',title:'Published At',type:'datetime',initialValue:()=>new Date().toISOString()}),
  ]
})

export const courseSchema = defineType({
  name:'course', title:'Course', type:'document',
  fields:[
    defineField({name:'title',title:'Course Title',type:'string',validation:r=>r.required()}),
    defineField({name:'slug',title:'Slug',type:'slug',options:{source:'title'},validation:r=>r.required()}),
    defineField({name:'description',title:'Description',type:'text',rows:3}),
    defineField({name:'category',title:'Category',type:'string',options:{list:[
      {title:'Formation',value:'formation'},
      {title:'Critical Thinking',value:'thinking'},
      {title:'African Context',value:'context'},
      {title:'Wellbeing',value:'wellbeing'}
    ]}}),
    defineField({name:'isCoreCurriculum',title:'Core curriculum?',type:'boolean',initialValue:false}),
    defineField({name:'thumbnail',title:'Thumbnail',type:'image',options:{hotspot:true}}),
    defineField({
      name:'modules',
      title:'Modules',
      type:'array',
      of:[{
        type:'object',
        name:'courseModule',
        title:'Module',
        fields:[
          defineField({name:'title',title:'Module Title',type:'string',validation:r=>r.required()}),
          defineField({name:'description',title:'Module Description',type:'text',rows:2}),
          defineField({
            name:'sessions',
            title:'Sessions',
            type:'array',
            of:[{
              type:'object',
              name:'courseSession',
              title:'Session',
              fields:[
                defineField({name:'title',title:'Session Title',type:'string',validation:r=>r.required()}),
                defineField({
                  name:'contentBlocks',
                  title:'Session Content',
                  description:'Add one or more content types to this session.',
                  type:'array',
                  of:[
                    {
                      type:'object',
                      name:'videoBlock',
                      title:'Video',
                      fields:[
                        defineField({name:'title',title:'Video Title',type:'string'}),
                        defineField({name:'url',title:'YouTube Link',type:'url',validation:r=>r.required()}),
                        defineField({name:'description',title:'Video Description',type:'text',rows:2})
                      ],
                      preview:{select:{title:'title',subtitle:'url'},prepare:({title,subtitle})=>({title:title||'Video Block',subtitle})}
                    },
                    {
                      type:'object',
                      name:'textBlock',
                      title:'Text Content',
                      fields:[
                        defineField({name:'body',title:'Text content',type:'array',of:[{type:'block'}]})
                      ],
                      preview:{prepare:()=>({title:'Text Block'})}
                    },
                    {
                      type:'object',
                      name:'imageBlock',
                      title:'Image',
                      fields:[
                        defineField({name:'image',title:'Image',type:'image',options:{hotspot:true},validation:r=>r.required()}),
                        defineField({name:'caption',title:'Caption',type:'string'})
                      ],
                      preview:{select:{media:'image',title:'caption'},prepare:({media,title})=>({title:title||'Image Block',media})}
                    }
                  ]
                })
              ]
            }]
          })
        ]
      }]
    }),
    defineField({name:'totalDurationMinutes',title:'Total Estimated Duration (min)',type:'number'}),
    defineField({name:'publishedAt',title:'Published At',type:'datetime',initialValue:()=>new Date().toISOString()}),
  ]
})

export const announcementSchema = defineType({
  name:'announcement', title:'Announcement', type:'document',
  fields:[
    defineField({name:'title',title:'Title',type:'string',validation:r=>r.required()}),
    defineField({name:'body',title:'Body',type:'array',of:[{type:'block'}]}),
    defineField({name:'targetRoles',title:'Target Roles',type:'array',of:[{type:'string'}],options:{list:['admin','mentor','student']}}),
    defineField({name:'cohortId',title:'Cohort ID (optional)',type:'string'}),
    defineField({name:'publishedAt',title:'Publish At',type:'datetime',initialValue:()=>new Date().toISOString()}),
    defineField({name:'expiresAt',title:'Expires At',type:'datetime'}),
  ]
})

export const taskPromptSchema = defineType({
  name:'taskPrompt', title:'Task Prompt', type:'document',
  fields:[
    defineField({name:'title',title:'Task Title',type:'string',validation:r=>r.required()}),
    defineField({name:'pillarNumber',title:'Pillar',type:'number',options:{list:[1,2,3,4,5]}}),
    defineField({name:'weekNumber',title:'Week',type:'number',options:{list:Array.from({length:12},(_,i)=>i+1)}}),
    defineField({name:'prompt',title:'Task Prompt',type:'text',rows:5,validation:r=>r.required()}),
    defineField({name:'instructions',title:'Detailed Instructions',type:'array',of:[{type:'block'}]}),
  ],
  preview:{select:{title:'title',pillar:'pillarNumber',week:'weekNumber'},prepare:({title,pillar,week})=>({title,subtitle:`P${pillar} - W${week}`})}
})

export const voiceJournalSchema = defineType({
  name: 'voiceJournal',
  title: 'Voice Journal',
  type: 'document',
  fields: [
    defineField({ name: 'studentId', title: 'Student ID', type: 'string', validation: r => r.required() }),
    defineField({ name: 'weekNumber', title: 'Week Number', type: 'number', validation: r => r.required() }),
    defineField({ name: 'pillarNumber', title: 'Pillar Number', type: 'number', validation: r => r.required() }),
    defineField({ name: 'audioFile', title: 'Audio File', type: 'file', options: { accept: 'audio/*' }, validation: r => r.required() }),
    defineField({ name: 'duration', title: 'Duration (seconds)', type: 'number' }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', initialValue: () => new Date().toISOString() }),
  ],
  preview: {
    select: { student: 'studentId', week: 'weekNumber' },
    prepare: ({ student, week }) => ({ title: `Voice Journal - W${week}`, subtitle: `Student: ${student}` })
  }
})
