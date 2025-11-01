import axios from "axios";

export const addPaymentToInvoiceApi = async ({ invoiceId, data }) => {
  const res = await axios.put(`/api/invoice/${invoiceId}`, data);
};

export const getInvocies = async ({
  invoiceType = "labWork" | "appointment",
  patientId = null,
  isPaymentComplete = null,
  paginate,
  page = 1,
  limit = 10,
}) => {
  const res = await axios.get(`/api/invoice`, {
    params: {
      invoiceType: invoiceType || "appointment",
      patientId: patientId,
      isPaymentComplete,
      paginate,
      page: paginate ? page : null,
      limit: paginate ? limit : null,
    },
  });
  return res.data;
};

export const getInvoiceById = async (invoiceId) => {
  // data-> amount, paymentMethod
  const res = await axios.get(`/api/invoice/${invoiceId}`);
  return res;
};
