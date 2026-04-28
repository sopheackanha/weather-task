# TaskFlow — Weather-Aware Daily Planner

A full-stack Next.js app where **weather is the star**. The entire UI dynamically adapts to weather conditions, and tasks are intelligently analyzed based on weather data.

---

## 🌦️ Weather Intelligence Features

### 1. Dynamic UI Theme
The entire dashboard changes based on weather:
- ☀️ **Sunny** → warm golden gradient + sun glow + sparkles
- ⛅ **Partly Cloudy** → soft blue gradient + floating cloud layers  
- 🌧️ **Rainy** → dark navy glassmorphism + animated raindrops
- ⛈️ **Stormy** → near-black + purple accents + lightning flash
- ❄️ **Snowy** → pale blue + falling snowflakes
- 💨 **Windy** → teal + horizontal wind lines
- 🌫️ **Foggy** → grey + drifting fog layers

### 2. Smart Daily Tip
Contextual advice in the WeatherHero panel:
- "🥵 Extreme heat — avoid outdoor work 11am–3pm"
- "💨 Very windy — secure loose items"
- "🌧️ Rainy day — carry an umbrella"

### 3. Auto Task Categorization (Indoor/Outdoor)
Tasks are automatically tagged based on keywords:
- **Outdoor**: run, grocery, market, garden, bike, sports, errands...
- **Indoor**: study, code, clean, cook, zoom, doctor...

### 4. Weather Warnings on Tasks
When weather is bad (rainy/stormy), outdoor tasks get:
- 🔴 Red border with pulsing animation
- ⚠️ "Weather Warning — Reschedule?" badge
- Warning count banner at the top of the task list

### 5. Weather-Based Priority Bump
Tasks containing storm-critical keywords ("umbrella", "roof", "leak", "flashlight") are auto-bumped to **High** priority during stormy/rainy weather.

### 6. 5-Day Forecast Bar
- Shows outdoor suitability score (0–100) for each day
- ⭐ highlights the best day for outdoor tasks
- Click any day to jump to that date

### 7. Best Day Suggestion in Add Task Modal
When you type an outdoor task:
- Shows forecast weather for the selected date
- Warns if the date has bad weather
- Suggests switching to the best day with one click

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your OpenWeather API key

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Getting an API Key (Free, 2 minutes)
1. Go to https://openweathermap.org/api
2. Sign up (free)
3. Go to "API Keys" tab
4. Copy your key into `.env.local`

> **Without an API key**: The app works perfectly with realistic mock data (partly cloudy, 32°C, Phnom Penh). Great for development!

---

## 📁 Structure

```
app/
  api/
    tasks/route.ts          ← GET/POST tasks
    tasks/[id]/route.ts     ← PATCH/DELETE task
    weather/route.ts        ← Current weather
    weather/forecast/route.ts ← 5-day forecast
  dashboard/page.tsx        ← Main page
  layout.tsx / globals.css

components/
  WeatherHero.tsx           ← Big weather display + tip
  WeatherParticles.tsx      ← CSS atmospheric effects
  ForecastBar.tsx           ← 5-day forecast + best day
  MiniCalendar.tsx          ← Themed calendar
  TaskList.tsx              ← Weather warnings + filters
  TaskCard.tsx              ← Per-task weather badges
  AddTaskModal.tsx          ← Smart scheduling suggestions

lib/
  types.ts                  ← All TypeScript types
  weather.ts                ← OpenWeather API + mock
  weatherTheme.ts           ← 8 weather themes
  taskIntelligence.ts       ← Auto-categorization logic
  taskStorage.ts            ← File-based DB (no setup!)
```

---

## 🎯 Your 2 Contributions (for presentation)

**Contribution 1 — Task Management System**
- Full CRUD (create, read, update, delete)
- Status management (todo → in-progress → done)
- Date-based filtering + progress tracking

**Contribution 2 — Weather Intelligence**
- Dynamic UI theme per weather condition
- Auto indoor/outdoor task detection
- Weather warnings + priority bumping
- 5-day forecast + best day scheduling

---

## 🗄️ Data

Tasks are stored in `data/tasks.json` (auto-created). No database setup required!

For production: replace functions in `lib/taskStorage.ts` with Supabase or Firebase calls. The API routes stay the same.
