import type { ReactElement } from "react";
import { HallPage } from "@/features/hall/HallPage";
import { JournalPage } from "@/features/journal/JournalPage";
import { MapPage } from "@/features/map/MapPage";
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
  { path: "/", element: <HallPage /> },
  { path: "/map", element: <MapPage /> },
  { path: "/quests/:questId", element: <QuestPage /> },
  { path: "/skills", element: <SkillsPage /> },
  { path: "/vault", element: <VaultPage /> },
  { path: "/review", element: <ReviewPage /> },
  { path: "/shop", element: <ShopPage /> },
  { path: "/journal", element: <JournalPage /> },
];
