# OpenClaw Jitsi

Experimental Jitsi Meet browser participant plugin for
[OpenClaw](https://github.com/openclaw/openclaw).

It registers the `jitsi_meet` tool and `openclaw jitsimeet` CLI. The plugin uses
OpenClaw's shared meeting runtime for Chrome control, transcription, agent
consults, realtime voice, TTS talk-back, virtual audio, and paired-node routing.

## Status

The first release deliberately supports only public `https://meet.jit.si/<room>`
URLs. Restricting the origin prevents an agent-supplied URL from silently gaining
microphone permission. Configurable self-hosted origins will require an explicit
allowlist.

Supported modes:

- `transcribe`: join muted with the camera off and capture Jitsi captions when
  the room provides them
- `agent`: transcribe meeting audio, ask the selected OpenClaw agent, and speak
  its answer with OpenClaw TTS
- `bidi`: bridge meeting audio to a configured realtime voice provider

The camera is always kept off. The plugin does not interpret incoming video,
publish an avatar/video track, or implement native XMPP Jingle calls.

Requires OpenClaw 2026.10.3 or newer.

## Install

Until a reviewed ClawHub release exists:

```bash
openclaw plugins install git:github.com/choutos/openclaw-jitsi@main
openclaw gateway restart
```

## Configure

The defaults join as `OpenClaw Agent` in `agent` mode. Optional configuration:

```json5
{
  plugins: {
    entries: {
      "jitsi-meet": {
        enabled: true,
        config: {
          defaultMode: "agent",
          chrome: {
            guestName: "OpenClaw Agent",
          },
        },
      },
    },
  },
}
```

Talk-back on macOS requires BlackHole 2ch and SoX. On Linux it requires a
PipeWire-Pulse desktop session and `pactl`, `pacat`, and `parec`. Observe-only
`transcribe` mode does not need the virtual-audio bridge.

Preflight and join:

```bash
openclaw jitsimeet setup --mode transcribe
openclaw jitsimeet join https://meet.jit.si/YourRoom --mode transcribe
```

An agent can call the tool directly:

```json
{
  "action": "join",
  "url": "https://meet.jit.si/YourRoom",
  "transport": "chrome",
  "mode": "agent"
}
```

## Security and limitations

- Joining a meeting sends audio to the configured transcription or realtime
  provider. Obtain participant consent.
- The adapter joins as a guest and may stop at a lobby, password, CAPTCHA, or
  browser permission prompt for manual action.
- Jitsi captions depend on the deployment's transcription support. `agent` and
  `bidi` modes use OpenClaw's realtime audio path instead.
- XMPP call-invite detection and automatic handoff are not part of this package
  yet; pass a Jitsi URL to the tool or CLI.

## Development

```bash
npm install
npm run check
npm test
```

## Provenance

The adapter uses OpenClaw's MIT-licensed browser meeting plugin architecture and
was initially derived from its Zoom meeting adapter. Jitsi DOM selectors are
based on the upstream Jitsi Meet components and browser page objects.
