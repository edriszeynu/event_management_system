"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

export function CheckInButton({ checkedIn, onCheckIn, disabled }: any) {
  return (
    <Button
      variant={checkedIn ? "default" : "outline"}
      size="sm"
      onClick={onCheckIn}
      disabled={disabled}
      className={checkedIn ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {checkedIn ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1" /> Checked In
        </>
      ) : (
        <>
          <Circle className="h-4 w-4 mr-1" /> Check In
        </>
      )}
    </Button>
  );
}
