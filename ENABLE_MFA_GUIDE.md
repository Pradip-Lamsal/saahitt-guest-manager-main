# Enabling MFA in Supabase

## Issue: "MFA enroll is disabled" Error

If you're seeing the error message "MFA enroll is disabled" when trying to set up MFA, it means Multi-Factor Authentication is not enabled in your Supabase project.

## Solution: Enable MFA in Supabase Dashboard

### For Remote/Hosted Supabase Projects:

1. **Go to Supabase Dashboard**

   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in to your account

2. **Select Your Project**

   - Find and click on your project: `wifcukhtssicphdfrtex`

3. **Navigate to Authentication Settings**

   - In the left sidebar, click on "Authentication"
   - Then click on "Settings"

4. **Enable Multi-Factor Authentication**

   - Scroll down to find "Multi-Factor Authentication" section
   - Toggle the "Enable MFA" switch to ON
   - Save the settings

5. **Configure MFA Settings (Optional)**
   - Set maximum enrolled factors (default: 10)
   - Configure any additional MFA policies

### For Local Development:

If you're running Supabase locally with `supabase start`, the MFA configuration in `supabase/config.toml` should work:

```toml
[auth.mfa]
# Enable Multi-Factor Authentication
enabled = true
max_enrolled_factors = 10
```

### Verify MFA is Enabled

After enabling MFA, you can verify it's working by:

1. Refresh your application
2. Try setting up MFA again
3. You should see the QR code instead of an error message

### Troubleshooting

**Error: "MFA requires a Supabase Pro plan"**

- MFA is only available on Supabase Pro plans and above
- Upgrade your project at the Supabase Dashboard

**Error: "User not authenticated"**

- Make sure you're logged in before trying to set up MFA
- The MFA setup should only be accessible to authenticated users

**QR Code not showing**

- Check browser console for errors
- Ensure the `qrcode` package is installed: `npm install qrcode`

### Current Project Details

- **Project ID**: `wifcukhtssicphdfrtex`
- **Project URL**: `https://wifcukhtssicphdfrtex.supabase.co`
- **MFA Setup Route**: `/mfa-setup` (requires authentication)

### Next Steps

Once MFA is enabled in your Supabase project:

1. Users can set up MFA by visiting `/mfa-setup`
2. During login, users with MFA enabled will be prompted for their TOTP code
3. The authenticator app will generate 6-digit codes for verification

### Support

If you continue having issues:

- Check the Supabase documentation: [https://supabase.com/docs/guides/auth/auth-mfa](https://supabase.com/docs/guides/auth/auth-mfa)
- Contact Supabase support through their dashboard
- Ensure your project is on a plan that supports MFA
