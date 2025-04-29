#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import prompts from "prompts";

(async () => {
  const projectName = process.argv[2] || "my-react-app";

  console.log(`Creating a new React project: ${projectName}...`);

  // Prompt for TypeScript and Tailwind CSS
  const { useTypeScript, useTailwind } = await prompts([
    {
      type: "confirm",
      name: "useTypeScript",
      message: "Would you like to use TypeScript?",
      initial: false,
    },
    {
      type: "confirm",
      name: "useTailwind",
      message: "Would you like to include Tailwind CSS?",
      initial: false,
    },
  ]);

  // Create project directory
  const projectDir = join(process.cwd(), projectName);
  if (existsSync(projectDir)) {
    console.error(
      `Directory ${projectName} already exists. Please choose a different name.`
    );
    process.exit(1);
  }
  mkdirSync(projectDir);

  // Initialize Vite-based React project
  const viteTemplate = useTypeScript ? "react-ts" : "react";
  try {
    execSync(
      `npm create vite@latest ${projectName} -- --template ${viteTemplate}`,
      { stdio: "inherit", cwd: process.cwd() }
    );
  } catch (error) {
    console.error("Failed to initialize Vite project:", error.message, {
      stderr: error.stderr?.toString(),
    });
    process.exit(1);
  }

  // Navigate to project directory
  process.chdir(projectDir);

  // Install dependencies
  console.log("Installing dependencies...");
  let dependencies =
    "@mui/material @emotion/react @emotion/styled @reduxjs/toolkit react-redux react-router-dom";
  if (useTailwind) {
    dependencies += " tailwindcss postcss autoprefixer";
  }
  try {
    execSync(`npm install ${dependencies}`, { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to install dependencies:", error.message, {
      stderr: error.stderr?.toString(),
    });
    process.exit(1);
  }

  // Initialize Tailwind CSS if selected
  if (useTailwind) {
    try {
      execSync("npx tailwindcss init -p", { stdio: "inherit" });
      writeFileSync(
        join(projectDir, "tailwind.config.js"),
        `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
      );
      writeFileSync(
        join(projectDir, "src/index.css"),
        `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
`
      );
    } catch (error) {
      console.error("Failed to initialize Tailwind CSS:", error.message, {
        stderr: error.stderr?.toString(),
      });
    }
  } else {
    writeFileSync(
      join(projectDir, "src/index.css"),
      `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
`
    );
  }

  // Create directory structure
  const srcDirs = [
    "components",
    "pages",
    "store",
    "features/counter",
    "hooks",
    "utils",
  ];
  srcDirs.forEach((dir) => {
    try {
      mkdirSync(join(projectDir, "src", dir), { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory src/${dir}:`, error.message);
      process.exit(1);
    }
  });

  // File extensions based on TypeScript
  const ext = useTypeScript ? "tsx" : "jsx";
  const typeExt = useTypeScript ? "ts" : "js";

  // Create Redux store setup
  try {
    writeFileSync(
      join(projectDir, `src/store/index.${typeExt}`),
      `
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

${
  useTypeScript
    ? `
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`
    : ""
}
`
    );
  } catch (error) {
    console.error("Failed to create store/index:", error.message);
    process.exit(1);
  }

  // Create sample counter slice
  try {
    writeFileSync(
      join(projectDir, `src/features/counter/counterSlice.${typeExt}`),
      `
import { createSlice } from '@reduxjs/toolkit';

${useTypeScript ? "interface CounterState { value: number }" : ""}
const initialState${useTypeScript ? ": CounterState" : ""} = { value: 0 };

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
`
    );
  } catch (error) {
    console.error("Failed to create counterSlice:", error.message);
    process.exit(1);
  }

  // Create Redux Provider wrapper
  try {
    writeFileSync(
      join(projectDir, `src/main.${ext}`),
      `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);
`
    );
  } catch (error) {
    console.error("Failed to create main:", error.message);
    process.exit(1);
  }

  // Create Router setup
  try {
    writeFileSync(
      join(projectDir, `src/App.${ext}`),
      `
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import { Container } from '@mui/material';

function App() {
  return (
    <BrowserRouter>
      <Container${useTailwind ? ' className="py-4"' : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
`
    );
  } catch (error) {
    console.error("Failed to create App:", error.message);
    process.exit(1);
  }

  // Create sample pages
  try {
    writeFileSync(
      join(projectDir, `src/pages/Home.${ext}`),
      `
import { Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { increment, decrement } from '../features/counter/counterSlice';

${useTypeScript ? "import { RootState } from '../store';" : ""}
function Home() {
  const count = useSelector((state${
    useTypeScript ? ": RootState" : ""
  }) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div${useTailwind ? ' className="space-y-4"' : ""}>
      <Typography variant="h4">Welcome to the Home Page</Typography>
      <Typography>Counter: {count}</Typography>
      <div${useTailwind ? ' className="space-x-2"' : ""}>
        <Button variant="contained" onClick={() => dispatch(increment())}>Increment</Button>
        <Button variant="outlined" onClick={() => dispatch(decrement())}>Decrement</Button>
      </div>
    </div>
  );
}

export default Home;
`
    );
  } catch (error) {
    console.error("Failed to create Home page:", error.message);
    process.exit(1);
  }

  try {
    writeFileSync(
      join(projectDir, `src/pages/About.${ext}`),
      `
import { Typography } from '@mui/material';

function About() {
  return <Typography variant="h4"${
    useTailwind ? ' className="text-blue-600"' : ""
  }>About Page</Typography>;
}

export default About;
`
    );
  } catch (error) {
    console.error("Failed to create About page:", error.message);
    process.exit(1);
  }

  // Update package.json
  try {
    const packageJsonPath = join(projectDir, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath));
    packageJson.scripts = {
      ...packageJson.scripts,
      start: "vite",
      build: "vite build",
      preview: "vite preview",
    };
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.error("Failed to update package.json:", error.message);
    process.exit(1);
  }

  console.log(`Project ${projectName} created successfully!`);
  console.log(`Features included:
  - Material-UI for UI components
  - Redux Toolkit for state management
  - React Router DOM for routing
  ${useTypeScript ? "- TypeScript for type safety" : ""}
  ${useTailwind ? "- Tailwind CSS for styling" : ""}
`);
  console.log(`To get started:
  cd ${projectName}
  npm run dev
`);
})();
