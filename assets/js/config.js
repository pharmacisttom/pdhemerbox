const API_URL = 'https://script.google.com/macros/s/AKfycbxTeqGF1jGciWAyhP4w-NageotGJw9H2emofDDmPpJ_zYhvAjK-3IMwjcsC4FkfZX301g/exec';

const APP_NAME = 'ระบบควบคุมเบิกจ่ายกล่องยาฉุกเฉินช่วยชีวิต';
const HOSPITAL_NAME = 'ห้องยา โรงพยาบาลปลวกแดง';

const TOKEN_KEY = 'medbox_token';
const USER_KEY = 'medbox_user';

const SESSION_TIMEOUT_MINUTES = 480;

const ROLES = {
  admin: 'แอดมินระบบ',
  box_manager: 'ผู้จัดกล่องยา',
  box_dispenser: 'ผู้จ่ายกล่องยา',
  requester: 'ผู้เบิกกล่องยา'
};

const STATUS_LABELS = {
  pending: 'รอเปิดใช้งาน',
  active: 'ใช้งาน',
  inactive: 'ปิดใช้งาน',
  submitted: 'รอตรวจสอบ',
  approved: 'อนุมัติแล้ว',
  dispensed: 'จ่ายแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก'
};

const IMAGE_MAX_SIZE_MB = 5;
