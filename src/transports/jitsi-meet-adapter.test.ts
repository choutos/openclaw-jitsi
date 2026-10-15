import { describe, expect, it } from "vitest";
import { jitsiMeetingPageScripts } from "./jitsi-meet-page-scripts.js";
import { JITSI_MEETINGS_PLATFORM_ADAPTER } from "./jitsi-meet-platform-adapter.js";
import { JITSI_MEETING_SELECTORS } from "./jitsi-meet-selectors.js";

describe("Jitsi meeting adapter", () => {
  it("grants talk-back permission only to the constrained Jitsi origin", () => {
    expect(JITSI_MEETINGS_PLATFORM_ADAPTER.browser.permissions?.({
      allowMicrophone: true,
      meetingUrl: "https://meet.jit.si/OpenClawRoom",
    })).toEqual({
      origin: "https://meet.jit.si",
      permissions: ["audioCapture"],
      optionalPermissions: ["speakerSelection"],
    });

    expect(JITSI_MEETINGS_PLATFORM_ADAPTER.browser.permissions?.({
      allowMicrophone: false,
      meetingUrl: "https://meet.jit.si/OpenClawRoom",
    })).toBeUndefined();
  });

  it("uses selectors maintained by Jitsi's own browser tests", () => {
    expect(JITSI_MEETING_SELECTORS.guestName).toContain("input#premeeting-name-input");
    expect(JITSI_MEETING_SELECTORS.join).toContain('[data-testid="prejoin.joinMeeting"]');
    expect(JITSI_MEETING_SELECTORS.leave).toContain(
      'button[aria-label="Leave the meeting" i]',
    );
  });

  it("generates an owned, camera-off browser join script", () => {
    const script = jitsiMeetingPageScripts.status({
      allowMicrophone: false,
      allowSessionAdoption: false,
      autoJoin: true,
      captureCaptions: true,
      guestName: "OpenClaw Agent",
      meetingSessionId: "jitsi-test",
      meetingUrl: "https://meet.jit.si/OpenClawRoom",
      readOnly: false,
      waitForInCallMs: 1,
    });

    expect(script).toContain("prejoin.joinMeeting");
    expect(script).toContain("Turned the Jitsi camera off");
    expect(script).toContain("__openclawJitsiMeeting");
    expect(script).not.toContain("zoom.us");
  });
});
