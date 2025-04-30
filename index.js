#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import prompts from "prompts";

(async () => {
  // Get project name from command-line arguments (e.g., npm create @yourname/mutorr-stack@latest my-app)
  const projectName = process.argv[2] || "my-react-app";

  // Validate project name to ensure it's safe for file creation
  if (!/^[a-z0-9-]+$/.test(projectName)) {
    console.error(
      "Project name must contain only lowercase letters, numbers, and hyphens (e.g., my-app)."
    );
    process.exit(1);
  }

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

  // Initialize Vite-based React project (suppress output)
  const viteTemplate = useTypeScript ? "react-ts" : "react";
  try {
    console.log("Initializing Vite project...");
    execSync(
      `npm create vite@latest ${projectName} -- --template ${viteTemplate}`,
      {
        stdio: ["inherit", "pipe", "pipe"], // Capture stdout/stderr, inherit stdin
        cwd: process.cwd(),
      }
    );
  } catch (error) {
    console.error("Failed to initialize Vite project:", error.message, {
      stderr: error.stderr?.toString(),
    });
    process.exit(1);
  }

  // Navigate to project directory
  process.chdir(projectDir);

  // Update package.json to include all dependencies
  try {
    const packageJsonPath = join(projectDir, "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath));

    // Add custom dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "@mui/material": "^5.16.0",
      "@emotion/react": "^11.13.0",
      "@emotion/styled": "^11.13.0",
      "@reduxjs/toolkit": "^2.2.0",
      "react-router-dom": "^6.26.0",
      "react-redux": "^9.1.2",
    };

    // Add Tailwind devDependencies if selected
    if (useTailwind) {
      packageJson.devDependencies = {
        ...packageJson.dependencies,
        tailwindcss: "^3.4.0",
        postcss: "^8.4.0",
        autoprefixer: "^10.4.0",
      };
    }

    // Update scripts
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

  // Install all dependencies in one go
  console.log("Installing dependencies...");
  try {
    execSync("npm install", { stdio: "inherit" });
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
     
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      
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
  import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
  import { useDispatch, useSelector } from 'react-redux';
  import { Link } from 'react-router-dom';
  import { increment, decrement } from '../features/counter/counterSlice';
  import "./Home.css"; 
  ${useTypeScript ? "import { RootState } from '../store';" : ""}
  function Home() {
    const count = useSelector((state${
      useTypeScript ? ": RootState" : ""
    }) => state.counter.value);
    const dispatch = useDispatch();
  
    return (
       <Box sx={{ bgcolor: "#121212", height: "100vh", color: "#fff" }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ bgcolor: "#000" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mutorr Stack
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/about">
            About
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 6,
        }}
      >
        <img
          src="https://res.cloudinary.com/dzooftuit/image/upload/v1745995442/logo_ewfpn4.svg"
          alt="Logo"
          height={300}
          className="logo"
        />
      </Box>

      {/* Centered Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          mt: 4,
        }}
      >
        <Typography sx={{ mt: -1 }} variant="h6">
          Counter: {count}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#000",
              color: "#fff",
              "&:hover": { bgcolor: "#333" },
            }}
            onClick={() => dispatch(increment())}
          >
            Increment
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#fff",
              color: "#fff",
              "&:hover": { bgcolor: "#333" },
            }}
            onClick={() => dispatch(decrement())}
          >
            Decrement
          </Button>
        </Box>
      </Box>
    </Box>
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
      join(projectDir, "src/pages/Home.css"),
      `
  .logo {
  animation: float 2s ease-in-out infinite;
  filter: drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px #ffffff)
    drop-shadow(0 0 16px #ffffff) drop-shadow(0 0 30px #6c63ff)
    drop-shadow(0 0 60px #5a50cc) drop-shadow(0 0 100px #4b41b3);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
    `
    );
  } catch (error) {
    console.error("Failed to create Home.css:", error.message);
    process.exit(1);
  }

  try {
    writeFileSync(
      join(projectDir, `src/pages/About.${ext}`),
      `
 import { Typography, Box } from '@mui/material';
  import { Link } from "react-router-dom";
  
  function About() {
    return (
      <Box
      sx={{
        bgcolor: "#121212",
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            About Page
          </Typography>

          <Link
            to="/"
            style={{
              textDecoration: "underline",
              color: "#fff",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                display: "inline-block",
                px: 2,
                py: 0.5,
                mt: 2,
                ml: 2,
                backgroundColor: "#5c6bc0", // Indigo shade
                color: "#fff",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#3f51b5", // Darker indigo
                  boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                },
              }}
            >
              Go to Home
            </Typography>
          </Link>
        </Box>
      </Box>
    </Box>
    );
  }
  
  export default About;
`
    );
  } catch (error) {
    console.error("Failed to create About page:", error.message);
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
