import crypto from 'crypto';
import qs from 'qs'; // Dùng qs thay vì querystring để đúng với code mẫu VNPay

// VNPay Configuration
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || '';
const VNPAY_SECRET_KEY = process.env.VNPAY_SECRET_KEY || '';
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/orders/payment/vnpay-return';
const VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || 'http://localhost:3000/api/orders/payment/vnpay-ipn';

/**
 * Sắp xếp object theo thứ tự alphabet (theo chuẩn VNPay)
 * Copy từ code mẫu VNPay để đảm bảo tính chính xác
 * @param {Object} obj - Object cần sắp xếp
 * @returns {Object} Object đã được sắp xếp
 */
// Function sortObject theo đúng code mẫu VNPay
const sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
};

/**
 * Tạo payment URL từ VNPay
 * @param {Object} params - Thông tin thanh toán
 * @param {String} params.orderId - Mã đơn hàng
 * @param {Number} params.amount - Số tiền thanh toán (VND)
 * @param {String} params.orderDescription - Mô tả đơn hàng
 * @param {String} params.orderType - Loại đơn hàng
 * @param {String} params.locale - Ngôn ngữ (vn, en)
 * @param {String} params.ipAddr - Địa chỉ IP khách hàng
 * @returns {String} Payment URL
 */
export const createPaymentUrl = (params) => {
  // Kiểm tra cấu hình VNPay
  if (!VNPAY_TMN_CODE || !VNPAY_SECRET_KEY) {
    throw new Error('VNPAY_TMN_CODE và VNPAY_SECRET_KEY phải được cấu hình trong .env');
  }

  const {
    orderId,
    amount,
    orderDescription = 'Thanh toan don hang',
    orderType = 'other',
    locale = 'vn',
    ipAddr = '127.0.0.1'
  } = params;

  // Validate inputs
  if (!orderId) {
    throw new Error('orderId is required');
  }
  if (!amount || amount <= 0) {
    throw new Error('amount must be greater than 0');
  }

  // Set timezone GMT+7 (Asia/Ho_Chi_Minh)
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const date = new Date();
  
  // Format date: yyyyMMddHHmmss (theo chuẩn VNPay, GMT+7)
  // VNPay yêu cầu timezone GMT+7 (Asia/Ho_Chi_Minh)
  const formatDateVNPay = (d) => {
    // Chuyển sang timezone GMT+7
    const offset = 7 * 60; // GMT+7 offset in minutes
    const localTime = new Date(d.getTime() + (offset * 60 * 1000));
    const utcTime = new Date(localTime.getTime() - (d.getTimezoneOffset() * 60 * 1000));
    
    const year = utcTime.getUTCFullYear();
    const month = String(utcTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcTime.getUTCDate()).padStart(2, '0');
    const hours = String(utcTime.getUTCHours()).padStart(2, '0');
    const minutes = String(utcTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utcTime.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };
  
  const createDate = formatDateVNPay(date);
  console.log('VNPay createDate:', createDate);
  
  // Expire date: +15 phút
  const expireDateObj = new Date(date.getTime() + 15 * 60 * 1000);
  const expireDate = formatDateVNPay(expireDateObj);
  console.log('VNPay expireDate:', expireDate);

  // Chuẩn hóa mô tả đơn hàng (Tiếng Việt không dấu, không ký tự đặc biệt)
  const normalizeOrderInfo = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
      .replace(/[^\w\s]/g, ' ') // Thay ký tự đặc biệt bằng space
      .replace(/\s+/g, ' ') // Xóa space thừa
      .trim();
  };

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Locale: locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: normalizeOrderInfo(orderDescription),
    vnp_OrderType: orderType,
    vnp_Amount: Math.round(amount * 100), // VNPay yêu cầu số tiền nhân 100, phải là số nguyên
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate
  };

  // Sắp xếp lại các tham số theo thứ tự alphabet (theo chuẩn VNPay)
  const sortedParams = sortObject(vnp_Params);
  console.log('VNPay sortedParams:', JSON.stringify(sortedParams, null, 2));

  // Tạo query string để tính chữ ký (theo chuẩn VNPay)
  const signData = qs.stringify(sortedParams, { encode: false });
  console.log('VNPay signData:', signData);
  
  // Tạo chữ ký với SHA512
  const hmac = crypto.createHmac('sha512', VNPAY_SECRET_KEY);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  console.log('VNPay secureHash:', signed);
  
  // Thêm chữ ký vào params
  sortedParams['vnp_SecureHash'] = signed;

  // Tạo URL thanh toán
  const paymentUrl = VNPAY_URL + '?' + qs.stringify(sortedParams, { encode: false });
  console.log('VNPay paymentUrl:', paymentUrl);
  
  return paymentUrl;
};

/**
 * Xác thực chữ ký từ VNPay callback
 * @param {Object} vnp_Params - Các tham số từ VNPay callback
 * @returns {Boolean} true nếu chữ ký hợp lệ
 */
export const verifySecureHash = (vnp_Params) => {
  const secureHash = vnp_Params['vnp_SecureHash'];
  
  // Tạo object copy để không thay đổi object gốc
  const paramsCopy = { ...vnp_Params };
  delete paramsCopy['vnp_SecureHash'];
  delete paramsCopy['vnp_SecureHashType'];

  // Sắp xếp lại các tham số (theo chuẩn VNPay)
  const sortedParams = sortObject(paramsCopy);

  // Tạo query string để tính chữ ký (theo chuẩn VNPay)
  const signData = qs.stringify(sortedParams, { encode: false });
  
  // Tạo chữ ký với SHA512
  const hmac = crypto.createHmac('sha512', VNPAY_SECRET_KEY);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  return secureHash === signed;
};

// Export các URL để sử dụng trong controller
export { VNPAY_RETURN_URL, VNPAY_IPN_URL };

