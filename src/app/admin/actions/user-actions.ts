"use server";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/features/core/lib/auth";
import { prisma } from "@/features/core/lib/prisma";
import { getServerSession } from "next-auth";
type UserUpdate = {
  id: string;
  isVerified: boolean;
  role: "ADMIN" | "OWNER" | "USER";
};

type UpdateUsersResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function fetchAllUsers() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { error: "Unauthorized", success: false };
    }

    const requestingUser = await prisma.user.findUnique({
      where: { id: session.user?.id },
      select: { role: true },
    });

    // Only super admin can access
    if (requestingUser?.role !== "ADMIN") {
      return { error: "Forbidden", success: false };
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, message: "Users Fetched Succesfully", data: users };
  } catch (error) {
    console.log(error);
    return { error: "Error fetching users", success: false };
  }
}

export async function updateUsers(
  updates: UserUpdate[]
): Promise<UpdateUsersResult> {
  try {
    const session = await getServerSession(authOptions);

    // Authentication check
    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get requesting user's role
    const requestingUser = await prisma.user.findUnique({
      where: { id: session.user?.id },
      select: { role: true, isVerified: true },
    });

    // Only super admin can access
    if (requestingUser?.role !== "ADMIN") {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // Only verified super admin can access
    if (!requestingUser?.isVerified) {
      return {
        success: false,
        error: "User Not Verified: Forbidden",
      };
    }

    // Validate updates array
    if (!updates || !Array.isArray(updates)) {
      return {
        success: false,
        error: "Invalid request body, missing updates array",
      };
    }

    // Perform transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.user.update({
          where: { id: update.id },
          data: { isVerified: update.isVerified, role: update.role },
        })
      )
    );

    // Revalidate the relevant paths (adjust as needed)
    revalidatePath("/admin/users"); // or whatever path displays the users

    return {
      success: true,
      message: "Users updated successfully",
    };
  } catch (error) {
    console.error("Failed to update users:", error);
    return {
      success: false,
      error: "Failed to update users",
    };
  }
}
