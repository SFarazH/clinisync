import { apiClient } from "@/utils";

export const addPaymentToInvoiceApi = async ({
  invoiceId,
  paymentData,
  dbName,
}) => {
  return apiClient.put(`/api/invoice/${invoiceId}`, paymentData, {
    headers: { "db-name": dbName },
  });
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
  return apiClient.get(`/api/invoice`, {
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
};

export const getInvoiceById = async ({ invoiceId, dbName }) => {
  return apiClient.get(`/api/invoice/${invoiceId}`, {
    headers: { "db-name": dbName },
  });
};
