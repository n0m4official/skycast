"use client";

import { useState } from "react";
import MetarSidePanel from "./MetarSidePanel";

export default function MetarDecoded({ metar }) {
  
  const [panel, setPanel] = useState({
    open: false,
    token: "",
    label: "",
    info: null
  });

  if (!metar?.raw_text) return null;

  const raw = metar.raw_text;
  const tokens = raw.split(" ");

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

// --- IMPORTANT: RMK-specific rules FIRST ---
    { regex: /^(AC\d)+$/, label: "Altocumulus Layer Summary (Remarks)" }, 
    { regex: /^AC\d?$/, label: "Altocumulus Clouds (Remarks)" },
    { regex: /^AC\d+AC\d+AC\d+$/, label: "Cloud Amount/Type Summary (Remarks)" },
    { regex: /^TR$/, label: "Trace Precipitation (Remarks)" },

    // Temperature / weather RMK blocks
    { regex: /^1\d{3}$/, label: "6-hour Maximum Temperature" },
    { regex: /^2\d{3}$/, label: "6-hour Minimum Temperature" },
    { regex: /^1\d{4}$/, label: "1-minute Average Temperature" },
    { regex: /^2\d{4}$/, label: "1-minute Average Dewpoint" },
    { regex: /^4\d{4}$/, label: "Precipitation Amount" },
    { regex: /^5\d{4}$/, label: "Pressure Tendency" },
    { regex: /^6\d{4}$/, label: "6-hour Precipitation" },
    { regex: /^7\d{5}$/, label: "Weather-Related Phenomena" },
    { regex: /^8\d{3}$/, label: "Cloud Type/Height Detail" },

    // --- GENERIC FALLBACK MATCHES LAST ---
    { regex: /^(\+|-)?[A-Z]{2,}$/, label: "Weather Phenomenon" },
    { regex: /^AO1$/, label: "Automated Station (no precipitation sensor)" },
    { regex: /^AO2$/, label: "Automated Station (with precipitation sensor)" },
    { regex: /^\$$/, label: "Maintenance Indicator" },
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
    AC_REMARK: "Altocumulus clouds present. Common in Canadian RMK sections.",
    AC_SUMMARY: "Cloud type/amount summary used in RMK section for detailed cloud analysis.",
    TRACE_PRECIP: "Trace precipitation reported — enough to be observed but not measurable.",
    TEMP_1MIN: "1-minute average temperature, encoded as 1xxxx (temp x10°C).",
    DEW_1MIN: "1-minute average dewpoint, encoded as 2xxxx (dewpoint x10°C).",
  };

function windDirectionName(deg) {
  const dirs = [
    "North", "North-East", "East", "South-East",
    "South", "South-West", "West", "North-West"
  ];
  return dirs[Math.round(deg / 45) % 8];
}

  function getInfo(token) {
    const rule = rules.find(r => r.regex.test(token));

    if (!rule) {
      return {
        label: "Unknown / Miscellaneous",
        icon: "❓",
        beginner: "This part of the METAR is not recognized by the decoder.",
        advanced: "This may be part of the remarks section (RMK), or a station-specific token.",
        meaning: "Likely not essential for basic METAR interpretation.",
        decoded: null
      };
    }

    // --------------------------
    // ICAO IDENTIFIER
    // --------------------------
    if (rule.label === "ICAO Station Identifier") {
      return {
        label: rule.label,
        icon: "📍",
        beginner: `${token} is the airport code. Every airport uses a unique four-letter ICAO identifier.`,
        advanced: "ICAO identifiers are globally standardized. Canada uses 'C---', the U.S. uses 'K---'.",
        meaning: "This simply tells you which airport the weather report belongs to.",
        decoded: { icao: token }
      };
    }

    // --------------------------
    // TIME
    // --------------------------
    if (rule.label === "Report Time (DDHHMMZ)") {
      const day = token.slice(0,2);
      const hour = token.slice(2,4);
      const min = token.slice(4,6);

      return {
        label: rule.label,
        icon: "⏱️",
        beginner: `The METAR was issued on day ${day} at ${hour}:${min} UTC.`,
        advanced: "All METAR times are in Zulu (UTC). Aviation uses UTC to avoid time zone confusion.",
        meaning: "This tells you how recent the weather report is.",
        decoded: { day, hourUTC: hour, minute: min }
      };
    }

    // --------------------------
    // WIND
    // --------------------------
    if (rule.label === "Wind Direction & Speed") {
      const dir = token.slice(0,3);
      const speed = parseInt(token.slice(3,5));
      const gust = token.match(/G(\d{2})/)?.[1] ?? null;

      return {
        label: rule.label,
        icon: "🌬️",
        beginner: `${dir}° wind direction means the wind is blowing FROM the ${windDirectionName(dir)}.\n${speed} knots ≈ ${(speed * 1.852).toFixed(1)} km/h.`,
        advanced: "Direction is in degrees TRUE. Speed is in knots. Gusts appear as 'G##'. Critical for runway selection.",
        meaning: gust
          ? "Gusty conditions may cause unstable approaches."
          : "Steady wind — easier for takeoff & landing.",
        decoded: {
          directionDegrees: dir,
          directionCardinal: windDirectionName(dir),
          speedKt: speed,
          speedKmh: (speed * 1.852).toFixed(1),
          gustKt: gust || "None"
        }
      };
    }

    // --------------------------
    // VISIBILITY
    // --------------------------
    if (rule.label === "Visibility (Statute Miles)") {
      const miles = parseFloat(token.replace("SM",""));
      return {
        label: "Visibility",
        icon: "👁️",
        beginner: `${miles} SM ≈ ${(miles * 1.609).toFixed(1)} km visibility.`,
        advanced: "Visibility determines whether VFR flight is allowed. Below 3 miles is typically IFR.",
        meaning: miles < 3 ? "Low visibility — likely IFR." : "Good visibility for VFR flying.",
        decoded: { miles, kilometers: (miles * 1.609).toFixed(1) }
      };
    }

    // --------------------------
    // CAVOK
    // --------------------------
    if (rule.label === "Ceiling & Visibility OK") {
      return {
        label: rule.label,
        icon: "☀️",
        beginner: "No clouds below 5000 ft, no fog, no precipitation, and visibility is excellent.",
        advanced: "CAVOK is used outside North America; indicates no significant weather and visibility ≥ 10 km.",
        meaning: "Great flying conditions.",
        decoded: null
      };
    }

    // --------------------------
    // CLOUD LAYERS
    // --------------------------
    if (rule.label === "Cloud Layer (Coverage / Height)") {
      const amount = token.slice(0,3);
      const height = Number(token.slice(3)) * 100;

      const mapAmount = {
        FEW: "A few clouds (1–2 oktas)",
        SCT: "Scattered clouds (3–4 oktas)",
        BKN: "Broken clouds (5–7 oktas)",
        OVC: "Overcast (8 oktas)"
      };

      return {
        label: "Cloud Layer",
        icon: "☁️",
        beginner: `${mapAmount[amount]} at ${height} ft above ground.`,
        advanced: "Cloud coverage is measured in eighths ('oktas'). Height is reported in hundreds of feet.",
        meaning:
          amount === "OVC"
            ? "Sky fully covered — may limit visibility and reduce VFR conditions."
            : "Clouds present but generally manageable for flying.",
        decoded: {
          coverage: mapAmount[amount],
          heightFeet: height
        }
      };
    }

    // --------------------------
    // TEMPERATURE / DEWPOINT
    // --------------------------
    if (rule.label === "Temperature / Dew Point") {
      const [t, d] = token.split("/");
      const temp = t.replace("M","-");
      const dew = d.replace("M","-");
      const spread = Math.abs(temp - dew);

      return {
        label: "Temperature / Dew Point",
        icon: "🌡️",
        beginner: `Temperature: ${temp}°C\nDew point: ${dew}°C.\nIf they are close, fog is likely.`,
        advanced: "A narrow dewpoint spread means saturated air -> fog or low cloud risk.",
        meaning: spread < 2 ? "High humidity — fog may form." : "Low fog risk.",
        decoded: { temperatureC: temp, dewpointC: dew, spreadC: spread }
      };
    }

    // --------------------------
    // ALTIMETER
    // --------------------------
    if (rule.label === "Altimeter Setting (inHg)") {
      const value = parseFloat(token.slice(1)) / 100;
      return {
        label: "Altimeter Setting",
        icon: "📏",
        beginner: `The altimeter is set to ${value.toFixed(2)} inHg.`,
        advanced: "Altimeter setting adjusts for local pressure so pilots read correct altitude.",
        meaning: value < 29.80 ? "Low pressure system — potentially bad weather." : "Normal pressure.",
        decoded: { inHg: value.toFixed(2) }
      };
    }

    // --------------------------
    // SEA LEVEL PRESSURE (SLP)
    // --------------------------
    if (rule.label === "Sea Level Pressure (hPa)") {
      const val = Number(token.slice(3));
      const hPa = val >= 500 ? 900 + val / 10 : 1000 + val / 10;

      return {
        label: "Sea Level Pressure",
        icon: "🌪️",
        beginner: `${hPa.toFixed(1)} hPa sea-level pressure.`,
        advanced: "SLP encodes the last three digits of pressure in tenths of hectopascals.",
        meaning: hPa < 995 ? "Low pressure — storms possible." : "Stable conditions.",
        decoded: { hPa: hPa.toFixed(1) }
      };
    }

    // --------------------------
    // WEATHER PHENOMENA
    // --------------------------
    if (rule.label === "Weather Phenomenon") {
      return {
        label: "Weather Phenomena",
        icon: "🌧️",
        beginner: `Weather condition code: ${token}. Example: RA = Rain, BR = Mist, TS = Thunderstorm.`,
        advanced: "METAR uses standard ICAO precipitation & obstruction codes.",
        meaning: "Weather may directly affect visibility or safety depending on type.",
        decoded: { code: token }
      };
    }

    // --------------------------
    // RMK START
    // --------------------------
    if (rule.label === "Beginning of Remarks Section") {
      return {
        label: "Remarks (RMK)",
        icon: "📝",
        beginner: "Extra details from the station, such as precise temperature or cloud types.",
        advanced: "RMK adds sensor data, runway info, temperature precision, etc.",
        meaning: "Useful but not essential for beginners.",
        decoded: null
      };
    }

    // --------------------------
    // AO1 / AO2
    // --------------------------
    if (rule.label.includes("Automated Station")) {
      return {
        label: rule.label,
        icon: "🏭",
        beginner: "AO1/AO2 describes what sensors the automated station has.",
        advanced: "AO1 = no precipitation sensor. AO2 = has a precipitation sensor.",
        meaning: "Does not affect flight but explains differences in data accuracy.",
        decoded: { type: rule.label }
      };
    }

    // --------------------------
    // MAINTENANCE INDICATOR
    // --------------------------
    if (rule.label === "Maintenance Indicator") {
      return {
        label: "Maintenance Indicator",
        icon: "⚠️",
        beginner: "The weather station may need maintenance.",
        advanced: "Indicates possible degraded reliability in automated readings.",
        meaning: "Pilots treat METAR with slight caution.",
        decoded: null
      };
    }

    // --------------------------
    // TRACE PRECIP
    // --------------------------
    if (rule.label === "Trace Precipitation (Remarks)") {
      return {
        label: "Trace Precipitation",
        icon: "🌦️",
        beginner: "Rain/snow was observed, but too little to measure.",
        advanced: "Often reported in RMK sections for climate logging.",
        meaning: "Does not affect flight significantly.",
        decoded: null
      };
    }

    // --------------------------
    // 1-minute temperature
    // --------------------------
    if (rule.label === "1-minute Average Temperature") {
      const decoded = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: "1-minute Average Temperature",
        icon: "🌡️",
        beginner: `A more precise temperature measurement: ${decoded}°C.`,
        advanced: "Automated stations report precise temps in RMK blocks.",
        meaning: "Not used operationally — just informational.",
        decoded: { temperatureC: decoded }
      };
    }

    // --------------------------
    // 1-minute dewpoint
    // --------------------------
    if (rule.label === "1-minute Average Dewpoint") {
      const decoded = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: "1-minute Average Dewpoint",
        icon: "💧",
        beginner: `Precise dewpoint: ${decoded}°C.`,
        advanced: "Used for climate recording and humidity calculations.",
        meaning: "Important for fog prediction.",
        decoded: { dewpointC: decoded }
      };
    }

    // --------------------------
    // MAX TEMP
    // --------------------------
    if (rule.label === "6-hour Maximum Temperature") {
      const val = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: "6-hour Maximum Temperature",
        icon: "🔥",
        beginner: `Highest temperature in the last 6 hours: ${val}°C`,
        advanced: "Decoded from RMK climate block.",
        meaning: "Useful for weather analysis.",
        decoded: { maxTemp6hrC: val }
      };
    }

    // --------------------------
    // MIN TEMP
    // --------------------------
    if (rule.label === "6-hour Minimum Temperature") {
      const val = (Number(token.slice(1)) / 10).toFixed(1);
      return {
        label: "6-hour Minimum Temperature",
        icon: "❄️",
        beginner: `Lowest temperature in the last 6 hours: ${val}°C`,
        advanced: "Decoded from RMK climate block.",
        meaning: "Useful for weather analysis.",
        decoded: { minTemp6hrC: val }
      };
    }

    // --------------------------
    // PRESSURE TENDENCY
    // --------------------------
    if (rule.label === "Pressure Tendency") {
      const change = Number(token.slice(1)) / 10;
      const code = token[3];

      const tendencies = {
        0: "Increasing then decreasing",
        1: "Increasing then steady",
        2: "Increasing",
        3: "Decreasing or steady",
        4: "Decreasing then increasing",
        5: "Decreasing",
        6: "Steady",
        7: "Rapidly decreasing",
        8: "Rapidly increasing",
        9: "Unstable"
      };

      return {
        label: "Pressure Tendency",
        icon: "📉",
        beginner: `Pressure changed by ${change.toFixed(1)} hPa.\nType: ${tendencies[code]}`,
        advanced: "Pressure tendency predicts weather patterns. Rapid drops mean storms.",
        meaning: code >= 5 ? "Pressure dropping — bad weather approaching." : "Stable or improving pressure.",
        decoded: { changeHpa: change, tendency: tendencies[code] }
      };
    }

    // --------------------------
    // PRECIP BLOCK (4xxxx)
    // --------------------------
    if (rule.label === "Precipitation Amount") {
      return {
        label: "Precipitation Amount",
        icon: "🌧️",
        beginner: "Precipitation recorded in the last observation interval.",
        advanced: "Encoded in hundredths of an inch.",
        meaning: "Light to heavy precipitation depending on value.",
        decoded: { raw: token }
      };
    }

    // --------------------------
    // CLOUD DETAIL (8xxx)
    // --------------------------
    if (rule.label === "Cloud Type/Height Detail") {
      return {
        label: rule.label,
        icon: "☁️",
        beginner: "Detailed cloud information from sensors.",
        advanced: "Used for cloud typing and vertical structure studies.",
        meaning: "Not operational for pilots.",
        decoded: { raw: token }
      };
    }

    // --------------------------
    // ALTOCUMULUS CLOUDS (RMK)
    // --------------------------
    if (rule.label === "Altocumulus Layer Summary (Remarks)") {
      // Extract pairs: AC5AC2 → ["5","2"]
      const layers = token.match(/AC(\d)/g)?.map(x => x.replace("AC", "")) || [];

      return {
        label: "Altocumulus Cloud Layer Summary",
        icon: "☁️",
        beginner:
          `This tells you how many layers of altocumulus (AC) clouds were observed.\n` +
          layers.map((l, i) => `• Layer ${i+1}: ${l} oktas (out of 8)`).join("\n"),

        advanced:
          "AC groups in RMK indicate altocumulus amounts. Each 'AC#' encodes cloud coverage in oktas (1–8). These layers describe mid-level cloud structure.",

        meaning:
          layers.some(x => x >= 6)
            ? "Significant mid-level cloud cover — may indicate incoming weather changes."
            : "Light to moderate mid-level clouds — usually not operationally significant.",

        decoded: { layers }
      };
    }


    // LAST FALLBACK
    return {
      label: rule.label,
      icon: "ℹ️",
      beginner: "This METAR element is recognized but not specially decoded.",
      advanced: "May be station-specific.",
      meaning: "Not critical for METAR interpretation.",
      decoded: { raw: token }
    };
  }

  return (
    <>
      <div className="p-4 bg-gray-900 text-gray-100 rounded-md font-mono text-sm flex flex-wrap">
        {tokens.map((token, idx) => {
          const info = getInfo(token);
          return (
            <span
              key={idx}
                onClick={() => setPanel({
                    open: true,
                    token,
                    label: info.label,
                    info   // pass the whole info object
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
        onClose={() => setPanel({ open: false, token: "", label: "", info: null })}
        token={panel.token}
        label={panel.label}
        info={panel.info}
      />
    </>
  );
}
