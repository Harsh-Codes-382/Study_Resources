# Multi-Tenant Auth: Password, Social, SSO, SAML & SCIM

*High-Level Design study note · building per-organization enterprise auth on top of self-serve login*

---

## 0 · The one-line mental model

You are building **one users table with many ways to prove you own a row in it**, where the *set of allowed ways* is decided by the organization that owns the email's domain.

Everything in this note answers four questions:

1. **Who is this person?** → password, or an OIDC token from Google/Microsoft, or a SAML assertion from the customer's IdP.
2. **How much do I trust what that credential *claims* about them?** → the trust-tier rule in §4. This is where every security hole in this feature lives.
3. **Which organization do they belong to, and what may they do?** → domain ownership, tenant binding, invites, group→role mapping.
4. **Who works at that company right now?** → SCIM, because SSO only fires when a browser shows up, and departed employees don't open browsers.

> **Separation of concerns (the spine of the design):**
> **`users`** = *the human* · **`identities`** = *the ways they can log in* · **`sso_connections`** = *one customer's IdP* · **`org_domains` + `org_microsoft_tenants`** = *proof a customer owns an identity namespace* · **SCIM** = *the directory mirror.* Each table does exactly one job.

**The single sentence to remember:**

> **SAML/OIDC answer "who is at the door." SCIM answers "who works here." You need the second because people stop working somewhere without ever coming to the door again.**

---

## 1 · Requirements

**Functional**

- Three self-serve login methods: email/password, Sign in with Google, Sign in with Microsoft.
- Organizations onboard users. An org admin is invited, verifies their domain, and invites their team.
- Per-organization **SSO** via **SAML 2.0** (and optionally OIDC), configured self-serve by the customer's admin at runtime — unbounded number of orgs, each with its own IdP.
- Per-organization **SCIM 2.0** provisioning so the customer's IdP can create/update/deactivate users in the app.
- An org can **enforce** SSO, which disables password and social login for its members.

**Non-functional** *(these are what actually drive the design)*

- **No attacker-controlled string may ever act as a verified fact.** Every hole in this feature is a violation of this one rule.
- **Tenant isolation.** Org A's IdP must never be able to mint an identity in Org B.
- **Revocation must be real.** `active: false` from SCIM has to kill live sessions, not just future logins.
- **Self-serve setup.** If a human from your team must be on a call for every SSO connection, the feature doesn't scale.
- **No lockout.** A customer whose IdP cert expires at 2am must still have a way in.
- **Runtime-configurable trust.** Certs, endpoints and secrets live in the database, per connection — not in `.env`.

---

## 2 · Terminology

### 2.1 The basics

| Term | Meaning |
|---|---|
| **Authentication** (authn) | *Who are you.* Login. |
| **Authorization** (authz) | *What may you do.* Roles/permissions. |
| **IdP** — Identity Provider | The system that owns the user's credentials and vouches for them. Google, Microsoft Entra ID, Okta, JumpCloud, OneLogin, Ping. |
| **SP** — Service Provider | The app that trusts the IdP. **You.** This is SAML's word. |
| **RP** — Relying Party / **Client** | OIDC's word for the same role. **You.** |
| **SSO** | An *outcome*, not a protocol: log in once at the IdP, get into many apps. SAML and OIDC are two protocols that implement it. |
| **Tenant / Organization** | One customer, with isolated config including its own IdP connection. |
| **JIT provisioning** | Create the user row on their *first successful SSO login*, from the assertion's attributes. |
| **Home realm discovery / IdP discovery** | Working out *which* IdP a given user belongs to. For you: email → domain → org → connection. |
| **Identity linking** | One human, several credentials (password + Google + SAML) attached to one canonical user row. |
| **Break-glass account** | An account deliberately exempt from SSO enforcement, so a broken IdP can't lock a customer out of their own tenant. |

> **OAuth 2.0 is authorization, not authentication.** "Sign in with Google" works because OIDC sits on top of OAuth and adds the `id_token`. Never treat a bare OAuth access token as proof of identity.

### 2.2 SAML vocabulary

| Term | Meaning |
|---|---|
| **Entity ID** | Unique identifier (a URI) for the SP and for the IdP. Yours: `https://yourapp.com/saml/metadata`. |
| **ACS URL** | *Assertion Consumer Service* — the endpoint on **your** server where the IdP POSTs the result. |
| **AuthnRequest** | XML you send to the IdP: "authenticate this person for me." |
| **Assertion** | The signed XML coming back: "this is harsh@visions.com, authenticated at 09:14Z, here are their attributes." |
| **NameID** | The primary subject identifier in the assertion. Format matters: `emailAddress`, or better, `persistent`. |
| **AttributeStatement** | Extra claims — firstName, lastName, email, groups. |
| **AuthnContextClassRef** | *How* they authenticated. You can require `…ac:classes:MultiFactor` in your AuthnRequest to demand MFA from the IdP. |
| **Bindings** | How messages travel. `HTTP-Redirect` for the request, `HTTP-POST` for the response (an auto-submitting form). |
| **RelayState** | Opaque string you send and get echoed back — how you carry "which org, which return URL" through the round trip. |
| **Metadata XML** | Machine-readable config: entity id, endpoints, X.509 signing cert. Both sides publish one. |
| **X.509 cert** | The IdP's public signing cert. **The entire trust anchor.** Get it wrong and anyone can forge logins. |
| **SLO** — Single Logout | Optional and half-broken across IdPs. Support if asked; never design around it. |

### 2.3 OIDC vocabulary, and the mapping

You already understand SAML — you know it by different words.

| Concept | OIDC | SAML |
|---|---|---|
| Your app's identifier | `client_id` | **Entity ID** |
| "Please authenticate this person" | Authorization Request | **AuthnRequest** |
| Where the answer lands | `redirect_uri` | **ACS URL** |
| The identity payload | `id_token` (a JWT) | **Assertion** (signed XML) |
| Stable user id | `sub` | **NameID** |
| Extra user info | claims in the JWT | **AttributeStatement** |
| Config discovery | `.well-known/openid-configuration` | **metadata XML** |
| Signing keys | JWKS endpoint | **X.509 certificate** |
| CSRF carrier | `state` | **RelayState** |
| Replay protection | `nonce` | Assertion `ID` + `NotOnOrAfter` |

**Lineage correction:** OIDC did *not* evolve from SAML. SAML 2.0 (2005, OASIS) came from the XML/SOAP/WS-\* world. OAuth 2.0 (2012, IETF) was built for delegated *authorization*; OIDC (2014) added an authn layer on top of it. Two independent standards that converged on the same problem from opposite directions — and **OIDC has not replaced SAML in enterprise.** Both are alive, which is why you build both.

### 2.4 SCIM vocabulary

**System for Cross-domain Identity Management.** RFC 7643 (schema) + RFC 7644 (protocol), 2015. Plain JSON REST. **Not authentication** — a directory sync API that *you serve* and the customer's IdP calls.

---

## 3 · What you are actually building

Not "OIDC or SAML" — **five separate integrations.**

```
┌─ 1. Email / password ────────────────────────────────────────────┐
│  Protocol: none. Your own code.                                  │
│  argon2id, verification emails, reset tokens, rate limits.        │
└──────────────────────────────────────────────────────────────────┘
┌─ 2. Sign in with Google ─────────────────────────────────────────┐
│  Protocol: OIDC.  You are the RP / Client.                       │
│  ONE fixed provider. ONE client_id in .env. Registered once.     │
└──────────────────────────────────────────────────────────────────┘
┌─ 3. Sign in with Microsoft ──────────────────────────────────────┐
│  Protocol: OIDC.  You are the RP / Client.                       │
│  ONE fixed provider (/common). ONE app registration.             │
└──────────────────────────────────────────────────────────────────┘
┌─ 4. Enterprise SSO, per organization ────────────────────────────┐
│  Protocol: SAML (mainly), optionally OIDC.  You are the SP.      │
│  N providers — ONE PER CUSTOMER. Config in the DATABASE.         │
│  Added at runtime by customer admins.                            │
└──────────────────────────────────────────────────────────────────┘
┌─ 5. SCIM ────────────────────────────────────────────────────────┐
│  Protocol: SCIM 2.0. A REST API you SERVE.                       │
│  N bearer tokens, one per customer.                              │
└──────────────────────────────────────────────────────────────────┘
```

### The distinction that actually matters

It isn't SAML-vs-OIDC. It's **fixed client vs dynamic relying party**:

| | #2 / #3 (social) | #4 (enterprise) |
|---|---|---|
| How many providers | Exactly 2, forever | One per customer, unbounded |
| Where config lives | `.env` | `sso_connections` table |
| Who sets it up | You, once, by hand | Customer admins, self-serve, at runtime |
| Callback URL | One, fixed | Per-connection: `/auth/sso/{connId}/acs` |
| Trust anchor | Google's/Microsoft's JWKS | A cert per row, rotating independently |
| What breaks | Nothing, ever | One customer's cert expires at 2am |

Even if #4 were pure OIDC it would share almost no code with #2/#3 — because #2/#3 hardcode one provider and #4 looks one up per request. **That's the real split in the codebase.**

### The same vendor appears twice

```
MICROSOFT, twice:

  "Sign in with Microsoft" button
    → OIDC, /common endpoint, your ONE app registration
    → any Microsoft account on earth
    → FREE for the customer, zero admin setup
    → integration #3

  Visions Ltd's enterprise SSO connection
    → SAML, against Visions' SPECIFIC Entra tenant
    → only Visions' employees
    → their admin configured it; needs Entra ID P1
    → integration #4, one row in sso_connections
```

Google is the same story: "Sign in with Google" is a completely separate integration from "Google Workspace as a SAML IdP for org 42."

### Which to build for #4 — SAML or OIDC?

**SAML first.**

1. The request always arrives as *"do you support SAML SSO?"* — that's the literal wording on security questionnaires.
2. Every IdP supports SAML for custom third-party apps. Custom **OIDC** app support is patchier — Okta and Entra do it well, but Google Workspace's custom-app story is SAML-oriented.
3. SCIM pairs with SAML in every IdP's provisioning UI; they're presented as one feature.

Keep `sso_connections.type ∈ {'saml','oidc'}` in the schema from day one, implement `'saml'`, add `'oidc'` when a customer asks. Your callback is already per-connection, so it's a branch, not a rewrite.

---

## 4 · The central invariant: email trust tiers

**This section is the security core of the whole design.** Every vulnerability in §11 is a violation of it.

> **An untrusted email claim can create nothing but a personal, unverified, org-less account — and cannot exclusively claim the address.**
>
> Org membership requires one of: (a) *you* verified the mailbox, (b) the org's own IdP asserted it, (c) an admin invited them, or (d) the token came from an Entra tenant the org registered.

| Tier | Source | May auto-join an org? |
|---|---|---|
| **none** | Microsoft `/common` with no `xms_edov`, or `xms_edov: false` | ❌ |
| **provider** | Google `email_verified: true`; Microsoft `xms_edov: true` | ✅ provider verified domain ownership |
| **self** | You emailed a signed link, they clicked it | ✅ |
| **org** | Assertion from that org's own connection, or an accepted invite | ✅ |

**`xms_edov`** ("email domain owner verified") is the optional claim Microsoft added specifically for this. It is **off by default** — enable it in your app registration's optional claims. It's what promotes Microsoft from tier *none* to tier *provider*, and without it you tax every legitimate Entra user with an extra verification email forever.

**Simple operating rule:** *no account row exists until the email is proven.*

**Corollary — key on stable IDs, never email.** `sub`, `oid`+`tid`, NameID, `externalId`. Email becomes a mutable profile field with **no authority**. Once it has no authority, an entire class of takeover bugs disappears.

---

## 5 · Data model

```
organizations
  id, name, slug, sso_enforced, auto_join_enabled, created_at

org_domains                          -- an org can own several domains
  id, org_id, domain, verified_at, verification_token
  UNIQUE(domain)                     -- a domain belongs to exactly one org

org_microsoft_tenants                -- the strong binding on the Microsoft path
  id, org_id, tid, verified_at, default_role
  UNIQUE(tid)                        -- one Entra tenant → one org

users
  id, org_id (nullable), email, email_verified, name, avatar,
  status ('invited'|'active'|'inactive'), role,
  token_version,                     -- bump to revoke all sessions
  scim_external_id
  -- uniqueness applies to PROVEN emails only, see below

identities                           -- the login methods on a user
  id, user_id,
  provider,                          -- 'password'|'google'|'microsoft'|'saml'|'oidc'
  provider_user_id,                  -- google sub | MS sub | SAML NameID | null
  connection_id (nullable),          -- which sso_connection this came from
  tid, oid (nullable),               -- Microsoft: tenant + object id, for support
  password_hash (nullable),          -- only for provider='password'
  last_login_at
  UNIQUE(provider, provider_user_id)

sso_connections                      -- one org may have >1 (Okta + Entra migration)
  id, org_id, type ('saml'|'oidc'), status ('draft'|'active'),
  display_name,                      -- the login BUTTON label. see §9
  is_primary, jit_enabled, allow_external_domains,
  -- SAML:
  idp_entity_id, idp_sso_url, idp_x509_certs[], name_id_format,
  attribute_map (jsonb),
  -- OIDC:
  issuer, client_id, client_secret_enc, discovery_url,
  default_role

invites
  id, user_id, org_id, role, token_hash, expires_at, consumed_at

scim_tokens
  id, org_id, token_hash, created_at, last_used_at, revoked_at

group_role_mappings                  -- IdP group → your app role
  id, org_id, idp_group_name, app_role
```

**Why `identities` is a separate table:** account linking, "signed up with a password, now wants Google", and moving an org from social to SAML all become *row inserts* instead of migrations.

**The two indexes that matter:**

```js
// Uniqueness applies to PROVEN emails only — this is the anti-squatting fix (§7.4)
db.users.createIndex({ email: 1 },
  { unique: true, partialFilterExpression: { emailVerified: true } });
db.users.createIndex({ email: 1, emailVerified: 1 });

// The structural fix that ends email-based identity matching forever
db.identities.createIndex({ provider: 1, providerUserId: 1 }, { unique: true });
```

**Multi-org humans** (consultants) — either `UNIQUE(org_id, email)` with an org switcher, or one global user with memberships. **Pick early**; changing later is painful.

---

## 6 · Flow A — email/password

```
1. POST /auth/signup {email, password}
2. Email not already taken (among VERIFIED users).
3. Check the domain against org_domains:
     verified domain AND org.sso_enforced
       → REJECT. "Your organization uses SSO." Otherwise an employee
         quietly creates a shadow password account and bypasses their
         company's MFA policy.
     verified domain, SSO not enforced, auto_join_enabled
       → create user, attach org_id
     else
       → personal user, org_id = null
4. argon2id (or bcrypt cost ≥ 12).
5. Send verification email — signed, single-use, ~24h TTL.
6. On click → email_verified = true → issue session.
```

Login is the mirror: find user → find the `provider='password'` identity → verify hash → rate-limit **per IP *and* per account** → issue session.

> Put the step-3 precedence logic in **one function** and call it from signup, login and invite acceptance. Scattering it is how bypasses appear.

---

## 7 · Flow B — Google / Microsoft (OIDC, authorization code + PKCE)

### 7.1 The round trip

```
1. Generate  state (CSRF), nonce (replay), code_verifier → code_challenge=S256.
   Store server-side keyed by state; put state in an httpOnly cookie.
2. Redirect to the authorization endpoint with
     client_id, redirect_uri, response_type=code, scope="openid email profile",
     state, nonce, code_challenge, code_challenge_method=S256
3. User authenticates and consents at the provider.
4. Provider redirects back with ?code=…&state=…
5. MANDATORY validation:
     - returned state == stored state              → CSRF
     - exchange code + code_verifier server-side   → id_token
     - verify id_token: signature vs JWKS (cached, keys rotate),
       iss, aud == your client_id, exp, nonce == stored nonce
6. Extract sub (stable, immutable). Key on SUB, NOT email.
```

**Microsoft-specific `iss` note:** with `/common`, `iss` is tenant-specific — `https://login.microsoftonline.com/{tid}/v2.0`. You cannot pin one issuer string. **Pin the host and require the issuer's tenant segment to equal the `tid` claim.**

### 7.2 Trusted vs untrusted, per provider

```
TRUSTED always:   sub, tid, oid
UNTRUSTED:        email, name  — from Microsoft /common without xms_edov
TRUSTED-ish:      email when Google says email_verified: true
                  (Google verifies domain ownership before a Workspace
                   admin can assert addresses at that domain)
```

### 7.3 The callback decision tree

```
Token verified. You hold: sub (trusted) | tid, oid (trusted) | email, name (UNTRUSTED)
│
├─ 0. Already a logged-in session?
│     → this is "connect account" from Settings. The session IS the proof.
│       Link immediately. → DONE
│
├─ 1. identities.findOne({provider:'microsoft', subject: sub})
│     → FOUND → load its user, log in. IGNORE the email claim entirely. → DONE
│
├─ 2. Not found. What is the email claim worth?  trust ∈ {none, provider}
│     │
│     ├─ 2a. tid registered in org_microsoft_tenants (verified)?
│     │       → STRONGEST signal on this path. Auto-provision into THAT org
│     │         (not the org implied by the email domain). emailVerified=true. → DONE
│     │
│     ├─ 2b. Email's domain owned by a verified org?   ← the targeted case
│     │       ├─ org.sso_enforced   → create NOTHING. Route to their IdP.
│     │       ├─ trust = none       → create NOTHING. Email a verify link.
│     │       └─ trust = provider   → auto-join, emailVerified = true. → DONE
│     │
│     └─ 2c. Domain owned by nobody
│             → personal account, org_id = null,
│               emailVerified = (trust === 'provider'),
│               no exclusive claim on the address. → DONE
│
└─ 3. A VERIFIED user already exists with this email → §8 (linking).
```

### 7.4 The three attacks this tree defends against

**nOAuth — existing-account takeover.** In Entra, a tenant admin sets their own users' `mail`/`otherMails` to arbitrary values; there is no requirement that the domain be one they own. And `/common` accepts tokens from *any* tenant, including a free one made five minutes ago:

```
1. Attacker creates tenant evil.onmicrosoft.com, user bob.
2. Sets bob's mail = harsh@visions.com.
3. Clicks "Sign in with Microsoft" on your app.
4. Your app receives a cryptographically VALID id_token from
   login.microsoftonline.com — signature, iss, aud, nonce all good —
   carrying  email: harsh@visions.com.
5. App matches on email → attacker is inside Harsh's account.
```

Nothing is forged. The token is genuine; the *claim inside it* is attacker-controlled. Microsoft's own guidance since: **never use `email` as a unique or trusted identifier — use `sub`, or `oid`+`tid`.**

**Auto-join injection — new-account variant, and worse, because there's no victim account to alert.**

```
1. Same forged tenant, mail = newhire@visions.com (nobody has this yet).
2. No identity, no existing user → the "brand new person" path.
3. Naive code: resolveForEmail("newhire@visions.com") → visions.com is a
   VERIFIED domain of org 42, auto-join on → attacker is a MEMBER of
   Visions' workspace, reading their data.
```

Domain-based auto-join is a **privilege grant**. Driving it from an untrusted claim hands out org membership to anyone with a free Entra tenant. Fix: branches 2a/2b above — resolve trust *before* touching org membership.

**Account squatting** — even harmless-looking branch 2c has a tail: an attacker creates a personal, org-less, unverified account holding `harsh@visions.com`. They can't read the mailbox so they can't escalate, but they've squatted the row: the real person now hits "email already in use", and any future code path that trusts `User.email` without checking `email_verified` becomes live. Fixes:

- the **partial unique index** from §5 — uniqueness only among verified users;
- lookups that matter use `{ email, emailVerified: true }`;
- a **reclaim path**: when someone verifies an email, delete unverified users holding it in the same transaction;
- expire unverified, never-logged-in accounts after ~7 days.

### 7.5 Why the tenant binding is the right primitive on the Microsoft path

`tid` **is** trusted — Microsoft won't issue a token for a tenant the caller doesn't belong to, and you validated that the issuer's tenant segment equals the `tid` claim. So:

```
Admin flow: an authenticated org OWNER goes to
  Settings → Connect Microsoft Entra → signs in with Microsoft themselves.
You read tid off THEIR verified token and store it in org_microsoft_tenants.

No DNS record, no pasting GUIDs, and the binding is established by
someone you already trust. After that every Microsoft login from that
tenant auto-joins correctly, and no other tenant can impersonate it.
```

This also matters commercially — see the P1 licensing note in §10.4.

---

## 8 · Flow B′ — linking a new provider to an existing user

**Scenario:** the user onboarded with Google (or a password). They come back and click **Sign in with Microsoft.**

### 8.1 The policy

The general OIDC rule — *auto-link when the provider asserts `email_verified: true`* — is sound for Google and **unsafe for Microsoft `/common`** (§7.4). If you'd rather have one code path than two policies, apply the strict flow to both. **Recommended:** strict for both. The UX cost is one extra click on a rare event.

> **Never auto-link. Stash the verified `sub`, demand proof of the existing account, then write the identity row.**

### 8.2 The Microsoft callback (collision branch)

```ts
// ── 6. Collision. Existing VERIFIED account, unproven Microsoft identity. ──
if (await this.orgs.isSsoEnforced(existing.orgId)) {
  return this.render(res, 'sso-required', { email: claimedEmail });
}

// Rate-limit: stops this being used to spam a victim with link prompts,
// or to probe which accounts exist.
await this.limiter.consume(`link:${claimedEmail}`, { points: 5, perHour: 1 });

const handle = randomToken(32);
await this.cache.set(`link:${handle}`, {
  provider: 'microsoft', subject: sub, tid, oid,
  pendingUserId: existing._id.toString(),   // ← BIND to the matched user
  claimedEmail,
}, { ttl: 600 });

// Cookie, NOT a URL param — so the handle can't be planted in
// someone else's browser.
res.cookie('link_handle', handle, {
  httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600_000,
});

const methods = await AuthIdentity.find({ userId: existing._id }).distinct('provider');
return this.render(res, 'confirm-link', {
  email: claimedEmail,
  canUsePassword: methods.includes('password'),
  canUseGoogle:   methods.includes('google'),
});
```

**Why an email lookup here is safe even though §4 says never match on email:** the difference is what the match *authorizes*. Here it authorizes **nothing** — it only decides which screen to render. The attacker with a forged `email` claim reaches this screen and is asked for the real user's password or Google account. **The lookup is a hint; the proof is the gate.**

### 8.3 Proof by password — no redirect, best UX

```ts
// POST /auth/link/confirm-password  { password }
const stash = await this.cache.getdel(`link:${req.cookies.link_handle}`); // atomic, single-use
if (!stash) throw new BadRequest('link_expired');
res.clearCookie('link_handle');

const user = await User.findById(stash.pendingUserId);
const pw = await AuthIdentity.findOne({ userId: user._id, provider: 'password' });
if (!pw) throw new BadRequest('no_password_credential');

const ok = await argon2.verify(pw.passwordHash, req.body.password);
if (!ok) {
  await this.limiter.consume(`link-pw:${user._id}`);
  throw new Unauthorized('bad_password');   // stash consumed → restart the flow
}
return this.finalizeLink(res, user, stash);
```

Consuming the stash *before* the password check makes the handle strictly one-attempt and kills it as a password-guessing oracle. If you prefer retries, keep the stash and rate-limit hard — just be deliberate.

### 8.4 Proof by Google re-auth

```ts
// inside googleCallback, AFTER verifying the id_token
const googleIdentity = await AuthIdentity.findOne({
  provider: 'google', subject: claims.sub,
});

if (pkce.intent === 'link') {
  const stash = await this.cache.getdel(`link:${req.cookies.link_handle}`);
  if (!stash) throw new BadRequest('link_expired');
  res.clearCookie('link_handle');

  // ★ THE most important line in this whole feature.
  // Without it, anyone who can complete ANY Google login can redeem ANY stash.
  if (!googleIdentity || googleIdentity.userId.toString() !== stash.pendingUserId) {
    throw new Forbidden('link_owner_mismatch');
  }
  return this.finalizeLink(res, await User.findById(stash.pendingUserId), stash);
}
// ...otherwise fall through to the normal Google login path
```

### 8.5 The shared finalizer

```ts
private async finalizeLink(res, user, stash) {
  // Race guard: two tabs, or this sub got claimed in the last 10 minutes.
  // The unique index is the real enforcement; this makes the error sane.
  const clash = await AuthIdentity.findOne({
    provider: stash.provider, subject: stash.subject,
  });
  if (clash) {
    if (clash.userId.toString() !== user._id.toString())
      throw new Conflict('identity_already_linked');
  } else {
    await AuthIdentity.create({
      userId: user._id, provider: stash.provider, subject: stash.subject,
      tid: stash.tid, oid: stash.oid, lastLoginAt: this.now(),
    });
  }

  // Detection control. ALWAYS send. This is how a real takeover gets caught.
  await this.mailer.send(user.email, 'security/provider-linked', {
    provider: 'Microsoft', revokeUrl: this.urls.securitySettings(),
  });
  await this.audit.log({ userId: user._id, orgId: user.orgId,
    action: 'identity.linked', provider: stash.provider, tenantId: stash.tid });

  return this.issueSession(res, user);
}
```

**On `token_version`:** don't bump it on a *link*. It logs the user out on every other device for what feels like connecting an account. The notification email is the control that actually catches abuse. Reserve the bump for password changes, email changes, unlinks, and SSO-enforcement flips.

### 8.6 What the user sees

```
[ Sign in with Microsoft ]  ← clicked
          ↓
┌──────────────────────────────────────────────────┐
│  Connect your Microsoft account                  │
│  harsh@visions.com already has an account here.  │
│  Confirm it's you and we'll add Microsoft as a   │
│  way to sign in.                                 │
│                                                  │
│  Password  [ ················ ]  [ Confirm ]     │
│  ── or ──   [  Continue with Google  ]           │
│                                                  │
│  Not your account? Contact support.              │
└──────────────────────────────────────────────────┘
          ↓
   Signed in. Next time the Microsoft button works in ONE hop —
   branch 1 of the tree catches it. One indexed lookup, forever.
```

One-time cost, one login, per user.

> Step 8.6 leaks *which providers exist* on an account. Unavoidable if you want that UX. Accept it knowingly, and don't expose the same detail on the plain login screen where it buys nothing.

---

## 9 · Flow C — enterprise SSO (SP-initiated SAML)

### 9.1 Identifier-first discovery

You cannot know which IdP to use until you know the domain. Hence **identifier-first**: ask for the email before showing anything else.

```
┌──────────────────────────────────┐        ┌──────────────────────────────────┐
│  Sign in to YourApp              │        │  harsh@visions.com        [edit] │
│  Email                           │        │                                  │
│  [ harsh@visions.com        ]    │  ───▶  │  Visions uses single sign-on.    │
│  [        Continue        ]      │        │  [   Continue with Okta    ]     │
│  ── or ──                        │        │                                  │
│  [ Google ]  [ Microsoft ]       │        │  ← no password field             │
└──────────────────────────────────┘        │  ← no social buttons             │
   Step 1: identifier only. Never           └──────────────────────────────────┘
   show a password field yet — you             Step 2: rendered from /auth/discover
   don't know if one is allowed.
```

Social buttons on step 1 are fine — an enforced-org user who clicks Google there gets caught by the enforcement check and routed to their IdP. No bypass, and most visitors aren't from an enforced org.

```ts
// POST /auth/discover  { email }
const email  = req.body.email.toLowerCase().trim();
const domain = email.split('@')[1];
if (!domain) throw new BadRequest('invalid_email');
await this.limiter.consume(`discover:${req.ip}`);

const orgDomain = await OrgDomain.findOne({ domain, verifiedAt: { $ne: null } });
if (!orgDomain) return res.json({ methods: ['password','google','microsoft'] });

const org   = await Org.findById(orgDomain.orgId);
const conns = await SsoConnection.find({ orgId: org._id, status: 'active' });
const ssoOptions = conns.map(c => ({
  id: c._id,
  label: `Continue with ${c.displayName}`,
  startUrl: `/auth/sso/${c._id}/start`,
}));

if (org.ssoEnforced && ssoOptions.length) {
  return res.json({ orgName: org.name, methods: ['sso'], sso: ssoOptions });
}
return res.json({
  orgName: org.name,
  methods: ['password','google','microsoft', ...(ssoOptions.length ? ['sso'] : [])],
  sso: ssoOptions,
});
```

**Enumeration note:** this answers based on the **domain**, never on whether the user exists. Two different unregistered addresses at the same company get identical responses. You disclose "Visions uses SSO here" — which every SaaS does and their IT admin considers public — not "harsh has an account."

**Implementation notes.** Don't fire `/auth/discover` on keystrokes — on submit, or on blur debounced ~500ms; it's a DB hit and trivially scrapeable otherwise. And when an enforced org has exactly one active connection, **return a 302 target and follow it** — a screen with a single button on it is a click charged to the user for nothing.

### 9.2 The full round trip

```
┌─ Browser ─────────────────────────────────────────────────────┐
│ 1. User types harsh@visions.com at /login                     │
└───────────────┬───────────────────────────────────────────────┘
                ▼  POST /auth/discover
┌─ Your server ─────────────────────────────────────────────────┐
│ 2. domain → org_domains (verified) → org 42                   │
│    → sso_connections WHERE org_id=42 AND status='active'      │
│                                                               │
│ 3. GET /auth/sso/{connId}/start                               │
│    AuthnRequest:  ID=_abc123 (STORE IT, see 7f)               │
│                   Issuer=your Entity ID                        │
│                   Destination=conn.idp_sso_url                 │
│                   ACS=https://yourapp.com/auth/sso/{id}/acs   │
│    deflate+base64 → SAMLRequest                                │
│    RelayState = signed {org_id, return_to, request_id}         │
│    302 to idp_sso_url                                          │
└───────────────┬───────────────────────────────────────────────┘
                ▼
┌─ Okta / Entra / Google Workspace ─────────────────────────────┐
│ 4. Live IdP session? straight through. Else password + MFA +   │
│    conditional access.                                         │
│ 5. Signed Assertion → auto-submitting HTML form → your ACS.    │
└───────────────┬───────────────────────────────────────────────┘
                ▼
┌─ Your ACS: POST /auth/sso/{connId}/acs ───────────────────────┐
│ 6. base64-decode SAMLResponse.                                 │
│ 7. VALIDATE — every one of these is MANDATORY:                 │
│      a. XML signature valid vs conn.idp_x509_certs             │
│      b. Issuer == conn.idp_entity_id                           │
│      c. Audience == your Entity ID                             │
│      d. Destination / Recipient == your ACS URL                │
│      e. NotBefore <= now <= NotOnOrAfter (small clock skew)    │
│      f. InResponseTo == the request_id you stored (SP-init)    │
│      g. Assertion ID not seen before → replay cache            │
│      h. Org comes from THE CONNECTION, never from the email    │
│      i. The email's domain belongs to THAT org                 │
│    Any failure = reject. No "best effort" here.                │
│ 8. Extract NameID + mapped attributes.                         │
│ 9. Match (§9.4), attach identity, map groups → role.           │
│ 10. Issue YOUR session. Redirect to return_to.                 │
└───────────────────────────────────────────────────────────────┘
```

**7h and 7i are the tenant-isolation boundary.** The tenant is decided by *which connection validated the signature*, not by the email inside the assertion — otherwise Org A's IdP can mint an assertion for `ceo@orgB.com` and you'll log them into Org B. And in reverse, reject an assertion whose email domain isn't in that org's verified domains.

**IdP-initiated variant:** the IdP POSTs to your ACS unsolicited (a user clicked your tile in their Okta dashboard). No `InResponseTo`, no RelayState you generated. Resolve the connection by the assertion's `Issuer`, and lean harder on the replay cache plus a tight `NotOnOrAfter`.

### 9.3 The session semantics people get wrong

> **The IdP round trip is not per-request.** Once the assertion validates you issue **your own** session cookie, and every subsequent request is a normal session lookup. The IdP is involved when the session is *created*, not when it's *used*.

```
Your session expires (say 7 days) → /login → email → 302 to Okta
      ↓
Okta already has a live session (they logged in this morning for
email/Slack/Jira) → immediately POSTs an assertion back.
No password. No MFA. No prompt.
      ↓
Fresh session issued. ~400ms, two redirects, zero interaction.
```

That *is* single sign-on. The heavy path only runs when the IdP session has also expired. **And this is exactly why SCIM's `active:false` must actively revoke sessions** — otherwise a deprovisioned user keeps their existing session until it expires.

### 9.4 Matching at the ACS (with invite context)

```ts
const conn  = /* resolved by Issuer, or by the per-connection ACS URL */;
const orgId = conn.orgId;                    // ← authoritative. NEVER from email.
const assertedEmail = attrs.email.toLowerCase();
const nameId        = assertion.nameId;

// Domain fence: this connection may only speak for its own org's domains.
const okDomain = await OrgDomain.exists({
  orgId, domain: assertedEmail.split('@')[1], verifiedAt: { $ne: null },
});
if (!okDomain && !conn.allowExternalDomains) throw new Forbidden('domain_mismatch');

// 1) Already linked?
let identity = await AuthIdentity.findOne({
  provider: 'saml', connectionId: conn._id, subject: nameId,
});
if (identity) return this.issueSession(res, await User.findById(identity.userId));

// 2) Invite context in the cookie? Strongest hint available.
let user = null, invite = null;
if (req.cookies.invite_ctx) {
  invite = await Invite.findOne({
    tokenHash: sha256(req.cookies.invite_ctx), consumedAt: null,
    expiresAt: { $gt: this.now() }, orgId,        // must match THIS org
  });
  if (invite) user = await User.findById(invite.userId);
}

// 3) No invite (login page, or the Okta tile) → match the shell by email in this org.
if (!user) user = await User.findOne({ orgId, email: assertedEmail });

// 4) Still nothing → JIT, if the org allows it.
if (!user) {
  if (!conn.jitEnabled) throw new Forbidden('user_not_provisioned');  // SCIM-only orgs
  user = await User.create({
    orgId, email: assertedEmail, emailVerified: true,   // org IdP asserted it
    name: attrs.name, status: 'active', tokenVersion: 0,
  });
}

await AuthIdentity.create({
  userId: user._id, provider: 'saml',
  connectionId: conn._id, subject: nameId, lastLoginAt: this.now(),
});

// The IdP is authoritative for its own users. Invite went to harsh@visions.com
// but Okta says h.sharma@visions.com? Take the IdP's value — the domain fence
// already proved it's in scope.
await User.updateOne({ _id: user._id }, {
  status: 'active', emailVerified: true, email: assertedEmail,
  name: attrs.name ?? user.name,
  role: this.resolveRole({ groups: attrs.groups, conn, invite }),
});
if (invite) await Invite.updateOne({ _id: invite._id }, { consumedAt: this.now() });
res.clearCookie('invite_ctx');
return this.issueSession(res, user);
```

**Role precedence — decide once, document it for admins:** *IdP group mapping wins if the org configured any mappings, else the invite's role, else the connection default.* Groups winning is the right default — the whole point of enterprise SSO is that the IdP is the source of truth for who's an admin, and an org admin shouldn't be able to escalate someone by hand-picking a role in an invite.

### 9.5 Four ways to skip typing the email

Email-first is the **fallback**. Most enterprise logins never touch it.

| Route | How | When |
|---|---|---|
| **Remembered connection** | On successful SSO login set a long-lived `last_conn=conn_abc` cookie. Next visit render "Continue with Okta" directly, with a small "use a different account" link. | Returning users — the majority |
| **Tenant URL** | `visions.yourapp.com` or `yourapp.com/o/visions` → org from the URL, no email needed. Enterprises bookmark these. | Worth building if enterprise-heavy |
| **IdP-initiated** | They click your tile in their Okta/Entra dashboard. Your login page never renders. | Very common — the IdP dashboard *is* their home page |
| **Invite deep link** | The invite carries the org, so it renders the SSO button directly (§11). | First login |

---

## 10 · Flow D — org onboarding and self-serve SSO setup

### 10.1 Where the IdP actually lives

**Okta is the customer's software, not yours.** You never install, host, or pay for it. An IdP is infrastructure the customer already bought for their own IT — laptops, email, VPN, Slack, Salesforce. **Your app is one more row in a list they already maintain.**

```
Visions Ltd. already has ONE of:
  visions.okta.com     ← their Okta tenant, they pay ~$2-6/user/mo
  Entra ID inside their Microsoft 365 subscription  ← already there
  admin.google.com     ← their Google Workspace, already there

Inside it, a list of apps:
  ├── Salesforce   (SAML)
  ├── Slack        (SAML + SCIM)
  ├── Zoom         (SAML)
  └── YourApp      ← the admin adds this row. ~15 min of their time.
```

You never log into their IdP; they never log into your servers. The handshake is entirely *"here are my values, give me yours."*

### 10.2 Who does what

| Step | Who | Where |
|---|---|---|
| Buy / operate the IdP | **Customer** | Their vendor contract |
| Create the app entry for YourApp | **Customer's IT admin** | Their IdP admin console |
| Publish SP Entity ID + ACS URL + metadata XML | **You** | Your SSO settings page |
| Paste those into the IdP | **Customer admin** | Their console |
| Copy IdP metadata XML / URL back | **Customer admin** | Their console → your settings |
| Store the connection, validate assertions | **You** | Your backend |
| Assign which employees get the app | **Customer admin** | Their console (groups) |
| Generate SCIM base URL + bearer token | **You** | Your settings page |
| Paste SCIM URL + token, enable provisioning | **Customer admin** | Their console |
| Test the connection | **Both** | Your "Test connection" button |

### 10.3 The three vendors you'll actually meet

| IdP | Lives at | Admin path | Who has it |
|---|---|---|---|
| **Microsoft Entra ID** (was Azure AD) | `entra.microsoft.com` | Enterprise applications → New application → *Create your own* → *Integrate any other application* → Single sign-on → SAML | **Anyone on Microsoft 365 already has it** — it backs their Outlook/Teams logins. Most common in enterprise. |
| **Google Workspace** | `admin.google.com` | Apps → Web and mobile apps → Add app → *Add custom SAML app* | Anyone on business Gmail. Common in startups/SMB. |
| **Okta / JumpCloud / OneLogin / Ping / Auth0** | `<company>.okta.com` | Applications → Create App Integration → SAML 2.0 | A *deliberate* identity layer, bought when they outgrew "whatever came with our email." Mid-market up, and disproportionately common among customers who actually ask you for SSO. |

If a company is big enough to demand SSO, they have one of these. A 10-person startup has none and doesn't want SAML — they want your Google button. **Don't sell SAML to a 10-person company.**

### 10.4 The licensing gotcha that changes product decisions

> **Custom SAML apps in Entra ID require Entra ID P1** (formerly Azure AD Premium P1). A customer on Microsoft 365 Business Basic/Standard has Entra ID Free and **cannot** add you as a custom SAML app without upgrading. Entra's SCIM provisioning also wants P1.

So *"we use Microsoft, we want SSO"* often means an upsell **on their side** that they don't want to pay for. The workaround is genuinely good:

**"Sign in with Microsoft" (OIDC) is free for everyone.** No P1. Which means your Microsoft social button isn't only a consumer convenience — **it's the SSO path for every Microsoft customer too small for P1.** Combine it with the `org_microsoft_tenants` binding (§7.5) and those customers get most of what SSO gives them — centrally-managed identity, their MFA policy, no passwords in your app — at zero licensing cost.

Google's shape: custom SAML apps are available across their business editions, and "Sign in with Google" is free. Google's weak spot is the other direction — **its outbound provisioning only targets apps in its catalog**, so a Google-shop customer generally can't hand you SCIM natively. **Plan on JIT for them.** Okta and Entra both do SCIM to custom apps fine.

### 10.5 Testing with zero customers

| Tool | Cost | Good for |
|---|---|---|
| **`mocksaml.com`** (BoxyHQ) | Free, no signup | Instant fake IdP. Your first end-to-end assertion, in 30 min. |
| **Okta Developer Edition** | Free, permanent | Full SAML + SCIM. Closest thing to a real enterprise customer. |
| **Microsoft 365 Developer Program** | Free, renewable | Entra tenant with P1 features — custom SAML + provisioning |
| **Google Workspace trial** | 14 days / cheap 1-seat | Custom SAML app testing |
| **Keycloak in Docker** | Free | A local IdP you fully control — best for CI integration tests |
| **`samltest.id`** | Free | Another public test IdP |

Practical order: **mocksaml.com** → **Okta Developer** (real-world quirks) → **Entra** (different quirks, especially NameID formats and `http://schemas.xmlsoap.org/...` attribute names) → Google if needed. Keycloak in CI so your SAML validation has regression tests.

### 10.6 App catalogs — later, but know they exist

The **Okta Integration Network (OIN)**, the **Entra ID app gallery**, Google's app catalog. Getting listed means the admin searches "YourApp", clicks, and half the fields are pre-filled — less setup friction plus real distribution. Requires submitting your integration for vendor review. Not day one; put it on the list for when enterprise is a real channel. Until then "Create your own application" works identically, just with more copy-paste.

### 10.7 The admin onboarding sequence

```
1. You (or sales) create org "Visions" and invite admin@visions.com as OWNER.
   They accept via an invite token — an invite IS a domain claim, so an
   invited owner is trusted for that domain.

2. Admin → Settings → Domains → adds "visions.com".
   You generate  TXT visions-verify=<random>.
   They add the DNS record; you resolve it and set verified_at.
   ⚠ Re-verify periodically — domains change hands.

3. Admin → Settings → Single Sign-On → Set up SAML.
   Show YOUR side (they copy OUT), take THEIR side (prefer metadata URL).
   Store as a 'draft' connection.

4. "Test connection" — run the full SP-initiated flow in a popup without
   creating a session. Show the decoded assertion and exactly which check
   failed. ★ This one screen eliminates most future support load.

5. Activate. Then optionally sso_enforced = true.
```

### 10.8 The settings surface — your entire deliverable on this axis

```
Settings → Single Sign-On
├─ Your details (they copy these OUT)
│    SP Entity ID:  https://yourapp.com/saml/metadata            [copy]
│    ACS URL:       https://yourapp.com/auth/sso/{connId}/acs    [copy]
│    NameID format: EmailAddress
│    Required attributes: email, firstName, lastName, groups
│    [ Download SP metadata XML ]
│
├─ Their details (they paste these IN)
│    ○ Metadata URL   ← PREFER THIS: you can re-fetch it and survive
│                       cert rotation
│    ○ Upload metadata XML
│    ○ Enter manually (Entity ID / SSO URL / X.509 cert)
│
├─ [ Test connection ]
├─ Attribute mapping   (their claim name → your field)
├─ Group → role mapping
└─ [ Activate ]   then   [ Enforce SSO for this organization ]

Settings → Provisioning (SCIM)
     SCIM base URL:  https://yourapp.com/scim/v2/orgs/42   [copy]
     Bearer token:   scim_live_xxxxx  (shown once)  [regenerate]
```

Plus a docs page per IdP — *"Setting up SSO with Okta / Entra ID / Google Workspace"* — with screenshots of **their** console. Every SaaS with SSO has these three pages; go read Notion's or Linear's for the shape. Customers' IT admins genuinely follow them step by step.

### 10.9 The enforcement ordering trap

The first admin **cannot** onboard via SSO, because SSO doesn't exist yet:

```
1. Owner accepts their invite with password or Google/Microsoft.  ← must work
2. Owner verifies visions.com via DNS TXT.
3. Owner configures + TESTS the SAML connection.
4. ONLY NOW may they set sso_enforced = true.
```

Gate step 4 in code: **`sso_enforced` cannot be set true unless an `active`, successfully-tested connection exists.** And keep at least one **break-glass owner** exempt, reachable at a separate `/login/recovery` path with its own audit trail. When their cert expires at 2am, that exemption is the difference between a support ticket and a public incident.

---

## 11 · Flow E — invite + SSO-enforced onboarding

### 11.1 What options do you show? Render from policy, not a fixed template

| Situation | What the user sees |
|---|---|
| Unknown visitor, no context | Email field + Google + Microsoft. No password field yet. |
| Email typed, domain owns no org | Password + Google + Microsoft |
| Email typed, org exists, `sso_enforced = false` | Password + Google + Microsoft + "Continue with Okta" |
| Email typed, org exists, `sso_enforced = true` | **Only** "Continue with Okta" |
| Invite clicked, `sso_enforced = false` | Password + Google + Microsoft — all valid, pick one |
| Invite clicked, `sso_enforced = true` | **Only** "Continue with Okta" |
| Break-glass owner on an enforced org | Password, via a separate `/login/recovery` path |

So for an invited user at an enforced org: **you give them one button.** Showing Google/Microsoft there is actively harmful — it invites them to create a credential their org's policy forbids, and they hit a rejection two clicks later.

> **★ The key realization: the invite click has already done a job for you — it proved the mailbox.** So the invite flow needs *less* proof than a cold signup, not more.

### 11.2 The flow

```
┌─ Admin ───────────────────────────────────────────────────────────┐
│ 1. Owner at Visions invites harsh@visions.com as MEMBER.          │
│    (Or SCIM pushes the user — same destination, no email sent.)   │
└──────────────┬───────────────────────────────────────────────────┘
┌─ Your server ─────────────────────────────────────────────────────┐
│ 2. Domain check: visions.com must be a verified domain of org 42, │
│    OR the org must allow inviting external addresses. Don't let   │
│    an org invite @gmail.com into an SSO-ENFORCED tenant unless    │
│    they explicitly enabled it — those users can NEVER satisfy the │
│    policy and are permanently stuck.                              │
│ 3. Create the shell:                                              │
│      User { email, orgId:42, status:'invited',                    │
│             emailVerified:false, role:'member' }                  │
│    → NO identity rows. No password. Nothing to log in with.       │
│ 4. Invite { userId, orgId, role, tokenHash, expiresAt:+7d }       │
│    Token = 32 random bytes; store only the HASH.                  │
│ 5. Email → https://yourapp.com/invite/accept?token=...            │
└──────────────┬───────────────────────────────────────────────────┘
┌─ Harsh clicks ────────────────────────────────────────────────────┐
│ 6. Validate: hash matches, not expired, not consumed,             │
│              user still status='invited'.                          │
│    ★ The click proves mailbox control → emailVerified = true.      │
│    Move the token out of the URL into an httpOnly cookie so it     │
│    doesn't ride through the SAML round trip in query strings,      │
│    Referer headers, or browser history.                            │
│ 7. Read org policy → sso_enforced → render ONE button.            │
└──────────────┬───────────────────────────────────────────────────┘
                ▼  §9.2 SP-initiated SAML, RelayState carries orgId+inviteId
                ▼  §9.4 match via invite context → attach → activate → session
```

### 11.3 The accept endpoint

```ts
// GET /invite/accept?token=...
const invite = await Invite.findOne({
  tokenHash: sha256(req.query.token),
  consumedAt: null, expiresAt: { $gt: this.now() },
});
if (!invite) return this.render(res, 'invite-invalid');

const user = await User.findById(invite.userId);
const org  = await Org.findById(invite.orgId);

// Already onboarded? Just send them to login — idempotent, no error page.
if (user.status === 'active') return res.redirect('/login');

// ★ A link delivered to that mailbox IS proof of the address.
await User.updateOne({ _id: user._id }, { emailVerified: true });

res.cookie('invite_ctx', req.query.token, {
  httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1_800_000,  // 30 min
});

const conn = await SsoConnection.findOne({ orgId: org._id, status: 'active' });

if (org.ssoEnforced) {
  if (!conn) {                                  // enforcement on, no connection
    await this.alerts.orgMisconfigured(org._id); // don't dead-end the user
    return this.render(res, 'invite-sso-unavailable', { org });
  }
  return this.render(res, 'invite-sso-only', {
    org, idpName: conn.displayName ?? 'your identity provider',
    startUrl: `/auth/sso/${conn._id}/start?invite=1`,
  });
}

// Not enforced → let them choose. Email is ALREADY proven, so every one of
// these is a single hop with no extra verification step.
return this.render(res, 'invite-choose-method', {
  org, showPassword: true, showGoogle: true, showMicrosoft: true,
  showSso: !!conn,     // offered, not required
});
```

### 11.4 The four doors into an SSO-enforced org

**Your invite flow must not be the only way in.** All four happen in the wild and all converge on the §9.4 handler.

| Door | What happens |
|---|---|
| **Invite click** | §11.2. `invite_ctx` cookie present. |
| **They ignore the invite and go to `/login`** | Identifier-first → domain → org → enforced → one button → same ACS, no invite cookie, **matched by email at step 3**. |
| **They click your tile in Okta** (IdP-initiated) | Assertion arrives cold. No `InResponseTo`, no invite cookie, no RelayState you made. Resolve by `Issuer`, lean on the replay cache + tight `NotOnOrAfter`, match by email, JIT at step 4. |
| **SCIM pre-provisioned** | The user row already exists; often no invite email is ever sent. First login just attaches the identity. Set `jit_enabled = false` for these orgs so unknown users are **rejected**, not silently created. |

> **The invite is a convenience, not a gate.** Build the email-match and JIT paths or half your enterprise users are stuck.

---

## 12 · SAML, in depth

### 12.1 The one real architectural difference from OIDC

**OIDC has a back channel. SAML, as deployed, does not.**

```
OIDC authorization code flow:
  browser gets a short, useless `code`
      ↓
  YOUR SERVER ──TLS──→ IdP token endpoint    ← direct, private, authenticated
  YOUR SERVER ←──────── id_token
  The identity payload NEVER touches the browser.

SAML HTTP-POST binding:
  IdP builds the ENTIRE signed answer
      ↓ hands it to the browser as an auto-submitting form
      ↓ browser POSTs it to your ACS URL
  There is no back channel. There is no second call.
  The identity payload travels through the USER'S MACHINE.
```

That's why SAML leans so hard on the XML signature: the document crosses hostile territory — a machine the user controls — so it must be **self-verifying**. Skip or botch signature validation and anyone can hand-write an assertion claiming to be the CEO and POST it to your ACS.

Structurally, SAML's POST binding is OIDC's **implicit flow** — the one the industry killed precisely because tokens through the browser are fragile. SAML survives it by signing the payload.

> **Never hand-roll SAML XML parsing.** XML Signature Wrapping (XSW) attacks exploit the gap between *what the parser reads* and *what the signature covers*. That gap has produced a decade of CVEs in otherwise competent libraries. Use `@node-saml/node-saml` / `python3-saml` / `ruby-saml` and keep it patched.

*(SAML does define an Artifact binding with a real back channel. Essentially nobody uses it. Ignore it.)*

### 12.2 A real assertion, trimmed

```xml
<samlp:Response Destination="https://yourapp.com/auth/sso/conn_abc/acs"
                InResponseTo="_a1b2c3"          <!-- your AuthnRequest ID -->
                ID="_resp_9f8e" Version="2.0"
                IssueInstant="2026-08-04T09:14:22Z">

  <saml:Issuer>http://www.okta.com/exk1a2b3c4</saml:Issuer>   <!-- which IdP -->

  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>

  <saml:Assertion ID="_assert_7d6c" IssueInstant="2026-08-04T09:14:22Z">
    <saml:Issuer>http://www.okta.com/exk1a2b3c4</saml:Issuer>

    <ds:Signature>…</ds:Signature>        <!-- ← the entire trust anchor -->

    <saml:Subject>
      <saml:NameID Format="…nameid-format:emailAddress">
        harsh@visions.com                 <!-- ← your provider_user_id -->
      </saml:NameID>
      <saml:SubjectConfirmation>
        <saml:SubjectConfirmationData
              NotOnOrAfter="2026-08-04T09:19:22Z"      <!-- 5 min window -->
              Recipient="https://yourapp.com/auth/sso/conn_abc/acs"
              InResponseTo="_a1b2c3"/>
      </saml:SubjectConfirmation>
    </saml:Subject>

    <saml:Conditions NotBefore="2026-08-04T09:09:22Z"
                     NotOnOrAfter="2026-08-04T09:19:22Z">
      <saml:AudienceRestriction>
        <saml:Audience>https://yourapp.com/saml/metadata</saml:Audience>
      </saml:AudienceRestriction>         <!-- ← must equal YOUR entity id -->
    </saml:Conditions>

    <saml:AuthnStatement AuthnInstant="2026-08-04T09:14:20Z">
      <saml:AuthnContext>
        <saml:AuthnContextClassRef>
          urn:oasis:names:tc:SAML:2.0:ac:classes:X509
        </saml:AuthnContextClassRef>      <!-- HOW they authenticated -->
      </saml:AuthnContext>
    </saml:AuthnStatement>

    <saml:AttributeStatement>
      <saml:Attribute Name="email">
        <saml:AttributeValue>harsh@visions.com</saml:AttributeValue>
      </saml:Attribute>
      <saml:Attribute Name="groups">
        <saml:AttributeValue>engineering</saml:AttributeValue>
        <saml:AttributeValue>admins</saml:AttributeValue>   <!-- → your roles -->
      </saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>
```

Every field in the §9.2 step-7 checklist is visible here: `Issuer`, `Audience`, `Destination`/`Recipient`, `NotBefore`/`NotOnOrAfter`, `InResponseTo`, the assertion `ID` for your replay cache. **That list isn't arbitrary paranoia — it's literally "verify each thing the document claims about itself."**

### 12.3 Why `attribute_map` exists

Same field, three names:

| Field | Okta | Entra ID | Others |
|---|---|---|---|
| email | `email` | `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress` | `mail` |
| first name | `firstName` | `…/claims/givenname` | `givenName` |
| groups | `groups` | `http://schemas.microsoft.com/ws/2008/06/identity/claims/groups` | `memberOf` |

This is the **one place** per-vendor difference leaks into your code. Contain it in a per-connection `attribute_map` jsonb and everything downstream stays vendor-agnostic.

### 12.4 Why SAML still exists in 2026

- Predates OAuth by years, so every enterprise IdP and legacy app already speaks it.
- Procurement checklists literally say *"SAML 2.0 SSO"* — not "SSO."
- It's genuinely good at the enterprise-specific parts: multi-valued attributes, `AuthnContext` requirements, signed metadata exchange.
- Migration costs money and breaks logins, so nobody does it.

---

## 13 · SCIM, in depth

### 13.1 The gap it fills

SSO only tells you about a person **at the exact moment they log in.** That leaves two holes.

**Hole 1 — people who haven't logged in yet.**

```
Monday: A new hire starts. IT adds them to "Engineering" in Okta.
        Your app: knows nothing. The admin must manually invite them,
        or wait for the person to stumble onto your app and JIT-provision.
        Meanwhile the org can't pre-assign their project, team, permissions.
```

**Hole 2 — people who leave. This is the one enterprises actually pay for.**

```
Friday 5pm: Employee terminated. IT disables them in Okta.
            SSO login now fails. ✓
            But in YOUR database:
            - the user row still exists, status active
            - still counted against the org's seat licence
            - still in the org's member list
            - their API token still works              ✗
            - their active session cookie still works  ✗
            - an admin must remember to delete them by hand

Multiply by 40 SaaS apps × every departure. THIS is why SCIM exists.
```

SSO cannot fill these holes **because SSO only fires when a browser shows up.** A departed employee's browser never shows up.

### 13.2 The direction flips

```
SAML / OIDC:   the user's BROWSER drives it
               happens ONLY at login
               IdP → browser → your app   (front channel)
               a human is always present

SCIM:          the IdP's SERVER drives it
               happens WHENEVER the directory changes
               IdP server ──HTTPS──→ your REST API   (back channel)
               NO human present. Could be 3am.
```

For SAML you *receive* a POST. For SCIM **you are the API** — you publish a URL and a bearer token and their IdP starts calling you.

### 13.3 The endpoints

Base URL is per-org: `https://yourapp.com/scim/v2/orgs/{org_id}`, `Authorization: Bearer <token>` from `scim_tokens` (stored hashed, shown once, rotatable).

| Call | Meaning for you |
|---|---|
| `GET /Users?filter=userName eq "harsh@visions.com"` | Okta checks existence before creating. **Must** support this filter or provisioning breaks. |
| `POST /Users` | Create in org N, `status='invited'`, store `externalId`. **No password.** |
| `GET /Users/{id}` | Return the SCIM representation. |
| `PATCH /Users/{id}` | Partial update. The big one: `{"op":"replace","path":"active","value":false}` → **deprovision**: revoke all sessions and API tokens immediately. |
| `PUT /Users/{id}` | Full replace. |
| `DELETE /Users/{id}` | Many IdPs never send it; they use `active:false`. Support both, prefer soft-delete for audit. |
| `GET/POST/PATCH /Groups` | Group membership → `group_role_mappings` → app roles. |
| `GET /ServiceProviderConfig`, `/Schemas`, `/ResourceTypes` | Discovery. Okta/Entra probe these. |

```http
POST /scim/v2/orgs/42/Users
Authorization: Bearer scim_live_7f3a…
Content-Type: application/scim+json

{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "userName": "harsh@visions.com",
  "externalId": "00u1a2b3c4d5",           // ← Okta's own id for this person
  "name": { "givenName": "Harsh", "familyName": "Sharma" },
  "emails": [{ "value": "harsh@visions.com", "primary": true }],
  "active": true
}
```

Reply `201` with the resource and the `id` you assigned. Then Friday at 5pm:

```http
PATCH /scim/v2/orgs/42/Users/usr_88h2k
{
  "schemas": ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
  "Operations": [ { "op": "replace", "path": "active", "value": false } ]
}
```

**Those five lines are the entire commercial reason SCIM appears in contracts.**

**Rules that matter:**

- Responses carry `"schemas":[…]`; lists use `ListResponse` with `totalResults`/`startIndex`/`itemsPerPage`.
- Errors use the SCIM error format; **409** on duplicate `userName`.
- **Idempotency** — retries are normal; never create duplicates.
- Scope every query by the `org_id` derived from **the token**, never the URL alone.
- SCIM never carries passwords. The user still logs in via §9.

### 13.4 The chain behind it

```
Workday / BambooHR / HR system      ← someone in HR clicks "Terminate"
        ↓ (HR sync)
Okta / Entra ID                      ← user disabled, removed from groups
        ↓ (SCIM, fan-out to every app)
   ┌────┴────┬─────────┬──────────┐
Slack   Notion   Salesforce   YOUR APP
```

One HR action propagates to 40 vendors automatically. **That's what the customer bought.** Your SCIM endpoint is how you join that chain instead of being the app someone has to clean up by hand.

### 13.5 SCIM vs JIT

| | JIT | SCIM |
|---|---|---|
| Effort to build | ~an afternoon | ~1–2 weeks done properly |
| Creates users | on first login | immediately when IT adds them |
| **Deactivates users** | ❌ never | ✅ within seconds |
| Group/role changes | at next login | immediately |
| Pre-populated user list for admins | ❌ | ✅ |
| Works with no browser | ❌ | ✅ |

**Ship JIT first.** It handles onboarding for 90% of customers. Add SCIM when a deal requires it — it arrives phrased as *"we need automatic deprovisioning"* or *"we need users provisioned before first login."*

When both are on, **SCIM is the source of truth** — set `jit_enabled = false` for those orgs, or you get duplicate and orphaned records.

### 13.6 The division of labour

| Question | Answered by |
|---|---|
| Is this person who they claim to be, right now? | **SAML / OIDC** |
| What's their name and email? | Both |
| Which employees exist at this company? | **SCIM** |
| Someone was just hired — create their account | **SCIM** (or JIT at first login) |
| Someone was just fired — kill their access | **SCIM only** |
| What role should they have? | Group claims in the assertion, or SCIM `/Groups` |
| Did they pass MFA? | **SAML/OIDC** (`AuthnContext` / `amr`) |

---

## 14 · How you know which IdP an org uses

**You don't detect it — you read it out of your own database.** The admin told you at setup.

The thing that makes this click: **protocol-wise you don't care who the IdP is.** SAML is SAML whether it came from Okta, Entra, or Google Workspace. The vendor identity is purely **a label on a button**. It changes zero logic.

```
"harsh@visions.com"
   ↓  split domain
"visions.com"
   ↓  org_domains WHERE domain=? AND verified_at IS NOT NULL
org 42 "Visions"
   ↓  sso_connections WHERE org_id=42 AND status='active'
{ type:'saml', display_name:'Okta', id:'conn_abc' }
   ↓
render:  [ Continue with Okta ]
```

Four indexed reads. No probing, no heuristics.

### 14.1 Where `display_name` comes from

**1. Ask the admin at setup.** One field: *"Button label — what your team will see on the login screen"*, default `Single Sign-On`. Four seconds of their time, always right.

**2. Auto-derive from the metadata they pasted** (pre-fill the field above):

```ts
const IDP_FINGERPRINTS = [
  [/\.okta(preview)?\.com$/,                        'Okta'],
  [/login\.microsoftonline\.com$/,                  'Microsoft Entra ID'],
  [/^accounts\.google\.com$|google\.com\/o\/saml2/, 'Google Workspace'],
  [/\.onelogin\.com$/,                              'OneLogin'],
  [/\.jumpcloud\.com$/,                             'JumpCloud'],
  [/\.pingone\.com$|pingidentity/,                  'Ping Identity'],
  [/\.auth0\.com$/,                                 'Auth0'],
  [/\.duosecurity\.com$/,                           'Duo'],
  [/\/adfs\//,                                      'AD FS'],
];

function guessIdpName(ssoUrl) {
  const u = new URL(ssoUrl);
  const hit = IDP_FINGERPRINTS.find(([re]) => re.test(u.hostname) || re.test(u.pathname));
  return hit ? hit[1] : 'Single Sign-On';
}
```

Their metadata XML often also carries `<md:Organization><md:OrganizationDisplayName>` — use it if present.

**3. Fall back to `Single Sign-On`.** Always correct, never confusing.

### 14.2 Where detection *is* useful — the setup wizard, to pick a docs page

Best signal, and it's clean — **Microsoft publishes tenant existence per domain:**

```
GET https://login.microsoftonline.com/visions.com/v2.0/.well-known/openid-configuration

200 → they're on Entra, AND the `issuer` field carries their tenant id:
      "issuer": "https://login.microsoftonline.com/8f2a…c31/v2.0"
      ← that's the tid for the org_microsoft_tenants binding (§7.5)
400 (AADSTS90002 "Tenant not found") → not an Entra domain
```

For Google, check MX records:

```
dig +short MX visions.com
  *.mail.protection.outlook.com          → Microsoft 365
  aspmx.l.google.com / smtp.google.com   → Google Workspace
  anything else  → self-hosted or another provider; they likely have a
                   dedicated IdP (Okta et al.)
```

Two more you already hold: if the admin signed up with **Microsoft**, `tid` is their Entra tenant. If with **Google Workspace**, the `hd` (hosted domain) claim says it's Workspace, not consumer Gmail.

> Use all of these to **pre-select a dropdown and show the matching guide** — never to change protocol behaviour. A company can be on Microsoft 365 for email and Okta for identity, which is extremely common. **MX records tell you where mail goes, not who does authn.**

### 14.3 Multiple connections on one org

Happens mid-migration (Okta → Entra) or with a parent company holding two subsidiaries' IdPs.

```
sso_enforced + 1 connection  → AUTO-REDIRECT, don't render a button. ✔ do this
sso_enforced + 2 connections → show both, labelled; or mark one is_primary and
                               auto-redirect with a "use a different provider" link
```

### 14.4 Compressed answers

| Question | Answer |
|---|---|
| How do I know which IdP an org uses? | You stored it. `sso_connections.display_name`. |
| What if they haven't configured one? | They don't have SSO with you, so `sso_enforced` can't be on. Show password + Google + Microsoft. |
| Do I support each IdP differently? | No. One SAML impl + one OIDC impl covers every vendor. Differences are attribute names and NameID formats — that's what `attribute_map` is for. |
| Do I ever detect their IdP? | Only to pick a docs page during setup. **Never in the auth path.** |

---

## 15 · Attack catalog

| Attack | Mechanism | Defence |
|---|---|---|
| **nOAuth** | Free Entra tenant sets `mail` to the victim's address; token is genuine, claim is attacker-controlled | Key on `sub`/`oid`+`tid`. Never link on an untrusted email. §7.4 |
| **Auto-join injection** | Same forged claim, but no account exists yet → domain auto-join hands out org membership | Resolve the trust tier *before* touching org membership. §4, §7.3 |
| **Account squatting** | Unverified account created holding a real corporate address | Partial unique index on verified emails only + reclaim path + TTL. §7.4 |
| **Unverified-email auto-link** | Provider says `email_verified: false`, app links anyway | Never auto-link without provider verification; prefer strict proof for all. §8.1 |
| **Link-stash hijack** | Attacker redeems a pending link handle with their own account | Handle in an httpOnly cookie + `googleIdentity.userId === stash.pendingUserId`. §8.4 |
| **Cross-tenant assertion** | Org A's IdP asserts `ceo@orgB.com` | Org comes from the **connection**, not the email; plus the domain fence. §9.2 h/i |
| **XSW (XML Signature Wrapping)** | Signature covers one element, parser reads another | Use a maintained SAML library; never hand-roll. §12.1 |
| **Assertion replay** | Same signed assertion POSTed twice | Assertion-ID replay cache + tight `NotOnOrAfter`. §9.2 g |
| **Shadow password account** | Employee creates a password login to dodge their org's MFA policy | Reject password/social signup for enforced domains, in **one** shared function. §6 |
| **Stale session after deprovision** | SCIM `active:false` arrives; long-lived JWT keeps working | Revoke sessions on deprovision; keep `token_version` in the token and check it. §13.3 |
| **Domain takeover** | Org claims a domain they no longer own | DNS TXT verification + periodic re-verification. §10.7 |
| **Cert-expiry lockout** | IdP signing cert expires overnight | Store multiple certs, poll the metadata URL, alert the admin ~30 days out, break-glass account. §16 |

---

## 16 · Master edge-case table

| Situation | Behaviour |
|---|---|
| Microsoft `sub` already attached to a *different* user (their email changed at your app) | Branch 1 wins — log into the user the identity points at. **Never reassign an identity based on email.** |
| Their provider email differs from their account email | Normal. Link once proved; keep `User.email` canonical, don't overwrite from an untrusted claim. |
| User has *only* one identity and wants to unlink it | **Block it.** Refuse to remove the last credential or you orphan the account. |
| Password reset on an account with no password identity | *"This account signs in with Google/Microsoft."* Don't silently create a password credential via reset — that bypasses the whole scheme. |
| Two tabs, two link flows | Unique index on `(provider, provider_user_id)` + the `clash` check. §8.5 |
| Same human, two Entra tenants (contractor) | Two identity rows, same `user_id`, different `subject`/`tid`. Works naturally — which is why you store `tid`. |
| Existing password user, then their org enables `sso_enforced` | Keep the password identity row, refuse it at login, route to SSO. Attach the SAML identity alongside on next login. **Don't delete credentials on a policy flip** — the org may flip back. |
| Org flips `sso_enforced` on with live sessions | Bump `token_version` for everyone whose current identity isn't SSO. This one *does* warrant forced logout. |
| Invited email's domain isn't in the org's verified domains | Block at invite time unless the org enabled external invites — otherwise the user can never satisfy the policy. |
| Invite expires before they click | Admin resends: new token, **same shell user, same `user_id`**. No duplicate row. |
| They click the invite but authenticate as a different person at the IdP | Domain fence passed → real member of that org → attach to the asserted identity and log the mismatch. Strict alternative: reject when `assertedEmail !== invite.email`. |
| Enforcement on, no active connection | Don't dead-end the user — render "SSO unavailable" and alert the admin. §11.3 |
| IdP cert rotation | Store **multiple** valid certs per connection, poll the metadata URL, alert the admin ~30 days before expiry. Otherwise the whole org locks out overnight. |
| SLO (Single Logout) requested | Support if asked; never design around it. Half-broken across IdPs. |
| Deprovisioned mid-session | Revoke immediately. If sessions are long-lived JWTs with no revocation check, **SCIM deprovisioning is theatre.** |

---

## 17 · Build order

| # | Piece | What you write | Reach for |
|---|---|---|---|
| 1 | Schema | All tables from §5, **including `sso_connections` even while empty** | — |
| 2 | Email/password | Your own | `argon2` |
| 3 | Google + Microsoft OIDC | One reusable OIDC client, two configs | `openid-client` — handles PKCE, JWKS, `id_token` validation |
| 4 | Identity linking | §8, strict proof for both providers | — |
| 5 | Orgs, domain verification, invites | §10.7, §11 | DNS resolver |
| 6 | `/auth/discover` + identifier-first UI | §9.1 | — |
| 7 | Enterprise SAML | Per-connection SP, dynamic config, **Test connection** screen | `@node-saml/node-saml` — never hand-roll |
| 8 | `sso_enforced` + break-glass | §10.9 | — |
| 9 | JIT provisioning + group→role | §9.4 | — |
| 10 | SCIM | Hand-write it; the RFC is readable, libraries are thin | — |
| 11 | Audit log | login (method + connection), SCIM writes, config changes | — |

**Build vs buy on 7 + 10.** The effort there is 80% per-IdP quirks, not protocol.

- **Build** — full control, no per-connection cost; you own cert rotation, quirks, and support.
- **WorkOS / Auth0 Enterprise / Stytch / Descope** — a normalizing proxy: you integrate one OIDC connection, they handle N customers' SAML + SCIM and give you an admin portal to hand to org admins. Fastest path, priced per connection.
- **Keycloak self-hosted** — free identity brokering, but you run and secure it.

**Recommendation:** build 1–6 yourself, model the §5 schema from day one, start SAML/SCIM with a provider, and in-house it later if per-connection cost stops making sense. **The schema above is deliberately compatible with either choice.**

---

## 18 · The five things to remember

1. **`users` and `identities` are separate tables.** One human, N credentials. Everything else follows from this.
2. **Key on stable IDs, never email.** `sub` / `oid`+`tid` / NameID / `externalId`. Email is a mutable profile field with no authority.
3. **Decide an identity signal's trust tier before it touches org membership.** Every hole in this feature — nOAuth, auto-join injection, squatting — is the same mistake at a different blast radius: an attacker-controlled string allowed to act as a verified fact.
4. **Tenant identity comes from the connection that validated the signature**, not from anything inside the payload.
5. **SSO answers "who is at the door." SCIM answers "who works here."** Ship JIT first; add SCIM when a deal demands deprovisioning.
