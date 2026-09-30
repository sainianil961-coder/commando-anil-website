/* Structured content: exam categories, updates, videos, resources.
   RULE: never invent vacancy numbers, dates, cut-offs or salaries.
   To publish a real update: copy one object, fill official fields, set status "published". */
window.examCategories = [
  { slug: "rrb-ntpc", title: "RRB NTPC", desc: "CBT-1, CBT-2, Syllabus, Post & Zone Preference, Medical, Salary." },
  { slug: "rrb-group-d", title: "RRB Group D", desc: "Eligibility, Exam Pattern, Physical, Medical, Selection." },
  { slug: "rpf-constable", title: "RPF Constable", desc: "CBT, PET/PMT, Documents, Training, Job Profile, Salary." },
  { slug: "rpf-si", title: "RPF SI", desc: "Eligibility, CBT, Physical, Medical, Selection Process." },
  { slug: "latest-updates", title: "Railway Current Affairs", desc: "Exam-oriented Railway + General Awareness points." },
  { slug: "study-resources", title: "General Science", desc: "Physics, Chemistry, Biology — Railway exam focus." },
  { slug: "study-resources", title: "Physical & Medical", desc: "PET/PMT standards, Medical fitness, DV documents." },
  { slug: "rpf-constable", title: "Job Profile", desc: "Duty, posting, lifestyle — practical ground reality." },
  { slug: "rpf-constable", title: "Salary & Benefits", desc: "Pay level, allowances, Railway benefits — official rule अनुसार।" },
  { slug: "study-resources", title: "Preparation Strategy", desc: "90-day plan, PYQ, Mock Test, revision method." }
];

/* Keep EMPTY until real data is available. Renderer shows a clean empty-state. */
window.siteUpdates = [];

window.siteVideos = []; // {id, title, category, date, desc} — add real YouTube video IDs only

window.studyResources = [
  { title: "General Science MCQs", cat: "General Science", desc: "Physics • Chemistry • Biology — Railway pattern पर practice set architecture.", action: "Coming Soon", href: "study-resources/" },
  { title: "Railway Current Affairs", cat: "Current Affairs", desc: "Railway Budget, Zones, New Trains, Appointments — monthly format.", action: "Coming Soon", href: "study-resources/" },
  { title: "Railway PYQs", cat: "PYQ", desc: "Previous year question practice — CBT pattern समझने के लिए।", action: "Coming Soon", href: "study-resources/" },
  { title: "Mock Tests", cat: "Mock Test", desc: "Timer + Score + Explanation वाला scalable Mock Test UI (phase-2)।", action: "View Plan", href: "study-resources/" },
  { title: "Practice Sets", cat: "Practice", desc: "Topic-wise practice sets — Math, Reasoning, GK/GS।", action: "Coming Soon", href: "study-resources/" },
  { title: "Exam Notes & Guides", cat: "Notes", desc: "Syllabus, Physical, Medical, Documents — short practical guides.", action: "Read Guides", href: "exams/" }
];
