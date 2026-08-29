/** Sends a message to the Lua client; resolves a mock response in browser development. */
export async function fetchNui<T = unknown>(
  eventName: string,
  data?: unknown,
  mockResponse?: T,
): Promise<T> {
  const options = {
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  }

  if (!(window as unknown as { invokeNative?: unknown }).invokeNative) {
    return mockResponse ?? (Promise.resolve({}) as T)
  }

  const resourceName = (window as unknown as { GetParentResourceName?: () => string })
    .GetParentResourceName?.() ?? 'sync_textui'

  const response = await fetch(`https://${resourceName}/${eventName}`, options)
  return (await response.json()) as T
}
