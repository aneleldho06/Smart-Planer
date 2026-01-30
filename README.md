# SmartPlaner

An intelligent, glassmorphic productivity dashboard designed to help you organize your day, track goals, and visualize progress.

![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)
![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF)

## ✨ Features

- **Daily Dashboard**: A unified view for your timeline, tasks, and priorities.
- **Projects Hub**: Group related tasks into projects (e.g., "Exam Prep") and track completion progress.
- **Interactive Calendar**:
  - **Month View**: Split layout with daily details and weather context.
  - **Year View**: Beautiful, color-coded grid for annual navigation.
- **Onboarding Wizard**: A welcoming 3-step setup flow for first-time users.
- **Visual Excellence**:
  - Full Glassmorphism aesthetic (blurs, translucency, soft shadows).
  - Dark/Light mode support with harmonious color palettes.
  - Smooth Framer Motion transitions.
- **Local-First**: All data is stored securely in your browser's local storage—no backend setup required.

## 📸 Screenshots

> *[Screenshots relating to the Onboarding, Projects, and Calendar views will be attached here]*

## ⚡ Quick Start

Get the app running locally in seconds:

```bash
git clone https://github.com/aneleldho06/Smart-Planer.git
cd Smart-Planer
npm install
npm run dev
```

Open your browser to `http://localhost:5173`.

## Installation

### Prerequisites
- Node.js 18+
- npm (comes with Node.js)

### Setup
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/aneleldho06/Smart-Planer.git
    cd Smart-Planer
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

## Development Setup

The project uses [Vite](https://vitejs.dev/) for a lightning-fast development experience.

**Key Commands**:
- `npm run dev` - Start the development server (HMR enabled).
- `npm run build` - Build for production (TypeScript + Vite).
- `npm run lint` - Run ESLint to catch code quality issues.
- `npm run preview` - Preview the production build locally.

**Project Structure**:
```text
src/
├── assets/         # Images and global styles
├── components/     # Reusable UI components (BottomNav, TaskCard, etc.)
├── stores/         # State management (Zustand: uiStore, taskStore, projectStore)
├── views/          # Main page views (Today, Monthly, Projects, AI)
├── App.tsx         # Main application entry point
└── index.css       # Tailwind directives and custom CSS
```

## Usage

### Organizing Your Day
1.  **Add a Task**: On the "Today" view, simply type in the "Add a new task..." input and hit **Enter**.
2.  **Prioritize**: Click the Star icon on any task to move it to your "My Priorities" list.

### Managing Projects
1.  Navigate to the **Projects** tab (Folder icon).
2.  Click **New Project**, enter a name (e.g., "Fitness"), and pick an emoji.
3.  Click on the project card to add tasks specifically linked to that goal.

### Using the Calendar
1.  Go to the **Month** tab.
2.  Click the Month Name (e.g., "January 2026") to zoom out to the Year Grid.
3.  Select any month tile to jump to that specific month's daily view.

## Configuration

The application is currently configured for a serverless, local-first experience.

- **Persistence**: Data is saved to `localStorage`. Clearing browser data will reset the app.
- **Environment Variables**:
  Create a `.env` file for future backend integrations:
  ```env
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_key
  ```

## Testing

*Testing suite setup is currently in progress.*

## Contributing

We welcome contributions! Please open an issue first to discuss what you would like to change.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Project Tech**: React 19, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion  
**Project Type**: Single Page Application (SPA) / Personal Productivity Tool  
**Main Purpose**: To provide a focused, visually stunning interface for managing daily tasks and long-term goals without the clutter of complex enterprise tools.
