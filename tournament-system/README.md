# 🏆 TourneyOS — Tournament Management System

A full-stack tournament management system for Chess and Clash Royale with League (Round Robin) and Knockout (Single Elimination) formats.

**Stack:** React + Vite · Tailwind CSS · Framer Motion · Supabase  
**Theme:** Dark futuristic gaming UI with neon purple/cyan accents and glassmorphism

---

## 📁 Project Structure

```
tournament-system/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CreateTournamentModal.jsx   # Full form: league/knockout creation
│   │   │   └── MatchResultForm.jsx         # Inline result entry per match
│   │   ├── public/
│   │   │   ├── TournamentCard.jsx          # Tournament listing card
│   │   │   ├── Leaderboard.jsx             # Standings table with ranks
│   │   │   └── BracketView.jsx             # Visual knockout bracket tree
│   │   ├── shared/
│   │   │   └── PageTransition.jsx          # Framer Motion page wrapper
│   │   └── ui/
│   │       ├── Button.jsx                  # Neon glow button variants
│   │       ├── Badge.jsx                   # Status/type label badges
│   │       ├── Card.jsx                    # Glassmorphism card
│   │       ├── Input.jsx                   # Styled form input
│   │       └── Skeleton.jsx                # Loading skeleton components
│   ├── hooks/
│   │   ├── useAuth.jsx                     # Auth context + hook
│   │   └── useTournament.js                # Data fetching hooks
│   ├── layouts/
│   │   ├── PublicLayout.jsx                # Top navbar for public pages
│   │   └── AdminLayout.jsx                 # Sidebar layout (protected)
│   ├── lib/
│   │   ├── supabase.js                     # Supabase client init
│   │   ├── utils.js                        # cn() utility
│   │   └── tournamentService.js            # All DB operations + logic
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx          # List + create tournaments
│   │   │   └── AdminTournamentManage.jsx   # Enter results, view progress
│   │   └── public/
│   │       ├── HomePage.jsx                # Browse + filter tournaments
│   │       ├── TournamentPage.jsx          # View bracket or leaderboard
│   │       └── LoginPage.jsx               # Sign in / sign up
│   ├── utils/
│   │   └── tournament.js                   # Round robin + knockout algorithms
│   ├── App.jsx                             # Router setup
│   ├── main.jsx                            # React entry point
│   └── index.css                           # Global styles + Tailwind
├── supabase/
│   └── schema.sql                          # Full DB schema + RLS policies
├── .env.example
├── netlify.toml
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Setup Guide

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account

---

### Step 1 — Clone and Install

```bash
git clone <your-repo-url>
cd tournament-system
npm install
```

---

### Step 2 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name, password, and region
3. Wait for the project to spin up (~1 min)

---

### Step 3 — Run the SQL Schema

1. In your Supabase dashboard → **SQL Editor**
2. Click **New Query**
3. Paste the full contents of `supabase/schema.sql`
4. Click **Run**

This creates all tables, indexes, and Row Level Security policies.

---

### Step 4 — Get Your Supabase Credentials

1. Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon / public** key

---

### Step 5 — Set Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### Step 6 — Create an Admin User

**Option A: Via the App**
1. `npm run dev` → visit `http://localhost:5173/login`
2. Sign up with your email/password
3. Check your email and confirm (required by Supabase)

**Option B: Directly via Supabase**
1. Supabase Dashboard → **Authentication** → **Users** → **Invite user**

**Grant Admin Role:**

In Supabase SQL Editor:

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'your-admin@email.com';
```

Then sign out and sign back in. You'll see the **Admin** button in the navbar.

---

### Step 7 — Run Locally

```bash
npm run dev
```

Open `http://localhost:5173`

---

## 🌐 Deployment (Netlify)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2 — Connect to Netlify

1. [netlify.com](https://netlify.com) → New site from Git
2. Connect your GitHub repo
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### Step 3 — Add Environment Variables

Netlify Dashboard → Site Settings → **Environment variables**:

```
VITE_SUPABASE_URL     = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

### Step 4 — Deploy

Click **Deploy site**. The `netlify.toml` handles SPA routing redirects automatically.

---

## 🔐 Authentication & Roles

| Feature | Public User | Admin |
|---|---|---|
| View tournaments | ✅ | ✅ |
| View leaderboard | ✅ | ✅ |
| View bracket | ✅ | ✅ |
| Create tournament | ❌ | ✅ |
| Enter match results | ❌ | ✅ |
| Admin dashboard | ❌ | ✅ |

Admin role is set via `user_metadata.role = "admin"` in Supabase.

---

## 🏆 Tournament Generation Logic

### League (Round Robin)

Uses the **Circle Method** algorithm:

1. Players are arranged in a circle
2. One player is fixed; the rest rotate each round
3. For N players: N-1 rounds, N/2 matches per round
4. If odd player count: a BYE (null) is added temporarily

Example for 4 players (A, B, C, D):
- Round 1: A vs D, B vs C
- Round 2: A vs C, D vs B
- Round 3: A vs B, C vs D

Points are configurable (e.g., Win=3, Draw=1, Loss=0). Standings update automatically after each result.

### Knockout (Single Elimination)

1. Players are shuffled randomly
2. First round pairs are created sequentially (player[0] vs player[1], etc.)
3. Round names are computed based on remaining players:
   - 2 left → Final
   - 4 left → Semifinal
   - 8 left → Quarterfinal
   - 16 left → Round of 16
4. After all matches in a round complete → next round auto-generates with winners
5. When only 1 winner remains → tournament closes automatically

---

## 🗄️ Database Schema

```
players         → id, name, created_at
tournaments     → id, name, type, allow_draw, win/draw/loss_points, status, created_at
matches         → id, tournament_id, round_number, round_name, player1_id, player2_id, winner_id, is_draw, completed, created_at
standings       → id, tournament_id, player_id, played, wins, draws, losses, points
```

---

## 🎨 UI Theme

- **Background:** Deep space dark (`#060611`) with purple radial gradients
- **Typography:** Orbitron (headings) + Rajdhani (body) + Space Mono (code)
- **Cards:** Glassmorphism with purple border glow on hover
- **Buttons:** Neon purple & cyan with glow animations
- **Animations:** Framer Motion page transitions + staggered list reveals
- **Grid:** Subtle dot grid background for depth

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Database + Auth |
| `framer-motion` | Animations & transitions |
| `react-router-dom` | Client-side routing |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icon library |
| `tailwind-merge` + `clsx` | Conditional class merging |

---

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
→ Make sure `.env` exists and has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Admin button not showing**
→ Ensure you've set `role: "admin"` in user_metadata and signed out/in again

**RLS errors on data fetch**
→ Confirm you ran the full `schema.sql` including the RLS policy section

**Bracket not generating next round**
→ Ensure all matches in the current knockout round are completed before the next generates

---

## 📄 License

MIT
