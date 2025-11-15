import axios from "axios";

export const addPaymentToInvoiceApi = async ({
  invoiceId,
  paymentData,
  dbName,
}) => {
  const res = await axios.put(`/api/invoice/${invoiceId}`, paymentData, {
    headers: { "db-name": dbName },
  });
  return res.data;
};

export const getInvocies = async ({
  invoiceType = "labWork" | "appointment",
  patientId = null,
  isPaymentComplete = null,
  paginate,
  page = 1,
  limit = 10,
  startDate = null,
  endDate = null,
  dbName,
}) => {
  const res = await axios.get(`/api/invoice`, {
    params: {
      invoiceType: invoiceType || "appointment",
      patientId: patientId,
      isPaymentComplete,
      paginate,
      page: paginate ? page : null,
      limit: paginate ? limit : null,
      startDate: startDate,
      endDate: endDate,
    },
    headers: { "db-name": dbName },
  });
  return res.data;
};

export const getInvoiceById = async ({ invoiceId, dbName }) => {
  const res = await axios.get(`/api/invoice/${invoiceId}`, {
    headers: { "db-name": dbName },
  });
  return res;
};
