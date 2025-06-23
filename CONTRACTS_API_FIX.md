# Contracts API Fix

## Issue:
- Frontend getting 500 error when fetching contracts
- Database service missing `getContracts` method
- Error: "TypeError: dbService.getContracts is not a function"

## Solution Applied:
1. **Added getContracts method** to DatabaseService class
2. **Query Structure**: Selects accepted proposals as contracts
3. **User Filtering**: Returns contracts based on user type (client/freelancer)
4. **Data Fields**: Includes all contract-relevant information

## Method Implementation:
- Joins proposals with jobs table
- Filters by accepted status and user relationship
- Returns comprehensive contract data including rates, durations, and descriptions

## Status:
✅ getContracts method added to database service
✅ Contracts endpoint should now function correctly
✅ Supports both client and freelancer contract views

The contracts API now properly retrieves accepted proposals as active contracts.