import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "login": "Login",
      "driver_id": "Driver ID",
      "password": "Password",
      "active_trip": "Active Trip",
      "no_active_trip": "No active trip",
      "start_trip": "Start Trip",
      "complete_trip": "Complete Trip",
      "report_issue": "Report Issue",
      "navigation": "Navigation",
      "profile": "Profile",
      "leaderboard": "Leaderboard",
      "loading": "Loading...",
      "offline": "You are offline",
      "online": "You are online",
      "language": "Language",
      "hindi": "Hindi",
      "english": "English",
      "accept": "Accept",
      "reject": "Reject",
      "upload_pod": "Upload POD",
      "signature": "Signature",
      "camera": "Camera",
      "submit": "Submit",
      "earnings": "Earnings",
      "documents": "Documents",
      "rank": "Rank",
      "points": "Points",
      "distance": "Distance",
      "duration": "Duration",
      "origin": "Origin",
      "destination": "Destination",
      "cargo": "Cargo",
      "contact": "Contact",
      "call": "Call",
      "navigate": "Navigate"
    }
  },
  hi: {
    translation: {
      "welcome": "स्वागत है",
      "login": "लॉग इन करें",
      "driver_id": "ड्राइवर आईडी",
      "password": "पासवर्ड",
      "active_trip": "सक्रिय यात्रा",
      "no_active_trip": "कोई सक्रिय यात्रा नहीं",
      "start_trip": "यात्रा शुरू करें",
      "complete_trip": "यात्रा पूरी करें",
      "report_issue": "समस्या की रिपोर्ट करें",
      "navigation": "नेविगेशन",
      "profile": "प्रोफाइल",
      "leaderboard": "लीडरबोर्ड",
      "loading": "लोड हो रहा है...",
      "offline": "आप ऑफ़लाइन हैं",
      "online": "आप ऑनलाइन हैं",
      "language": "भाषा",
      "hindi": "हिंदी",
      "english": "अंग्रेजी",
      "accept": "स्वीकार करें",
      "reject": "अस्वीकार करें",
      "upload_pod": "POD अपलोड करें",
      "signature": "हस्ताक्षर",
      "camera": "कैमरा",
      "submit": "जमा करें",
      "earnings": "कमाई",
      "documents": "दस्तावेज़",
      "rank": "रैंक",
      "points": "अंक",
      "distance": "दूरी",
      "duration": "अवधि",
      "origin": "मूल",
      "destination": "गंतव्य",
      "cargo": "कार्गो",
      "contact": "संपर्क",
      "call": "कॉल करें",
      "navigate": "नेविगेट करें"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
