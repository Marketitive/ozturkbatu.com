# 🔍 Google Analytics 4 Setup Guide

## Step 1: Create Google Analytics 4 Account

1. **Go to Google Analytics**
   - Visit: https://analytics.google.com
   - Sign in with your Google account

2. **Create a New Property**
   - Click "Admin" (gear icon at bottom left)
   - Click "Create Property"
   - Property name: `ozturkbatu.com`
   - Select timezone: `Europe/Berlin` (Germany)
   - Select currency: `Euro (EUR)`
   - Click "Next"

3. **Business Information**
   - Industry category: `Internet & Telecom` or `Professional Services`
   - Business size: `Small`
   - How you intend to use Google Analytics: Check relevant options
   - Click "Create"

4. **Accept Terms of Service**
   - Read and accept the terms
   - Click "I Accept"

## Step 2: Get Your Measurement ID

1. **Data Stream Setup**
   - Platform: Select "Web"
   - Website URL: `https://www.ozturkbatu.com`
   - Stream name: `ozturkbatu.com`
   - Click "Create stream"

2. **Copy Your Measurement ID**
   - You'll see a Measurement ID like: `G-XXXXXXXXXX`
   - **Copy this ID** - you'll need it next

## Step 3: Add Measurement ID to Your Website

### Option A: Using Environment Variable (Recommended for Production)

1. **Create `.env` file** in your project root:
   ```bash
   PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Measurement ID

2. **Add `.env` to `.gitignore`** (if not already there):
   ```
   .env
   .env.local
   ```

3. **The code is already set up** in `src/components/GoogleAnalytics.astro`

### Option B: Direct in Code (Quick Setup)

1. **Open** `src/components/GoogleAnalytics.astro`

2. **Replace** `G-XXXXXXXXXX` with your actual Measurement ID:
   ```javascript
   const GA_MEASUREMENT_ID = 'G-YOUR-ACTUAL-ID';
   ```

3. **Also update** the gtag config line:
   ```javascript
   gtag('config', 'G-YOUR-ACTUAL-ID', {
   ```

## Step 4: For Netlify Deployment

### Add Environment Variable in Netlify

1. **Go to Netlify Dashboard**
   - Select your site
   - Go to "Site settings"
   - Click "Environment variables" in the left sidebar

2. **Add New Variable**
   - Key: `PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX` (your actual Measurement ID)
   - Click "Save"

3. **Redeploy Your Site**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

## Step 5: Configure Google Analytics Settings

### Enable IP Anonymization (GDPR Compliance)

Already configured in the code! ✅
```javascript
gtag('config', 'G-XXXXXXXXXX', {
  anonymize_ip: true,
  cookie_flags: 'SameSite=None;Secure'
});
```

### Set Data Retention Period

1. **In Google Analytics Admin**
   - Go to "Admin" → "Data Settings" → "Data Retention"
   - Set retention period: `14 months` (GDPR recommended)
   - Click "Save"

### Enable Enhanced Measurement

1. **In Data Streams**
   - Click on your web data stream
   - Scroll to "Enhanced measurement"
   - Toggle ON (recommended features):
     - ✅ Page views
     - ✅ Scrolls
     - ✅ Outbound clicks
     - ✅ Site search
     - ✅ Video engagement
     - ✅ File downloads

## Step 6: Verify Installation

### Test Locally

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open your site**: http://localhost:4321

3. **Check browser console**:
   - Right-click → Inspect → Console tab
   - Look for Google Analytics requests (no errors)

### Test in Production

1. **After deploying to Netlify**:
   - Visit your live site: https://www.ozturkbatu.com

2. **Check Real-Time Reports**:
   - Go to Google Analytics → Reports → Realtime
   - You should see your visit within 30 seconds

3. **Use Google Tag Assistant** (Chrome Extension):
   - Install: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
   - Visit your site
   - Click extension icon
   - Should show: "Google Analytics: GA4" with your Measurement ID

## Step 7: Set Up Important Events

### Track Newsletter Signups

1. **In Google Analytics Admin**:
   - Go to "Admin" → "Events"
   - Click "Create event"
   - Event name: `newsletter_signup`
   - Matching conditions:
     - Parameter: `event_name`
     - Operator: `equals`
     - Value: `form_submit`
   - Click "Create"

### Track Blog Post Reads

1. **Create Custom Event**:
   - Event name: `blog_read`
   - Tracks when users read blog posts
   - Automatically tracked with Enhanced Measurement

## Step 8: Create Useful Reports

### Blog Performance Report

1. **Go to Reports** → "Engagement" → "Pages and screens"
2. **Filter** by URL containing `/blog/`
3. **Add secondary dimension**: "Page title"
4. **Save as custom report**: "Blog Performance"

### Newsletter Conversion Report

1. **Go to Reports** → "Engagement" → "Events"
2. **Find**: `form_submit` event
3. **Create conversion**: Mark as key event
4. **Track**: Newsletter signup rate

## Step 9: Privacy & Compliance

### GDPR Compliance Checklist

- ✅ IP anonymization enabled
- ✅ Data retention set to 14 months
- ✅ Privacy policy updated (already done)
- ✅ User opt-out link provided (in privacy policy)
- ✅ Cookie consent mentioned

### Cookie Banner (Optional but Recommended)

For strict GDPR compliance, consider adding a cookie consent banner:

**Recommended Services**:
- [Cookiebot](https://www.cookiebot.com/) - Free for small sites
- [Cookie Consent](https://github.com/orestbida/cookieconsent) - Open source
- [Complianz](https://complianz.io/) - WordPress alternative

## Step 10: Monitor & Optimize

### Weekly Check

- [ ] Review visitor numbers
- [ ] Check most popular blog posts
- [ ] Monitor newsletter signups
- [ ] Review traffic sources

### Monthly Review

- [ ] Analyze user behavior flow
- [ ] Identify high-performing content
- [ ] Optimize low-performing pages
- [ ] Track conversion goals

### Useful Reports to Monitor

1. **Acquisition Overview**: Where visitors come from
2. **Engagement Overview**: What content performs best
3. **Pages and Screens**: Most visited pages
4. **Events**: Newsletter signups, downloads, etc.

## Troubleshooting

### Issue 1: No Data Showing
**Solution:**
- Check if Measurement ID is correct
- Verify site is deployed
- Wait 24-48 hours for first data
- Check Real-time reports (instant data)

### Issue 2: Multiple Properties
**Solution:**
- Use only GA4 property (not Universal Analytics)
- GA4 has Measurement ID starting with `G-`
- Universal Analytics (old) has ID starting with `UA-`

### Issue 3: Data Discrepancies
**Solution:**
- Check IP anonymization settings
- Verify Enhanced Measurement is enabled
- Review data retention settings
- Check for ad blockers (will block GA)

## Additional Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Migration Guide](https://support.google.com/analytics/answer/10759417)
- [GDPR Compliance Guide](https://support.google.com/analytics/answer/9019185)
- [Google Analytics Academy](https://analytics.google.com/analytics/academy/)

## Quick Reference

### Your Setup

- **Website**: https://www.ozturkbatu.com
- **Property Name**: ozturkbatu.com
- **Measurement ID**: G-XXXXXXXXXX (replace with yours)
- **Data Retention**: 14 months
- **IP Anonymization**: Enabled ✅
- **Enhanced Measurement**: Enabled ✅

### Important Links

- **Google Analytics Dashboard**: https://analytics.google.com
- **Real-time Reports**: https://analytics.google.com → Reports → Realtime
- **Tag Manager**: https://tagmanager.google.com (if needed later)

---

**Need Help?**
- Google Analytics Help: https://support.google.com/analytics
- Community Forum: https://support.google.com/analytics/community

**Good luck tracking your website's performance! 📊**

