import type { ExtensionStorage, ExtensionJobStatus } from '@googlebusinessdata/shared-types'

export async function getStorage<K extends keyof ExtensionStorage>(
  keys: K[]
): Promise<Pick<ExtensionStorage, K>> {
  return chrome.storage.sync.get(keys) as Promise<Pick<ExtensionStorage, K>>
}

export async function setStorage(data: Partial<ExtensionStorage>): Promise<void> {
  return chrome.storage.sync.set(data)
}

export async function getSessionStorage<K extends keyof ExtensionStorage>(
  keys: K[]
): Promise<Pick<ExtensionStorage, K>> {
  return chrome.storage.session.get(keys) as Promise<Pick<ExtensionStorage, K>>
}

export async function setSessionStorage(data: Partial<ExtensionStorage>): Promise<void> {
  return chrome.storage.session.set(data)
}

export async function getAuthTokens() {
  const { access_token, refresh_token, user_id } = await getStorage([
    'access_token', 'refresh_token', 'user_id',
  ])
  return { accessToken: access_token, refreshToken: refresh_token, userId: user_id }
}

export async function setAuthTokens(accessToken: string, refreshToken: string, userId: string) {
  await setStorage({ access_token: accessToken, refresh_token: refreshToken, user_id: userId })
}

export async function clearAuth() {
  await chrome.storage.sync.remove(['access_token', 'refresh_token', 'user_id'])
}

export async function getActiveJobId(): Promise<string | undefined> {
  const { active_job_id } = await getSessionStorage(['active_job_id'])
  return active_job_id
}

export async function setActiveJobId(jobId: string | undefined) {
  if (jobId) {
    await setSessionStorage({ active_job_id: jobId })
  } else {
    await chrome.storage.session.remove(['active_job_id'])
  }
}

export async function getJobStatus(): Promise<ExtensionJobStatus | undefined> {
  const { job_status } = await getSessionStorage(['job_status'])
  return job_status
}

export async function setJobStatus(status: ExtensionJobStatus) {
  await setSessionStorage({ job_status: status })
}
