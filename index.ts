import { MeetingPlatformAdapter } from "openclaw/plugin-sdk/meeting-runtime";
import { JITSI_MEETINGS_CLI_METADATA } from "./cli-metadata.js";
import { JitsiMeetingsInvalidRequestError } from "./src/errors.js";
import type {
  JitsiMeetingsManualActionReason,
  JitsiMeetingsSpeechBlockedReason,
} from "./src/transports/types.js";
import { JITSI_MEETINGS_PLATFORM_ADAPTER } from "./src/transports/jitsi-meet-platform-adapter.js";

const AGENT_CONSULT_TOOL = "openclaw_agent_consult";
const MAX_TIMER_TIMEOUT_MS = 2_147_483_647;

export const jitsiMeetingsPlugin = MeetingPlatformAdapter.defineBrowserMeetingPlugin<
  JitsiMeetingsManualActionReason,
  JitsiMeetingsSpeechBlockedReason
>({
  platform: JITSI_MEETINGS_PLATFORM_ADAPTER,
  labels: {
    meeting: "Jitsi meeting",
    participant: "Jitsi guest",
    brand: "Jitsi",
    microphone: "Jitsi",
    browserPage: "Jitsi",
  },
  config: {
    defaultRealtimeInstructions: `You are joining a private Jitsi meeting as an OpenClaw voice transport. Keep spoken replies brief and natural. In agent mode, wait for OpenClaw consult results and speak them exactly. In bidi mode, answer directly and call ${AGENT_CONSULT_TOOL} for deeper reasoning, current information, or tools.`,
    resolveGatewayOperationTimeoutMs: (config) =>
      Math.max(
        60_000,
        Math.min(
          MAX_TIMER_TIMEOUT_MS,
          config.chrome.waitForInCallMs + config.chrome.joinTimeoutMs * 2 + 30_000,
        ),
      ),
  },
  InvalidRequestError: JitsiMeetingsInvalidRequestError,
  toolUrlDescription: "Jitsi meeting URL",
  transcriptSource: { id: "jitsi", aliases: ["jitsi-meet"], providerName: "Jitsi" },
  hooks: {
    // Normalize before locking so credential reuse sees the exact launched request.
    normalizeJoinRequest: (request, context) => {
      const resolved = context.resolvedJoin(request);
      return { ...request, agentId: resolved.agentId, url: resolved.url };
    },
    // Stateful admission refresh lets the admitted page adopt its existing session.
    isAwaitingAdmission: (session) =>
      session.chrome?.health?.lobbyWaiting === true ||
      session.chrome?.health?.manualAction?.reason === "jitsi-admission-required",
    // Only Jitsi treats a missing or host-ended page as terminal during status.
    afterStatusRefresh: async (session, context) => {
      const confirmedTabMissing = session.chrome?.health?.status === "browser-tab-missing";
      if (session.state === "active" && confirmedTabMissing) {
        session.browserLeft = true;
        await context.endSession(session.id, { keepBrowserTab: true });
      } else if (session.state === "active" && session.chrome?.health?.meetingEnded === true) {
        await context.endSession(session.id);
      }
    },
    // A closed Jitsi realtime engine is absent so a later speak can rebuild it.
    isAudioBridgeActive: (session) =>
      Boolean(session.chrome?.audioBridge && session.chrome.health?.bridgeClosed !== true),
    afterAudioBridgeAttached: (session) => {
      if (session.chrome) {
        session.chrome.health = { ...session.chrome.health, bridgeClosed: false };
      }
    },
    validateLaunchResult: (result) => {
      if (result.browser?.meetingEnded === true) {
        throw new Error("The Jitsi meeting has already ended.");
      }
    },
    // Missing or unreachable browser state is authoritative for Jitsi session reuse;
    // recording it prevents a dead tab from being reported or reused as active.
    recordBrowserRecoveryFailure: (session, failure) => {
      if (!session.chrome) {
        return;
      }
      if (failure.kind === "missing") {
        session.chrome.browserTab = undefined;
        session.browserLeft = true;
      }
      session.chrome.health = {
        ...session.chrome.health,
        inCall: false,
        micMuted: undefined,
        captioning: false,
        audioInputRouted: false,
        audioOutputRouted: false,
        manualAction: { reason: "browser-control-unavailable", message: failure.message },
        status: failure.kind === "missing" ? "browser-tab-missing" : "browser-control",
        notes: [
          ...(session.chrome.health?.notes ?? []).filter((note) => note !== failure.message),
          failure.message,
        ],
      };
      session.updatedAt = new Date().toISOString();
    },
  },
  browserReadinessFailed: (error) => `Jitsi browser readiness refresh failed: ${error}`,
  microphoneMutedReason: "jitsi-microphone-muted",
  setup: {
    captionsMessage: (mode) =>
      mode === "transcribe"
        ? "Jitsi live-caption capture is enabled and ready"
        : "Caption scraping is not used by talk-back modes",
    connectedNodeMessage: (node) => `Connected Jitsi meeting node ready: ${node}`,
    guestJoinCheck: (config) => {
      const ok = Boolean(
        config.chrome.guestName &&
        config.chrome.autoJoin &&
        (config.chrome.launch || config.chrome.reuseExistingTab),
      );
      return {
        ok,
        message: ok
          ? "Guest name, auto-join, and a Chrome launch or reuse path are configured"
          : "Set chrome.guestName, chrome.autoJoin, and either chrome.launch or chrome.reuseExistingTab for unattended guest joins",
      };
    },
    missingNodeIdMessage: "Connected Jitsi meetings node did not include a node id.",
  },
  defaultSpeechMessage: "Say exactly: Jitsi speech test complete.",
  shouldWaitForListening: (session) => Boolean(session.chrome?.browserTab?.targetId),
  sharePrerequisiteDeadline: true,
  preserveTrackedBrowserOnEngineFailure: true,
  nodePolicyDeniedCode: "JITSI_MEETINGS_NODE_POLICY_DENIED",
  cli: {
    descriptor: JITSI_MEETINGS_CLI_METADATA.descriptor,
    joinDescription: "join a Jitsi meeting as a guest",
  },
});

export default jitsiMeetingsPlugin.plugin;
