import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/firebase";

const VAPID_KEY = "BB66OBghGqfrS0_fXRwfaRTJTyfXYBqBeInfefFXZWtFNIayk5V0AsvRyOjLS9C3AUWGVqQk5LteyblFveIQYgo";

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log("🔔 FCM Token:", token);
      return token;
    }
    return null;
  } catch (error) {
    console.error("❌ Error requesting notification permission:", error);
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log("📩 New foreground message:", payload);
    // You can use a toast library here to show the notification
    if (payload.notification) {
      const { title, body } = payload.notification;
      new Notification(title || "Alert", { body });
    }
  });
};
