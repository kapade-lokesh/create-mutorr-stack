 <p align="center">
  <img src="https://res.cloudinary.com/dzooftuit/image/upload/v1745995442/logo_ewfpn4.svg" alt="Create Mutorr Stack Logo" width="200"/>
</p>

# 🚀 create-mutorr-stack

A powerful CLI tool to scaffold a modern React project with **Material-UI (MUI)**, **Redux Toolkit**, **React Router DOM**, and optional **TypeScript** and **Tailwind CSS**, powered by **Vite**.

> The name **"mutorr"** combines **Mu (Material-UI)** and **torr (Redux Toolkit + React Router DOM)** — your complete, feature-rich React development stack! 🎉

---

## ✨ Features

- 🎨 **Material-UI (MUI)**: Pre-configured, beautiful UI components for rapid development.
- 🧠 **Redux Toolkit**: Simplified state management with a sample counter slice.
- 🧭 **React Router DOM**: Seamless client-side routing with Home and About pages.
- ⚡ **Vite**: Lightning-fast dev server and optimized builds.
- 🧾 **TypeScript (Optional)**: Type safety for a better developer experience.
- 🌈 **Tailwind CSS (Optional)**: Utility-first CSS for flexible, custom styling.
- 🗂️ **Organized Folder Structure**: Maintainable layout with components, pages, store, and more.

---

## 🛠️ Installation

### Global Installation

Install the CLI globally to use it anywhere:

```bash
npm install -g @yourname/create-mutorr-stack

Quick Start with npx
npx create-mutorr-stack my-app


🚀 Usage
Create a New Project
Run the CLI command and provide a project name:

create-mutorr-stack my-app

Answer Prompts
📝 TypeScript: Choose whether to use TypeScript (y/n).
🎨 Tailwind CSS: Choose whether to include Tailwind CSS (y/n).


Navigate to the project:
cd my-app


Install dependencies (if not already done by the CLI):
npm install


Start the development server:
npm run start

The app will be available at http://localhost:5173.

Build for production:
npm run build

The optimized build will be in the dist folder.

Preview the production build:
npm run preview



Project Structure
The generated project has a clean, scalable structure:
my-app/
├── src/
│   ├── components/          # 📦 Reusable UI components
│   ├── features/           # 🧩 Redux slices and logic (e.g., counter)
│   ├── hooks/              # ⚓ Custom React hooks
│   ├── pages/              # 📄 Route-based page components (e.g., Home, About)
│   ├── store/              # 🏬 Redux store configuration
│   ├── utils/              # 🔧 Utility functions
│   ├── App.tsx             # 🌐 Router setup with MUI Container
│   ├── main.tsx            # 🚀 Redux Provider and app entry
│   └── index.css           # 🎨 Global styles (Tailwind or basic)
├── public/                 # 📂 Static assets
├── index.html              # 📑 Vite entry point
├── package.json            # 📦 Project metadata and scripts
├── vite.config.ts          # ⚙️ Vite configuration
└── tailwind.config.js      # 🌬️ Tailwind configuration (if selected)
🎮 Example
The generated project includes a sample app with:

he generated project includes a sample app with:

A Home page (/) featuring a Redux counter with MUI buttons.
An About page (/about) with basic MUI typography.
Navigation via React Router DOM.
Styling with MUI and optional Tailwind CSS.

Test the Counter:

Visit http://localhost:5173.
Click the Increment and Decrement buttons to update the Redux state.

✅ Requirements

🟢 Node.js: Version 16 or higher.
📦 npm: Version 7 or higher.
🌐 Internet Connection: Required for initial dependency installation.

🤝 Contributing
Contributions are welcome! 🎉 Follow these steps:
Fork the repository on GitHub.
Clone your fork:

Clone your fork:git clone https://github.com/yourusername/create-mutorr-stack.git


Create a branch:git checkout -b feature/your-feature


Make changes and commit:

git commit -m "Add your feature"


Push to your fork:

git push origin feature/your-feature


Open a pull request on the main repository.

Please follow the Code of Conduct and include tests for new features.

🐛 Issues
Report bugs or suggest features by opening an issue on the GitHub repository.

📜 License
This project is licensed under the MIT License. See the LICENSE file for details.

🙌 Acknowledgments
Built with inspiration from tools like create-vite and create-react-app.
Powered by Vite, Material-UI, Redux Toolkit, and React Router.
Created by Your Name. Happy coding! 😄
```
