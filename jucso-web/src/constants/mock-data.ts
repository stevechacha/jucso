import type {
  Club,
  Complaint,
  Document,
  Event,
  Minister,
  NewsItem,
  Suggestion,
  User,
} from "@/types";

export const DEMO_USERS: Record<string, User> = {
  "JUC/2024/001": { name: "Amara Osei", reg: "JUC/2024/001", role: "student" },
  "JUC/2024/002": { name: "Leilani Mwamba", reg: "JUC/2024/002", role: "student" },
  "MIN/ACAD/001": { name: "Amani Kiprotich", reg: "MIN/ACAD/001", role: "minister", ministry: "Academics" },
  "MIN/FIN/001": { name: "Baraka Omondi", reg: "MIN/FIN/001", role: "minister", ministry: "Finance" },
  "MIN/HLTH/001": { name: "Zawadi Moshi", reg: "MIN/HLTH/001", role: "minister", ministry: "Health & Welfare" },
  "MIN/SOC/001": { name: "Farida Juma", reg: "MIN/SOC/001", role: "minister", ministry: "Social Affairs" },
  "MIN/ACC/001": { name: "Tumelo Banda", reg: "MIN/ACC/001", role: "minister", ministry: "Accommodation" },
  "MIN/SPT/001": { name: "Kioni Njoroge", reg: "MIN/SPT/001", role: "minister", ministry: "Sports & Recreation" },
  "EXEC/PRES/001": { name: "Dr. Neema Salim", reg: "EXEC/PRES/001", role: "executive" },
  "ADMIN/001": { name: "System Administrator", reg: "ADMIN/001", role: "admin" },
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  { id: "JUC-001", category: "Academic Issues", description: "Library books for ECO 301 are insufficient — only 3 copies for 200+ students.", ministry: "Academics", status: "Pending", date: "Jun 24, 2026", studentName: "Amara Osei", studentReg: "JUC/2024/001", urgent: true },
  { id: "JUC-002", category: "Financial / Loan Issues", description: "HESLB loan disbursement delayed by 3 weeks with no official communication.", ministry: "Finance", status: "In Progress", date: "Jun 20, 2026", studentName: "Leilani Mwamba", studentReg: "JUC/2024/002", response: "We have escalated this to HESLB. Expect resolution by June 30." },
  { id: "JUC-003", category: "Accommodation", description: "Room 14B has a broken ceiling fan and leaking roof — reported twice with no action.", ministry: "Accommodation", status: "Resolved", date: "Jun 15, 2026", studentName: "Amara Osei", studentReg: "JUC/2024/001", response: "Maintenance team repaired both issues on June 18. Please confirm." },
  { id: "JUC-004", category: "Health & Welfare", description: "College dispensary is unstaffed during afternoon hours (1–3 PM daily).", ministry: "Health & Welfare", status: "Pending", date: "Jun 18, 2026", studentName: "Leilani Mwamba", studentReg: "JUC/2024/002", urgent: true },
  { id: "JUC-005", category: "Academic Issues", description: "Computer lab PCs in Block C are running outdated software — cannot run required coursework.", ministry: "Academics", status: "In Progress", date: "Jun 22, 2026", studentName: "Amara Osei", studentReg: "JUC/2024/001" },
  { id: "JUC-006", category: "Social Affairs", description: "Student common room lights broken for two months — reported to housing but no action.", ministry: "Social Affairs", status: "Pending", date: "Jun 25, 2026", studentName: "Leilani Mwamba", studentReg: "JUC/2024/002" },
];

export const INITIAL_SUGGESTIONS: Suggestion[] = [
  { id: "SUG-001", title: "Extended Library Hours", description: "Library should stay open until midnight during exam periods.", studentName: "Amara Osei", date: "Jun 20, 2026", status: "Under Review" },
  { id: "SUG-002", title: "Mental Health Counselor", description: "Hire a full-time student counselor — many students struggle silently.", studentName: "Leilani Mwamba", date: "Jun 23, 2026", status: "Received" },
  { id: "SUG-003", title: "Online Lecture Recordings", description: "Record and upload all lectures to the student portal for revision.", studentName: "Amara Osei", date: "Jun 10, 2026", status: "Implemented" },
];

export const CLUBS: Club[] = [
  { id: "CLB-001", name: "Debate & Public Speaking Society", description: "Weekly debates, public speaking coaching, and national competition participation.", members: 47, leader: "Dr. Kamau", category: "Academic" },
  { id: "CLB-002", name: "Environmental Action Club", description: "Tree planting, campus clean-ups, and sustainability advocacy.", members: 63, leader: "Prof. Wanjiku", category: "Community" },
  { id: "CLB-003", name: "Tech & Innovation Hub", description: "Coding bootcamps, hackathons, and entrepreneurship workshops.", members: 88, leader: "Mr. Ochieng", category: "Academic" },
  { id: "CLB-004", name: "Dance & Performing Arts", description: "Traditional and contemporary dance, theatre, and cultural showcases.", members: 35, leader: "Ms. Abebe", category: "Arts" },
  { id: "CLB-005", name: "Chess & Strategy Club", description: "Weekly tournaments, coaching sessions, and inter-university competitions.", members: 22, leader: "Mr. Msomi", category: "Recreation" },
  { id: "CLB-006", name: "Community Service Corps", description: "Off-campus volunteer programs, hospital visits, and primary school tutoring.", members: 54, leader: "Dr. Ngugi", category: "Community" },
];

export const EVENTS: Event[] = [
  { id: "EVT-001", title: "JUCSO Annual Freshers' Welcome", date: "Jul 8, 2026", location: "Main Auditorium", capacity: 400, registered: 287, description: "Welcome ceremony for 2026 intake. Musical performances, introductions, and refreshments." },
  { id: "EVT-002", title: "Career Fair 2026", date: "Jul 15, 2026", location: "Student Centre", capacity: 300, registered: 189, description: "50+ companies on campus. Bring your CV and dress professionally." },
  { id: "EVT-003", title: "Inter-University Debate Championship", date: "Jul 20, 2026", location: "Conference Hall A", capacity: 200, registered: 142, description: "JUCSO Debate Society hosts five universities. Open viewing for all students." },
  { id: "EVT-004", title: "Health Awareness Week Launch", date: "Aug 1, 2026", location: "Campus Grounds", capacity: 500, registered: 93, description: "Free medical screenings, mental health workshops, and nutrition talks." },
];

export const NEWS: NewsItem[] = [
  { id: "N01", title: "Digital Portal Launch: What Every Student Needs to Know", excerpt: "The JUCSO Digital Student Government Management System officially launches this month. All students must register using their reg number.", date: "Jun 28, 2026", tag: "Announcement" },
  { id: "N02", title: "Freshers' Welcome 2026 — Registration Now Open", excerpt: "If you joined Jordan University College in 2026, register for the official welcome ceremony by July 5.", date: "Jun 25, 2026", tag: "Events" },
  { id: "N03", title: "Tech & Innovation Hub Recruiting New Members", excerpt: "The Tech Hub is accepting applications for Semester 1. No prior coding experience required — just curiosity.", date: "Jun 22, 2026", tag: "Clubs" },
  { id: "N04", title: "HESLB Loan Disbursements: Official Timeline", excerpt: "The Ministry of Finance has confirmed HESLB disbursements will be processed in two batches: June 30 and July 7.", date: "Jun 20, 2026", tag: "Notice" },
  { id: "N05", title: "Career Fair 2026 — 50 Companies Confirmed", excerpt: "This year's career fair features firms from finance, tech, engineering, and health. Dress code is smart casual.", date: "Jun 18, 2026", tag: "Events" },
  { id: "N06", title: "Library Hours Extended for Exam Season", excerpt: "Following student feedback, the library will operate 7AM–11PM from July 1 through August 15.", date: "Jun 15, 2026", tag: "Announcement" },
];

export const DOCS: Document[] = [
  { id: "DOC-001", name: "JUCSO Constitution 2026", size: "1.2 MB", type: "PDF", date: "Jan 2026" },
  { id: "DOC-002", name: "Election Bylaws & Procedures", size: "856 KB", type: "PDF", date: "Feb 2026" },
  { id: "DOC-003", name: "Student Rights & Responsibilities Charter", size: "643 KB", type: "PDF", date: "Mar 2026" },
  { id: "DOC-004", name: "Meeting Minutes — June 2026", size: "312 KB", type: "PDF", date: "Jun 2026" },
  { id: "DOC-005", name: "Ministry Performance Report Q1 2026", size: "2.1 MB", type: "PDF", date: "Apr 2026" },
];

export const MINISTERS: Minister[] = [
  { initials: "AK", name: "Amani Kiprotich", role: "Minister of Academics" },
  { initials: "BO", name: "Baraka Omondi", role: "Minister of Finance" },
  { initials: "ZM", name: "Zawadi Moshi", role: "Minister of Health & Welfare" },
  { initials: "FJ", name: "Farida Juma", role: "Minister of Social Affairs" },
  { initials: "TB", name: "Tumelo Banda", role: "Minister of Accommodation" },
  { initials: "KN", name: "Kioni Njoroge", role: "Minister of Sports & Recreation" },
];

export const CAT_TO_MINISTRY: Record<string, string> = {
  "Academic Issues": "Academics",
  "Financial / Loan Issues": "Finance",
  "Health & Welfare": "Health & Welfare",
  Accommodation: "Accommodation",
  "Social Affairs": "Social Affairs",
  "Sports & Recreation": "Sports & Recreation",
  Other: "Academics",
};

export const PUBLIC_PAGES = ["home", "about", "services", "news", "documents", "contact"] as const;

export const PORTAL_ROLE_LABELS = {
  student: "Student Portal",
  minister: "Minister Portal",
  executive: "Executive Portal",
  admin: "Admin Portal",
} as const;

export const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  "In Progress": "bg-amber-50 text-amber-600",
  Resolved: "bg-emerald-50 text-emerald-700",
  Received: "bg-gray-100 text-gray-600",
  "Under Review": "bg-amber-50 text-amber-600",
  Implemented: "bg-emerald-50 text-emerald-700",
};

export const HOME_STATS = [
  ["2,400+", "Students Served"],
  ["6", "Active Ministries"],
  ["12", "Weeks to Launch"],
  ["TZS 70K", "Annual Budget"],
] as const;

export const SERVICE_CARDS = [
  { icon: "📋", title: "Submit a Complaint", desc: "File a complaint under the correct ministry and track it in real time.", color: "#1B2B6B" },
  { icon: "💡", title: "Share an Idea", desc: "Have a suggestion? JUCSO leadership will review and respond.", color: "#00B4C6" },
  { icon: "🎓", title: "Join a Club", desc: "Browse active student clubs and sign up with one click.", color: "#F5A623" },
  { icon: "📅", title: "Event Registration", desc: "Find upcoming events and secure your spot before capacity fills.", color: "#1B2B6B" },
] as const;
