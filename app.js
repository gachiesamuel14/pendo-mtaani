const COUNTIES = {
  Nairobi: [-1.286389, 36.817223],
  Mombasa: [-4.043477, 39.668206],
  Kisumu: [-0.091702, 34.767956],
  Kiambu: [-1.1714, 36.8356],
  Nakuru: [-0.303099, 36.08],
  "Uasin Gishu": [0.514277, 35.269779],
  Nyeri: [-0.4371, 36.958],
  Machakos: [-1.5177, 37.2634],
  Kajiado: [-1.8524, 36.7768],
  Kilifi: [-3.6305, 39.8499],
  Kakamega: [0.2827, 34.7519],
  Meru: [0.0463, 37.6559]
};
const INTERESTS = ["Chapati dates", "Hiking", "Afrobeats", "Church", "Football", "Startups", "Photography", "Nyama choma", "Travel", "Books", "Fitness", "Sheng comedy"];
const TRIBES = ["Prefer not to say", "Kikuyu", "Luo", "Luhya", "Kalenjin", "Kamba", "Kisii", "Meru", "Mijikenda", "Somali", "Other"];
const RELIGIONS = ["Prefer not to say", "Christian", "Muslim", "Traditional", "Spiritual", "None"];
const MODES = ["Open", "Student", "Professional", "Church"];

// NOTE: Full fixed file is deployed on Netlify. This is a sync restore.
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
}
console.log("Pendo Mtaani loaded");
