# Check-in Page Refactoring Documentation

## Overview
The Check-in page has been completely refactored to provide a better user experience for hotel staff with comprehensive guest information management, automated surcharge calculations, and an optimized workflow.

## New Features

### 1. **Enhanced Guest Information**
- **Full Guest Details**: Now captures complete guest information including:
  - Basic Info: Name, ID Number, Phone (required for main guest)
  - Additional Info: Gender, Birthday, Nationality, Address
  - Main Guest designation with clear visual indicators

### 2. **Improved Guest Management**
- **Add/Edit/Delete Guests**: 
  - Each guest card has edit mode with Save button
  - Visual distinction between main guest and additional guests
  - Cannot delete main guest (protected)
  - Easy-to-use interface with form validation

### 3. **Automated Surcharge Calculation**
The new `SurchargeCalculator` component automatically calculates:
- **Extra Adults**: 200,000 VND per person
- **Extra Children** (under 12): 100,000 VND per child
- **Early Check-in** (before 14:00): 150,000 VND
- **Late Check-out** (after 12:00): 150,000 VND
- **Extra Bed**: 100,000 VND per bed

Features:
- Real-time calculation
- Capacity validation (prevents exceeding room capacity)
- Visual breakdown of all charges
- Total surcharge display

### 4. **Reorganized UI Structure**

#### Single Room Booking:
1. **Main Guest Section** (Required)
   - Comprehensive form with all guest details
   - Edit mode for updating information
   
2. **Additional Guests Section**
   - Add multiple guests
   - Each guest with full details
   - Edit/delete functionality
   
3. **Surcharge & Services Section**
   - Surcharge calculator with capacity check
   - Visual indicators for room capacity status
   
4. **Summary & Confirmation**
   - Complete booking summary
   - Cost breakdown (Room + Surcharges + Services)
   - Grand total calculation
   - One-click check-in confirmation

#### Multi-Room Booking:
- Separate sections for each room
- Individual guest lists per room
- Per-room surcharge calculation
- Total surcharges across all rooms

### 5. **Simplified Required Fields**
- **Main Guest Only**: Name, ID Number, Phone are required
- **Additional Guests**: All fields optional but can be filled
- Better user experience with less mandatory data entry

## New Components

### `GuestInfoForm.tsx`
Reusable component for guest information entry and display.

**Props:**
- `guest`: Guest information object
- `isEditing`: Boolean to toggle edit mode
- `isMain`: Whether this is the main guest
- `index`: Guest number for display
- `onEdit`, `onSave`, `onRemove`: Action handlers
- `onChange`: Field update handler

**Features:**
- Toggle between view and edit modes
- Responsive grid layout
- Clear visual hierarchy
- Protected main guest (cannot be deleted)

### `SurchargeCalculator.tsx`
Component for calculating and displaying surcharges.

**Props:**
- `surcharges`: Current surcharge values
- `rates`: Pricing for each surcharge type
- `onChange`: Handler for surcharge updates
- `maxCapacity`: Room capacity limit
- `currentGuests`: Number of registered guests

**Features:**
- Real-time calculation
- Capacity validation with visual warnings
- Checkbox for early/late check-in/out
- Number inputs for people and beds
- Automatic total calculation

### `CheckInSummary.tsx`
Final summary and confirmation component.

**Props:**
- `bookingInfo`: Booking details
- `surchargeTotal`: Total surcharges
- `serviceTotal`: Total service fees
- `roomTotal`: Room cost
- `onConfirm`: Check-in confirmation handler
- `isLoading`: Loading state
- `disabled`: Whether confirm button is disabled

**Features:**
- Booking information display
- Cost breakdown visualization
- Grand total calculation
- Loading state during check-in
- Warning notes for staff

## Updated Interfaces

```typescript
interface GuestInfo {
  id?: string;
  name: string;
  id_number: string;
  phone: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  nationality?: string;
  address?: string;
  is_main?: boolean;
}

interface RoomGuestInfo {
  room_id: number;
  room_name: string;
  guests: GuestInfo[];
  surcharges: {
    extra_adults: number;
    extra_children: number;
    early_checkin: boolean;
    late_checkout: boolean;
    extra_bed: number;
  };
}

interface SurchargeRates {
  extra_adult: number;
  extra_child: number;
  early_checkin: number;
  late_checkout: number;
  extra_bed: number;
}
```

## Key Improvements

### User Experience
1. **Clear Visual Hierarchy**: Sections clearly separated with icons and colors
2. **Better Workflow**: Step-by-step process from guest info to confirmation
3. **Real-time Feedback**: Instant validation and calculations
4. **Error Prevention**: Capacity checks prevent invalid data entry

### Code Quality
1. **Component Modularity**: Reusable components for maintainability
2. **Type Safety**: Full TypeScript interfaces
3. **Consistent Styling**: Tailwind CSS with cohesive design
4. **Better State Management**: Organized state with clear responsibilities

### Validation
1. **Required Field Validation**: Only essential fields are mandatory
2. **Capacity Validation**: Prevents exceeding room capacity
3. **Main Guest Protection**: Cannot delete or skip main guest
4. **Room Number Validation**: Ensures all rooms have assigned numbers

## Usage Example

```typescript
// Main guest is automatically created with is_main: true
const initialGuest: GuestInfo = {
  id: generateGuestId(),
  name: '',
  id_number: '',
  phone: '',
  gender: undefined,
  birthday: undefined,
  nationality: 'Việt Nam',
  address: '',
  is_main: true
};

// Adding additional guest
const handleAddGuest = () => {
  const newGuest: GuestInfo = {
    id: generateGuestId(),
    name: '',
    id_number: '',
    phone: '',
    is_main: false
  };
  setGuests([...guests, newGuest]);
};

// Calculating surcharges
const totalSurcharge = calculateSurchargeForRoom(surcharges);
```

## Migration Notes

### Removed
- Old separate sections for guest info and surcharges
- Manual total calculation
- Basic 3-field guest form
- `extraPersons` and `children` separate states (replaced by surcharge object)

### Updated
- `handleCheckIn`: Now uses new guest and surcharge structures
- `handleSelectBooking`: Initializes new guest format
- Validation logic: Uses `is_main` flag instead of index

## Testing Checklist

- [ ] Main guest form with all fields
- [ ] Add additional guests
- [ ] Edit guest information
- [ ] Delete additional guests (cannot delete main)
- [ ] Surcharge calculator with capacity validation
- [ ] Early check-in checkbox
- [ ] Late checkout checkbox
- [ ] Extra bed input
- [ ] Multi-room bookings with separate guests
- [ ] Total calculation accuracy
- [ ] Check-in confirmation
- [ ] Form reset after successful check-in

## Future Enhancements

1. **Guest History**: Store and retrieve past guest information
2. **ID Scanning**: OCR for automatic ID card data entry
3. **Photo Capture**: Guest photo capture for security
4. **Digital Signature**: Guest signature for check-in confirmation
5. **Email Confirmation**: Automatic email with room details
6. **SMS Notification**: Room number via SMS
7. **Loyalty Integration**: Automatic loyalty points calculation
8. **Payment Integration**: Direct payment processing during check-in

## Support

For questions or issues, please contact the development team or refer to the main project documentation.
