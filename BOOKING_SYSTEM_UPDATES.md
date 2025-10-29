Booking System Updates - Payment Removal & Dynamic Dashboard

Overview:
Removed payment integration from user booking flow and created a dynamic owner dashboard based on real database data.

Key Changes Made:

1. Updated Booking Dialog (src/features/core/components/booking-dialog.tsx)
   - Removed Khalti payment integration
   - Simplified booking flow to direct booking request submission
   - Changed "Proceed to Payment" to "Submit Booking Request"
   - Added note that payment will be arranged directly with owner
   - Removed payment steps and processing states

2. Updated Booking API (src/app/api/v1/bookings/route.ts)
   - Enabled direct booking creation via POST method
   - Added vehicle availability validation
   - Added conflict checking for existing bookings
   - Creates bookings with PENDING status by default
   - Includes comprehensive error handling

3. Created Dynamic Owner Dashboard API (src/app/api/v1/owner/dashboard/route.ts)
   - Calculates real-time statistics from database
   - Overview stats: total vehicles, available vehicles, bookings
   - Revenue calculations: total, monthly, pending, completed
   - Monthly revenue chart data (last 6 months)
   - Booking status distribution chart
   - Vehicle type distribution chart
   - Recent bookings list (last 5)
   - Top performing vehicles by revenue

4. Updated Owner Dashboard Page (src/app/owner/page.tsx)
   - Converted to client component with API integration
   - Added loading states and error handling
   - Fetches real data from dynamic API
   - Maintains same UI components with live data

5. Enhanced Owner Booking Management (src/app/api/v1/owner/bookings/[id]/route.ts)
   - Added support for PENDING status updates
   - Allows owners to approve, reject, or keep bookings pending
   - Enhanced validation for status changes
   - Prevents modification of completed/cancelled bookings

New Workflow:

User Booking Process:
1. User selects vehicle and dates
2. Fills booking form with contact details
3. Submits booking request (no payment)
4. Booking created with PENDING status
5. Owner receives notification to review

Owner Management Process:
1. Owner views booking requests in dashboard
2. Can approve (CONFIRMED), reject (CANCELLED), or keep pending
3. Payment arranged directly between user and owner outside system
4. Owner can update booking status as needed

Dashboard Features:
- Real-time vehicle and booking statistics
- Revenue tracking and analytics
- Visual charts for performance metrics
- Recent activity monitoring
- Top performing vehicle insights

Benefits:
- Simplified user experience (no payment complexity)
- Flexible payment arrangements between parties
- Real-time data-driven owner dashboard
- Better booking management workflow
- Reduced system complexity and maintenance

API Endpoints:
- POST /api/v1/bookings - Create booking request
- GET /api/v1/owner/dashboard - Get dynamic dashboard data
- PATCH /api/v1/owner/bookings/[id] - Update booking status

The system now focuses on facilitating connections between users and vehicle owners while allowing flexible payment arrangements outside the platform.