export type User = {
  id: string
  fullName: string
  email: string
  profession?: string
  country?: string
  city?: string
  isAdmin: boolean
  createdAt: string
  lastLoginAt?: string
}