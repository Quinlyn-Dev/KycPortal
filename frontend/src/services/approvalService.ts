import { apiClient } from './api'

export interface CustomerDto {
  id: number
  customerCode: string
  customerName: string
  email: string
  phoneNumber: string
  address: string
  divisionCode: string
  divisionName: string
  kycStatus: string
  requiredApprovalLevels: number
  currentApprovalLevel?: number
  submittedBy?: string
  submittedAt?: string
  approvedByLevel1?: string
  approvedAtLevel1?: string
  approvedByLevel2?: string
  approvedAtLevel2?: string
  approvedByLevel3?: string
  approvedAtLevel3?: string
}

export interface ApprovalRequest {
  comments?: string
}

export interface RejectRequest {
  reason: string
}

export const approvalService = {
  async getPendingApprovals(divisionId?: number): Promise<CustomerDto[]> {
    const url = divisionId ? `/approval/pending?divisionId=${divisionId}` : '/approval/pending'
    const response = await apiClient.get(url)
    return response.data
  },

  async approveCustomer(customerId: number, request: ApprovalRequest): Promise<any> {
    const response = await apiClient.post(`/approval/approve/${customerId}`, request)
    return response.data
  },

  async rejectCustomer(customerId: number, request: RejectRequest): Promise<any> {
    const response = await apiClient.post(`/approval/reject/${customerId}`, request)
    return response.data
  },

  async getApprovalHistory(customerId: number): Promise<any[]> {
    const response = await apiClient.get(`/approval/history/${customerId}`)
    return response.data
  },

  async getReadyForSAP(): Promise<CustomerDto[]> {
    const response = await apiClient.get('/approval/ready-for-sap')
    return response.data
  },

  async syncToSAP(customerId: number): Promise<any> {
    const response = await apiClient.post(`/approval/sync-to-sap/${customerId}`)
    return response.data
  }
}
