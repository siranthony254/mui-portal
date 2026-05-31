import { defineType, defineField } from 'sanity'

export const contentSchema = defineType({
  name:'content', title:'Content Block', type:'document',
  fields:[
    defineField({name:'title',title:'Title',type:'string',validation:r=>r.required()}),
    defineField({name:'description',title:'Description',type:'text',rows:3}),
    defineField({name:'contentType',title:'Content Type',type:'string',options:{list:['video','article','audio','pdf','image'],layout:'radio'},validation:r=>r.required()}),
    defineField({name:'url',title:'URL / Link',type:'url',description:'For YouTube: paste full URL. For others: direct link.',hidden:({document})=>document?.contentType==='article'}),
    defineField({name:'youtubeId',title:'YouTube Video ID',type:'string',hidden:({document})=>document?.contentType!=='video'}),
    defineField({name:'body',title:'Article Body',type:'array',of:[{type:'block'},{type:'image',options:{hotspot:true}}],hidden:({document})=>document?.contentType!=='article'}),
    defineField({name:'pillarNumber',title:'Pillar',type:'number',options:{list:[{title:'1 - Identity',value:1},{title:'2 - Understanding',value:2},{title:'3 - Awareness',value:3},{title:'4 - Solution Thinking',value:4},{title:'5 - Voice & Responsibility',value:5}]},validation:r=>r.required()}),
    defineField({name:'weekNumber',title:'Week',type:'number',options:{list:Array.from({length:12},(_,i)=>({title:`Week ${i+1}`,value:i+1}))},validation:r=>r.required()}),
    defineField({name:'durationMinutes',title:'Duration (minutes)',type:'number'}),
    defineField({name:'isRequired',title:'Required content?',type:'boolean',initialValue:true}),
    defineField({name:'tags',title:'Tags',type:'array',of:[{type:'string'}]}),
    defineField({name:'publishedAt',title:'Published At',type:'datetime',initialValue:()=>new Date().toISOString()}),
  ],
  preview:{select:{title:'title',subtitle:'contentType',pillar:'pillarNumber',week:'weekNumber'},prepare:({title,subtitle,pillar,week})=>({title,subtitle:`${subtitle?.toUpperCase()} - P${pillar} - W${week}`})}
})

export const courseSchema = defineType({
  name:'course', title:'Course', type:'document',
  fields:[
    defineField({name:'title',title:'Course Title',type:'string',validation:r=>r.required()}),
    defineField({name:'slug',title:'Slug',type:'slug',options:{source:'title'},validation:r=>r.required()}),
    defineField({name:'description',title:'Description',type:'text',rows:3}),
    defineField({name:'category',title:'Category',type:'string',options:{list:['formation','thinking','context','wellbeing']}}),
    defineField({name:'isCoreCurriculum',title:'Core curriculum (required for cohort)?',type:'boolean',initialValue:false}),
    defineField({name:'thumbnail',title:'Thumbnail',type:'image',options:{hotspot:true}}),
    defineField({name:'modules',title:'Modules',type:'array',of:[{type:'object',fields:[{name:'title',title:'Module Title',type:'string'},{name:'description',title:'Description',type:'text'},{name:'contentBlocks',title:'Content',type:'array',of:[{type:'reference',to:[{type:'content'}]}]}]}]}),
    defineField({name:'totalDurationMinutes',title:'Total Duration (minutes)',type:'number'}),
    defineField({name:'publishedAt',title:'Published At',type:'datetime',initialValue:()=>new Date().toISOString()}),
  ]
})

export const announcementSchema = defineType({
  name:'announcement', title:'Announcement', type:'document',
  fields:[
    defineField({name:'title',title:'Title',type:'string',validation:r=>r.required()}),
    defineField({name:'body',title:'Body',type:'array',of:[{type:'block'}]}),
    defineField({name:'targetRoles',title:'Target Roles',type:'array',of:[{type:'string'}],options:{list:['admin','mentor','student']}}),
    defineField({name:'cohortId',title:'Cohort ID (optional)',type:'string',description:'Leave blank to show to all users of targeted roles'}),
    defineField({name:'publishedAt',title:'Publish At',type:'datetime',initialValue:()=>new Date().toISOString()}),
    defineField({name:'expiresAt',title:'Expires At',type:'datetime'}),
  ]
})

export const taskPromptSchema = defineType({
  name:'taskPrompt', title:'Task Prompt', type:'document',
  fields:[
    defineField({name:'title',title:'Task Title',type:'string',validation:r=>r.required()}),
    defineField({name:'pillarNumber',title:'Pillar',type:'number',options:{list:[1,2,3,4,5].map(n=>({title:`Pillar ${n}`,value:n}))}}),
    defineField({name:'weekNumber',title:'Week',type:'number',options:{list:Array.from({length:12},(_,i)=>({title:`Week ${i+1}`,value:i+1}))}}),
    defineField({name:'prompt',title:'Task Prompt',type:'text',rows:5,validation:r=>r.required()}),
    defineField({name:'instructions',title:'Detailed Instructions',type:'array',of:[{type:'block'}]}),
    defineField({name:'exampleResponse',title:'Example Response (optional)',type:'text',rows:4}),
    defineField({name:'resources',title:'Related Resources',type:'array',of:[{type:'reference',to:[{type:'content'}]}]}),
  ],
  preview:{select:{title:'title',pillar:'pillarNumber',week:'weekNumber'},prepare:({title,pillar,week})=>({title,subtitle:`P${pillar} - W${week}`})}
})
