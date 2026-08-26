# Changelog

All notable changes to this project will be documented in this file.

## [Security Fixes] - 2024-08-26

### CRITICAL SECURITY FIXES

This release addresses critical security vulnerabilities identified in a comprehensive security review. All issues are classified as **BLOCKER** priority and represent immediate security risks.

### 🔒 SECURITY FIXES

#### 1. SQL Injection Vulnerabilities - FIXED ✅
**Priority:** BLOCKER - Immediate security risk  
**Files Affected:** `src/auth.ts`, `src/users.ts`, `src/notes.ts`

**Issue:** Direct string interpolation in SQL queries allowed malicious input to manipulate SQL queries.

**Fix:** Replaced all string concatenation with parameterized queries:
- `src/auth.ts:12-15` - Login query now uses parameterized `?` placeholders
- `src/users.ts:10` - Email check query now uses parameterized `?` placeholders  
- `src/notes.ts:12` - User query now uses parameterized `?` placeholders
- `src/notes.ts:22` - Note lookup by ID now uses parameterized `?` placeholders

**Impact:** Prevents attackers from bypassing authentication, accessing unauthorized data, or modifying/destroying database contents.

---

#### 2. Weak Password Hashing (MD5) - FIXED ✅
**Priority:** BLOCKER - Compromises user security  
**Files Affected:** `src/db.ts`, `src/auth.ts`

**Issue:** Using MD5 for password hashing, which is cryptographically broken and vulnerable to rainbow table attacks, collision attacks, and fast brute force.

**Fix:** Replaced MD5 with bcrypt:
- Installed `bcrypt` and `@types/bcrypt` dependencies
- Updated `hashPassword()` function in `src/db.ts` to use bcrypt.hashSync with 10 salt rounds
- Modified login endpoint in `src/auth.ts` to use `bcrypt.compareSync()` for password verification

**Impact:** Passwords are now properly secured with industry-standard hashing that is resistant to brute force and rainbow table attacks.

---

#### 3. Authentication Bypass - Note Access - FIXED ✅
**Priority:** BLOCKER - Data privacy violation  
**Files Affected:** `src/notes.ts`

**Issue:** GET /notes/:id and GET /notes allowed any authenticated user to access any note by ID or list all notes, regardless of ownership.

**Fix:** Added ownership check in note access:
- Modified `GET /notes/:id` endpoint to include `user_id` check in WHERE clause
- Modified `GET /notes` endpoint to filter notes by authenticated user's ID
- Added 404 response when note doesn't exist or doesn't belong to user
- Users can now only access notes they created

**Impact:** Prevents users from reading other users' private notes and eliminates complete authorization bypass.

---

#### 4. Hardcoded Secrets - FIXED ✅
**Priority:** BLOCKER - Authentication bypass  
**Files Affected:** `src/config.ts`

**Issue:** JWT secret defaulted to "supersecret" if no environment variable was set, allowing attackers to forge JWT tokens and impersonate any user.

**Fix:** Removed default value and added proper validation:
- Removed `"supersecret"` default from JWT_SECRET configuration
- Added validation to throw error if JWT_SECRET is not set
- Application now fails fast with clear error message if environment variable is missing

**Impact:** Prevents attackers from forging JWT tokens and eliminates authentication bypass vulnerability.

---

## All Critical Issues Resolved ✅

### 🎉 COMPLETED
- [x] Critical (Blockers) #1: SQL Injection Vulnerabilities - FIXED
- [x] Critical (Blockers) #2: Weak Password Hashing (MD5) - FIXED
- [x] Critical (Blockers) #3: Authentication Bypass - Note Access - FIXED  
- [x] Critical (Blockers) #4: Hardcoded Secrets - FIXED

---

### 📊 SUMMARY

**Critical Fixes Completed:** 4/4 ✅  
**Total Security Fixes:** 4 critical vulnerabilities fixed  
**Files Modified:** 5 core source files  
**Dependencies Added:** 2 security-focused packages (bcrypt, @types/bcrypt)

---

### 📋 DEPENDENCY CHANGES

#### Added Dependencies
- `bcrypt@^6.0.0` - Secure password hashing library
- `@types/bcrypt@^5.0.2` - TypeScript definitions for bcrypt

---

### ⚙️ BREAKING CHANGES

#### Environment Variables Required
- **JWT_SECRET** (Required): This environment variable is now required for application startup. The application will throw an error and fail to start if this variable is not set.

**Migration Guide:**
1. Set a secure JWT secret as environment variable:
   ```bash
   export JWT_SECRET="your-secure-random-secret-here"
   ```
2. Or add to your `.env` file:
   ```
   JWT_SECRET=your-secure-random-secret-here
   ```

#### Password Hashing Format Change
- Existing user passwords hashed with MD5 will no longer work
- Users will need to reset their passwords or re-register
- Database migration may be required to update existing password hashes

**Migration Guide:**
- Clear existing user data and re-seed with bcrypt hashes
- Or implement a password reset mechanism for existing users

---

### 🔐 SECURITY RECOMMENDATIONS

Before deploying to production, ensure:

1. **Set Strong JWT Secret**: Use a cryptographically secure random string (minimum 32 characters)
2. **Environment Variables**: Never commit `.env` files or secrets to version control
3. **Database Security**: Ensure proper file permissions on database files
4. **HTTPS Only**: Always use HTTPS in production to protect tokens in transit

---

## Releases

### v1.0.0 - Security Hardening Release (2024-08-26)
- ✅ Fixed SQL injection vulnerabilities  
- ✅ Replaced MD5 with bcrypt for password hashing
- ✅ Added ownership checks for note access
- ✅ Removed hardcoded secrets and added proper validation

All critical security vulnerabilities have been resolved. The API is now significantly more secure and ready for further hardening.