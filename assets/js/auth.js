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

function hasPrivacyConsent() {
  try {
    const consent = JSON.parse(localStorage.getItem(PRIVACY_CONSENT_KEY));
    return Boolean(consent && consent.accepted === true && consent.version === 1);
  } catch (e) {
    return false;
  }
}

function setPrivacyConsent() {
  localStorage.setItem(
    PRIVACY_CONSENT_KEY,
    JSON.stringify({
      accepted: true,
      version: 1,
      accepted_at: new Date().toISOString()
    })
  );
}

function clearPrivacyConsent() {
  localStorage.removeItem(PRIVACY_CONSENT_KEY);
  clearSession();
}

async function showPrivacyNotice(options = {}) {
  const result = await Swal.fire({
    icon: 'info',
    title: 'ประกาศการใช้ข้อมูลส่วนบุคคลและคุกกี้',
    html: `
      <div style="text-align:left">
        <p><b>Emergency MedBox</b> ใช้ข้อมูลส่วนบุคคลเท่าที่จำเป็นเพื่อยืนยันตัวตน กำหนดสิทธิ์ บันทึกการเบิก/ใช้ยา ตรวจสอบย้อนหลัง และรักษาความปลอดภัยของระบบ</p>
        <p><b>ข้อมูลที่เกี่ยวข้อง:</b> ชื่อผู้ใช้ ชื่อ-สกุล หน่วยงาน บทบาทการใช้งาน ประวัติการทำรายการ รหัสกล่องยา รายการยา รูปภาพที่แนบ และข้อมูลวันเวลาใช้งาน</p>
        <p><b>คุกกี้/ข้อมูลบนอุปกรณ์:</b> ระบบนี้ไม่ใช้คุกกี้เพื่อโฆษณาหรือการตลาด แต่ใช้ <code>localStorage</code> เพื่อเก็บ token การเข้าสู่ระบบ ข้อมูลผู้ใช้ เวลากิจกรรมล่าสุด และสถานะการยอมรับประกาศนี้</p>
        <p><b>การส่งข้อมูล:</b> ข้อมูลถูกส่งไปยัง API/Google Apps Script ที่ระบบกำหนด เพื่อประมวลผลตามวัตถุประสงค์ของงานกล่องยาฉุกเฉิน</p>
        <p><b>สิทธิของผู้ใช้:</b> สามารถติดต่อผู้ดูแลระบบเพื่อขอเข้าถึง แก้ไข ตรวจสอบ หรือขอจัดการข้อมูลตามนโยบายของหน่วยงานและกฎหมายคุ้มครองข้อมูลส่วนบุคคล</p>
        <p class="mb-0 text-muted">การกด “ยอมรับและใช้งานระบบ” หมายถึงท่านรับทราบประกาศนี้และยินยอมให้ระบบจัดเก็บข้อมูลที่จำเป็นต่อการใช้งาน</p>
      </div>
    `,
    width: 760,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCancelButton: true,
    confirmButtonText: 'ยอมรับและใช้งานระบบ',
    cancelButtonText: 'ไม่ยอมรับ',
    reverseButtons: true
  });

  if (result.isConfirmed) {
    setPrivacyConsent();
    return true;
  }

  if (options.redirectOnReject) {
    clearPrivacyConsent();
    Swal.fire({
      icon: 'warning',
      title: 'ยังไม่สามารถใช้งานระบบได้',
      text: 'กรุณายอมรับประกาศการใช้ข้อมูลส่วนบุคคลและคุกกี้ก่อนใช้งานระบบ'
    });
  }

  return false;
}

async function ensurePrivacyConsent(options = {}) {
  if (hasPrivacyConsent()) {
    return true;
  }

  return showPrivacyNotice(options);
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
  if (!hasPrivacyConsent()) {
    clearSession();

    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }

    return false;
  }

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
