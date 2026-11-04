"use client";

import { useState } from "react";
import { useForm, FormProvider, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Tickets } from "./Step2Tickets";
import { Step3Speakers } from "./Step3Speakers";
import { Step4Sessions } from "./Step4Sessions";
import { Step5Preview } from "./Step5Preview";
import { eventSchema, EventFormData, type EventFormInitialData } from "./useEventForm";
import { CheckCircle, Loader2 } from "lucide-react";

const steps = [
  { id: "basic", label: "Basic Info" },
  { id: "tickets", label: "Tickets" },
  { id: "speakers", label: "Speakers" },
  { id: "sessions", label: "Sessions" },
  { id: "preview", label: "Preview" },
];

export function EventForm({ initialData }: { initialData?: EventFormInitialData | null }) {
  const isEditing = Boolean(initialData);
  const visibleSteps = steps;
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData ? {
      ...initialData,
      startDate: new Date(initialData.startDate),
      endDate: new Date(initialData.endDate),
      bannerImage: initialData.bannerImage ?? "",
      ticketTiers: initialData.ticketTiers.map((tier) => ({
        ...tier,
        description: tier.description ?? "",
        salesStart: tier.salesStart ? new Date(tier.salesStart) : undefined,
        salesEnd: tier.salesEnd ? new Date(tier.salesEnd) : undefined,
      })),
      speakers: (initialData.speakers ?? []).map((speaker) => ({
        ...speaker,
        bio: speaker.bio ?? "",
        photo: speaker.photo ?? "",
        company: speaker.company ?? "",
        socialLinks: speaker.socialLinks ?? undefined,
      })),
      sessions: (initialData.sessions ?? []).map((session) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        description: session.description ?? "",
        room: session.room ?? "",
        speakerId: session.speakerId ?? session.speaker?.id ?? undefined,
      })),
    } : {
      title: "",
      description: "",
      category: "",
      tags: [],
      eventType: "PHYSICAL",
      startDate: new Date(),
      endDate: new Date(),
      timezone: "UTC",
      venueAddress: "",
      virtualLink: "",
      maxCapacity: 100,
      ticketTiers: [{ name: "General Admission", price: 0, quantityTotal: 100, quantitySold: 0 }],
      speakers: [],
      sessions: [],
      bannerImage: "",
    },
  });

  const { handleSubmit, trigger } = methods;

  const nextStep = async () => {
    let fields: (keyof EventFormData)[] = [];
    const activeStepId = visibleSteps[currentStep]?.id;
    if (activeStepId === "basic") fields = ["title", "description", "category", "startDate", "endDate", "eventType"];
    else if (activeStepId === "tickets") fields = ["ticketTiers"];
    else if (activeStepId === "speakers") fields = ["speakers"];
    else if (activeStepId === "sessions") fields = ["sessions"];

    const isValid = await trigger(fields);
    if (isValid && currentStep < visibleSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: EventFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        initialData ? `/api/organizer/events/${initialData.id}` : "/api/organizer/events",
        {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || (isEditing ? "Failed to update event" : "Failed to create event"));
      }

      setSuccess(true);
      toast({
        title: isEditing ? "Event Updated" : "Event Created",
        description: isEditing ? "Your event changes have been saved." : "Your event has been created successfully.",
      });
      setTimeout(() => router.push("/organizer/events"), 2000);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = (errors: FieldErrors<EventFormData>) => {
    const invalidField = Object.keys(errors)[0];
    const invalidStepId = invalidField?.startsWith("ticketTiers")
      ? "tickets"
      : invalidField?.startsWith("speakers")
        ? "speakers"
        : invalidField?.startsWith("sessions")
          ? "sessions"
          : invalidField === "bannerImage"
            ? "preview"
            : "basic";
    const invalidStep = visibleSteps.findIndex((step) => step.id === invalidStepId);
    setCurrentStep(invalidStep >= 0 ? invalidStep : 0);

    const fieldError = invalidField
      ? errors[invalidField as keyof EventFormData]?.message
      : undefined;
    toast({
      title: "Validation Error",
      description: typeof fieldError === "string"
        ? fieldError
        : "Please check the highlighted fields and try again.",
      variant: "destructive",
    });
  };

  const renderStep = () => {
    switch (visibleSteps[currentStep]?.id) {
      case "basic": return <Step1BasicInfo />;
      case "tickets": return <Step2Tickets />;
      case "speakers": return <Step3Speakers />;
      case "sessions": return <Step4Sessions />;
      case "preview": return <Step5Preview onUploadStateChange={setUploadingBanner} />;
      default: return null;
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">{isEditing ? "Event Updated Successfully!" : "Event Created Successfully!"}</h2>
        <p className="text-muted-foreground">Redirecting to your events...</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <StepIndicator steps={visibleSteps} currentStep={currentStep} />
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {renderStep()}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || submitting}>
            Previous
          </Button>
          {currentStep === visibleSteps.length - 1 ? (
            <Button type="submit" disabled={submitting || uploadingBanner}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? "Save Changes" : "Create Event"}
            </Button>
          ) : (
            <Button type="button" onClick={nextStep}>Next</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
