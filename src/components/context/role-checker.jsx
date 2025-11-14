import { useRouter } from "next/navigation";
import { useAuth } from "./authcontext";
import { roles } from "@/utils/role-permissions.mapping";

export const RoleBasedWrapper = ({
  allowedRoles,
  featureKey = null,
  children,
}) => {
  const { authUser, authClinic } = useAuth();

  if (!authUser) {
    return null;
  }

  if (authUser.role === roles.SUPER_ADMIN) return children;

  if (allowedRoles.length > 0 && !allowedRoles.includes(authUser.role)) {
    return null;
  }

  if (featureKey && authClinic?.features?.[featureKey] !== true) {
    return null;
  }

  return children;
};
