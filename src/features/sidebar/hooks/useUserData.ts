// hooks/useUserData.ts
import { useSession } from "next-auth/react";
import { IDummyData } from "../../admin/types/types";

const dummyData: IDummyData = {
  name: "",
  email: "",
  id: "",
};

export const useUserData = () => {
  const { data: session } = useSession();

  return session?.user
    ? {
        name: session.user.name || "",
        email: session.user.email || "",
        id: session.user.id || "",
      }
    : dummyData;
};
