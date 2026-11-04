import { z } from "zod";

export const ticketTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be >= 0"),
  quantityTotal: z.number().int().positive("Must be at least 1"),
  quantitySold: z.number().int().min(0),
  salesStart: z.date().optional(),
  salesEnd: z.date().optional(),
});

export const speakerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  photo: z.union([z.string().url("Invalid URL"), z.literal("")]).optional(),
  company: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
});

export const sessionSchema = z.object({
  id: z.string().optional(),
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
  tags: z.array(z.string()),
  eventType: z.enum(["PHYSICAL", "VIRTUAL", "HYBRID"]),
  startDate: z.date(),
  endDate: z.date(),
  timezone: z.string(),
  venueAddress: z.string().optional(),
  virtualLink: z.union([z.string().url("Invalid URL"), z.literal("")]).optional(),
  maxCapacity: z.number().int().positive("Must be at least 1"),
  bannerImage: z.string()
    .trim()
    .min(1, "Upload an event banner before creating the event.")
    .refine(
      (value) => value.startsWith("/uploads/events/") || z.string().url().safeParse(value).success,
      "Upload a valid event banner image.",
    ),
  ticketTiers: z.array(ticketTierSchema).min(1, "At least one ticket tier is required"),
  speakers: z.array(speakerSchema),
  sessions: z.array(sessionSchema),
});

export type EventFormData = z.infer<typeof eventSchema>;

type EventFormInitialSpeaker = Omit<EventFormData["speakers"][number], "socialLinks"> & {
  id: string;
  socialLinks?: Record<string, string> | null;
};

export type EventFormInitialData = Omit<EventFormData, "startDate" | "endDate" | "ticketTiers" | "bannerImage" | "speakers" | "sessions"> & {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  bannerImage?: string | null;
  ticketTiers: Array<
    Omit<EventFormData["ticketTiers"][number], "salesStart" | "salesEnd"> & {
      id: string;
      salesStart?: string | Date | null;
      salesEnd?: string | Date | null;
    }
  >;
  speakers: EventFormInitialSpeaker[];
  sessions: Array<
    Omit<EventFormData["sessions"][number], "startTime" | "endTime"> & {
      id: string;
      startTime: string | Date;
      endTime: string | Date;
      speaker?: EventFormInitialSpeaker | null;
    }
  >;
};
