import { z } from "zod";

export const ticketTierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be >= 0"),
  quantityTotal: z.number().int().positive("Must be at least 1"),
  quantitySold: z.number().int().min(0).default(0),
  salesStart: z.date().optional(),
  salesEnd: z.date().optional(),
});

export const speakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  photo: z.string().url("Invalid URL").optional(),
  company: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
});

export const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  room: z.string().optional(),
  speakerId: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  eventType: z.enum(["PHYSICAL", "VIRTUAL", "HYBRID"]),
  startDate: z.date(),
  endDate: z.date(),
  timezone: z.string().default("UTC"),
  venueAddress: z.string().optional(),
  virtualLink: z.string().url("Invalid URL").optional(),
  maxCapacity: z.number().int().positive("Must be at least 1"),
  bannerImage: z.string().url("Invalid URL").optional(),
  ticketTiers: z.array(ticketTierSchema).min(1, "At least one ticket tier is required"),
  speakers: z.array(speakerSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
});

export type EventFormData = z.infer<typeof eventSchema>;
