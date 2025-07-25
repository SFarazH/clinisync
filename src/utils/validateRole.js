export const validateRole = async (roles, user) => {
  return roles.includes(user.data.role);
};
