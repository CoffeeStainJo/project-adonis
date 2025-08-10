import React, { useState, useEffect, useRef } from "react";

const DARK_BG = "#121212";
const ACCENT_COLOR = "#82cfff";
const TEXT_COLOR = "#eeeeee";
const WEIGHT_COLOR = "#4caf50";
const GOAL_COLOR = "#f44336";
const GRID_COLOR = "#333";

const ResponsiveStyles = () => (
  <style>{`
    /* Base styles for inputs and container */
    .container {
      max-width: 430px;
      margin: auto;
      padding: 20px;
      color: ${TEXT_COLOR};
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: ${DARK_BG};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    form.grid-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    label {
      margin-bottom: 6px;
      font-weight: 600;
    }
    input[type="number"],
    input[type="date"] {
      background-color: #222;
      border: 1.5px solid #555;
      border-radius: 8px;
      padding: 10px 15px;
      color: ${TEXT_COLOR};
      font-size: 16px;
      width: 100%;
      box-sizing: border-box;
    }
    button.save-btn {
      background-color: ${ACCENT_COLOR};
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      color: ${DARK_BG};
      width: 100%;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    button.save-btn:hover {
      background-color: #63b5f6;
    }
    canvas.weight-canvas {
      width: 100%;
      height: 300px;
      border-radius: 15px;
      margin-top: 20px;
      box-shadow:
        0 4px 15px rgba(130, 207, 255, 0.3),
        0 0 20px rgba(130, 207, 255, 0.2);
      background-color: ${DARK_BG};
    }
    .summary {
      color: ${ACCENT_COLOR};
      font-weight: 600;
      text-align: center;
      margin-top: 10px;
      font-size: 16px;
    }

    /* Medium screens - iPad Pro 11 inch ~ 834px */
    @media (min-width: 600px) and (max-width: 900px) {
      .container {
        max-width: 834px;
        padding: 30px 40px;
      }
      form.grid-form {
        grid-template-columns: 1fr; /* single column for easier readability */
        gap: 20px;
      }
      input[type="number"],
      input[type="date"] {
        font-size: 20px;
        padding: 14px 20px;
      }
      button.save-btn {
        font-size: 20px;
        padding: 16px 24px;
      }
      .summary {
        font-size: 20px;
      }
      canvas.weight-canvas {
        height: 400px;
        margin-top: 30px;
      }
    }

    /* Small phones - iPhone 14 Pro and similar */
    @media (max-width: 430px) {
      .container {
        max-width: 100vw;
        padding: 15px 10px;
      }
      form.grid-form {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      input[type="number"],
      input[type="date"] {
        font-size: 14px;
        padding: 8px 12px;
      }
      button.save-btn {
        font-size: 14px;
        padding: 10px 16px;
      }
      .summary {
        font-size: 14px;
      }
      canvas.weight-canvas {
        height: 280px;
        margin-top: 15px;
      }
      input[type="date"] {
        /* Specific fixes for iOS date inputs */
        -webkit-appearance: none;
        max-width: 100%;
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
      }
      /* Add padding adjustment for container */
      .container {
        padding: 15px 15px;  /* slightly increased side padding */
      }
      form.grid-form {
        padding: 0 2px;  /* small padding to prevent edge bleeding */
      }
    }
  `}</style>
);

// const iPhone14ProWidth = 430; // Approx width in px for responsiveness

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// Helper to get days difference (ceil)
function daysBetween(a, b) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((b - a) / msPerDay);
}

function WeightLossApp() {
  // Load from localStorage or defaults
  const [goalWeight, setGoalWeight] = useState(() => {
    const stored = localStorage.getItem("goalWeight");
    return stored ? parseFloat(stored) : 70;
  });
  const [targetDate, setTargetDate] = useState(() => {
    const stored = localStorage.getItem("targetDate");
    if (stored) return stored;
    // default target date 3 months from now
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return formatDate(d);
  });
  const [weighIns, setWeighIns] = useState(() => {
    // Stored weigh-ins in localStorage as JSON array [{date, weight}]
    const stored = localStorage.getItem("weighIns");
    if (stored) return JSON.parse(stored);
    return [];
  });

  // Current date auto
  const todayStr = formatDate(new Date());

  // Input state for today's weigh-in
  const [todayWeight, setTodayWeight] = useState(() => {
    // if there's a weigh-in for today, preload it
    const todayEntry = weighIns.find((w) => w.date === todayStr);
    return todayEntry ? todayEntry.weight : "";
  });

  // Store goalWeight and targetDate persistently on change
  useEffect(() => {
    localStorage.setItem("goalWeight", goalWeight.toString());
  }, [goalWeight]);
  useEffect(() => {
    localStorage.setItem("targetDate", targetDate);
  }, [targetDate]);

  // Store weighIns persistently on change
  useEffect(() => {
    localStorage.setItem("weighIns", JSON.stringify(weighIns));
  }, [weighIns]);

  // Handle weigh-in submit
  function handleWeighInSubmit(e) {
    e.preventDefault();
    const weightNum = parseFloat(todayWeight);
    if (isNaN(weightNum) || weightNum <= 0) return alert("Enter valid weight");

    // If there's already an entry for today, update it
    const existingIndex = weighIns.findIndex((w) => w.date === todayStr);
    let newWeighIns;
    if (existingIndex >= 0) {
      newWeighIns = [...weighIns];
      newWeighIns[existingIndex] = { date: todayStr, weight: weightNum };
    } else {
      newWeighIns = [...weighIns, { date: todayStr, weight: weightNum }];
    }
    // Sort by date ascending
    newWeighIns.sort((a, b) => new Date(a.date) - new Date(b.date));
    setWeighIns(newWeighIns);
  }

  // Derive earliest weigh-in (start point)
  const startDate = weighIns.length > 0 ? weighIns[0].date : todayStr;
  const startWeight = weighIns.length > 0 ? weighIns[0].weight : goalWeight + 10;

  // Current weight = last weigh-in or today's weigh-in
  const currentWeight = weighIns.length > 0 ? weighIns[weighIns.length - 1].weight : startWeight;

  // Calculate time and weight progress
  const now = new Date();
  const target = new Date(targetDate);
  const totalDays = daysBetween(new Date(startDate), target);
  const daysPassed = daysBetween(new Date(startDate), now);
  const daysLeft = Math.max(daysBetween(now, target), 0);

  // eslint-disable-next-line no-unused-vars
  const totalWeightLoss = startWeight - goalWeight;
  const weightLost = startWeight - currentWeight;
  const weightLeft = Math.max(currentWeight - goalWeight, 0);

  // Weight loss per day required to meet goal
  const requiredLossPerDay = weightLeft / daysLeft || 0;

  // Canvas ref & drawing
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear and set size for retina and responsiveness
    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    canvas.width = width;
    canvas.height = height;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    // Background
    ctx.fillStyle = DARK_BG;
    ctx.fillRect(0, 0, cw, ch);

    // Draw grid lines (vertical: days, horizontal: weight scale)
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;

    // Vertical grid every ~1 week or 7 days, max 10 lines
    const dayStep = Math.ceil(totalDays / 10);
    for (let d = 0; d <= totalDays; d += dayStep) {
      const x = (d / totalDays) * (cw - 60) + 50;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, ch - 50);
      ctx.stroke();

      // Date label
      const dateLabel = new Date(new Date(startDate).getTime() + d * 86400000);
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(dateLabel.toISOString().slice(5, 10), x, ch - 30);
    }

    // Horizontal grid every 2kg approx between goalWeight and startWeight + some margin
    const weightMin = Math.min(goalWeight, startWeight) - 2;
    const weightMax = Math.max(goalWeight, startWeight) + 2;
    const weightRange = weightMax - weightMin;
    const weightStep = 2;

    for (let w = Math.floor(weightMin); w <= Math.ceil(weightMax); w += weightStep) {
      const y = ((weightMax - w) / weightRange) * (ch - 70) + 20;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(cw - 10, y);
      ctx.stroke();

      // Weight label
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${w} kg`, 45, y + 4);
    }

    // Draw goal line (horizontal)
    const goalY = ((weightMax - goalWeight) / weightRange) * (ch - 70) + 20;
    ctx.strokeStyle = GOAL_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, goalY);
    ctx.lineTo(cw - 10, goalY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = GOAL_COLOR;
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Goal Weight", cw - 100, goalY - 10);

    // Draw weight loss progress curve (linear interpolation between weigh-ins)
    ctx.strokeStyle = WEIGHT_COLOR;
    ctx.lineWidth = 3;
    ctx.beginPath();

    weighIns.forEach(({ date, weight }, idx) => {
      const dayIndex = daysBetween(new Date(startDate), new Date(date));
      const x = (dayIndex / totalDays) * (cw - 60) + 50;
      const y = ((weightMax - weight) / weightRange) * (ch - 70) + 20;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw current weight point
    if (weighIns.length > 0) {
      const currentDay = daysBetween(new Date(startDate), now);
      const cx = (currentDay / totalDays) * (cw - 60) + 50;
      const cy = ((weightMax - currentWeight) / weightRange) * (ch - 70) + 20;
      ctx.fillStyle = ACCENT_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
      ctx.fill();

      // Label current weight
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${currentWeight.toFixed(1)} kg`, cx, cy - 15);
    }

    // Draw time progress bar (below graph)
    const barX = 50;
    const barY = ch - 40;
    const barWidth = cw - 60;
    const barHeight = 15;

    ctx.fillStyle = GRID_COLOR;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const progressRatio = Math.min(daysPassed / totalDays, 1);
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fillRect(barX, barY, barWidth * progressRatio, barHeight);

    ctx.strokeStyle = TEXT_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Label time progress
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Time Progress: ${daysPassed} / ${totalDays} days`,
      cw / 2,
      barY + barHeight + 15
    );
  }, [weighIns, goalWeight, targetDate, currentWeight, startDate, totalDays, daysPassed]);

  // Responsive container style
  // const containerStyle = {
  //   maxWidth: iPhone14ProWidth,
  //   margin: "auto",
  //   padding: 20,
  //   color: TEXT_COLOR,
  //   fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  //   backgroundColor: DARK_BG,
  //   minHeight: "100vh",
  //   display: "flex",
  //   flexDirection: "column",
  //   gap: 15,
  // };

  // Input styles
  const inputStyle = {
    backgroundColor: "#222",
    border: "1.5px solid #555",
    borderRadius: 8,
    padding: "10px 15px",
    color: TEXT_COLOR,
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = { marginBottom: 6, fontWeight: "600" };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Construct the correct path using Vite's base URL
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                if (confirm('New version available! Would you like to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(error => console.log('Service worker registration failed:', error));
    }
  }, []);

  return (
    <>
      <ResponsiveStyles />
      <div className="container">
        <h1 style={{ textAlign: "center", marginBottom: 10 }}>
          Project Adonis 💪
        </h1>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid-form"
        >
          <div>
            <label style={labelStyle} htmlFor="goalWeight">
              Goal Weight (kg)
            </label>
            <input
              id="goalWeight"
              type="number"
              min="20"
              max="300"
              step="0.1"
              style={inputStyle}
              value={goalWeight}
              onChange={(e) => setGoalWeight(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="targetDate">
              Target Date
            </label>
            <input
              id="targetDate"
              type="date"
              style={inputStyle}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={todayStr}
            />
          </div>
        </form>

        <form onSubmit={handleWeighInSubmit} style={{ marginTop: 10 }}>
          <label style={labelStyle} htmlFor="todayWeight">
            Today's Weight (kg)
          </label>
          <input
            id="todayWeight"
            type="number"
            min="20"
            max="300"
            step="0.1"
            style={{ ...inputStyle, marginBottom: 10 }}
            value={todayWeight}
            onChange={(e) => setTodayWeight(e.target.value)}
            placeholder="Enter your weight today"
          />
          <button
            type="submit"
            className="save-btn"
          >
            Save Weigh-In
          </button>
        </form>

        <canvas
          ref={canvasRef}
          className="weight-canvas"
        />

        <div
          className="summary"
        >
          <div>Weight Lost: {weightLost.toFixed(1)} kg</div>
          <div>Weight Left: {weightLeft.toFixed(1)} kg</div>
          <div>Days Left: {daysLeft}</div>
          <div>
            Required Loss Per Day:{" "}
            {daysLeft === 0 ? "Goal Date Passed" : requiredLossPerDay.toFixed(2)} kg
          </div>
        </div>
      </div>
    </>
  );
}

export default WeightLossApp;
