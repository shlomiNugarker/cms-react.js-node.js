import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n.ts";
import "@/config/axios"; // Import axios configuration
import Routes from "./routes";

// Loading component while i18n resources are being loaded
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<LoadingComponent />}>
      <Routes />
    </Suspense>
  </StrictMode>
);
