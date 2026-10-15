// Prefer selectors exercised by Jitsi Meet's own browser page objects.
export const JITSI_MEETING_SELECTORS = {
  continueInBrowser: [],
  guestName: ["input#premeeting-name-input", '[data-testid="lobby.nameField"]'],
  join: ['[data-testid="prejoin.joinMeeting"]', '[data-testid="lobby.knockButton"]'],
  microphone: [
    'button[aria-label="Mute microphone" i]',
    'button[aria-label="Unmute microphone" i]',
  ],
  camera: [
    'button[aria-label="Stop camera" i]',
    'button[aria-label="Start camera" i]',
  ],
  deviceSettings: ["#audio-settings-button", 'button[aria-label="Audio settings" i]'],
  microphoneDevice: ["#audio-settings-button"],
  microphoneDeviceMenu: ["#audio-settings-dialog"],
  microphoneDeviceScope: "#audio-settings-dialog",
  selectedMicrophoneDevice: [
    '[role="menuitemradio"][aria-checked="true"]',
  ],
  audioDeviceOptions: ['[role="menuitemradio"]'],
  leave: ['button[aria-label="Leave the meeting" i]', ".hangup-button"],
  leaveConfirmation: ['button[aria-label="Leave meeting" i]'],
  postCall: ["#reload", '[data-testid="lobby.joinRejectedMessage"]'],
  lobby: [".lobby-screen-content .joining-message"],
  signIn: ['button[aria-label*="log in" i]', 'button[aria-label*="sign in" i]'],
  passcode: [
    'input[type="password"]',
    '[data-testid="lobby.password"]',
  ],
  captcha: [
    'iframe[src*="recaptcha" i]',
    'iframe[title*="captcha" i]',
    ".g-recaptcha",
    "[data-sitekey]",
    '[class*="captcha" i]',
  ],
  permissionPrompt: [],
  moreActions: [
    'button[aria-label="More actions" i]',
    'button[aria-label="More actions menu" i]',
  ],
  captions: [
    'button[aria-label="Toggle subtitles" i]',
    'button[aria-label="Closed captions" i]',
  ],
  captionsOff: [],
  captionRenderer: ['[class*="transcriptionSubtitles"]'],
  captionContent: ["body"],
  captionRows: ['[class*="transcriptionSubtitles"] p'],
  captionAuthor: [],
  captionText: ["span"],
} as const;
