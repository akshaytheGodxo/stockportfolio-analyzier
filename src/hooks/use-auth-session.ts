import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/server/better-auth/client";

export function useSession() {
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  return {
    session,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
    user: session?.user,
  };
}
