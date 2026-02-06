"use client";

import { useState } from "react";
import ProspectorForm from "@/components/ProspectorForm";
import LeadTable from "@/components/LeadTable";
import { Lead } from "@/lib/supabase";

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-7xl">
        <ProspectorForm onLeadsLoaded={setLeads} leads={leads} />
        <LeadTable leads={leads} />
      </div>
    </main>
  );
}
