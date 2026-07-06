"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Download, Eye, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export function TicketCard({ ticket }: { ticket: any }) {
  const [showQR, setShowQR] = useState(false);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CHECKED_IN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{ticket.event.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{ticket.ticketTier.name}</p>
          </div>
          <Badge className={statusColors[ticket.status as keyof typeof statusColors] || "bg-gray-100"}>
            {ticket.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(ticket.event.startDate), "MMM d, yyyy · h:mm a")}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {ticket.event.eventType === "VIRTUAL" ? "Virtual" : ticket.event.venueAddress || "Venue TBA"}
        </div>
        <div className="flex justify-between text-sm">
          <span>Ticket ID: {ticket.id.slice(-8)}</span>
          <span>${ticket.ticketTier.price.toFixed(2)}</span>
        </div>
        {showQR && (
          <div className="flex justify-center py-4">
            <QRCodeSVG value={ticket.id} size={150} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border pt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
          {showQR ? "Hide QR" : "Show QR"}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/events/${ticket.event.slug}`}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
