import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/features/core/lib/prisma";
import { sendBookingReminderEmail, sendBookingOverdueEmail } from "@/features/core/lib/email";
import { format, addDays, isBefore, startOfDay } from "date-fns";

// This endpoint should be called by a cron job daily
// You can use services like Vercel Cron, GitHub Actions, or external cron services
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const results = {
      reminders: 0,
      overdueNotifications: 0,
      errors: [] as string[],
    };

    // 1. Find bookings starting tomorrow (send reminder)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        startDate: {
          gte: tomorrow,
          lt: addDays(tomorrow, 1),
        },
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            title: true,
            brand: true,
            model: true,
            pickupLocation: true,
            user: {
              select: {
                username: true,
                kyc: {
                  select: {
                    phoneNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Send reminder emails for upcoming bookings
    for (const booking of upcomingBookings) {
      try {
        await sendBookingReminderEmail({
          to: booking.user.email,
          userName: booking.user.username,
          vehicleName: booking.vehicle.title,
          vehicleBrand: booking.vehicle.brand,
          vehicleModel: booking.vehicle.model,
          startDate: format(new Date(booking.startDate), "PPP"),
          endDate: format(new Date(booking.endDate), "PPP"),
          pickupLocation: booking.vehicle.pickupLocation,
          ownerName: booking.vehicle.user.username,
          ownerPhone: booking.vehicle.user.kyc?.phoneNumber,
        });
        results.reminders++;
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, error);
        results.errors.push(`Reminder failed for booking ${booking.id}`);
      }
    }

    // 2. Find overdue bookings (end date passed but status still CONFIRMED)
    const overdueBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        endDate: {
          lt: today,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            title: true,
            brand: true,
            model: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Send overdue notifications
    for (const booking of overdueBookings) {
      try {
        await sendBookingOverdueEmail({
          to: booking.user.email,
          userName: booking.user.username,
          vehicleName: booking.vehicle.title,
          vehicleBrand: booking.vehicle.brand,
          vehicleModel: booking.vehicle.model,
          endDate: format(new Date(booking.endDate), "PPP"),
          ownerName: booking.vehicle.user.username,
          ownerEmail: booking.vehicle.user.email,
        });
        results.overdueNotifications++;
      } catch (error) {
        console.error(`Failed to send overdue notice for booking ${booking.id}:`, error);
        results.errors.push(`Overdue notice failed for booking ${booking.id}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking notifications processed",
      results: {
        remindersSent: results.reminders,
        overdueNotificationsSent: results.overdueNotifications,
        totalProcessed: results.reminders + results.overdueNotifications,
        errors: results.errors,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing booking notifications:", error);
    return NextResponse.json(
      {
        error: "Failed to process booking notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger (testing purposes)
export async function POST(request: NextRequest) {
  return GET(request);
}
