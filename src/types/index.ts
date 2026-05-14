export type Degree =
  | "MBBS"
  | "BDS"
  | "BAMS"
  | "BHMS"
  | "BUMS"
  | "BVSc"
  | "BSc Nursing";

export type Category = "General" | "OBC" | "SC" | "ST" | "EWS";

export type PrepYears = "First attempt" | "1 drop" | "2+ drops";

export type Tier = "free" | "paid_199" | "paid_999";

export interface Student {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  target_degree: Degree;
  score: number;
  category: Category;
  state: string;
  prep_years: PrepYears;
  biggest_worry: string;
  tier?: Tier;
  report_status?: "pending" | "queued" | "processing" | "done" | "failed";
  report_url?: string;
  session_token?: string;
  created_at?: string;
}

export interface Mentor {
  id: string;
  name: string;
  degree: Degree;
  college: string;
  neet_score: number;
  calendly_link: string;
  photo_url: string;
  is_active: boolean;
}

export interface Report {
  id: string;
  student_id: string;
  report_content: string;
  report_url?: string;
  generated_at: string;
}

export interface NtaUpdate {
  id: string;
  update_text: string;
  source_url: string;
  fetched_at: string;
}

export interface DegreeInfo {
  label: Degree;
  icon: string;
  color: string;
  description: string;
  projectedCutoff2026General: number;
  projectedCutoff2026OBC: number;
  projectedCutoff2026SC: number;
  projectedCutoff2026ST: number;
  totalSeats: string;
}

export const DEGREE_INFO: DegreeInfo[] = [
  {
    label: "MBBS",
    icon: "🩺",
    color: "#C2410C",
    description: "Bachelor of Medicine & Surgery",
    projectedCutoff2026General: 720,
    projectedCutoff2026OBC: 650,
    projectedCutoff2026SC: 550,
    projectedCutoff2026ST: 500,
    totalSeats: "1,09,145",
  },
  {
    label: "BDS",
    icon: "🦷",
    color: "#0EA5E9",
    description: "Bachelor of Dental Surgery",
    projectedCutoff2026General: 499,
    projectedCutoff2026OBC: 458,
    projectedCutoff2026SC: 400,
    projectedCutoff2026ST: 380,
    totalSeats: "27,948",
  },
  {
    label: "BAMS",
    icon: "🌿",
    color: "#10B981",
    description: "Bachelor of Ayurvedic Medicine",
    projectedCutoff2026General: 360,
    projectedCutoff2026OBC: 320,
    projectedCutoff2026SC: 280,
    projectedCutoff2026ST: 250,
    totalSeats: "52,720",
  },
  {
    label: "BHMS",
    icon: "💊",
    color: "#8B5CF6",
    description: "Bachelor of Homeopathic Medicine",
    projectedCutoff2026General: 320,
    projectedCutoff2026OBC: 280,
    projectedCutoff2026SC: 240,
    projectedCutoff2026ST: 210,
    totalSeats: "13,315",
  },
  {
    label: "BUMS",
    icon: "☪️",
    color: "#F59E0B",
    description: "Bachelor of Unani Medicine",
    projectedCutoff2026General: 300,
    projectedCutoff2026OBC: 260,
    projectedCutoff2026SC: 220,
    projectedCutoff2026ST: 200,
    totalSeats: "4,935",
  },
  {
    label: "BVSc",
    icon: "🐾",
    color: "#EC4899",
    description: "Bachelor of Veterinary Science",
    projectedCutoff2026General: 380,
    projectedCutoff2026OBC: 340,
    projectedCutoff2026SC: 290,
    projectedCutoff2026ST: 260,
    totalSeats: "10,462",
  },
  {
    label: "BSc Nursing",
    icon: "💉",
    color: "#14B8A6",
    description: "Bachelor of Science in Nursing",
    projectedCutoff2026General: 290,
    projectedCutoff2026OBC: 250,
    projectedCutoff2026SC: 210,
    projectedCutoff2026ST: 190,
    totalSeats: "27,369",
  },
];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Chandigarh","Puducherry","Andaman & Nicobar","Lakshadweep","Dadra & Nagar Haveli",
];
