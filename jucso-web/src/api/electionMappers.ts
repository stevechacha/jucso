import type { Election, ElectionCandidate } from "@/types";
import type { ApiElection, ApiElectionCandidate } from "@/api/types";

function mapCandidate(c: ApiElectionCandidate): ElectionCandidate {
  return {
    id: c.id,
    name: c.name,
    position: c.position,
    manifesto: c.manifesto,
    voteCount: c.vote_count ?? undefined,
  };
}

export function mapElection(e: ApiElection): Election {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    isOpen: e.is_open,
    hasVoted: e.has_voted ?? false,
    votedCandidateId: e.voted_candidate_id ?? null,
    candidates: (e.candidates ?? []).map(mapCandidate),
  };
}
