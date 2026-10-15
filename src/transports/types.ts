import type { MeetingPlatformAdapter } from "openclaw/plugin-sdk/meeting-runtime";

type JitsiMeetingsConfig = ReturnType<
  ReturnType<typeof MeetingPlatformAdapter.createPluginConfigSchema>["resolveConfig"]
>;
export type JitsiMeetingsMode = JitsiMeetingsConfig["defaultMode"];
type JitsiMeetingsTransport = "chrome" | "chrome-node";

export type JitsiMeetingsManualActionReason =
  | "jitsi-login-required"
  | "jitsi-admission-required"
  | "jitsi-permission-required"
  | "jitsi-audio-choice-required"
  | "jitsi-camera-required"
  | "jitsi-microphone-required"
  | "jitsi-passcode-required"
  | "jitsi-captcha-required"
  | "jitsi-session-conflict"
  | "browser-control-unavailable";

export type JitsiMeetingsSpeechBlockedReason =
  | JitsiMeetingsManualActionReason
  | "not-in-call"
  | "browser-unverified"
  | "audio-bridge-unavailable"
  | "jitsi-microphone-muted";

type JitsiMeetingsPluginTypes = ReturnType<
  typeof MeetingPlatformAdapter.pluginTypes<
    JitsiMeetingsConfig,
    JitsiMeetingsTransport,
    JitsiMeetingsMode,
    JitsiMeetingsManualActionReason,
    JitsiMeetingsSpeechBlockedReason,
    { meetingEnded?: boolean }
  >
>;
export type JitsiMeetingsTranscriptSnapshot = JitsiMeetingsPluginTypes["TranscriptSnapshot"];
export type JitsiMeetingsChromeHealth = JitsiMeetingsPluginTypes["ChromeHealth"];
