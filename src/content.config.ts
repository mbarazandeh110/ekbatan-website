import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    category: z.string(),
    badge: z.string(),
    description: z.string(),
    architectureDetails: z.array(z.string()),
    features: z.array(z.string()),
    yamlCode: z.string(),
  }),
});

const experiencesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    scale: z.string(),
    category: z.string(),
    description: z.string(),
    highlights: z.array(z.string()),
    techs: z.array(z.string()),
  }),
});

export const collections = {
  tools: toolsCollection,
  experiences: experiencesCollection,
};
