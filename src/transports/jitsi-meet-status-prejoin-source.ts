import type { MeetingPlatformAdapter } from "openclaw/plugin-sdk/meeting-runtime";

export const jitsiMeetingStatusPrelude: Parameters<
  typeof MeetingPlatformAdapter.createPageScripts
>[0]["statusPrelude"] = {
  controlLookupSource: `const findTextButton = (pattern) => [...document.querySelectorAll("button")]
    .find((button) => !button.disabled && pattern.test(label(button)));
  const findTextControl = (pattern) =>
    [...document.querySelectorAll('button, a, [role="button"]')]
      .find((control) => !control.disabled && pattern.test(label(control)));`,
  lifecycleSource: (sources) => `${sources.guestName(true)}
  const leave = first(selectors.leave);
  const continueWithoutDevices = undefined;
  const dismissedDevicePrompt = false;
  const pageText = text(document.body);
  const pageTextLower = pageText.toLowerCase();
  const lobbyWaiting = Boolean(first(selectors.lobby)) ||
    /waiting for (?:the )?moderator|asked to join|let people in the meeting know/i.test(pageTextLower);

  const identityAdoptedInCall = false;
  const identityRerenderedInCall = false;
  const identityAwaitingRerender = false;
${sources.preservedIdentity}
  const meetingEnded = Boolean(first(selectors.postCall)) ||
    /you left the meeting|conference has ended|meeting has ended/i.test(pageTextLower);
  const inCall = Boolean(identityVerified && leave && !meetingEnded);
  if (canMutateSession && identityVerified && meetingOwnerConflict) {
    adoptAudioBridgeSourcesForSession();
  }
  if (canMutateSession && !inCall) retireOwnedAudioBridges();
  if (canMutateSession && identityVerified) {
    window.__openclawJitsiMeeting = {
      ...(priorMeeting?.identity === expectedIdentity && !meetingOwnerConflict ? priorMeeting : {}),
      identity: expectedIdentity,
      sessionId: sessionId || priorMeeting?.sessionId,
      verifiedAt: Date.now(),
      awaitingAdmission: !inCall && lobbyWaiting,
      ...(inCall ? { inCallControl: leave, inCallUrl: location.href } : {}),
    };
  }

  const microphone = first(selectors.microphone) || findTextButton(/mute|unmute|microphone/i);
  let microphoneState = identityVerified ? toggleState(microphone, "microphone") : undefined;
  const refreshMicrophoneState = async () => {
    await waitForUi();
    const currentMicrophone = first(selectors.microphone) || findTextButton(/mute|unmute|microphone/i);
    microphoneState = toggleState(currentMicrophone, "microphone");
  };
  const camera = first(selectors.camera) || findTextButton(/camera|video/i);
  let cameraState = identityVerified ? toggleState(camera, "camera") : undefined;
  let controlManualAction;
  const passcodeInput = firstRaw(selectors.passcode);
  const passcodeRequired = Boolean(passcodeInput) &&
    /meeting password|enter (?:the )?password|invalid password|incorrect password/i.test(
      pageText + " " + label(passcodeInput)
    );
  const captchaRequired = Boolean(firstRaw(selectors.captcha)) ||
    /complete (?:the )?captcha|security check|verify (?:that )?you(?:'re| are) (?:a )?human/i.test(pageTextLower);
  if (identityVerified && !inCall && passcodeRequired) {
    controlManualAction = manualActionFor("jitsi-passcode-required", "Enter the Jitsi meeting password in the OpenClaw browser profile, then retry joining.");
  } else if (identityVerified && !inCall && captchaRequired) {
    controlManualAction = manualActionFor("jitsi-captcha-required", "Complete Jitsi's security check in the OpenClaw browser profile, then retry joining.");
  }

  if (canMutateSession && identityVerified && camera && cameraState === "on" && !controlManualAction) {
    camera.click();
    await waitForUi();
    const currentCamera = first(selectors.camera) || findTextButton(/camera|video/i);
    cameraState = toggleState(currentCamera, "camera");
    if (cameraState === "off") notes.push("Turned the Jitsi camera off.");
  }
  const join = first(selectors.join) ||
    findTextButton(/^\s*(join|join meeting|ask to join)\s*$/i);
  if (identityVerified && (inCall || join) && cameraState !== "off" && !controlManualAction) {
    controlManualAction = manualActionFor("jitsi-camera-required", "Turn the Jitsi camera off and verify the camera control shows it is off, then retry joining.");
  }
${sources.virtualAudioInput({
  selectionSource: `      let selected = Boolean(selectedMicrophoneLabel());`,
})}
${sources.prejoinMicrophone({
  unroutedSource: `      notes.push("The virtual audio input will be selected from Jitsi's audio controls.");`,
  muteInCall: true,
})}
${sources.inCallMicrophone}
  if (identityVerified && (inCall || join) && !allowMicrophone && microphoneState !== "off" && !controlManualAction) {
    controlManualAction = manualActionFor("jitsi-microphone-required", "Mute the Jitsi microphone and verify it stays muted for observe-only mode.");
  }`,
  manualActionSource: (sources) => `  const signInControl = first(selectors.signIn);
  const tenantLoginRequired =
    /log in to join|sign in to join|authentication required|you need to log in/i.test(pageTextLower);
  const loginRequired = tenantLoginRequired ||
    (Boolean(signInControl) && !guestInput && !join && /log in|sign in/i.test(pageTextLower));
${sources.manualActions({ inCallControls: true })}`,
  setupSource: `const document = globalThis.document;
  const pageWindow = document.defaultView || globalThis;
  const HTMLInputElement = pageWindow.HTMLInputElement || globalThis.HTMLInputElement;
  const Event = pageWindow.Event || globalThis.Event;
  const MutationObserver = pageWindow.MutationObserver || globalThis.MutationObserver;`,
};
