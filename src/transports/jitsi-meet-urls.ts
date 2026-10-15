import type { MeetingBrowserCandidateTab } from "openclaw/plugin-sdk/meeting-runtime";

type JitsiMeetingIdentity = {
  room: string;
};

function isJitsiHostname(hostname: string): boolean {
  return hostname === "meet.jit.si";
}

function parseJitsiMeetingIdentity(url: string | undefined): JitsiMeetingIdentity | undefined {
  if (!url) {
    return undefined;
  }
  const parsed = URL.parse(url);
  if (
    !parsed ||
    parsed.protocol !== "https:" ||
    parsed.port ||
    parsed.username ||
    parsed.password ||
    !isJitsiHostname(parsed.hostname.toLowerCase())
  ) {
    return undefined;
  }
  const match = parsed.pathname.match(/^\/([^/]+)\/?$/);
  try {
    const room = match?.[1] ? decodeURIComponent(match[1]).trim() : "";
    return room && !/[\s/]/.test(room) ? { room } : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeJitsiMeetingUrl(input: unknown): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Jitsi meeting URL is required");
  }
  const value = input.trim();
  if (!parseJitsiMeetingIdentity(value)) {
    throw new Error("Jitsi meeting URL must use https://meet.jit.si/<room>");
  }
  const parsed = new URL(value);
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

export function normalizeJitsiMeetingUrlForReuse(url: string | undefined): string | undefined {
  const identity = parseJitsiMeetingIdentity(url);
  return identity ? `jitsi:${identity.room.toLowerCase()}` : undefined;
}

export function isSameJitsiMeetingUrl(left: string | undefined, right: string | undefined): boolean {
  const normalizedLeft = normalizeJitsiMeetingUrlForReuse(left);
  const normalizedRight = normalizeJitsiMeetingUrlForReuse(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

export function isRecoverableJitsiMeetingTab(
  tab: MeetingBrowserCandidateTab,
  url?: string,
): boolean {
  if (url) {
    const tabIdentity = parseJitsiMeetingIdentity(tab.url);
    const requestedIdentity = parseJitsiMeetingIdentity(url);
    if (
      !tabIdentity ||
      !requestedIdentity ||
      tabIdentity.room.toLowerCase() !== requestedIdentity.room.toLowerCase()
    ) {
      return false;
    }
    return true;
  }
  if (normalizeJitsiMeetingUrlForReuse(tab.url)) {
    return true;
  }
  return false;
}
