"use client";

import { Lead } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadTableProps {
  leads: Lead[];
}

function IntentBadge({ score }: { score: number }) {
  if (score >= 80) return <Badge className="bg-red-600 hover:bg-red-700">{score}</Badge>;
  if (score >= 60) return <Badge className="bg-orange-500 hover:bg-orange-600">{score}</Badge>;
  if (score >= 40) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">{score}</Badge>;
  return <Badge variant="secondary">{score}</Badge>;
}

export default function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Enter a ZIP code above and click &quot;Fetch 50 Hot Seller Leads&quot; to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Leads ({leads.length})</span>
          <span className="text-sm font-normal text-muted-foreground">
            Sorted by intent score (highest first)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Equity %</TableHead>
              <TableHead className="text-right">Years Owned</TableHead>
              <TableHead className="text-center">Intent</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">SMS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads
              .sort((a, b) => b.intent_score - a.intent_score)
              .map((lead, i) => (
                <TableRow key={lead.id || i}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{lead.address}</TableCell>
                  <TableCell>{lead.owner_name}</TableCell>
                  <TableCell className="text-right">{lead.equity_percent}%</TableCell>
                  <TableCell className="text-right">{lead.years_owned}</TableCell>
                  <TableCell className="text-center">
                    <IntentBadge score={lead.intent_score} />
                  </TableCell>
                  <TableCell className="text-center">
                    {lead.email_sent ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">Sent</Badge>
                    ) : lead.email_content ? (
                      <Badge variant="outline">Ready</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {lead.sms_sent ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">Sent</Badge>
                    ) : lead.sms_content ? (
                      <Badge variant="outline">Ready</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
