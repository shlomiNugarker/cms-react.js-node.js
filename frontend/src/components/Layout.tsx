import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const Layout = () => {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/register"];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {shouldShowHeader && <Header />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
