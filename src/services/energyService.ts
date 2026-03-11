import { ref, onValue, set } from "firebase/database";
import { database } from "@/firebase";
import { EnergyReading } from "@/types";

const DATA_REF = 'ONXY_EDGE_1';
const COMMAND_REF = 'ONXY_EDGE_1/Command';
const STATE_REF = 'ONXY_EDGE_1/State';

// Active-LOW relay: LOW ("OFF" command) = relay ON, HIGH ("ON" command) = relay OFF
// We invert commands and state on the website side so the UI stays intuitive

// Monitor connection state
if (database) {
  const connectedRef = ref(database, ".info/connected");
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log("✅ Connected to Firebase Realtime Database");
    } else {
      console.warn("❌ Disconnected from Firebase Realtime Database");
    }
  });
}

export const subscribeToLatestReading = (
  callback: (reading: EnergyReading | null) => void,
  onError?: (error: Error) => void
) => {
  if (!database) {
    if (onError) onError(new Error("Firebase not initialized"));
    return () => { };
  }

  const readingsRef = ref(database, DATA_REF);
  console.log(`📡 Subscribing to: ${DATA_REF}`);

  let dataReceived = false;
  const timeout = setTimeout(() => {
    if (!dataReceived) {
      console.warn(`⏳ No data received from ${DATA_REF} after 10s.`);
    }
  }, 10000);

  return onValue(readingsRef, (snapshot) => {
    dataReceived = true;
    clearTimeout(timeout);
    const data = snapshot.val();
    console.log("📥 Received data:", data);

    if (data) {
      const reading: EnergyReading = {
        voltage: Number(data.Voltage) || 0,
        current: Number(data.Current) || 0,
        power: Number(data.Power) || 0,
        energy: Number(data.Energy) || 0,
        carbonFootprint: Number(data.CarbonFootprint) || 0,
        timestamp: Date.now(),
      };
      callback(reading);
    } else {
      console.warn("❓ Snapshot is empty at:", DATA_REF);
      callback(null);
    }
  }, (error) => {
    console.error("🔥 Subscription Error:", error);
    if (onError) onError(error);
    else callback(null);
  });
};

export const subscribeToHistory = (
  limitCount: number,
  callback: (history: EnergyReading[]) => void,
  onError?: (error: Error) => void
) => {
  // RTDB only has one node, not a time-series. Return empty.
  callback([]);
  return () => { };
};

export const subscribeToControlState = (
  callback: (isOn: boolean) => void,
  onError?: (error: Error) => void
) => {
  if (!database) {
    if (onError) onError(new Error("Firebase not initialized"));
    return () => { };
  }

  const stateRef = ref(database, STATE_REF);
  console.log(`📡 Subscribing to relay state: ${STATE_REF}`);

  return onValue(stateRef, (snapshot) => {
    const state = snapshot.val();
    console.log("📥 Received relay state:", state);
    // Active-LOW inversion: ESP32 reports "OFF" when pin is LOW, but relay is actually ON
    callback(state === "OFF");
  }, (error) => {
    console.error("🔥 Control Subscription Error:", error);
    if (onError) onError(error);
    else callback(false);
  });
};

export const setSystemState = async (isOn: boolean) => {
  if (!database) throw new Error("Firebase not initialized");
  try {
    const commandRef = ref(database, COMMAND_REF);
    // Active-LOW inversion: send "OFF" to set pin LOW (relay ON), "ON" to set pin HIGH (relay OFF)
    await set(commandRef, isOn ? "OFF" : "ON");

    console.log(`🚀 Relay command sent: ${isOn ? "ON" : "OFF"}`);
  } catch (error: any) {
    console.error("🔥 Error sending relay command:", error);
    throw error;
  }
};

export const pushReading = async (reading: EnergyReading) => {
  console.warn("pushReading is not supported with the current RTDB structure.");
  return Promise.resolve();
};
