import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { JournalPage } from "@/features/journal/JournalPage";
import { PathPage } from "@/features/path/PathPage";
import { QuestPage } from "@/features/quests/QuestPage";
import { ReviewPage } from "@/features/review/ReviewPage";
import { ShopPage } from "@/features/shop/ShopPage";
import { SkillsPage } from "@/features/skills/SkillsPage";
import { VaultPage } from "@/features/evidence/VaultPage";

export interface AppRoute {
  path: string;
  element: ReactElement;
}

export const APP_ROUTES: AppRoute[] = [
  { path: "/", element: <PathPage /> },
  // 旧地图并入路径主页；保留路由避免旧链接失效
  { path: "/map", element: <Navigate to="/" replace /> },
  { path: "/quests/:questId", element: <QuestPage /> },
  { path: "/skills", element: <SkillsPage /> },
  { path: "/vault", element: <VaultPage /> },
  { path: "/review", element: <ReviewPage /> },
  { path: "/shop", element: <ShopPage /> },
  { path: "/journal", element: <JournalPage /> },
];
