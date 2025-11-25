// src/utils/getClientIP.js
export const getClientIP = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    // Nếu có quốc gia → hiện luôn, không có thì chỉ hiện IP
    const location = data.country_name ? ` (${data.country_name})` : '';
    return `${data.ip}${location}`;
  } catch (err) {
    // Backup nhanh nếu bị chặn
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return 'Unknown IP';
    }
  }
};