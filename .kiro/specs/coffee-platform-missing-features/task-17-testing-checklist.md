# Task 17 Testing Checklist

## Manual Testing Steps

### Test 1: Coffee Variety Selection
- [ ] Open harvest form
- [ ] Verify variety dropdown shows: Arabica, Robusta, Specialty, Organic
- [ ] Select each variety
- [ ] Confirm suggested price loads for each variety
- [ ] Verify suggested price auto-fills sale price input

### Test 2: Quality Grade Slider
- [ ] Move slider from 1 to 10
- [ ] Verify grade value updates (1-10)
- [ ] Verify grade description updates:
  - Grades 1-3: "Low Quality"
  - Grades 4-6: "Medium Quality"
  - Grades 7-8: "High Quality"
  - Grades 9-10: "Premium Quality"
- [ ] Confirm suggested price updates when grade changes

### Test 3: Suggested Price Display
- [ ] Select variety and grade
- [ ] Verify "Suggested price" section appears
- [ ] Confirm price is displayed in USDC/kg format
- [ ] Verify price updates when variety or grade changes

### Test 4: Price Validation
- [ ] Enter sale price within normal range (50%-200% of suggested)
- [ ] Verify green "valid" message appears
- [ ] Enter price below 50% of suggested
- [ ] Verify warning/error message appears
- [ ] Enter price above 200% of suggested
- [ ] Verify warning/error message appears

### Test 5: Projected Revenue Calculation
- [ ] Enter yield amount (e.g., 100 kg)
- [ ] Enter sale price (e.g., 5.00 USDC/kg)
- [ ] Verify "Projected Revenue" section appears
- [ ] Confirm Total Revenue = yield × price (500 USDC)
- [ ] Confirm Farmer Share = 30% of total (150 USDC)
- [ ] Confirm Investor Share = 70% of total (350 USDC)

### Test 6: Price Breakdown Display
- [ ] Verify base price is shown
- [ ] Verify seasonal multiplier is shown
- [ ] Confirm values match API response

### Test 7: Real-time Updates
- [ ] Change variety → verify all calculations update
- [ ] Change grade → verify all calculations update
- [ ] Change yield → verify revenue updates
- [ ] Change sale price → verify validation and revenue update

### Test 8: Form Submission
- [ ] Fill out complete harvest form with new fields
- [ ] Submit form
- [ ] Verify harvest is created successfully
- [ ] Confirm variety is included in harvest data
- [ ] Check harvest history shows new harvest

### Test 9: Seasonal Pricing
- [ ] Test during different months (if possible)
- [ ] Verify seasonal multiplier changes
- [ ] Confirm suggested price reflects seasonal adjustment

### Test 10: Error Handling
- [ ] Disconnect from API (simulate network error)
- [ ] Verify form still shows basic calculations
- [ ] Confirm graceful degradation without crashes
- [ ] Verify helpful error messages if API fails

### Test 11: Visual/UI Testing
- [ ] Verify slider has gradient background (red-yellow-green)
- [ ] Confirm slider thumb is brown with white border
- [ ] Check price info box has light gray background
- [ ] Verify validation messages are color-coded correctly
- [ ] Confirm projected revenue section has card styling
- [ ] Test responsive design on different screen sizes

### Test 12: Accessibility
- [ ] Tab through form fields
- [ ] Verify all inputs are keyboard accessible
- [ ] Test slider with keyboard (arrow keys)
- [ ] Verify labels are properly associated with inputs

## Expected Results

All tests should pass with:
- ✅ Smooth real-time updates
- ✅ Accurate calculations (30/70 split)
- ✅ Proper price validation
- ✅ Clear visual feedback
- ✅ Graceful error handling
- ✅ Successful form submission with variety field

## Known Issues/Limitations

- None identified at this time

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## Notes

- Ensure backend pricing API endpoints are running
- Verify price oracle data is populated in database
- Test with realistic coffee prices and yields
