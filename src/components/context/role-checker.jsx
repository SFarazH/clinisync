import { useRouter } from "next/navigation";
import { useAuth } from "./authcontext";

export const RoleBasedWrapper = ({
  allowedRoles,
  featureKey = null,
  children,
}) => {
  const { authUser, authClinic } = useAuth();
  const router = useRouter();

  if (!authUser) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(authUser.role)) {
    return null;
  }

  if (featureKey && authClinic?.features?.[featureKey] !== true) {
    return null;
  }

  return children;
};
