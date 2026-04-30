import axios, { AxiosInstance } from 'axios'

export interface KonnectConfig {
  apiKey: string
  baseUrl?: string
}

export interface KonnectPaymentRequest {
  amount: number // Montant en millimes (fils tunisiens)
  orderId: string
  description: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  successUrl: string
  failureUrl: string
}

export interface KonnectPaymentResponse {
  paymentUrl: string
  paymentToken: string
  transactionId?: string
}

export interface KonnectTransactionStatus {
  status: 'success' | 'pending' | 'failed'
  transactionId: string
  amount: number
  orderId: string
  timestamp: string
}

class KonnectPaymentService {
  private client: AxiosInstance
  private apiKey: string

  constructor(config: KonnectConfig) {
    this.apiKey = config.apiKey
    const baseUrl = config.baseUrl || 'https://api.konnect.network'

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
  }

  /**
   * Create a payment invoice
   */
  async createInvoice(paymentRequest: KonnectPaymentRequest): Promise<KonnectPaymentResponse> {
    try {
      const payload = {
        amount: paymentRequest.amount,
        type: 'immediate',
        description: paymentRequest.description,
        orderId: paymentRequest.orderId,
        customer: {
          firstName: paymentRequest.customerFirstName,
          lastName: paymentRequest.customerLastName,
          email: paymentRequest.customerEmail,
          phone: paymentRequest.customerPhone
        },
        successUrl: paymentRequest.successUrl,
        failureUrl: paymentRequest.failureUrl,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/konnect`
      }

      const response = await this.client.post('/api/v2/invoices', payload)

      return {
        paymentUrl: response.data.paymentUrl || response.data._links?.payinvlink?.href,
        paymentToken: response.data.token || response.data._id,
        transactionId: response.data._id
      }
    } catch (error: any) {
      console.error('Konnect Invoice Creation Error:', error.response?.data || error.message)
      throw new Error(`Failed to create Konnect invoice: ${error.message}`)
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<KonnectTransactionStatus> {
    try {
      const response = await this.client.get(`/api/v2/invoices/${transactionId}`)

      const status = response.data.status === 'paid' ? 'success' : 
                     response.data.status === 'pending' ? 'pending' : 'failed'

      return {
        status,
        transactionId: response.data._id,
        amount: response.data.amount,
        orderId: response.data.orderId,
        timestamp: response.data.created_at || new Date().toISOString()
      }
    } catch (error: any) {
      console.error('Konnect Status Check Error:', error.response?.data || error.message)
      throw new Error(`Failed to get transaction status: ${error.message}`)
    }
  }

  /**
   * Verify webhook signature (for future implementation)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implement signature verification based on Konnect docs
    // This is a placeholder
    return true
  }

  /**
   * Create refund
   */
  async createRefund(transactionId: string, amount?: number): Promise<{ success: boolean; refundId: string }> {
    try {
      const payload = amount ? { amount } : {}
      const response = await this.client.post(`/api/v2/invoices/${transactionId}/refund`, payload)

      return {
        success: response.data.status === 'refunded',
        refundId: response.data.refund_id || response.data._id
      }
    } catch (error: any) {
      console.error('Konnect Refund Error:', error.response?.data || error.message)
      throw new Error(`Failed to create refund: ${error.message}`)
    }
  }
}

// Export singleton instance
let konnectService: KonnectPaymentService | null = null

export function getKonnectService(): KonnectPaymentService {
  if (!konnectService) {
    const apiKey = process.env.KONNECT_API_KEY
    if (!apiKey) {
      throw new Error('KONNECT_API_KEY environment variable is not set')
    }

    konnectService = new KonnectPaymentService({
      apiKey,
      baseUrl: process.env.KONNECT_BASE_URL
    })
  }

  return konnectService
}

export default KonnectPaymentService
