export const ROLES = ["student", "minister", "executive", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const PORTALS = ["student", "staff"] as const;
export type PortalType = (typeof PORTALS)[number];

export type ComplaintStatus = "Pending" | "In Progress" | "Resolved";
export type SuggestionStatus = "Received" | "Under Review" | "Implemented";
export type NewsTag = "Announcement" | "Events" | "Clubs" | "Notice";

export type PageId =
  | "home"
  | "about"
  | "services"
  | "news"
  | "documents"
  | "contact"
  | "dashboard"
  | "reset-password";

export interface User {
  name: string;
  reg: string;
  role: Role;
  ministry?: string;
}

export interface Complaint {
  id: string;
  category: string;
  description: string;
  ministry: string;
  status: ComplaintStatus;
  date: string;
  studentName: string;
  studentReg: string;
  response?: string;
  urgent?: boolean;
  supportingDocumentUrl?: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  studentName: string;
  date: string;
  status: SuggestionStatus;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  members: number;
  leader: string;
  category: string;
  joined?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  description: string;
  isRegistered?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tag: NewsTag;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  downloadUrl?: string;
}

export interface Minister {
  initials: string;
  name: string;
  role: string;
}
