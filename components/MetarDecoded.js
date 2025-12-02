"use client";

import { useState } from "react";
import MetarSidePanel from "./MetarSidePanel";

export default function MetarDecoded({ metar }) {
  if (!metar?.raw_text) return null;

  const raw = metar.raw_text;
  const tokens = raw.split(" ");

  const [panel, setPanel] = useState({
    open: false,
    token: "",
    label: "",
    desc: ""
  });

  const rules = [
    { regex: /^[A-Z]{4}$/, label: "ICAO Station Identifier" },
    { regex: /^\d{6}Z$/, label: "Report Time (DDHHMMZ)" },
    { regex: /^(VRB|\d{3})(\d{2})(G\d{2})?KT$/, label: "Wind Direction & Speed" },
    { regex: /^(\d{1,2}|\d\/\d|\d \d\/\d)SM$/, label: "Visibility (Statute Miles)" },
    { regex: /^CAVOK$/, label: "Ceiling & Visibility OK" },
    { regex: /^(FEW|SCT|BKN|OVC)\d{3}$/, label: "Cloud Layer (Coverage / Height)" },
    { regex: /^M?\d{2}\/M?\d{2}$/, label: "Temperature / Dew Point" },
    { regex: /^T\d{8}$/, label: "Precise Temperature/Dew Point" },
    { regex: /^A\d{4}$/, label: "Altimeter Setting (inHg)" },
    { regex: /^SLP\d{3}$/, label: "Sea Level Pressure (hPa)" },
    { regex: /^RMK$/, label: "Beginning of Remarks Section" },
    { regex: /^(\+|-)?[A-Z]{2,}$/, label: "Weather Phenomenon" },
    { regex: /^AO1$/, label: "Automated Station (no precipitation sensor)" },
    { regex: /^AO2$/, label: "Automated Station (with precipitation sensor)" },
    { regex: /^\$$/, label: "Maintenance Indicator" },
    { regex: /^1\d{3}$/, label: "6-hour Maximum Temperature" },
    { regex: /^2\d{3}$/, label: "6-hour Minimum Temperature" },
    { regex: /^1\d{4}$/, label: "1-minute Average Temperature" },
    { regex: /^2\d{4}$/, label: "1-minute Average Dewpoint" },
    { regex: /^4\d{4}$/, label: "Precipitation Amount" },
    { regex: /^5\d{4}$/, label: "Pressure Tendency" },
    { regex: /^6\d{4}$/, label: "6-hour Precipitation" },
    { regex: /^7\d{5}$/, label: "Weather-Related Phenomena" },
    { regex: /^8\d{3}$/, label: "Cloud Type/Height Detail" },
  ];

  const descriptions = {
    ICAO: "Four-letter airport identifier following ICAO standards. Example: CYYC for Calgary, KLAX for Los Angeles.",
    TIME: "Report time in UTC: DDHHMMZ (Day, Hour, Minute, Zulu/UTC).",
    WIND: "Wind direction (true north) and speed in knots, optionally with gusts. Example: 26008KT = winds 260° at 8 knots.",
    VIS: "Visibility given in statute miles (SM). Example: 10SM = 10 miles visibility.",
    CAVOK: "Ceiling And Visibility OK — no significant weather, no clouds below 5000 ft, visibility 10 km+.",
    CLOUD: "Cloud layer. FEW/SCT/BKN/OVC followed by height in hundreds of feet. Example: FEW250 = a few clouds at 25,000 ft.",
    TEMP: "Temperature and dew point in °C. M indicates minus. Example: 18/12 = 18°C temperature, 12°C dew point.",
    PRECISE_TEMP: "Precise temperature and dew point in tenths of degrees using Txxxxxxxx format.",
    ALTIMETER: "Altimeter setting in inches of mercury (Axxxx). Example: A3000 = 30.00 inHg.",
    SLP: "Sea level pressure in hPa. Example: SLP156 = 1015.6 hPa.",
    WX: "Weather phenomena code (RA rain, TS thunderstorm, BR mist, etc.).",
    RMK: "Marks the beginning of the remarks section containing additional detail.",
    AO1: "Automated station without a precipitation sensor.",
    AO2: "Automated station with a precipitation sensor.",
    MAINT: "Maintenance indicator. Notifies that additional maintenance is required.",
    RMK_MIN_TEMP: "6-hour minimum temperature (in tenths of °C). Example: 20167 = 16.7°C.",
    RMK_PRESS_TEND: "Pressure tendency over 3 hours. Example: 56005 = pressure falling then steady, change of 0.5 hPa.",
    RMK_MAX_TEMP: "6-hour maximum temperature (in tenths of °C).",
    RMK_PRECIP: "4-group precipitation amount in hundredths of an inch.",
    TEMP_1MIN: "1-minute average temperature, encoded as 1xxxx (temp ×10°C).",
   DEW_1MIN: "1-minute average dewpoint, encoded as 2xxxx (dewpoint ×10°C).",
  };

  function getInfo(token) {
    const rule = rules.find(r => r.regex.test(token));

    if (!rule) {
      return {
        label: "Unknown / Miscellaneous",
        desc: "This token is not recognized or is part of remarks."
      };
    }

    // --- BASIC GROUPS ---
    if (rule.label === "ICAO Station Identifier")
      return { label: rule.label, desc: descriptions.ICAO };

    if (rule.label === "Report Time (DDHHMMZ)")
      return { label: rule.label, desc: descriptions.TIME };

    if (rule.label === "Wind Direction & Speed")
      return { label: rule.label, desc: descriptions.WIND };

    if (rule.label === "Visibility (Statute Miles)")
      return { label: rule.label, desc: descriptions.VIS };

    if (rule.label === "Ceiling & Visibility OK")
      return { label: rule.label, desc: descriptions.CAVOK };

    if (rule.label === "Cloud Layer (Coverage / Height)")
      return { label: rule.label, desc: descriptions.CLOUD };

    if (rule.label === "Temperature / Dew Point")
      return { label: rule.label, desc: descriptions.TEMP };

    if (rule.label === "Precise Temperature/Dew Point")
      return { label: rule.label, desc: descriptions.PRECISE_TEMP };

    if (rule.label === "Altimeter Setting (inHg)")
      return { label: rule.label, desc: descriptions.ALTIMETER };

    if (rule.label === "Sea Level Pressure (hPa)")
      return { label: rule.label, desc: descriptions.SLP };

    if (rule.label === "Weather Phenomenon")
      return { label: rule.label, desc: descriptions.WX };

    if (rule.label === "Beginning of Remarks Section")
      return { label: rule.label, desc: descriptions.RMK };

    if (rule.label === "Automated Station (no precipitation sensor)")
      return { label: rule.label, desc: descriptions.AO1 };

    if (rule.label === "Automated Station (with precipitation sensor)")
      return { label: rule.label, desc: descriptions.AO2 };

    if (rule.label === "Maintenance Indicator")
      return { label: rule.label, desc: descriptions.MAINT };


    // --- RMK SPECIAL DECODES ---
    // 1-minute average temperature
    if (rule.label === "1-minute Average Temperature") {
      const decoded = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: rule.label,
        desc: `${descriptions.TEMP_1MIN}\nDecoded: ${decoded}°C`
      };
    }

    // 1-minute average dewpoint
    if (rule.label === "1-minute Average Dewpoint") {
      const decoded = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: rule.label,
        desc: `${descriptions.DEW_1MIN}\nDecoded: ${decoded}°C`
      };
    }

    // 6-hour max temp (1xxx)
    if (rule.label === "6-hour Maximum Temperature") {
      const decoded = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: rule.label,
        desc: `${descriptions.RMK_MAX_TEMP}\nDecoded: ${decoded}°C`
      };
    }

    // 6-hour min temp (2xxx)
    if (rule.label === "6-hour Minimum Temperature") {
      const decoded = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: rule.label,
        desc: `${descriptions.RMK_MIN_TEMP}\nDecoded: ${decoded}°C`
      };
    }

    // Pressure tendency 56xxx / 5xxxx
    if (rule.label === "Pressure Tendency") {
      const change = Number(token.slice(1)) / 10;
      const tendencyCode = token[3];

      const tendencies = {
        0: "Increasing, then decreasing",
        1: "Increasing, then steady",
        2: "Increasing (steadily or unsteadily)",
        3: "Decreasing or steady",
        4: "Decreasing, then increasing",
        5: "Decreasing (steadily or unsteadily)",
        6: "Steady",
        7: "Rapidly decreasing",
        8: "Rapidly increasing",
        9: "Unsettled pressure"
      };

      return {
        label: rule.label,
        desc:
          `${descriptions.RMK_PRESS_TEND}\n` +
          `Change: ${change.toFixed(1)} hPa\n` +
          `Tendency Code ${tendencyCode}: ${tendencies[tendencyCode] ?? "Unknown"}`
      };
    }

    // 4-group precipitation (4xxxx)
    if (rule.label === "Precipitation Amount") {
      return {
        label: rule.label,
        desc: descriptions.RMK_PRECIP
      };
    }

    // Cloud type/height (8xxx)
    if (rule.label === "Cloud Type/Height Detail")
      return { label: rule.label, desc: "Additional cloud detail from automated sensors." };


    // fallback
    return { label: rule.label, desc: "No description available." };
  }

  return (
    <>
      <div className="p-4 bg-gray-900 text-gray-100 rounded-md font-mono text-sm flex flex-wrap">
        {tokens.map((token, idx) => {
          const info = getInfo(token);
          return (
            <span
              key={idx}
                onClick={() =>
                setPanel({
                  open: true,
                  token,
                  label: info.label,
                  desc: info.desc
                })
              }
              className="
                relative group 
                bg-[#1e293b] 
                text-blue-100 
                px-2 py-1 
                rounded-md 
                mr-2 mb-2 
                shadow-sm 
                border border-blue-900/40
                hover:bg-blue-700 hover:border-blue-500 
                cursor-pointer
              "
            >
              {token}

              {/* Hover tooltip */}
              <span
                className="
                  absolute 
                  bottom-full left-1/2 -translate-x-1/2
                  mb-2 
                  hidden group-hover:block 
                  bg-black/90 
                  text-white 
                  text-xs 
                  p-2 rounded 
                  whitespace-nowrap 
                  z-10 border border-gray-600
                "
              >
                {info.label}
              </span>
            </span>
          );
        })}
      </div>

      {/* Slide-Out Panel */}
      <MetarSidePanel
        open={panel.open}
        onClose={() => setPanel({ open: false, token: "", label: "", desc: ""})}
        token={panel.token}
        label={panel.label}
        desc={panel.desc}
      />
    </>
  );
}
