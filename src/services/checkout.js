import api from "./api";

// ======================
// CUSTOMER / ADDRESS
// ======================

// Get customer ID by account ID
export const getCustomerIdByAccountId = async (accountId) => {
  if (!accountId) return null;
  const res = await api.get(`/api/accounts/${accountId}/customer-id`);
  return res.data; // Long
};

// Get all addresses by customerId
export const getAddressesByCustomerId = async (customerId) => {
  if (!customerId) return [];
  const res = await api.get(`/api/addresses/customer/${customerId}`);
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.content)) return res.data.content;
  return [];
};

// Get default address of current user
export const getDefaultAddressForCurrentUser = async () => {
  const userStored = localStorage.getItem("user");
  if (!userStored) return null;

  const user = JSON.parse(userStored);
  const customerId = await getCustomerIdByAccountId(user.id);
  if (!customerId) return null;

  const addresses = await getAddressesByCustomerId(customerId);
  if (!addresses.length) return null;

  return addresses.find((a) => a.default === true) || addresses[0];
};

// Create new address
export const createAddress = async (addressPayload) => {
  const token = localStorage.getItem("jwtToken");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const res = await api.post("/api/addresses", addressPayload, config);
  return res.data;
};

// ======================
// ORDER
// ======================

/**
 * ORDER PAYLOAD CHUẨN GỬI BE
 * {
 *  customerId: Long | null,
 *  addressId: Long | null,
 *  shippingFee: number,
 *  discount: number,
 *  orderDetails: [
 *    {
 *      productVariantId: Long,
 *      quantity: number
 *    }
 *  ]
 * }
 */
export const createOrder = async (orderPayload) => {
  const token = localStorage.getItem("jwtToken");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const payload = {
    customerId: orderPayload.customerId ?? null,
    addressId: orderPayload.addressId ?? null,
    shippingFee: orderPayload.shippingFee || 0,
    // Bỏ luôn discount, để BE tự tính
    // discount: orderPayload.discount || 0,

    orderDetails: orderPayload.orderDetails,

    // GỬI THÊM voucherCodes
    voucherCodes: orderPayload.voucherCodes || [],
  };

  console.log("✅ ORDER API PAYLOAD (FINAL):", payload);

  const res = await api.post("/api/orders", payload, config);
  return res.data;
};


export default {
  getCustomerIdByAccountId,
  getAddressesByCustomerId,
  getDefaultAddressForCurrentUser,
  createAddress,
  createOrder,
};
