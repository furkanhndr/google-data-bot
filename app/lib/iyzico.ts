// Thin promisified wrapper around the official `iyzipay` SDK (callback-based,
// untyped). Only the Checkout Form flow is implemented — iyzico's hosted
// payment page, no card data ever touches our server (no PCI scope).

import Iyzipay from 'iyzipay'

let client: Iyzipay | null = null

function getClient(): Iyzipay {
  if (client) return client

  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  const uri = process.env.IYZICO_BASE_URL ?? 'https://sandbox-api.iyzipay.com'

  if (!apiKey || !secretKey) throw new Error('IYZICO_API_KEY / IYZICO_SECRET_KEY is not set')

  client = new Iyzipay({ apiKey, secretKey, uri })
  return client
}

export interface CheckoutBuyerInfo {
  name: string
  surname: string
  identityNumber: string
  email: string
  gsmNumber: string
  address: string
  city: string
}

export interface CheckoutFormResult {
  status: string
  token: string
  checkoutFormContent: string
  paymentPageUrl: string
  errorMessage?: string
}

// Creates a hosted Checkout Form session. iyzico requires a full buyer +
// address block even for a single-item digital purchase — there's no
// minimal/guest mode for the Checkout Form API.
export function createCheckoutForm(params: {
  conversationId: string
  price: number
  callbackUrl: string
  buyer: CheckoutBuyerInfo
  basketId: string
  itemName: string
  ip: string
}): Promise<CheckoutFormResult> {
  const iyzipay = getClient()
  const price = params.price.toFixed(2)

  const addressBlock = {
    contactName: `${params.buyer.name} ${params.buyer.surname}`,
    city: params.buyer.city,
    country: 'Turkey',
    address: params.buyer.address,
    zipCode: '00000',
  }

  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(
      {
        locale: Iyzipay.LOCALE.TR,
        conversationId: params.conversationId,
        price,
        paidPrice: price,
        currency: Iyzipay.CURRENCY.TRY,
        basketId: params.basketId,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: params.callbackUrl,
        enabledInstallments: [1],
        buyer: {
          id: params.basketId,
          name: params.buyer.name,
          surname: params.buyer.surname,
          identityNumber: params.buyer.identityNumber,
          email: params.buyer.email,
          gsmNumber: params.buyer.gsmNumber,
          registrationAddress: params.buyer.address,
          ip: params.ip,
          city: params.buyer.city,
          country: 'Turkey',
          zipCode: '00000',
        },
        shippingAddress: addressBlock,
        billingAddress: addressBlock,
        basketItems: [
          {
            id: 'premium-30',
            name: params.itemName,
            category1: 'Yazılım',
            itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
            price,
          },
        ],
      },
      (err: Error | null, result: CheckoutFormResult) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

// Retrieves the final payment result by token — called from our callback
// route. Never trust the redirect alone; this server-to-server call (signed
// with the secret key) is the source of truth for whether payment succeeded.
export function retrieveCheckoutForm(params: { token: string; conversationId: string }): Promise<CheckoutFormResult> {
  const iyzipay = getClient()

  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(
      {
        locale: Iyzipay.LOCALE.TR,
        token: params.token,
        conversationId: params.conversationId,
      },
      (err: Error | null, result: CheckoutFormResult) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
