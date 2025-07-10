const API_BASE = '/api/user';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function fetchUserProfile() {
  const res = await fetch(`${API_BASE}/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(data: { username?: string; email?: string; avatar?: string }) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  // Response may include a new token if email was changed
  return res.json();
}

export async function changeUserPassword(oldPassword: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) throw new Error('Failed to change password');
  return res.json();
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload avatar');
  return res.json();
} 