import type { MeetingPlatformAdapter } from "openclaw/plugin-sdk/meeting-runtime";

export const jitsiMeetingStatusCall: Parameters<
  typeof MeetingPlatformAdapter.createPageScripts
>[0]["statusCall"] = {
  captionEnableSource: `if (!captionsFinalized && canMutateSession && inCall && !captionsEnabledNow) {
      let captionButton = first(selectors.captions);
      if (!captionButton) {
        (first(selectors.moreActions) || findTextButton(/^more actions$/i))?.click?.();
        await waitForUi();
        captionButton = first(selectors.captions);
      }
      if (captionButton) {
        const alreadyEnabled = captionButton.getAttribute?.("aria-checked") === "true" ||
          captionButton.getAttribute?.("aria-pressed") === "true" ||
          Boolean(firstRaw(selectors.captionRenderer));
        if (!alreadyEnabled) {
          captionButton.click();
          await waitForUi();
        }
        const currentCaptionButton = first(selectors.captions) || captionButton;
        captionsEnabledNow = currentCaptionButton.getAttribute?.("aria-checked") === "true" ||
          currentCaptionButton.getAttribute?.("aria-pressed") === "true" ||
          Boolean(firstRaw(selectors.captionRenderer));
        if (captionsEnabledNow && !alreadyEnabled) {
          notes.push("Enabled Jitsi live captions for transcript capture.");
        }
      }
    }`,
  extraResultSource: "meetingEnded,",
};
