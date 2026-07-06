"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import { eventSchema, EventFormData } from "./useEventForm";

const steps = [
  { id: "basic", label: "Basic Info" },
  { id: "tickets", label: "Tickets" },
  { id: "speakers", label: "Speakers" },
  { id: "sessions", label: "Sessions" },
  { id: "preview", label: "Preview" },
];

export function EventForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
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
      ticketTiers: [{ name: "General Admission", price: 0, quantityTotal: 100 }],
      speakers: [],
      sessions: [],
      bannerImage: "",
    },
  });

  const { handleSubmit, trigger } = methods;

  const nextStep = async () => {
    let fields: (keyof EventFormData)[] = [];
    if (currentStep === 0) fields = ["title", "description", "category", "startDate", "endDate", "eventType"];
    else if (currentStep === 1) fields = ["ticketTiers"];
    else if (currentStep === 2) fields = ["speakers"];
    else if (currentStep === 3) fields = ["sessions"];

    const isValid = await trigger(fields);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      toast({
        title: "Success",
        description: "Event created successfully!",
        variant: "success",
      });
      router.push("/organizer/events");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1BasicInfo />;
      case 1: return <Step2Tickets />;
      case 2: return <Step3Speakers />;
      case 3: return <Step4Sessions />;
      case 4: return <Step5Preview />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <StepIndicator steps={steps} currentStep={currentStep} />
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {renderStep()}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button type="submit">Create Event</Button>
          ) : (
            <Button type="button" onClick={nextStep}>Next</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
