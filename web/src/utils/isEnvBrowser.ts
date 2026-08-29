/** True when running in a normal browser rather than the FiveM CEF environment. */
export function isEnvBrowser(): boolean {
  return !(window as unknown as { invokeNative?: unknown }).invokeNative
}
