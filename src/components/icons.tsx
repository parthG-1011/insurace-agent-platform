import type { SVGProps } from "react";

/**
 * Hand-rolled 24x24 stroke icon set — no icon dependency is installed, and the
 * story brief prohibits one. All icons inherit `currentColor` so a single
 * `text-*` utility on the parent sets the colour.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 9 7 7 7-7" />
    </Icon>
  );
}

export function Check(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  );
}

export function X(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function Search(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </Icon>
  );
}

export function Plus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function Sun(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  );
}

export function Moon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 13.5A8.2 8.2 0 0 1 10.5 4a8.5 8.5 0 1 0 9.5 9.5Z" />
    </Icon>
  );
}

export function Menu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function LogOut(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4M6 12h9" />
    </Icon>
  );
}

export function Mail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </Icon>
  );
}

export function AlertCircle(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.2v.1" />
    </Icon>
  );
}

export function Inbox(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 13h4l1.5 3h7L17 13h4" />
      <path d="M4.6 5.6 3 13v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4l-1.6-7.4A2 2 0 0 0 17.5 4h-11a2 2 0 0 0-1.9 1.6Z" />
    </Icon>
  );
}

export function FileText(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z" />
      <path d="M13.5 3v5.5H19M8.5 13h7M8.5 16.5h7" />
    </Icon>
  );
}

export function Users(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3.5 20a6 6 0 0 1 12 0M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 14.4a6 6 0 0 1 3 5.6" />
    </Icon>
  );
}

export function Shield(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 6v6c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function IndianRupee(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h10M7 8.5h10M7 4c4.5 0 7 1.8 7 4.5S11.5 13 7 13h1l7 7" />
    </Icon>
  );
}

export function ExternalLink(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14.5v4a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h4" />
    </Icon>
  );
}

export function LayoutDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
      <rect x="13.5" y="11" width="7" height="9.5" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function Phone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a11.5 11.5 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
    </Icon>
  );
}