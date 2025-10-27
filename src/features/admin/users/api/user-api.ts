import { updateUsers } from "@/app/admin/actions/user-actions";
import { IUserUpdate } from "../types/types";

export const userApi = {
  async updateBatch(updates: IUserUpdate[]): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    return await updateUsers(updates);
  },
};
