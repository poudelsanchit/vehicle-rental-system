# Vehicle Recommendation System

## Overview
The vehicle browsing page now features a personalized recommendation system that intelligently sorts vehicles based on user preferences and vehicle ratings.

## Recommendation Logic

The system uses a multi-tier sorting algorithm:

### 1. User Preference (Primary)
- **Tracks user booking history**: Analyzes completed and confirmed bookings
- **Identifies preferred category**: Determines if user prefers TWO_WHEELER or FOUR_WHEELER
- **Prioritizes matching vehicles**: Shows preferred category vehicles first

### 2. Average Rating (Secondary)
- **Calculates vehicle ratings**: Uses feedback data to compute average overall rating
- **Higher ratings first**: Vehicles with better ratings appear earlier
- **Quality indicator**: Helps users find well-reviewed vehicles

### 3. Review Count (Tertiary)
- **Popularity metric**: More reviews indicate more bookings
- **Trust factor**: Vehicles with more feedback are more established
- **Breaks rating ties**: When ratings are equal, more reviews wins

### 4. Recency (Final)
- **Newest vehicles**: Recently added vehicles appear last
- **Ensures variety**: Prevents stale listings from dominating

## User Experience

### For New Users
- No booking history exists
- Vehicles sorted by rating and popularity
- Highest-rated vehicles appear first
- Helps new users find trusted options

### For Returning Users
- System learns from booking patterns
- If user mostly books bikes → bikes shown first
- If user mostly books cars → cars shown first
- Still maintains quality sorting within categories

### Visual Indicators
- **"Recommended For You" Section**: Top 3 vehicles displayed prominently with purple gradient header
- **Top Pick Badge**: First recommended vehicle gets special "Top Pick" badge
- **Recommended Badge**: Other top vehicles get "Recommended" badge with sparkle icon
- **Purple Border**: Recommended vehicles have distinctive purple border
- **Gradient Button**: Recommended vehicles have gradient "Book Now" button
- **Star rating display**: Shows average rating (e.g., 4.5 ⭐)
- **Review count**: Shows number of reviews (e.g., "12 reviews")
- **Available Now badge**: Indicates current availability
- **"More Available Vehicles" Section**: Remaining vehicles shown in separate section with blue header

## Example Scenarios

### Scenario 1: Bike Enthusiast
```
User has booked 5 bikes and 1 car
Result: TWO_WHEELER vehicles shown first, sorted by rating
```

### Scenario 2: First-Time User
```
User has no booking history
Result: All vehicles sorted by rating, then review count
```

### Scenario 3: Balanced User
```
User has booked 3 bikes and 3 cars equally
Result: Category with most recent booking preferred, or rating-based if tied
```

## Technical Implementation

### API Changes (`src/app/api/v1/vehicles/route.ts`)
- Fetches user session and booking history
- Calculates category preference from confirmed/completed bookings
- Aggregates feedback data for average ratings
- Implements multi-tier sorting algorithm
- Returns vehicles with rating metadata

### UI Changes (`src/app/user/vehicles/page.tsx`)
- Added `avgRating` and `ratingCount` to Vehicle interface
- Displays star rating with review count
- Shows rating only for vehicles with reviews
- Maintains clean, intuitive design

## Benefits

1. **Personalization**: Users see relevant vehicles first
2. **Quality Assurance**: High-rated vehicles get visibility
3. **Trust Building**: Review counts provide social proof
4. **Better Discovery**: New users find popular vehicles easily
5. **User Retention**: Personalized experience encourages return visits

## Future Enhancements

Potential improvements:
- Weight recent bookings more heavily
- Consider location preferences
- Factor in price range preferences
- Add "Recommended for You" badge
- Implement collaborative filtering
- Consider seasonal preferences
