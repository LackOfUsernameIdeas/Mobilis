# Mobilis

> **Comprehensive health platform** that analyzes **characteristics of the users' body condition** - **BMI**, **body composition** (via the U.S. Navy method), **BMR** (Mifflin-St Jeor formula), and **TDEE** - combined with personal metrics to determine optimal daily calorie and macronutrient targets, feeding into a **goal selection algorithm** that assigns the most appropriate fitness goal. A distinctive feature is the **corrective exercise program aimed at improving postural health**, which uses the **Orbbec Astra+ 3D depth camera** and specialized algorithms for **real-time tracking and analysis of body movements and poses**

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Gitignored Configuration Files](#gitignored-configuration-files)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Nuitrack App Setup](#nuitrack-app-setup)
- [Hardware Setup](#hardware-setup)

---

## Architecture

```
Mobilis/
├── src/                  # Next.js application source
│   ├── app/              # App Router pages and API routes
│   ├── server/           # Server-side logic (calorie calculator, health, measurements, save functions, etc.)
│   ├── lib/db/           # Supabase client factories (browser, server, service role)
│   ├── components/       # Shared UI components (shadcn/ui)
│   ├── navigation/       # Sidebar items
│   └── ...
├── tests/                # Vitest unit tests
├── nuitrack_app/         # Python posture correction application (Orbbec Astra+ / Nuitrack SDK)
│   ├── utils/            # Core modules: calibration, pose/angle checks, skeleton processing, visualization
│   ├── main.py           # Entry point
│   ├── app.py            # Tkinter GUI
│   ├── exercises.py      # All exercise definitions
│   ├── session.py        # Session start/stop/toggle logic
│   ├── tts_manager.py    # OpenAI TTS voice assistant
│   ├── sound_manager.py  # Step and exercise completion sounds
│   └── ...
└── .env                  # Shared environment variables
```

| Sub-project     | Role                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`          | Full-stack Next.js application for body metrics, goal selection, workout recommendations, meal plans, weight prognosis, and posture correction UI  |
| `nuitrack_app/` | Standalone Python + Tkinter application that interfaces with the Orbbec Astra+ via Nuitrack SDK and PyNuitrack for real-time posture correction    |

---

## Tech Stack

**Next.js App (`src/`)**  
Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Auth + PostgreSQL), OpenAI API (`gpt-5.2` for workout/nutrition/prognosis generation), YouTube Data API, Vitest

**Posture Correction App (`nuitrack_app/`)**  
Python, Tkinter, Nuitrack SDK, PyNuitrack, OpenCV, OpenAI API (TTS via `gpt-4o-mini-tts`, `coral` voice), pygame (audio playback), requests

---

## Gitignored Configuration Files

These files are excluded from version control and must exist locally before running the project. Templates below show the expected structure - fill in real values yourself.

### `.env`

This file lives at the **repo root** and is shared by both the Next.js app and the `nuitrack_app/` Python application (loaded via `python-dotenv`).

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000 | `your domain`

OPENAI_API_KEY=your_openai_api_key

YOUTUBE_API_KEY_1=your_youtube_api_key_1
YOUTUBE_API_KEY_2=your_youtube_api_key_2
YOUTUBE_API_KEY_3=your_youtube_api_key_3

# Used for admin/auth operations (e.g. checking if email already exists)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> **Note on YouTube keys:** The app uses three YouTube API keys and automatically fails over to the next one if a key is exhausted. You can supply just one key in `YOUTUBE_API_KEY_1` and leave the others empty.

> **Note on `NEXT_PUBLIC_BASE_URL`:** Set this to `http://localhost:3000` for local development and to your production domain when deploying.

---

## Local Development

### 1. Install dependencies

```bash
cd ./Mobilis
npm i
```

### 2. Configure Supabase

- Create a project at [supabase.com](https://supabase.com).
- Run the SQL schema in the Supabase SQL editor to initialize all tables.
- Fill in the Supabase credentials in `.env`.

### 3. Start the development server

```bash
npm run dev
```

### 4. Run tests (optional)

```bash
npm run test
```

Runs ~180 Vitest unit tests across `calorieCalculator`, `cookies`, `health`, `measurements`, `nutritionalProfile`, `recommendedGoal`, and `saveFunctions`.

---

## Production Deployment

This section covers deploying the Next.js app to a cPanel host via a Node.js application.

### 1. Enable standalone output (one-time)

Add `output: "standalone"` to `next.config.mjs`. This only needs to be done once:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
    ];
  },
}

export default nextConfig
```

### 2. Update `.env` for production

Make sure all paths and values in `.env` point to your production environment - in particular, set `NEXT_PUBLIC_BASE_URL` to your production domain.

### 3. Build the app

```bash
npm run build
```

This produces a `.next/` directory. The standalone bundle is at `.next/standalone/`, and the static assets are at `.next/static/` (outside `standalone/`).

### 4. Upload files to cPanel 

1. In cPanel, create a **Node.js application** in production mode and set up your domain.
2. Upload the **contents** of `.next/standalone/` to the Node.js application's root directory via FTP. This includes:
   - `.next/`
   - `src/`
   - `node_modules/` (built locally and transferred to the shared hosting running npm 10.8.2 on Node 20.20.2, which cannot resolve Next.js dependencies, and since sudo is unavailable on shared hosting, npm cannot be upgraded)
   - `package.json`
   - `server.js`
3. Also upload your `.htaccess` file to the application root (first deployment only).

### 5. Upload static assets

Upload the `.next/static/` folder into the `.next/` directory on the host. This folder is generated by the build outside of the `standalone/` directory and must be copied there manually.

### 6. Upload the `public/` folder

Upload the `public/` folder (found at the repo root, outside `.next/`) to the application root on the host.

### 7. Restart the Node.js application

In cPanel, restart the Node.js application to pick up the new files.

---

## Nuitrack App Setup

The posture correction program (`nuitrack_app/`) is a standalone Python desktop application. It uses a **Tkinter GUI** for visualization, **PyNuitrack + OpenCV** for real-time skeleton tracking, and **OpenAI TTS** for voice-guided exercise instructions. It reads `OPENAI_API_KEY` directly from the repo root `.env` file.

### Prerequisites

- **Python 3.10** - verify with:
  ```bash
  python3.10 --version
  ```
  On Windows, Python 3.10 is typically installed at `C:\Users\<User>\AppData\Local\Programs\Python\Python310\`.
- **Windows** (the sound manager uses `winsound` as primary audio backend with `pygame` as fallback)
- **Orbbec Astra+** connected via **USB 3.0** (USB 2.0 is unreliable for depth data transmission)

### 1. Install Nuitrack Runtime

Download and install the Nuitrack Runtime from the [official 3DiVi GitHub releases](https://github.com/3DiVi/nuitrack-sdk/releases). Choose the installer matching your OS.

### 2. Obtain a Nuitrack license key

Register and generate a free trial license key at the [3DiVi License Management Dashboard](https://cognitive.3divi.com/app/nuitrack/dashboard): select a license → **Free** → **Activate**.

### 3. Activate the camera

1. Open `Nuitrack\nuitrack\nuitrack\activation_tool` and run `Nuitrack.exe`.
2. Select the **Astra+ 3D Sensor** from the device list.
3. Enter your license key and click **Activate**.
4. Close the program once activation is confirmed.

### 4. Set up the Python environment

Open a terminal in `Mobilis\nuitrack_app` and run the following steps in order:

```bash
# 1. Create a virtual environment pinned to Python 3.10
py -3.10 -m venv nuitrack-env

# 2. Activate the environment
nuitrack-env\Scripts\activate
# Or using the full path if the short form doesn't work:
# ..\Mobilis\nuitrack_app\nuitrack-env\Scripts\Activate.ps1
```

**Install PyNuitrack from the local `.whl` file**:

```bash
pip install nuitrack-env\Whl\py_nuitrack_windows_python3_10-0.38.3-py3-none-any.whl
```

> Pull the [Nuitrack SDK](https://github.com/3DiVi/nuitrack-sdk) and find the wheel at `PythonNuitrack-beta/pip_packages/dist/windows/`.

Then install the remaining dependencies:

```bash
pip install numpy opencv-python pillow pygame python-dotenv requests
```

### 5. Run the app

Make sure the virtual environment is active, then:

```bash
python main.py
```

This opens the Tkinter GUI window (**Програма за проследяване на изпълнението**). From there:

1. Click **Стартиране на сесия** - initializes the Nuitrack instance (`py_nuitrack.Nuitrack()`), opens the OpenCV window, and starts the depth camera feed.
2. Click **Стартиране на калибриране** - stand still with arms down and legs together. The system runs a 5-second calibration (`utils/calibration.py`) to compute height, arm length, shoulder/hip width, and leg length, then derives body-proportional tolerances for all subsequent pose and angle checks.
3. Select an exercise from the dropdown, then click **Стартиране на упражнение** - the voice assistant (OpenAI TTS) reads the step instructions aloud, and real-time feedback appears in the OpenCV window.

> **TTS caching:** All exercise instructions are pre-generated as MP3s into `tts_cache/` on first run and reused on subsequent runs to avoid API latency mid-exercise. The `tts_cache/` directory is gitignored.

### 6. Build a standalone `.exe` (optional)

Activate the virtual environment, then upgrade pip and install PyInstaller:

```bash
# Activate (if not already active)
nuitrack-env\Scripts\Activate.ps1

# Upgrade pip and install PyInstaller
python -m pip install --upgrade pip
pip install --force-reinstall pyinstaller
```

> After installation, `pyinstaller.exe` should be present inside `nuitrack-env\Scripts\`.

Then build the executable, bundling all required assets:

```bash
pyinstaller --onefile --noconsole \
  --name mobilis_pose_correction \
  --icon=logo.ico \
  --add-data "logo.ico;." \
  --add-data "exercise_calibration_complete_sound.wav;." \
  --add-data "step_complete_sound.wav;." \
  --add-data "tts_cache;tts_cache" \
  --add-data "ARIAL.TTF;." \
  main.py
```

The resulting `mobilis_pose_correction.exe` is placed in `dist/` and can be distributed and run without a Python installation.

---

## Hardware Setup

### Orbbec Astra+ (3D Depth Camera)

1. **Connect via USB 3.0.**
2. **Install Nuitrack Runtime** and **activate the license** as described in [Nuitrack App Setup](#nuitrack-app-setup).
3. **Position the camera** so the user is within the **2.5–3.0 m** optimal range. A color-coded distance bar in the OpenCV window guides you to the correct distance during sessions.

> **Lighting tip:** Avoid strong backlighting (e.g. a bright window directly behind the user) - it interferes with depth sensing.