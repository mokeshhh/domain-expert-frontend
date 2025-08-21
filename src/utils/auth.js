// src/utils/auth.js
export function login(token) {
  localStorage.setItem('token', token);
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
}
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}
