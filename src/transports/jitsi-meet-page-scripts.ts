import { MeetingPlatformAdapter } from "openclaw/plugin-sdk/meeting-runtime";
import { JITSI_MEETING_SELECTORS } from "./jitsi-meet-selectors.js";
import { jitsiMeetingStatusCall } from "./jitsi-meet-status-call-source.js";
import { jitsiMeetingStatusPrelude } from "./jitsi-meet-status-prejoin-source.js";
import { normalizeJitsiMeetingUrlForReuse } from "./jitsi-meet-urls.js";

function pageIdentityFunctionSource(): string {
  return `const meetingIdentity = (rawUrl) => {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "meet.jit.si") {
        return undefined;
      }
      const room = parsed.pathname.match(/^\\/([^/]+)\\/?$/)?.[1];
      return room ? "jitsi:" + decodeURIComponent(room).toLowerCase() : undefined;
    } catch {}
    return undefined;
  };`;
}

function jitsiMeetingToggleStateFunctionSource(): string {
  return `(input) => {
    const value = String(input?.label || "").toLowerCase().replace(/\\s+/g, " ").trim();
    if (!value) return undefined;
    if (input?.kind === "camera") {
      if (/\\bstop (?:camera|video)\\b|\\bturn (?:your )?camera off\\b/.test(value)) return "on";
      if (/\\bstart (?:camera|video)\\b|\\bturn (?:your )?camera on\\b/.test(value)) return "off";
      return undefined;
    }
    if (/\\bmute (?:your )?microphone\\b/.test(value)) return "on";
    if (/\\bunmute (?:your )?microphone\\b/.test(value)) return "off";
    return undefined;
  }`;
}

export const jitsiMeetingPageScripts = MeetingPlatformAdapter.createPageScripts({
  platform: {
    audioOutputElementIdPrefix: "openclaw-jitsi-audio-output-",
    manualActionReasonPrefix: "jitsi",
    displayName: "Jitsi",
    globals: {
      audioOutputs: "__openclawJitsiAudioOutputs",
      captionArchive: "__openclawJitsiCaptionArchive",
      captions: "__openclawJitsiCaptions",
      meeting: "__openclawJitsiMeeting",
    },
  },
  normalizeUrl: normalizeJitsiMeetingUrlForReuse,
  pageIdentitySource: pageIdentityFunctionSource,
  selectors: JITSI_MEETING_SELECTORS,
  toggleStateFunction: jitsiMeetingToggleStateFunctionSource,
  statusPrelude: jitsiMeetingStatusPrelude,
  statusCall: jitsiMeetingStatusCall,
  leave: {
    controlSource: `const first = (list) => {
    for (const selector of list) {
      const node = document.querySelector(selector);
      if (!node) continue;
      return node.matches?.("button") ? node : node.querySelector?.("button") || node.closest?.("button") || node;
    }
    return undefined;
  };
  const text = (node) => (node?.innerText || node?.textContent || "").trim();
  const findTextButton = (pattern) => [...document.querySelectorAll("button")]
    .find((button) => !button.disabled && pattern.test(text(button)));
  const leave = first(selectors.leave);
  const confirmation = first(selectors.leaveConfirmation) || findTextButton(/^leave meeting$/i);
  const postCall = !leave && (first(selectors.postCall) ||
    /you left the meeting|conference has ended|meeting has ended/i.test(text(document.body)));
  const currentUrlMatches = Boolean(expectedIdentity && currentIdentity === expectedIdentity);`,
    departedMarkerSource: "postCall",
    documentSetupSource: `const document = globalThis.document;`,
    meetingStateSource: "sessionId: expectedSessionId || state?.sessionId,",
    sessionMatchSource: `const sessionAdoptedFromUrl = Boolean(
    enforceSessionOwnership &&
    !state?.sessionId &&
    currentIdentity === expectedIdentity &&
    (!state?.identity || state.identity === expectedIdentity)
  );
  const sessionMatched = !enforceSessionOwnership ||
    state?.sessionId === expectedSessionId ||
    sessionAdoptedFromUrl;`,
  },
});
