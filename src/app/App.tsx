import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RewardCeremony } from "@/features/rewards/RewardCeremony";
import { APP_ROUTES } from "./routes";
import { Providers } from "./providers";

/** 路由切换时回到顶部。 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Providers>
      {/* HashRouter：GitHub Pages 等静态托管无需服务端路由配置 */}
      <HashRouter>
        <ScrollToTop />
        <AppShell>
          <Routes>
            {APP_ROUTES.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </AppShell>
        <RewardCeremony />
      </HashRouter>
    </Providers>
  );
}
