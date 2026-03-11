import React from 'react';
import { X, Copy, Check, Cpu, Zap, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HardwareGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HardwareGuide({ isOpen, onClose }: HardwareGuideProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const espCode = `
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define API_KEY "YOUR_FIREBASE_API_KEY"
#define DATABASE_URL "YOUR_FIREBASE_DATABASE_URL"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

const int RELAY_PIN = 26;
bool systemState = false;
unsigned long sendDataPrevMillis = 0;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
  } else {
    Serial.printf("%s\\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Listen for control changes
  if (Firebase.RTDB.getBool(&fbdo, "/control/isOn")) {
    bool newState = fbdo.boolData();
    if (newState != systemState) {
      systemState = newState;
      digitalWrite(RELAY_PIN, systemState ? HIGH : LOW);
      Serial.print("State changed to: ");
      Serial.println(systemState ? "ON" : "OFF");
    }
  }

  // Send sensor data every 2 seconds
  if (millis() - sendDataPrevMillis > 2000 || sendDataPrevMillis == 0) {
    sendDataPrevMillis = millis();

    // Simulate sensor readings (Replace with PZEM-004T or similar)
    float voltage = 230.0 + ((float)random(-20, 20) / 10.0);
    float current = systemState ? (5.0 + ((float)random(-10, 10) / 10.0)) : 0.0;
    float power = voltage * current;
    static float energy = 1450.0;
    if (systemState) energy += (power / 1000.0) * (2.0 / 3600.0);

    FirebaseJson json;
    json.set("timestamp", millis()); // Use NTP time in production
    json.set("voltage", voltage);
    json.set("current", current);
    json.set("power", power);
    json.set("energy", energy);

    Serial.printf("Pushing data... %s\\n", Firebase.RTDB.pushJSON(&fbdo, "/readings", &json) ? "ok" : fbdo.errorReason().c_str());
  }
}
`;

  const copyCode = () => {
    navigator.clipboard.writeText(espCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Cpu className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Hardware Setup Guide</h2>
              <p className="text-sm text-slate-400">Connect ESP32 & Relay</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Wiring Diagram Section */}
          <section>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Wiring Diagram
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                <h4 className="font-medium text-slate-300 mb-4">Component Connections</h4>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                    <div>
                      <span className="font-semibold text-slate-200">Relay Module</span>
                      <p className="text-slate-400 mt-1">
                        VCC → ESP32 5V/VIN<br />
                        GND → ESP32 GND<br />
                        IN → <span className="text-indigo-400 font-mono">GPIO 26</span>
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 flex items-center justify-center">
                {/* Simple CSS Diagram */}
                <div className="relative w-full max-w-xs aspect-square">
                  {/* ESP32 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-48 bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center justify-center">
                    <span className="text-xs font-mono text-slate-500 mb-2">ESP32</span>
                    <Cpu size={32} className="text-slate-600" />
                  </div>

                  {/* Relay */}
                  <div className="absolute top-0 right-0 w-24 h-20 bg-blue-900/20 rounded border border-blue-500/30 flex flex-col items-center justify-center">
                    <span className="text-xs font-mono text-blue-400">RELAY</span>
                    <div className="w-16 h-1 bg-blue-500/50 mt-2 rotate-45 origin-left"></div>
                  </div>

                  {/* Wires (Visual only) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                    <path d="M 180 140 L 220 60" stroke="#60a5fa" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Code Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-[10px] font-mono">C++</div>
                ESP32 Firmware Code
              </h3>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <div className="relative group">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed">
                <code>{espCode}</code>
              </pre>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
