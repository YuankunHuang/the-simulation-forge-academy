import { AnimatePresence, motion } from "framer-motion";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GateScreen } from "@/features/gate/GateScreen";
import { RewardCeremony } from "@/features/rewards/RewardCeremony";
import { pageVariants } from "@/lib/motion";
import { useCloudAutoSync, useCloudSyncStore } from "@/store/cloudSyncStore";
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

/** 页面级过渡：淡入 + 轻微上移，统一 spring 手感。 */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
        <Routes location={location}>
          {APP_ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  useCloudAutoSync();
  // 个人门户：没有口令时全屏拦截（口令即云端存档钥匙，验证过一次就持久化在本机）
  const unlocked = useCloudSyncStore((s) => s.passphrase !== null);
  return (
    <Providers>
      {!unlocked ? (
        <GateScreen />
      ) : (
        // HashRouter：GitHub Pages 等静态托管无需服务端路由配置
        <HashRouter>
          <ScrollToTop />
          <AppShell>
            <AnimatedRoutes />
          </AppShell>
          <RewardCeremony />
        </HashRouter>
      )}
    </Providers>
  );
}
