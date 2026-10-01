# Commando Anil — Railway & Defence Guidance Website

Independent educational website for **Commando Anil (Anil)** — RPF/RPSF CoRAS Commando | Constable.
Static HTML + CSS + Vanilla JS. No backend, no jQuery, no heavy framework.

## 1. Run locally (beginner)

**Option A — double-click:** `index.html` खोलें। (Sub-pages `about/index.html` आदि भी सीधे खुलते हैं।)

**Option B — local server (recommended, correct paths हेतु):**
```powershell
cd "F:\COMMANDO ANIL WB"
python -m http.server 8080
# browser: http://localhost:8080
```
VS Code हो तो "Live Server" extension से `index.html` → Go Live.

## 2. Replace Commando Anil photo

1. Real photo को WebP में convert करें (1200px wide, ~200KB से कम)।
2. Save as: `assets/images/commando-anil.webp`
3. Homepage + About में `.profile-photo` placeholder है — real photo मिलते ही `<img src="assets/images/commando-anil.webp" alt="Commando Anil — RPF/RPSF CoRAS Commando">` लगाएं।
4. Random/AI face **कभी न लगाएं**।

OG share image: `assets/images/og-default.webp` (1200×630) बनाकर रखें।

## 3. WhatsApp number / links बदलना

सिर्फ **`assets/js/config.js`** edit करें — पूरी site अपने-आप update:
- `whatsappNumber`, `whatsappDirect`, `whatsappGroup`
- `whatsappChannel` — Daily MCQ WhatsApp Channel link (homepage, community, study-resources, contact, footer me auto-update)
- Pre-filled enquiry message `whatsappEnquiry` में (auto URL-encoded)

## 4. YouTube / Instagram / Facebook बदलना

`assets/js/config.js` में: `youtube`, `youtubeHandle`, `instagram`, `instagramHandle`, `facebook`.

## 5. Telegram बाद में जोड़ना

`config.js` में `telegram: "https://t.me/YOURHANDLE"` भरें → `main.js` का `applyConfig()` उसे show करेगा।
खाली रहने पर Telegram अपने-आप hidden रहता है।

## 6. Latest Vacancy / Notification जोड़ना

`assets/js/data.js` → `siteUpdates` में object जोड़ें:
```js
{ id:"rrb-ntpc-2026", title:"...", slug:"...", category:"New Vacancy",
  summary:"...", date:"2026-..-..", updatedDate:"2026-..-..",
  status:"published", officialSource:"https://...", content:"..." }
```
- `status:"published"` तभी रखें जब official source verified हो।
- Bina source के vacancy/tarikh **कभी publish न करें** — empty-state अपने-आप honest message दिखाता है।

## 7. YouTube video जोड़ना

```js
{ id:"YOUTUBE_VIDEO_ID", title:"...", category:"NTPC", date:"2026-..-.." }
```
Fake/guessed video URL कभी न बनाएं — सिर्फ real video ID।

## 8. Study Resource / MCQ jodna

`studyResources` array me `{title, cat, desc, action, href}` jodein. Fake PDF link n dein.

**MCQ (subject-wise) jodna:** har subject ka file `assets/js/mcq/` me hai —
`physics.js`, `chemistry.js`, `biology.js`, `maths.js`, `reasoning.js`, `railway-gk.js`.
Naya question jodne ke liye us subject ke `questions` array me object add karein:
```js
{ q: "सवाल?", options: ["A","B","C","D"], answer: 0, exp: "छोटा explanation" }
```
- `options` me **exactly 4** hone chahiye, `answer` 0 se 3 ke beech (0 = pehla option)।
- Naya subject banana ho to nayi file bana ke `window.mcqData.push({...})` karein aur
  `study-resources/index.html` me uska `<script>` tag add karein।
- Quiz ka engine `assets/js/mcq.js` hai — saare subjects yahin render hote hain (best score localStorage me save)।

## 9. Mock Test (phase-2) plan

`study-resources/` page पर roadmap है: Question + 4 options + Timer + Next/Previous + Submit + Score + Explanation।
`data.js` में `mockQuestions` array जोड़कर pure-JS quiz render करें — backend की ज़रूरत नहीं।

## 10. Homepage edit / Colors / SEO title-meta

- Homepage sections: `index.html` (HERO → UPDATES → EXAMS → VIDEOS → RESOURCES → ABOUT → COMMUNITY → SOCIAL → CONTACT)
- Colors: `assets/css/style.css` → `:root` variables
- Title/meta: हर page के `<head>` में unique `<title>` + `meta description`

## 11. Final domain + Canonical + Sitemap

1. `assets/js/config.js` → `siteUrl: "https://www.YOUR-DOMAIN"`
2. हर page में `<!-- TODO: canonical -->` comment है — domain मिलते ही `<link rel="canonical" href="https://YOUR-DOMAIN/...">` enable करें।
3. `sitemap.xml` + `robots.txt` में `YOUR-DOMAIN` replace करें।
4. OG `og:url`/`og:image` absolute URLs करें।

## 13. Firebase — Reviews + Deployment (section 13)

Review system ke liye Firestore database chahiye. Steps:

**A. Firebase project banayein**
1. https://console.firebase.google.com → Add project (Analytics optional, free Spark plan kaafi)।
2. Build → Firestore Database → Create database → Production mode → region `asia-south1` (Mumbai)।
3. Project Settings → Your apps → Web app (`</>`) add karein → config values copy karein।
4. `assets/js/firebase-config.js` me PASTE_* values bharein aur `window.firebaseEnabled = true` karein।

**B. Security rules deploy**
1. Firestore → Rules tab → `firestore.rules` file ka content paste → Publish।
   (CLI ho to: `.firebaserc` me project ID bharkar `firebase deploy --only firestore:rules`)
2. Rules: public sirf `status=="approved"` padh sakta hai; create sirf valid `pending` review; approve/reject/delete sirf admin।

**C. Admin (moderation) setup**
1. Authentication → Sign-in method → Email/Password → Enable।
2. Users → Add user → owner email + strong password।
3. Us user ki UID copy karke Firestore me collection `admins` → document ID = UID → field `role: "owner"` → Save।
4. Moderation page kholein: `/admin/` (ye page kahin publicly link nahi hai) → login →
   Pending tab me **Approve / Reject / Delete**।
5. Admin approve kare tabhi review public hota hai — Firestore rules browser se status change block karte hain।

**D. Hosting deploy (production)**
```powershell
npm install -g firebase-tools
firebase login
# .firebaserc me "PASTE_FIREBASE_PROJECT_ID" ki jagah real project ID likhein
firebase deploy
```
`firebase.json` ready hai (cleanUrls + trailingSlash + 404.html + firestore rules)।

**E. Review test checklist (Firebase connect ke baad)**
1. 1-star + 5-star submit → Firestore me `status: "pending"` bana → public list me NA dikhe।
2. `/admin/` se approve → public me dikhe, average + breakdown update ho।
3. Empty form, bina star, 4-akshar review, link wala review → error messages।
4. 1000+ akshar review → block; `<script>` input → plain text render (XSS safe)।
5. 10 min me dobara submit → cooldown message; honeypot + fast-submit bot block।
6. Rules simulator me: pending doc read (deny), approved read (allow), public update status→approved (deny)।
7. Mobile 360px par modal + stars + bars check।

**Note:** Review/Rating structured data (schema) jaan-boojhkar NAHI lagaya — Google policy ke hisaab se self-serving reviews par AggregateRating invalid ho sakta hai. Genuine reviews visible hain, schema nahi — safe option।

## 14. Deploy (static hosts)

Netlify / Vercel / GitHub Pages / cPanel — folder ko as-is upload करें।

## File map

```
index.html, about/, exams/, rrb-ntpc/, rrb-group-d/, rpf-constable/, rpf-si/,
latest-updates/, videos/, study-resources/, reviews/, community/, contact/,
disclaimer/, privacy-policy/, terms/, admin/ (unlinked owner moderation), 404.html,
assets/css/style.css, assets/js/config.js|data.js|main.js|reviews.js|admin.js|firebase-config.js,
assets/icons/favicon.svg, sitemap.xml, robots.txt, manifest.webmanifest,
firestore.rules, firebase.json, .firebaserc
```

**Note:** यह Indian Railways/RRB/RPF की official website नहीं है — देखें `disclaimer/`।
