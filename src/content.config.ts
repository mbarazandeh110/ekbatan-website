import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const toolsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/tools" }),
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
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/experiences" }),
  schema: z.object({
    title: z.string(),
    scale: z.string(),
    category: z.string(),
    description: z.string(),
    highlights: z.array(z.string()),
    techs: z.array(z.string()),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional(),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('تیم مهندسی اکباتان'),
    tags: z.array(z.string()).optional(),
  }),
});

const servicesCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    description: z.string(),
    tag: z.string(),
    order: z.number().default(100),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional(),
  }),
});

export const collections = {
  tools: toolsCollection,
  experiences: experiencesCollection,
  blog: blogCollection,
  services: servicesCollection,
};