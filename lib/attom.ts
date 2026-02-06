export interface AttomProperty {
  address: string;
  ownerName: string;
  ownerPhone: string | null;
  ownerEmail: string | null;
  equityPercent: number;
  yearsOwned: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

export async function fetchPropertiesByZip(zipCode: string): Promise<AttomProperty[]> {
  const apiKey = process.env.ATTOM_API_KEY;
  if (!apiKey) throw new Error("ATTOM_API_KEY is not configured");

  const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/expandedprofile?postalcode=${zipCode}&pagesize=50`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      apikey: apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`ATTOM API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const properties = data?.property || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => {
      const mktTotalValue = Number(get(p, "assessment.market.mktTotalValue") || 0);
      const mortgageAmount = Number(get(p, "assessment.mortgage.amount.firstConcurrent") || 0);
      const equityPercent = mktTotalValue > 0 ? ((mktTotalValue - mortgageAmount) / mktTotalValue) * 100 : 0;
      return equityPercent > 50;
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => {
      const mktTotalValue = Number(get(p, "assessment.market.mktTotalValue") || 0);
      const mortgageAmount = Number(get(p, "assessment.mortgage.amount.firstConcurrent") || 0);
      const equityPercent = mktTotalValue > 0
        ? Math.round(((mktTotalValue - mortgageAmount) / mktTotalValue) * 100)
        : 0;

      const saleDate = get(p, "sale.saleTransDate") as string | undefined;
      const yearsOwned = saleDate
        ? Math.floor((Date.now() - new Date(saleDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 10;

      const ownerFirst = get(p, "assessment.owner.owner1.first") || "";
      const ownerLast = get(p, "assessment.owner.owner1.last") || "Owner";

      return {
        address: [
          get(p, "address.oneLine") || get(p, "address.line1"),
          get(p, "address.locality"),
          get(p, "address.countrySubd"),
          get(p, "address.postal1"),
        ].filter(Boolean).join(", "),
        ownerName: `${ownerLast}, ${ownerFirst}`.trim().replace(/^,\s*/, "").replace(/,\s*$/, "") || "Property Owner",
        ownerPhone: null,
        ownerEmail: null,
        equityPercent,
        yearsOwned: Math.max(yearsOwned, 0),
      } as AttomProperty;
    })
    .filter((p: AttomProperty) => p.yearsOwned >= 7)
    .slice(0, 50);
}
