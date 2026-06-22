// Listens for the auth token posted by the web app's /auth/extension-sync page
// and forwards it to the service worker so it can be stored in chrome.storage.session.

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost:3000',
]

window.addEventListener('message', (event: MessageEvent) => {
  if (!ALLOWED_ORIGINS.includes(event.origin)) return
  if (event.data?.type !== 'EXTENSION_AUTH_SYNC') return

  const { accessToken, refreshToken } = event.data as {
    accessToken: string
    refreshToken: string
  }

  if (!accessToken) return

  chrome.runtime.sendMessage({
    type: 'AUTH_TOKEN_UPDATED',
    accessToken,
    refreshToken,
  })
})
