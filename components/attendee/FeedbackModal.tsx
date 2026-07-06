"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onRefresh: () => void;
}

export function FeedbackModal({ open, onOpenChange, event, onRefresh }: FeedbackModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Error", description: "Please select a rating", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/attendee/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, rating, comment }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      toast({ title: "Success", description: "Feedback submitted", variant: "success" });
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Feedback</DialogTitle>
          <DialogDescription>
            Rate your experience for "{event.event.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hover || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 ? `${rating}/5` : "Select rating"}
            </span>
          </div>
          <Textarea
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
