"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { LoaderCircle, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EventFormData } from "./useEventForm";

export function Step5Preview({ onUploadStateChange }: { onUploadStateChange: (uploading: boolean) => void }) {
  const { control, getValues, setValue, formState: { errors } } = useFormContext<EventFormData>();
  const bannerImage = useWatch({ control, name: "bannerImage" }) || "";
  const data = getValues();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleBannerUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image is too large", description: "Choose an image smaller than 5 MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    onUploadStateChange(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/organizer/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      const previousImage = bannerImage;
      setValue("bannerImage", result.url, { shouldDirty: true, shouldValidate: true });
      if (previousImage.startsWith("/uploads/events/")) {
        void fetch("/api/organizer/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousImage }),
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      onUploadStateChange(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (bannerImage.startsWith("/uploads/events/")) {
      const response = await fetch("/api/organizer/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: bannerImage }),
      });
      if (!response.ok) {
        toast({ title: "Could not remove image", description: "Please try again.", variant: "destructive" });
        return;
      }
    }
    setValue("bannerImage", "", { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preview & Publish</h3>
      <Card>
        <CardContent className="space-y-2">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>Description:</strong> {data.description}</p>
          <p><strong>Category:</strong> {data.category}</p>
          <p><strong>Type:</strong> {data.eventType}</p>
          <p><strong>Capacity:</strong> {data.maxCapacity}</p>
          <p><strong>Start:</strong> {data.startDate?.toString()}</p>
          <p><strong>End:</strong> {data.endDate?.toString()}</p>
          <p><strong>Venue:</strong> {data.venueAddress || "N/A"}</p>
          <p><strong>Virtual Link:</strong> {data.virtualLink || "N/A"}</p>
          <p><strong>Ticket Tiers:</strong> {data.ticketTiers?.length}</p>
          <p><strong>Speakers:</strong> {data.speakers?.length}</p>
          <p><strong>Sessions:</strong> {data.sessions?.length}</p>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-medium">Event Banner <span className="text-destructive">(Required)</span></h4>
            <p className="text-sm text-muted-foreground">Upload a PNG, JPG, or WebP image up to 5 MB</p>
          </div>
          <div className="flex items-center gap-2">
            {bannerImage && (
              <Button type="button" variant="outline" size="sm" onClick={handleRemoveBanner} disabled={uploading}>
                <Trash2 aria-hidden="true" />
                Remove
              </Button>
            )}
            <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted has-disabled:cursor-not-allowed has-disabled:opacity-60">
              {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? "Uploading..." : bannerImage ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                aria-label="Upload event banner image"
                onChange={handleBannerUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
        {bannerImage ? (
          <div className="relative aspect-2/1 overflow-hidden rounded-lg border border-border bg-muted">
            <Image src={bannerImage} alt="Event banner preview" fill unoptimized className="object-cover" />
          </div>
        ) : (
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center hover:bg-muted/60">
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Choose an image for your event banner</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              aria-label="Choose an event banner image"
              onChange={handleBannerUpload}
              disabled={uploading}
            />
          </label>
        )}
        {errors.bannerImage?.message && (
          <p role="alert" className="text-sm text-destructive">{errors.bannerImage.message}</p>
        )}
      </div>
    </div>
  );
}
