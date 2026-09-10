import apiClient from './client'

export const loginApi = async ({ email, password }) => {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data
}

export const registerApi = async ({ name, email, password }) => {
  const { data } = await apiClient.post('/auth/register', { name, email, password })
  return data
}

export const googleLoginApi = async (idToken) => {
  const { data } = await apiClient.post('/auth/google', { id_token: idToken })
  return data
}

export const updateProfileApi = async ({ name, avatar_url }) => {
  const { data } = await apiClient.put('/auth/me', { name, avatar_url })
  return data
}
