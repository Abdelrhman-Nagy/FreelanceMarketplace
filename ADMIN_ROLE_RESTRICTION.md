# Admin Role Registration Restriction

## Change Applied
Removed the "Admin" option from the registration form dropdown to prevent regular users from registering as administrators.

## Updated File:
- `src/components/auth/RegisterForm.tsx` - Removed Admin SelectItem from role dropdown

## Registration Options Now Available:
- **Freelancer** - For service providers
- **Client** - For those posting jobs

## Admin Account Creation:
Admin accounts should be created through:
1. Direct database insertion
2. Server-side administration tools
3. Existing admin promoting users

## Security Benefit:
This prevents unauthorized users from creating admin accounts through the public registration form, ensuring proper access control for administrative functions.

The UserRole type definition remains unchanged to maintain compatibility with existing admin functionality.