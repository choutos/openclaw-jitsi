import { describe, expect, it } from "vitest";
import {
  isRecoverableJitsiMeetingTab,
  isSameJitsiMeetingUrl,
  normalizeJitsiMeetingUrl,
  normalizeJitsiMeetingUrlForReuse,
} from "./jitsi-meet-urls.js";

describe("Jitsi meeting URL policy", () => {
  it("normalizes a public meet.jit.si room without carrying URL options", () => {
    expect(normalizeJitsiMeetingUrl("https://meet.jit.si/OpenClawRoom?jwt=secret#config.foo=1"))
      .toBe("https://meet.jit.si/OpenClawRoom");
  });

  it("uses a case-insensitive room identity for reuse", () => {
    expect(normalizeJitsiMeetingUrlForReuse("https://meet.jit.si/OpenClawRoom"))
      .toBe("jitsi:openclawroom");
    expect(isSameJitsiMeetingUrl(
      "https://meet.jit.si/OpenClawRoom",
      "https://meet.jit.si/openclawroom/",
    )).toBe(true);
    expect(isRecoverableJitsiMeetingTab(
      { url: "https://meet.jit.si/OpenClawRoom" },
      "https://meet.jit.si/openclawroom",
    )).toBe(true);
  });

  it.each([
    "http://meet.jit.si/room",
    "https://meet.jit.si/",
    "https://meet.jit.si/a/b",
    "https://meet.jit.si:8443/room",
    "https://user:pass@meet.jit.si/room",
    "https://meet.jit.si/room%20name",
    "https://evil.example/room",
    "https://meet.jit.si.evil.example/room",
  ])("rejects a URL outside the constrained MVP: %s", (url) => {
    expect(normalizeJitsiMeetingUrlForReuse(url)).toBeUndefined();
    expect(() => normalizeJitsiMeetingUrl(url)).toThrow(
      "Jitsi meeting URL must use https://meet.jit.si/<room>",
    );
  });
});
