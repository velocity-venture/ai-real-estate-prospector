"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lead } from "@/lib/supabase";

interface ProspectorFormProps {
  onLeadsLoaded: (leads: Lead[]) => void;
  leads: Lead[];
}

export default function ProspectorForm({ onLeadsLoaded, leads }: ProspectorFormProps) {
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);

  const fetchLeads = async () => {
    if (!/^\d{5}$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit ZIP code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/leads?zip=${zipCode}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to fetch leads");
        return;
      }

      onLeadsLoaded(data.leads);
      toast.success(`Found ${data.leads.length} leads in ${zipCode}`);
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const sendEmails = async () => {
    setSendingEmails(true);
    try {
      const res = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_code: zipCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send emails");
        return;
      }

      toast.success(`Sent ${data.sent} emails successfully`);
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setSendingEmails(false);
    }
  };

  const sendSMS = async () => {
    setSendingSMS(true);
    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip_code: zipCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send SMS");
        return;
      }

      toast.success(`Sent ${data.sent} SMS messages successfully`);
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setSendingSMS(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Real Estate Prospector</CardTitle>
        <CardDescription>
          Enter a ZIP code to find high-intent seller leads with 50%+ equity and 7+ years ownership
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="zip" className="text-sm font-medium mb-1.5 block">
              ZIP Code
            </label>
            <Input
              id="zip"
              placeholder="Enter 5-digit ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
              maxLength={5}
            />
          </div>
          <Button onClick={fetchLeads} disabled={loading || zipCode.length !== 5} className="min-w-[200px]">
            {loading ? "Fetching Leads..." : "Fetch 50 Hot Seller Leads"}
          </Button>
        </div>

        {leads.length > 0 && (
          <div className="flex gap-3 mt-4 pt-4 border-t">
            <Button variant="secondary" onClick={sendEmails} disabled={sendingEmails}>
              {sendingEmails ? "Sending..." : "Send First 10 Emails"}
            </Button>
            <Button variant="secondary" onClick={sendSMS} disabled={sendingSMS}>
              {sendingSMS ? "Sending..." : "Send First 10 SMS"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
