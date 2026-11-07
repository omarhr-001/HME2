import { STATIC_AUTH_DISABLED_MESSAGE } from './static-mode'

function unavailable() {
  return { success: false as const, error: STATIC_AUTH_DISABLED_MESSAGE }
}

export async function signUp(_email: string, _password: string, _firstName: string, _lastName: string) {
  return unavailable()
}

export async function signIn(_email: string, _password: string) {
  return unavailable()
}

export async function signOut() {
  return unavailable()
}

export async function getCurrentUser() {
  return null
}

export async function resetPasswordForEmail(_email: string) {
  return unavailable()
}

export async function updatePassword(_newPassword: string) {
  return unavailable()
}
