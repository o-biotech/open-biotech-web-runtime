import { Icon, IconProps } from "./icon.deps.ts"

export function ErrorIcon(props: IconProps) {
  return <Icon {...props} src="/icons/iconset" icon="error" />;
}
