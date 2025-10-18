# Grove Registration API Fix

## Issue
When farmers tried to register a new grove, they received a 404 error:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
/api/farmer-verification/register-grove:1 

API request failed: /api/farmer-verification/register-grove Error: HTTP error! status: 404, message: 
```

## Root Cause
The API client was calling the deprecated endpoint `/api/farmer-verification/register-grove` which was trying to proxy requests to a backend server that either wasn't running or didn't have that endpoint.

The API server actually supports the correct endpoint `/api/groves/register` but the client wasn't using it.

## Solution
Updated the API client methods to use the correct endpoints:

1. **Fixed `registerGrove` method** in `frontend/js/api.js`:
   - Changed from `/api/farmer-verification/register-grove` to `/api/groves/register`

2. **Fixed `registerGroveOwnership` method** in `frontend/js/api.js`:
   - Changed from `/api/farmer-verification/register-grove` to `/api/groves/register`

## Files Modified
- `frontend/js/api.js` - Updated endpoint URLs

## Testing
Created a test file `frontend/test-grove-registration.html` to verify the fix works correctly.

## How to Test
1. Start the API server: `npm run api:mock` or `pnpm run api:mock`
2. Open `frontend/test-grove-registration.html` in a browser
3. Fill in the form and click "Register Grove"
4. Verify that the registration succeeds without a 404 error

## Verification
The fix ensures that:
1. Grove registration uses the correct API endpoint
2. Farmers can successfully register new groves
3. No more 404 errors when registering groves
4. The API server's `/api/groves/register` endpoint is properly utilized