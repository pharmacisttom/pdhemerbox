function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (e) {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  localStorage.setItem(
    'medbox_last_activity',
    new Date().getTime()
  );
}

function updateLastActivity() {
  localStorage.setItem(
    'medbox_last_activity',
    new Date().getTime()
  );
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('medbox_last_activity');
}

function isLoggedIn() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return false;
  }

  const lastActivity = localStorage.getItem('medbox_last_activity');

  if (!lastActivity) {
    clearSession();
    return false;
  }

  const now = new Date().getTime();
  const diffMinutes = (now - Number(lastActivity)) / 1000 / 60;

  if (diffMinutes > SESSION_TIMEOUT_MINUTES) {
    clearSession();
    return false;
  }

  return true;
}

function requireLogin() {
  if (!isLoggedIn()) {

    clearSession();

    if (
      !window.location.pathname.includes('login.html') &&
      !window.location.pathname.includes('register.html')
    ) {
      window.location.href = 'login.html';
    }

    return false;
  }

  updateLastActivity();

  return true;
}

function requireRole(allowedRoles = []) {

  const user = getUser();

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (!allowedRoles.includes(user.role)) {

    Swal.fire({
      icon: 'error',
      title: 'ไม่มีสิทธิ์เข้าใช้งาน',
      text: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้'
    }).then(() => {
      window.location.href = 'dashboard.html';
    });

    return;
  }
}

async function logout() {

  const confirm = await Swal.fire({
    title: 'ออกจากระบบ',
    text: 'ต้องการออกจากระบบใช่หรือไม่',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ออกจากระบบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (!confirm.isConfirmed) {
    return;
  }

  try {

    const token = getToken();
    const user = getUser();

    if (token) {

      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'logout',
          token: token,
          user_id: user?.user_id || '',
          username: user?.username || ''
        })
      });

    }

  } catch (error) {
    console.error(error);
  }

  clearSession();

  Swal.fire({
    icon: 'success',
    title: 'ออกจากระบบสำเร็จ',
    timer: 1000,
    showConfirmButton: false
  }).then(() => {
    window.location.href = 'login.html';
  });
}

function getRoleName(role) {

  return ROLES[role] || role;

}

function getStatusLabel(status) {

  return STATUS_LABELS[status] || status;

}

function formatThaiDate(dateValue) {

  if (!dateValue) return '-';

  try {

    const date = new Date(dateValue);

    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  } catch (e) {

    return dateValue;

  }
}

function formatThaiDateOnly(dateValue) {

  if (!dateValue) return '-';

  try {

    const date = new Date(dateValue);

    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  } catch (e) {

    return dateValue;

  }
}

function showLoading(title = 'กำลังประมวลผล') {

  Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

}

function closeLoading() {
  Swal.close();
}

function successAlert(message) {

  return Swal.fire({
    icon: 'success',
    title: 'สำเร็จ',
    text: message
  });

}

function errorAlert(message) {

  return Swal.fire({
    icon: 'error',
    title: 'เกิดข้อผิดพลาด',
    text: message
  });

}

function warningAlert(message) {

  return Swal.fire({
    icon: 'warning',
    title: 'แจ้งเตือน',
    text: message
  });

}

function escapeHtml(text) {

  if (text === null || text === undefined) {
    return '';
  }

  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

}

function generateId(prefix = '') {

  const now = new Date().getTime();
  const rand = Math.floor(Math.random() * 1000);

  return prefix + now + rand;

}

window.addEventListener('click', updateLastActivity);
window.addEventListener('keydown', updateLastActivity);
window.addEventListener('mousemove', updateLastActivity);
window.addEventListener('touchstart', updateLastActivity);

document.addEventListener('DOMContentLoaded', () => {

  if (
    window.location.pathname.includes('login.html') ||
    window.location.pathname.includes('register.html')
  ) {
    return;
  }

  requireLogin();

});
