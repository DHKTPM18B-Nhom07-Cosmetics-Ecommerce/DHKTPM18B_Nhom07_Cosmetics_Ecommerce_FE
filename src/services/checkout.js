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

export default {
  getCustomerIdByAccountId,
  getAddressesByCustomerId,
  getDefaultAddressForCurrentUser,
};
