import api from './api';

// Try to find a Customer record that maps to a given Account id.
// The backend does not provide a direct `customer/by-account/{accountId}` endpoint
// in this codebase, so we fetch the customers list and lookup by `account.id`.
export const getCustomerIdByAccountId = async (accountId) => {
  if (!accountId) return null;
  try {
    const res = await api.get('/api/customers');
    let list = [];

    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data && Array.isArray(res.data.content)) {
      list = res.data.content;
    }

    const found = list.find(c => c.account && String(c.account.id) === String(accountId));
    return found ? found.id : null;
  } catch (err) {
    console.warn('getCustomerIdByAccountId error', err);
    return null;
  }
};

// Get addresses for a given customer id
export const getAddressesByCustomerId = async (customerId) => {
  if (!customerId) return [];
  try {
    const res = await api.get(`/api/addresses/customer/${customerId}`);
    // Normalize: backend may return array or paged content
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.content)) return res.data.content;
    return [];
  } catch (err) {
    console.warn('getAddressesByCustomerId error', err);
    return [];
  }
};

// Convenience: read current account id from localStorage, resolve customer id and return default address
export const getDefaultAddressForCurrentUser = async () => {
  try {
    const userStored = localStorage.getItem('user');
    if (!userStored) return null;
    const user = JSON.parse(userStored);
    const accountId = user && user.id ? user.id : null;
    if (!accountId) return null;

    // Try to get customer id
    const customerId = await getCustomerIdByAccountId(accountId) || accountId;

    const addresses = await getAddressesByCustomerId(customerId);
    if (!Array.isArray(addresses) || addresses.length === 0) return null;

    const defaultAddr = addresses.find(a => a.default === true) || addresses[0];
    return defaultAddr || null;
  } catch (err) {
    console.warn('getDefaultAddressForCurrentUser error', err);
    return null;
  }
};



// Create a new address
// Payload structure:
// {
//   "customerId": 123 or null (for guest),
//   "fullName": "Nguyen Van A",
//   "phone": "0123456789",
//   "address": "123 Nguyen Hue",
//   "city": "Quan 1",
//   "state": "Ho Chi Minh",
//   "country": "Vietnam",
//   "isDefault": false
// }
export const createAddress = async (addressPayload) => {
  try {
    const token = localStorage.getItem('jwtToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const payload = { ...addressPayload };
    
    console.log('🔵 Sending address payload to backend:', payload);
    
    const res = await api.post('/api/addresses', payload, config);
    return res.data;
  } catch (err) {
    console.error('createAddress error', err);
    throw err;
  }
};

// Create order by posting to /api/orders with exact payload structure
// Payload structure:
// {
//   "customerId": 123,
//   "addressId": 456,
//   "orderDate": "2025-12-07T13:00:00",
//   "status": "PENDING",
//   "totalAmount": 150000,
//   "shippingFee": 30000,
//   "discount": 0,
//   "orderDetails": [
//     {
//       "productVariantId": 789,
//       "quantity": 2,
//       "price": 50000,
//       "subtotal": 100000
//     }
//   ]
// }
export const createOrder = async (orderPayload) => {
  try {
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwtToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    // Add Authorization header if token exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const payload = { ...orderPayload };
    
    console.log('🔵 Sending order payload to backend:', payload);
    
    const res = await api.post('/api/orders', payload, config);
    return res.data;
  } catch (err) {
    console.error('createOrder error', err);
    throw err;
  }
};

export default {
  getCustomerIdByAccountId,
  getAddressesByCustomerId,
  getDefaultAddressForCurrentUser,
  createAddress,
  createOrder,
};
