import { useEffect, useState } from "react";
import { jucsoApi } from "@/api/jucsoApi";
import type { Election } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";

export function ElectionsPanel({ apiEnabled }: { apiEnabled: boolean }) {
  const { t } = useLanguage();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  const load = () => {
    if (!apiEnabled) {
      setLoading(false);
      return;
    }
    void jucsoApi
      .getElections()
      .then(setElections)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [apiEnabled]);

  const vote = async (electionPk: number, candidateId: string) => {
    setVotingId(candidateId);
    try {
      const updated = await jucsoApi.voteInElection(electionPk, candidateId);
      setElections((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (error) {
      console.error(error);
    } finally {
      setVotingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-400 text-sm">{t("electionsLoading")}</p>;
  }

  if (elections.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm shadow-card">
        {t("electionsEmpty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {elections.map((election) => (
        <article key={election.id} className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-display font-bold text-jucso-navy text-sm">{election.title}</h3>
            <Badge variant={election.isOpen ? "green" : "gray"}>
              {election.isOpen ? t("electionOpen") : t("electionClosed")}
            </Badge>
          </div>
          {election.description && (
            <p className="text-gray-500 text-xs leading-relaxed mb-4">{election.description}</p>
          )}
          <div className="space-y-3">
            {election.candidates.map((c) => (
              <div key={c.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div>
                    <div className="font-semibold text-jucso-navy text-xs">{c.name}</div>
                    {c.position && <div className="text-[10px] text-gray-400">{c.position}</div>}
                  </div>
                  {c.voteCount != null && (
                    <span className="text-xs font-bold text-jucso-teal">
                      {t("electionVotes", { count: String(c.voteCount) })}
                    </span>
                  )}
                </div>
                {c.manifesto && <p className="text-gray-600 text-xs leading-relaxed mb-2">{c.manifesto}</p>}
                {election.isOpen && !election.hasVoted && (
                  <Button
                    size="sm"
                    variant="navy"
                    disabled={votingId === c.id}
                    onClick={() => void vote(parseInt(election.id.replace(/^ELEC-/i, ""), 10), c.id)}
                  >
                    {votingId === c.id ? t("electionVoting") : t("electionVote")}
                  </Button>
                )}
                {election.hasVoted && election.votedCandidateId === c.id && (
                  <p className="text-xs text-emerald-700 font-semibold">{t("electionYourVote")}</p>
                )}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
