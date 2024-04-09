import { Icon, IconProps } from "./icon.deps.ts"

export function EmulatedDeviceIcon(props: IconProps) {
  return <Icon {...props} src="/icons/iconset" icon="emulated-device" />;
}
