import type { ExtensionMessage } from '@googlebusinessdata/shared-types'

export function sendToBackground(message: ExtensionMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message)
}

export function onMessage(
  handler: (msg: ExtensionMessage, sender: chrome.runtime.MessageSender) => void | Promise<unknown>
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const result = handler(message as ExtensionMessage, sender)
    if (result instanceof Promise) {
      result.then(sendResponse)
      return true // keep channel open
    }
  })
}
