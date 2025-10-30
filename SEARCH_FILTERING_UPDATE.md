Search and Filtering Update - Button-Triggered Search

Overview:
Updated the search and filtering functionality to only trigger when the user clicks the "Search Vehicles" button, rather than on every input change. This provides better user control and reduces unnecessary API calls.

Key Changes Made:

1. Modified Search Behavior (src/app/user/vehicles/page.tsx)
   - Removed automatic filtering on input change
   - Added manual search trigger via "Search Vehicles" button
   - Initial page load shows all vehicles without filters
   - Search only executes when user explicitly clicks search button

2. Enhanced User Interface
   - Added prominent "Search Vehicles" primary button
   - Button shows loading state during search ("Searching...")
   - Reorganized filter layout for better visual hierarchy
   - Added keyboard support (Enter key) for all input fields

3. Improved User Experience
   - Users can now set multiple filters before searching
   - Reduced API calls and server load
   - Clear visual indication when filters are applied
   - Better performance with controlled search execution

4. Enhanced Filter Management
   - "Clear Filters" button automatically refreshes results
   - Visual indicator shows when filters are currently applied
   - Proper loading states for all actions
   - Disabled buttons during loading to prevent multiple requests

New User Workflow:

1. User enters search criteria in various fields:
   - Text search (vehicles, location)
   - Date range selection
   - Price range (min/max)
   - Vehicle type and category selection

2. User clicks "Search Vehicles" button to apply filters

3. System fetches filtered results from API

4. Results display with applied filter indicators

5. User can clear all filters with "Clear Filters" button

Key Features:

Button-Triggered Search:
- Primary blue "Search Vehicles" button
- Loading state with "Searching..." text
- Disabled during API calls

Keyboard Support:
- Enter key triggers search from any input field
- Improved accessibility and user experience

Visual Feedback:
- "Filters Applied" badge when any filters are active
- Loading states for all interactive elements
- Clear visual hierarchy with proper button styling

Performance Benefits:
- Reduced API calls (no real-time filtering)
- Better server performance
- User controls when to search
- Prevents accidental searches while typing

Technical Improvements:

API Call Management:
- fetchVehicles() function with optional filter parameter
- Controlled search execution
- Proper loading state management

State Management:
- Clean separation between filter state and search execution
- Proper initialization with default values
- Efficient filter clearing with automatic refresh

User Interface:
- Responsive grid layout for filters
- Proper button hierarchy (primary search, secondary clear)
- Consistent spacing and visual design

Benefits:
- Better user control over search timing
- Reduced server load and API calls
- Improved performance and responsiveness
- Enhanced user experience with clear actions
- Professional search interface with proper feedback

The search functionality now provides a more controlled and efficient experience where users can set all their desired filters before executing a single search request.