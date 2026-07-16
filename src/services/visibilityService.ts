export interface CompetitorMention {
  competitorId: string;
  name: string;
  position: number;
}

export interface MentionScan {
  brandMentioned: boolean;
  brandMentionPosition: number | null;
  competitorsMentioned: CompetitorMention[];
  visibilityScore: number;
}

interface NamedEntity {
  id: string;
  name: string;
}

// MVP visibility heuristic (deliberately simple — see Module 3 of the
// strategic plan for the fuller scoring model to come later):
//  1. Find the first character index each tracked name (brand aliases +
//     competitor names) appears at in the raw response (case-insensitive).
//  2. Rank all names that were found by that index — rank 1 is whichever
//     name appeared earliest in the text.
//  3. visibilityScore = 100 / brand's rank if mentioned, else 0.
export function scanMentions(rawResponse: string, brandNames: string[], competitors: NamedEntity[]): MentionScan {
  const haystack = rawResponse.toLowerCase();

  const brandIndex = Math.min(
    ...brandNames
      .map((name) => haystack.indexOf(name.toLowerCase()))
      .filter((idx) => idx >= 0),
    Infinity,
  );

  const competitorHits = competitors
    .map((c) => ({ ...c, index: haystack.indexOf(c.name.toLowerCase()) }))
    .filter((c) => c.index >= 0);

  const allHits = [
    ...(brandIndex < Infinity ? [{ kind: "brand" as const, index: brandIndex }] : []),
    ...competitorHits.map((c) => ({ kind: "competitor" as const, id: c.id, name: c.name, index: c.index })),
  ].sort((a, b) => a.index - b.index);

  const brandRank = allHits.findIndex((hit) => hit.kind === "brand") + 1 || null;

  const competitorsMentioned: CompetitorMention[] = allHits
    .map((hit, i) => ({ hit, position: i + 1 }))
    .filter((entry): entry is { hit: Extract<(typeof allHits)[number], { kind: "competitor" }>; position: number } =>
      entry.hit.kind === "competitor",
    )
    .map(({ hit, position }) => ({ competitorId: hit.id, name: hit.name, position }));

  const brandMentioned = brandRank !== null;
  const visibilityScore = brandMentioned ? Number((100 / (brandRank as number)).toFixed(2)) : 0;

  return {
    brandMentioned,
    brandMentionPosition: brandRank,
    competitorsMentioned,
    visibilityScore,
  };
}
