# PRODUCTION HARDENING & SECURITY GUIDE

## 1. AUTHENTICATION & TOKEN MANAGEMENT

### Current Implementation

✅ JWT tokens with 1-hour expiration
✅ Refresh tokens with 7-day expiration  
✅ Token storage in HTTP-only cookies
✅ Token validation in `protect` middleware

### Hardening Steps

1. **Rotate Refresh Tokens**

```javascript
// backend/controllers/authController.js
// After refreshing, invalidate old token
userSchema.methods.invalidateRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter(
    rt => rt.token !== token
  );
  await this.save();
};
```

1. **Add Rate Limiting to Auth Endpoints**

```javascript
// backend/server.js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

1. **Session Timeout**

```javascript
// Logout inactive users after 30 minutes
// Implement in frontend store
const SESSION_TIMEOUT = 30 * 60 * 1000;
let inactivityTimeout;
window.addEventListener('activity', resetTimeout);
function resetTimeout() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => useStore.getState().logout(), SESSION_TIMEOUT);
}
```

---

## 2. DATA VALIDATION & SANITIZATION

### Current Implementation

✅ express-mongo-sanitize (prevents NoSQL injection)
✅ xss-clean (prevents XSS attacks)
✅ hpp (prevents parameter pollution)

### Additional Hardening

1. **Joi Validation for All Endpoints**

```javascript
// backend/utils/validators/listingValidator.js
const Joi = require('joi');
exports.createListingSchema = Joi.object({
  title: Joi.string().min(10).max(100).required(),
  description: Joi.string().min(50).max(2000).required(),
  propertyType: Joi.string().valid(...Object.values(propertyTypes)).required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    coordinates: Joi.array().length(2).required(),
  }).required(),
  // ... more fields
});
```

1. **File Upload Validation**

```javascript
// backend/middleware/upload.js
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) throw new Error('File too large');
  if (!ALLOWED_TYPES.includes(file.mimetype)) throw new Error('Invalid file type');
  // Scan for virus/malware with service like VirusTotal
};
```

---

## 3. RATE LIMITING

### Current Implementation

✅ Global rate limit: 100 requests per 15 minutes

### Recommended Configuration

```javascript
// backend/middleware/rateLimit.js
const EXPRESS_RATE_LIMIT = require('express-rate-limit');

const limiterConfig = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 },      // 5 per 15min
  api: { windowMs: 15 * 60 * 1000, max: 100 },    // 100 per 15min
  search: { windowMs: 1 * 60 * 1000, max: 30 },   // 30 per 1min
  upload: { windowMs: 24 * 60 * 60 * 1000, max: 50 }, // 50 per day
  booking: { windowMs: 60 * 60 * 1000, max: 10 },  // 10 per hour
};
```

---

## 4. DATABASE SECURITY

### Backup & Recovery

```bash
# Daily automated backups
mongodump --uri=mongodb+srv://user:pass@cluster.mongodb.net/db --out ./backups

# Point-in-time recovery enabled
# Test restore procedures monthly
```

### Access Control

```javascript
// Only allow app to access MongoDB (IP whitelist)
// Create read-only user for analytics
// Use strong passwords: minimum 16 characters, alphanumeric + symbols
```

### Encryption

```javascript
// At Rest: MongoDB enterprise encryption or encrypted volumes
// In Transit: TLS 1.3 connections
// In App: Hash passwords (bcrypt.js ✅ already implemented)
```

---

## 5. API SECURITY

### CORS Configuration

```javascript
// backend/server.js (ALREADY IMPLEMENTED)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));
```

### Content Security Policy

```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'https:', 'data:'],
    connectSrc: ["'self'", 'https:'],
  },
}));
```

### API Key Management (for service-to-service)

```javascript
// Never hardcode keys
// Use environment variables
// Rotate keys every 90 days
// Revoke compromised keys immediately
```

---

## 6. PAYMENT SECURITY (STRIPE)

### PCI Compliance

```javascript
// NEVER handle raw card data
// Always use Stripe Payment Intents API ✅ (already implemented)
// Store only Stripe customer IDs, not card details

// backend/routes/paymentRoutes.js
router.post('/create-payment-intent', protect, createPaymentIntent);
// Returns client_secret, frontend uses it with Stripe.js
```

### Webhook Validation

```javascript
// Verify Stripe signature
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## 7. AUDIT LOGGING

### What to Log

```javascript
// backend/middleware/auditLog.js
const auditLog = (action, userId, resourceId, status, details) => {
  AuditLog.create({
    action,           // 'booking_created', 'payment_processed', 'user_deleted'
    userId,
    resourceId,
    resourceType,     // 'Booking', 'Payment', 'User'
    status,           // 'success', 'failed'
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    details,
    timestamp: new Date(),
  });
};

// Log all sensitive operations
// - Booking creation/cancellation
// - Payment transactions
// - User account changes
// - Listing deletion
// - Admin actions
```

### Audit Log Schema

```javascript
const auditLogSchema = new Schema({
  action: { type: String, required: true },
  userId: { type: ObjectId, ref: 'User' },
  resourceId: String,
  resourceType: String,
  status: { type: String, enum: ['success', 'failed'] },
  ipAddress: String,
  userAgent: String,
  details: Object,
  timestamp: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), index: true }, // 90-day retention
});
```

---

## 8. FRONTEND SECURITY

### CSP Meta Tag

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  connect-src 'self' http://localhost:5000;
">
```

### Input Validation

```typescript
// src/utils/validators.ts
export const validateListingDate = (date: string): boolean => {
  const d = new Date(date);
  return !isNaN(d.getTime()) && d > new Date();
};

export const validateEmail = (email: string): boolean => {
  return /^\S+@\S+\.\S+$/.test(email);
};

export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
```

### Error Handling (Hide Sensitive Data)

```typescript
// Never expose stack traces to users
catch (error) {
  console.error(error); // Log to monitoring service
  return 'An error occurred. Please try again later.';
}
```

---

## 9. INFRASTRUCTURE SECURITY

### Environment Variables

```bash
# .env (backend)
NODE_ENV=production
JWT_ACCESS_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<long-random-string>
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
CLOUDINARY_NAME=<>
CLOUDINARY_API_KEY=<>
CLOUDINARY_API_SECRET=<>
STRIPE_SECRET_KEY=<>
STRIPE_WEBHOOK_SECRET=<>
SMTP_USER=<>
SMTP_PASS=<>
```

### Secrets Management

```bash
# Use AWS Secrets Manager, HashiCorp Vault, or Heroku Config Vars
# Never commit .env files to git
# Rotate secrets every 90 days
```

### HTTPS/TLS

```bash
# Always use HTTPS in production
# Certificate: Let's Encrypt (free) or AWS ACM
# TLS 1.2+
# HSTS header to force HTTPS
```

---

## 10. MONITORING & ALERTING

### Application Monitoring

```javascript
// Use services like:
// - Sentry (error tracking)
// - DataDog / New Relic (performance)
// - Loggly / CloudWatch (logging)

const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Security Monitoring

```javascript
// Monitor for:
// - Failed authentication attempts (brute force)
// - Unusual payment patterns
// - Rapid quota increases
// - Data exports
// - Privilege escalations

// Set up alerts for:
// - >10 failed logins per IP in 15 min
// - Payment decline rate >5%
// - Listing deletion spike
```

### Log Analysis

```bash
# Use ELK stack (Elasticsearch, Logstash, Kibana)
# Regular security log reviews (weekly minimum)
# Maintain logs for 90+ days for compliance
```

---

## 11. COMPLIANCE & LEGAL

### GDPR Compliance

- ✅ User can request data export
- ✅ User can delete account (right to be forgotten)
- ✅ Clear privacy policy
- ✅ Cookie consent

### Data Residency

- Store user data in compliant region (India: AWS ap-south-1)
- PII encryption

### Terms of Service

- Clear acceptable use policy
- Liability disclaimers
- Dispute resolution

---

## 12. DEPLOYMENT CHECKLIST

- [ ] All environment variables set
- [ ] Database backups tested
- [ ] SSL certificate configured
- [ ] CORS origins whitelisted
- [ ] Rate limits tuned
- [ ] Admin accounts created
- [ ] Monitoring alerts active
- [ ] Error tracking enabled
- [ ] Logs configured
- [ ] HTTPS enforced
- [ ] Headers configured (CSP, HSTS)
- [ ] Secrets rotated
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Incident response plan documented

---

## 13. INCIDENT RESPONSE

### Data Breach Protocol

1. Confirm breach
2. Isolate affected systems
3. Alert users (72h window per GDPR)
4. Notify authorities if required
5. Preserve logs for investigation
6. Remediate vulnerability
7. Document lessons learned

### Password Reset Due to Compromise

```javascript
router.post('/emergency-password-reset', async (req, res) => {
  // No auth required (account compromised)
  // Send reset link via email
  // Check for suspicious activity
  // Log security event
});
```

---

## SECURITY TESTING

### Manual Testing

```bash
# Test SQL/NoSQL injection
# Test XSS payloads
# Test unauthorized access
# Test CSRF attacks
# Test rate limiting
```

### Automated Testing

```bash
npm install --save-dev owasp-zap snyk
npm audit fix
npx snyk test
```

### Penetration Testing

- Hire third-party security firm quarterly
- Bug bounty program (HackerOne, Bugcrowd)
- Responsible disclosure policy

---

## RECOMMENDED THIRD-PARTY SERVICES

| Service | Purpose | Tier |
|---------|---------|------|
| Sentry.io | Error tracking | $29/month |
| DataDog | Monitoring | $15/host/month |
| Cloudflare | DDoS, WAF | $20+/month |
| Auth0 | (Optional) OAuth | Free for 7K MAU |
| AWS KMS | Encryption keys | $1/key/month |
| AWS WAF | Web firewall | $5+/month |

---

## SUCCESS METRICS

- Zero successful authentication bypasses
- <5 failed logins per user/month
- <1% payment decline rate
- <1% 500 errors
- >99.9% uptime
- <200ms API response (p95)
- OWASP Top 10: 0 findings
