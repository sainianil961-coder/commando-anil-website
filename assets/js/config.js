/* Central site configuration — single source of truth. Edit values here only. */
const siteConfig = {
  brandName: "Commando Anil",
  ownerName: "Anil",
  professionalIdentity: "RPF/RPSF CoRAS Commando",
  rank: "Constable",
  tagline: "Railway & Defence Guidance",
  whatsappNumber: "6005111738",
  whatsappDisplay: "6005111738",
  whatsappDirect: "https://wa.me/916005111738",
  whatsappEnquiry:
    "https://wa.me/916005111738?text=" +
    encodeURIComponent("नमस्ते Commando Anil Sir, मैं आपकी Website के माध्यम से आपसे जुड़ रहा/रही हूँ।"),
  whatsappGroup: "https://chat.whatsapp.com/IBm7WKAxz8K2o19i0VWWr2",
  whatsappGroupLabel: "Railway Students Group",
  whatsappChannel: "https://whatsapp.com/channel/0029VbEObTwB4hdNBribsE2q",
  whatsappChannelLabel: "Commando Anil — Daily CBT MCQs",
  youtube: "https://www.youtube.com/@Commando_anil",
  youtubeHandle: "@Commando_anil",
  instagram: "https://www.instagram.com/commandoanilrpf/",
  instagramHandle: "@commandoanilrpf",
  facebook: "https://www.facebook.com/share/17o4DoQPNj/",
  facebookLabel: "Commando Anil",
  telegram: "", // not confirmed — keep empty to hide Telegram
  // TODO: set final domain before deployment, e.g. "https://www.commandoanil.in"
  siteUrl: "",
  defaultOgImage: "/assets/images/og-default.webp"
};
if (typeof window !== "undefined") window.siteConfig = siteConfig;
