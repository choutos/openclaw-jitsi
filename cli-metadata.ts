import { getRootOptionAwareCommandPath } from "openclaw/plugin-sdk/cli-argv";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";

// Metadata discovery for unrelated commands must not load the meeting runtime.
const descriptor = {
  name: "jitsimeet",
  description: "Join and manage Jitsi meeting guests",
  hasSubcommands: true,
  machineOutput: ({ argv }: { argv: readonly string[] }) =>
    getRootOptionAwareCommandPath(argv, 2).length === 2,
} as const;

export const JITSI_MEETINGS_CLI_METADATA = {
  id: "jitsi-meet",
  name: "Jitsi meetings",
  description: "Jitsi meetings CLI metadata",
  descriptor,
  register(api: OpenClawPluginApi) {
    api.registerCli(() => {}, { descriptors: [descriptor] });
  },
};

export default JITSI_MEETINGS_CLI_METADATA;
