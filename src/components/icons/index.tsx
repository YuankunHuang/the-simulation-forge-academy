import type { SVGProps } from "react";

/** 学院图标集 — 全部为内联 SVG，stroke 风格，随 currentColor 着色。 */

export type IconName =
  | "flame"
  | "home"
  | "map"
  | "skilltree"
  | "chest"
  | "cards"
  | "shop"
  | "book"
  | "hammer"
  | "lock"
  | "check"
  | "star"
  | "gem"
  | "coin"
  | "sparkle"
  | "shield"
  | "scroll"
  | "chevron-right"
  | "x"
  | "download"
  | "upload"
  | "copy"
  | "fog"
  | "trophy"
  | "compass"
  | "quill"
  | "warning"
  | "refresh";

const PATHS: Record<IconName, JSX.Element> = {
  flame: (
    <path d="M12 3c.6 2.8-1.8 4.2-1.8 6.6 0 1 .5 1.8 1 2.4-1.5-.3-2.9-1.6-2.9-3.9C6.7 9.6 5.5 11.4 5.5 13.7c0 3.4 2.9 5.8 6.5 5.8s6.5-2.4 6.5-5.8c0-2.9-2-4.7-3.4-7.3-.5 1.4-1.4 2-2.2 2.2.4-1.5.1-3.6-.9-5.6z" />
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  skilltree: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="6" cy="17" r="2.2" />
      <circle cx="18" cy="17" r="2.2" />
      <path d="M12 7.2V12m0 0l-4.6 3.2M12 12l4.6 3.2" />
    </>
  ),
  chest: (
    <>
      <rect x="3.5" y="7" width="17" height="12" rx="2" />
      <path d="M3.5 11h17" />
      <path d="M12 9.5v3.5" />
      <path d="M6 7c0-1.7 2.7-3 6-3s6 1.3 6 3" />
    </>
  ),
  cards: (
    <>
      <rect x="4" y="6" width="11" height="14" rx="1.6" />
      <path d="M9 3.5l9.2 2.4a1.6 1.6 0 011.1 2L16.5 18" />
    </>
  ),
  shop: (
    <>
      <path d="M5 9h14l-1 11H6L5 9z" />
      <path d="M8.5 11.5V7a3.5 3.5 0 017 0v4.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5v-16z" />
      <path d="M4 19a2.5 2.5 0 012.5-2.5H20" />
      <path d="M9 8h7M9 11.5h5" />
    </>
  ),
  hammer: (
    <>
      <path d="M13.5 6.5l4 4L7 21l-4-4L13.5 6.5z" />
      <path d="M12 5l3-3 7 7-3 3" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 017 0v2.7" />
      <circle cx="12" cy="15" r="1.4" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  star: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" />
  ),
  gem: (
    <>
      <path d="M7 4h10l4 5-9 11L3 9l4-5z" />
      <path d="M3 9h18M9.5 9L12 20M14.5 9L12 20M7 4l2.5 5M17 4l-2.5 5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 9.5v5M10.3 10.8h3.4" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4l1.8 4.7L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.3L12 4z" />
      <path d="M19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.4 8-8 9.5C7.4 20 4 17 4 12V6l8-3z" />
      <path d="M9 12l2.2 2.2L15.5 9.5" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 4h11a2.5 2.5 0 012.5 2.5V18a2 2 0 01-2 2H8" />
      <path d="M6 4a2 2 0 00-2 2v1.5h4V6a2 2 0 00-2-2zM8 20a2 2 0 002-2v-1.5H4V18a2 2 0 002 2h2z" />
      <path d="M9.5 9h6M9.5 12.5h4.5" />
    </>
  ),
  "chevron-right": <path d="M9 5l7 7-7 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  download: (
    <>
      <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1" transform="translate(2 1)" />
    </>
  ),
  fog: (
    <>
      <path d="M4 10h9M4 14h13M4 18h7" />
      <path d="M15 10a4 4 0 10-1-7.9A5.5 5.5 0 006 6.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 01-8 0V4z" />
      <path d="M8 5H5a3 3 0 003 4M16 5h3a3 3 0 01-3 4" />
      <path d="M12 13v3m-3.5 4h7l-.8-4h-5.4l-.8 4z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  quill: (
    <>
      <path d="M20 4c-6 0-11 3-13.5 8.5C5.5 14.7 5 17 5 19c2 0 4.3-.5 6.5-1.5C17 15 20 10 20 4z" />
      <path d="M5 19L15 9" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 10v4.5M12 17.5v.1" />
    </>
  ),
  refresh: (
    <>
      <path d="M4.5 12a7.5 7.5 0 0112.9-5.2L20 9" />
      <path d="M20 4.5V9h-4.5" />
      <path d="M19.5 12a7.5 7.5 0 01-12.9 5.2L4 15" />
      <path d="M4 19.5V15h4.5" />
    </>
  ),
};

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

/** 米拉导师头像 — 温暖的手绘风格 SVG。 */
export function MiraAvatar({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-label="米拉导师" role="img">
      <circle cx="32" cy="32" r="30" fill="#F5EBD8" stroke="#E8A33D" strokeWidth="2.5" />
      {/* 兜帽 */}
      <path d="M14 36c0-14 8-22 18-22s18 8 18 22c0 3-1 5-2 6-1-9-6-14-16-14s-15 5-16 14c-1-1-2-3-2-6z" fill="#9B7EBD" />
      <path d="M16 40c1-9 6-13 16-13s15 4 16 13c0 6-8 9-16 9s-16-3-16-9z" fill="#FBF6EC" />
      {/* 脸 */}
      <circle cx="25.5" cy="40" r="1.8" fill="#3D3227" />
      <circle cx="38.5" cy="40" r="1.8" fill="#3D3227" />
      <path d="M28 46c1.4 1.4 6.6 1.4 8 0" stroke="#3D3227" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="21.5" cy="43.5" r="2.2" fill="#F6C066" opacity="0.6" />
      <circle cx="42.5" cy="43.5" r="2.2" fill="#F6C066" opacity="0.6" />
      {/* 兜帽上的小火苗徽记 */}
      <path
        d="M32 16.5c.3 1.6-1 2.4-1 3.8 0 1.1.9 1.9 2 1.9s2-.8 2-1.9c0-1-.7-1.7-1.4-2.9-.3.6-.8.9-1.1 1 .1-.6 0-1.4-.5-1.9z"
        fill="#E8A33D"
      />
    </svg>
  );
}
