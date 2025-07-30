import { useAuth } from "./authcontext";

export const RoleBasedWrapper = ({ allowedRoles, children }) => {
  const { authUser } = useAuth();
  console.log(authUser.role);

  if (!authUser) return null;
  if (!allowedRoles.includes(authUser.role)) return null;

  return children;
};
