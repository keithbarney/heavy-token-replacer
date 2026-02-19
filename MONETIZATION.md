# Monetization Strategy — Heavy Token Replacer

## Pricing Model

**One-time purchase, freemium gating**

- **Free tier** — useful enough to demonstrate value, limited enough to convert
- **Pro** — $9 one-time (no subscription)

### Pricing rationale
- Tokens Studio Pro: €39/month (~€468/year) — overkill for simple binding
- Tokenify: free — but no collision detection, no strokes, no multi-page
- **Sweet spot: $9 one-time** — below "impulse buy" threshold for individual designers, ROI clear for teams
- At Figma Community scale (100k+ plugin users), even 1% conversion × $9 = meaningful revenue

### Free tier limits
| Feature | Free | Pro |
|---------|------|-----|
| Scan current page | ✅ | ✅ |
| Up to 50 tokens per scan | ✅ | — |
| Unlimited tokens | ❌ | ✅ |
| Scan all pages | ❌ | ✅ |
| Stroke scanning | ❌ | ✅ |
| CSV export | ❌ | ✅ |
| Collision resolution | ✅ (basic) | ✅ (full) |

**Philosophy**: The free tier should solve the core use case for small files. Power users and design system teams (who get the most value) hit the limits quickly and convert.

---

## Payment Provider: Lemon Squeezy

Account: **heavy.lemonsqueezy.com** (existing account — Keith's)

Lemon Squeezy is now part of Stripe and acts as merchant of record — it handles:
- VAT/tax collection (EU, UK, etc.)
- Payment processing
- License key generation
- Subscription management (not needed for one-time, but available)

### Product Setup
1. Log into Lemon Squeezy dashboard
2. Create product: **Heavy Token Replacer Pro**
3. Type: One-time purchase
4. Price: $9 USD
5. Enable: License keys
6. Variant name: "Pro License"
7. Copy product ID and store as `LEMON_SQUEEZY_PRODUCT_ID`

### License Key Flow
```
User clicks "Unlock Pro" in plugin UI
    │
    ▼
Open Lemon Squeezy checkout in browser
(parent.postMessage to open external URL)
    │
    ▼
User completes purchase → receives license key via email
    │
    ▼
User pastes key into plugin "Activate" field
    │
    ▼
Plugin calls Lemon Squeezy License Activation API:
POST https://api.lemonsqueezy.com/v1/licenses/activate
    │
    ▼
On success: store key in figma.clientStorage
(persists across sessions on this machine)
    │
    ▼
Pro features unlocked
```

### API Endpoints (Lemon Squeezy)
```
Activate:   POST https://api.lemonsqueezy.com/v1/licenses/activate
Validate:   POST https://api.lemonsqueezy.com/v1/licenses/validate
Deactivate: POST https://api.lemonsqueezy.com/v1/licenses/deactivate
```

For this to work, you'll need to:
1. Enable network access in manifest.json:
   ```json
   "networkAccess": {
     "allowedDomains": ["api.lemonsqueezy.com"]
   }
   ```
2. Add license validation to plugin startup
3. Store validated key: `await figma.clientStorage.setAsync('pro_license', key)`
4. Check on startup: `const key = await figma.clientStorage.getAsync('pro_license')`

### Implementation Notes

**manifest.json** — update when paywall is ready:
```json
"networkAccess": {
  "allowedDomains": ["api.lemonsqueezy.com"]
}
```

**License validation in code.ts**:
```typescript
async function validateLicense(key: string): Promise<boolean> {
  const resp = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ license_key: key, instance_id: await getInstanceId() }),
  });
  const data = await resp.json();
  return data.valid === true;
}

async function getInstanceId(): Promise<string> {
  let id = await figma.clientStorage.getAsync('instance_id');
  if (!id) {
    id = Math.random().toString(36).slice(2);
    await figma.clientStorage.setAsync('instance_id', id);
  }
  return id;
}
```

**Startup check**:
```typescript
const savedKey = await figma.clientStorage.getAsync('pro_license');
const isPro = savedKey ? await validateLicense(savedKey) : false;
figma.ui.postMessage({ type: 'proStatus', isPro });
```

---

## Revenue Projections

| Scenario | MAU | Conversion | MRR |
|----------|-----|------------|-----|
| Conservative | 5,000 | 0.5% | $225 |
| Realistic | 15,000 | 1.0% | $1,350 |
| Optimistic | 50,000 | 2.0% | $9,000 |

One-time pricing compounds over time. At 5k MAU and 1% conversion: **25 sales/month × $9 = $225/mo passive**. This grows with Figma Community featuring.

---

## Marketing Notes

### Figma Community SEO
Key search terms to rank for:
- "token replacement figma"
- "color variables figma plugin"
- "bind fills to variables figma"
- "design tokens figma"
- "hex to variable figma"

### Content angles
1. **Tutorial**: "How to migrate a legacy Figma file to design tokens in 5 minutes"
2. **Comparison**: "Heavy Token Replacer vs Tokens Studio — which do you need?"
3. **Use case**: "Auditing your Figma file for hardcoded colors"

### Positioning
> "The 80/20 token tool. Tokens Studio for when you have a complex multi-platform token infrastructure. Heavy Token Replacer for when you just need to bind colors to variables — right now."

---

## v1.0.0 Launch: Free (no paywall)

Ship v1.0.0 completely free to:
1. Build installs and reviews
2. Gather real user feedback
3. Identify which limits actually matter

Add paywall at v1.2.0 once usage data shows conversion opportunity.
