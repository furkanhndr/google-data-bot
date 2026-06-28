// The official `iyzipay` SDK ships no type declarations — it's a plain
// callback-based JS client. We only touch a handful of well-known static
// constants and constructor options through app/lib/iyzico.ts, so a loose
// `any`-shaped declaration is enough; that file owns the real request/result
// shapes via its own interfaces.
declare module 'iyzipay' {
  interface IyzipayConfig {
    apiKey: string
    secretKey: string
    uri: string
  }

  class Iyzipay {
    constructor(config: IyzipayConfig)
    static LOCALE: { TR: string; EN: string }
    static CURRENCY: { TRY: string; [key: string]: string }
    static PAYMENT_GROUP: { PRODUCT: string; LISTING: string; SUBSCRIPTION: string }
    static BASKET_ITEM_TYPE: { PHYSICAL: string; VIRTUAL: string }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [resource: string]: any
  }

  export default Iyzipay
}
