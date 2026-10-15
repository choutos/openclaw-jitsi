import {
  MeetingPlatformAdapter,
  type MeetingBrowserJoinSession,
} from "openclaw/plugin-sdk/meeting-runtime";
import type {
  JitsiMeetingsChromeHealth,
  JitsiMeetingsMode,
  JitsiMeetingsTranscriptSnapshot,
} from "./types.js";
import { jitsiMeetingPageScripts } from "./jitsi-meet-page-scripts.js";
import {
  isRecoverableJitsiMeetingTab,
  isSameJitsiMeetingUrl,
  normalizeJitsiMeetingUrl,
  normalizeJitsiMeetingUrlForReuse,
} from "./jitsi-meet-urls.js";

export const JITSI_MEETINGS_PLATFORM_ADAPTER = MeetingPlatformAdapter.create<
  MeetingBrowserJoinSession<JitsiMeetingsMode>,
  JitsiMeetingsMode,
  JitsiMeetingsChromeHealth,
  JitsiMeetingsTranscriptSnapshot
>({
  id: "jitsi-meet",
  displayName: "Jitsi Meet",
  browserLabel: "Jitsi meeting",
  logScope: "[jitsi-meet]",
  agentConsult: {
    surface: "a private Jitsi meeting",
    userLabel: "Participant",
    assistantLabel: "Agent",
    questionSourceLabel: "participant",
    workingResponseLabel: "participant",
    extraSystemPrompt: [
      "You are a behind-the-scenes consultant for a live meeting voice agent.",
      "Prioritize a fast, speakable answer over exhaustive investigation.",
      "Use only bounded, task-relevant tool calls.",
      "Never print secrets or dump environment variables.",
      "Be accurate, brief, and speakable.",
    ].join(" "),
  },
  session: {
    idPrefix: "jitsi_meeting",
    participantIdentity: (transport) =>
      transport === "chrome-node"
        ? "Jitsi guest in Chrome on a paired node"
        : "Jitsi guest in the OpenClaw Chrome profile",
  },
  nodeCommandName: "jitsimeet.chrome",
  nodeConfigPath: "plugins.entries.jitsi-meet.config.chromeNode.node",
  urls: {
    validateAndNormalize: normalizeJitsiMeetingUrl,
    normalizeForReuse: normalizeJitsiMeetingUrlForReuse,
    isSameMeeting: isSameJitsiMeetingUrl,
    buildJoinUrl: (session) => session.url,
    accountHint: () => undefined,
    isPreferredJoinUrl: (url) => Boolean(normalizeJitsiMeetingUrlForReuse(url)),
    isRecoverableTab: isRecoverableJitsiMeetingTab,
    localeAction: () => undefined,
  },
  ...MeetingPlatformAdapter.createBrowserAdapterOptions<
    JitsiMeetingsMode,
    JitsiMeetingsChromeHealth,
    JitsiMeetingsTranscriptSnapshot
  >({
    displayName: "Jitsi",
    manualActionReasonPrefix: "jitsi",
    admissionReasons: ["jitsi-passcode-required", "jitsi-captcha-required"],
    retryCaptions: true,
    unavailableMessage:
      "Open the OpenClaw browser profile, finish the Jitsi admission or permission prompt, then retry.",
    origin: (meetingUrl) =>
      normalizeJitsiMeetingUrlForReuse(meetingUrl) ? "https://meet.jit.si" : undefined,
    scripts: jitsiMeetingPageScripts,
    statusFields: (parsed) => ({
      meetingEnded: typeof parsed.meetingEnded === "boolean" ? parsed.meetingEnded : undefined,
    }),
  }),
});
