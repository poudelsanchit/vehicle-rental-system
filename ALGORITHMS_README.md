Vehicle Rental System - Core Algorithms

This document outlines the key algorithms implemented in the Vehicle Rental System to ensure efficient operations, data integrity, and user experience.

1. Vehicle Availability Check Algorithm

Purpose:
Determines if a vehicle is available for booking during a specified date range by checking existing bookings and vehicle status.

Algorithm Steps:

ALGORITHM: CheckVehicleAvailability
INPUT: vehicleId, startDate, endDate
OUTPUT: boolean (available/unavailable)

BEGIN

1. VALIDATE input parameters

   - Ensure vehicleId exists
   - Ensure startDate < endDate
   - Ensure startDate >= currentDate

2. CHECK vehicle base availability

   - Query vehicle WHERE id = vehicleId
   - IF vehicle.available = false THEN RETURN false
   - IF vehicle.verificationStatus ≠ "APPROVED" THEN RETURN false

3. FETCH conflicting bookings

   - Query bookings WHERE vehicleId = vehicleId
   - AND status IN ["PENDING", "CONFIRMED"]
   - AND (
     (booking.startDate <= startDate AND booking.endDate > startDate) OR
     (booking.startDate < endDate AND booking.endDate >= endDate) OR
     (booking.startDate >= startDate AND booking.endDate <= endDate)
     )

4. CHECK for conflicts
   - IF conflicting bookings exist THEN RETURN false
   - ELSE RETURN true
     END

Time Complexity: O(n) where n is the number of bookings for the vehicle
Space Complexity: O(1)

2. Total Price Calculation Algorithm

Purpose:
Calculates the total rental cost including base price, duration, and any applicable fees or discounts.

Algorithm Steps:

ALGORITHM: CalculateTotalPrice
INPUT: vehicleId, startDate, endDate, additionalServices[]
OUTPUT: totalAmount (float)

BEGIN

1. VALIDATE input parameters

   - Ensure valid date range
   - Fetch vehicle pricing information

2. CALCULATE base rental cost

   - totalDays = (endDate - startDate) in days
   - IF totalDays < 1 THEN totalDays = 1
   - baseAmount = vehicle.pricePerDay × totalDays

3. APPLY duration-based discounts

   - IF totalDays >= 7 THEN
     weeklyDiscount = baseAmount × 0.10 // 10% weekly discount
   - IF totalDays >= 30 THEN
     monthlyDiscount = baseAmount × 0.20 // 20% monthly discount
   - discountedAmount = baseAmount - MAX(weeklyDiscount, monthlyDiscount)

4. ADD additional service fees

   - serviceTotal = 0
   - FOR each service in additionalServices DO
     serviceTotal += service.price
   - END FOR

5. CALCULATE final amount

   - subtotal = discountedAmount + serviceTotal
   - tax = subtotal × 0.13 // 13% VAT
   - totalAmount = subtotal + tax

6. RETURN totalAmount
   END

Time Complexity: O(m) where m is the number of additional services
Space Complexity: O(1)

3. KYC Verification Algorithm

Purpose:
Validates user-submitted KYC documents and personal information to ensure compliance and security.

Algorithm Steps:

ALGORITHM: ProcessKYCVerification
INPUT: userId, kycData, documentFiles[]
OUTPUT: verificationStatus, rejectionReason

BEGIN

1. VALIDATE personal information

   - CHECK required fields completeness
   - VALIDATE dateOfBirth (age >= 18)
   - VALIDATE phoneNumber format
   - VALIDATE nationalId/citizenship format

2. PROCESS document verification

   - FOR each document in documentFiles DO
     - VALIDATE file format (JPEG, PNG, PDF)
     - VALIDATE file size (< 5MB)
     - CHECK image quality and readability
     - EXTRACT text using OCR (if applicable)
     - CROSS-VERIFY extracted data with form data
   - END FOR

3. PERFORM identity verification

   - VALIDATE identity document authenticity
   - CHECK identity number against government database (if available)
   - VERIFY photo matches across documents
   - VALIDATE license information (for vehicle owners)

4. APPLY verification rules

   - IF any critical validation fails THEN
     status = "REJECTED"
     rejectionReason = specific failure reason
   - ELSE IF manual review required THEN
     status = "PENDING"
     rejectionReason = null
   - ELSE
     status = "APPROVED"
     rejectionReason = null

5. UPDATE user verification status

   - SAVE verification result to database
   - SEND notification to user
   - LOG verification activity for audit

6. RETURN status, rejectionReason
   END

Time Complexity: O(d × p) where d is number of documents and p is processing time per document
Space Complexity: O(d) for storing document data

4. Booking Confirmation Workflow Algorithm

Purpose:
Manages the complete booking lifecycle from initial request to final confirmation, ensuring data consistency and proper state transitions.

Algorithm Steps:

ALGORITHM: ProcessBookingConfirmation
INPUT: bookingRequest, paymentDetails
OUTPUT: bookingStatus, confirmationDetails

BEGIN

1. VALIDATE booking request

   - CHECK user authentication and KYC status
   - VERIFY vehicle availability using Algorithm 1
   - VALIDATE booking dates and duration
   - CALCULATE total price using Algorithm 2

2. INITIATE payment process

   - CREATE payment session with Khalti
   - GENERATE unique transaction ID
   - SET booking status = "PENDING_PAYMENT"
   - STORE temporary booking record

3. PROCESS payment verification

   - WAIT for payment callback from Khalti
   - VERIFY payment authenticity
   - CHECK payment amount matches calculated total
   - UPDATE payment status in database

4. CONFIRM booking upon successful payment

   - BEGIN database transaction
   - UPDATE booking status = "CONFIRMED"
   - MARK vehicle as unavailable for booking period
   - GENERATE booking confirmation number
   - SEND confirmation notifications
   - COMMIT transaction

5. HANDLE payment failure

   - IF payment fails OR timeout THEN
     - UPDATE booking status = "CANCELLED"
     - RELEASE vehicle availability
     - SEND failure notification
     - ROLLBACK any changes

6. NOTIFY stakeholders

   - SEND confirmation email to user
   - NOTIFY vehicle owner of new booking
   - UPDATE admin dashboard statistics
   - LOG booking activity

7. RETURN booking confirmation details
   END

Time Complexity: O(1) for core logic, O(n) for notification processing
Space Complexity: O(1)

5. Rating and Review System Algorithm (Future Implementation)

Purpose:
Processes user ratings and reviews for vehicles and owners, maintaining data integrity and preventing abuse.

Algorithm Steps:

ALGORITHM: ProcessRatingAndReview
INPUT: userId, vehicleId, bookingId, rating, reviewText
OUTPUT: reviewStatus, aggregatedRating

BEGIN

1. VALIDATE review eligibility

   - CHECK if user has completed booking for this vehicle
   - VERIFY booking status = "COMPLETED"
   - ENSURE user hasn't already reviewed this booking
   - VALIDATE rating range (1-5 stars)

2. CONTENT moderation

   - SCAN reviewText for inappropriate content
   - CHECK for spam patterns using ML model
   - VALIDATE review length (min 10, max 500 characters)
   - FLAG suspicious reviews for manual review

3. PROCESS rating calculation

   - FETCH existing ratings for vehicle
   - currentAverage = SUM(all ratings) / COUNT(ratings)
   - newAverage = (currentAverage × ratingCount + newRating) / (ratingCount + 1)
   - UPDATE vehicle aggregate rating

4. IMPLEMENT anti-abuse measures

   - CHECK for review bombing (multiple reviews from same IP)
   - DETECT fake reviews using behavioral analysis
   - APPLY rate limiting (1 review per booking)
   - VERIFY review authenticity score

5. CALCULATE owner rating impact

   - UPDATE owner's overall rating
   - WEIGHT recent reviews higher (time decay factor)
   - CONSIDER vehicle category in rating calculation
   - UPDATE owner reputation score

6. STORE and index review

   - SAVE review to database with metadata
   - INDEX review text for search functionality
   - CREATE review summary for quick display
   - GENERATE review analytics data

7. TRIGGER notifications

   - NOTIFY vehicle owner of new review
   - SEND thank you message to reviewer
   - UPDATE recommendation algorithms
   - REFRESH vehicle ranking in search results

8. RETURN review confirmation and updated ratings
   END

Time Complexity: O(log n) where n is the number of existing reviews
Space Complexity: O(1) for processing, O(k) for storing review data

Algorithm Performance Summary

Algorithm | Time Complexity | Space Complexity | Critical Path
Vehicle Availability Check | O(n) | O(1) | Booking validation
Price Calculation | O(m) | O(1) | Payment processing
KYC Verification | O(d×p) | O(d) | User onboarding
Booking Confirmation | O(1) | O(1) | Transaction processing
Rating & Review | O(log n) | O(1) | User feedback

Implementation Notes

1. Concurrency Handling: All algorithms implement proper locking mechanisms to handle concurrent requests safely.

2. Error Recovery: Each algorithm includes comprehensive error handling and rollback procedures.

3. Scalability: Algorithms are designed to handle increasing load through database indexing and caching strategies.

4. Security: Input validation and sanitization are integral parts of each algorithm to prevent injection attacks.

5. Monitoring: All algorithms include logging and metrics collection for performance monitoring and debugging.

This document serves as a technical reference for the core algorithms powering the Vehicle Rental System's functionality and business logic.
