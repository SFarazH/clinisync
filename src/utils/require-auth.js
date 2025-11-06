import { authenticate } from "./authenticate";

export const requireAuth = async (allowedRoles = []) => {
  const auth = await authenticate();
  if (!auth.success) {
    return { ok: false, status: 401, message: auth.message };
  }

  const user = auth.data;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return { ok: false, status: 403, message: "Forbidden" };
  }

  return { ok: true, user };
};
