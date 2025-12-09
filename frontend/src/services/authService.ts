import { apiClient } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterUserRequest {
  username: string
  email: string
  password: string
  fullName: string
  roleId: number
  userApprovals?: UserApprovalDto[]
}

export interface UserApprovalDto {
  id?: number
  userId?: number
  divisionId: number
  divisionCode?: string
  divisionName?: string
  approvalLevel: number
  isActive?: boolean
}

export interface DivisionDto {
  id: number
  divisionCode: string
  divisionName: string
  description: string
}

export interface UserDto {
  id: number
  username: string
  email: string
  fullName: string
  roleName: string
  roleId: number
  isActive: boolean
  userApprovals?: UserApprovalDto[]
}

export interface LoginResponse {
  token: string
  user: UserDto
}

export interface Role {
  id: number
  roleName: string
  description: string
  maxApprovalLevel?: number | null
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(userData: RegisterUserRequest): Promise<UserDto> {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get('/admin/roles')
    return response.data
  },

  async getDivisions(): Promise<DivisionDto[]> {
    const response = await apiClient.get('/admin/divisions')
    return response.data
  },

  async getUsers(): Promise<UserDto[]> {
    const response = await apiClient.get('/admin/users')
    return response.data
  },
  async updateUser(id: number, data: { fullName?: string; email?: string; roleId?: number; isActive?: boolean }): Promise<UserDto> {
    const response = await apiClient.put(`/admin/users/${id}`, data)
    return response.data.user
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`)
  },
}
