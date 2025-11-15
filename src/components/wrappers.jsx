import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./context/authcontext";

export function useQueryWrapper({
  queryKey,
  queryFn,
  params = {},
  enabled = true,
}) {
  const { authClinic } = useAuth();
  const dbName = authClinic?.databaseName;

  return useQuery({
    queryKey: [...queryKey, params, dbName],
    enabled: enabled && !!dbName,
    queryFn: () => queryFn({ ...params, dbName }),
  });
}

export function useMutationWrapper({ mutationFn, onSuccess, onError }) {
  const { authClinic } = useAuth();
  const dbName = authClinic?.databaseName;

  return useMutation({
    mutationFn: async (payload) => {
      console.log("WRAPPER RECEIVED PAYLOAD --->", payload);
      return mutationFn({
        ...payload,
        dbName,
      });
    },

    onSuccess: (...args) => {
      onSuccess && onSuccess(...args);
    },

    onError,
  });
}
