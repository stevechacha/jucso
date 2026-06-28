import { useCallback, useState } from "react";
import {
  CLUBS,
  DOCS,
  EVENTS,
  INITIAL_COMPLAINTS,
  INITIAL_SUGGESTIONS,
  NEWS,
} from "@/constants/mock-data";
import { isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { Club, Complaint, Document, Event, NewsItem, Suggestion, User } from "@/types";

export function usePortalData() {
  const [dataLoading, setDataLoading] = useState(isApiEnabled);
  const [dataError, setDataError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);
  const [clubs, setClubs] = useState<Club[]>(CLUBS);
  const [events, setEvents] = useState<Event[]>(EVENTS);
  const [news, setNews] = useState<NewsItem[]>(NEWS);
  const [documents, setDocuments] = useState<Document[]>(DOCS);

  const refreshPortalData = useCallback(async (activeUser: User | null) => {
    if (!isApiEnabled) return;

    setDataLoading(true);
    setDataError(null);

    try {
      const [newsData, clubsData, eventsData, docsData] = await Promise.all([
        jucsoApi.getNews(),
        jucsoApi.getClubs(),
        jucsoApi.getEvents(),
        jucsoApi.getDocuments(),
      ]);
      setNews(newsData);
      setClubs(clubsData);
      setEvents(eventsData);
      setDocuments(docsData);

      if (activeUser) {
        const [complaintsData, suggestionsData] = await Promise.all([
          jucsoApi.getComplaints(),
          jucsoApi.getSuggestions(),
        ]);
        setComplaints(complaintsData);
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load portal data";
      setDataError(message);
      console.error("Failed to sync portal data:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const resetPrivateData = useCallback(() => {
    setComplaints(INITIAL_COMPLAINTS);
    setSuggestions(INITIAL_SUGGESTIONS);
    setClubs(CLUBS);
    setEvents(EVENTS);
    if (!isApiEnabled) {
      setNews(NEWS);
      setDocuments(DOCS);
    }
  }, []);

  return {
    dataLoading,
    dataError,
    complaints,
    setComplaints,
    suggestions,
    setSuggestions,
    clubs,
    setClubs,
    events,
    setEvents,
    news,
    documents,
    refreshPortalData,
    resetPrivateData,
  };
}
