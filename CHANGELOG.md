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

**Issue:** GET /notes/:id allowed any authenticated user to access any note by ID, regardless of ownership.

**Fix:** Added ownership check in note access:
- Modified `GET /notes/:id` endpoint to include `user_id` check in WHERE clause
- Added 404 response when note doesn't exist or doesn't belong to user
- Users can now only access notes they created

**Impact:** Prevents users from reading other users' private notes and eliminates complete authorization bypass.

---

## Remaining Critical Issues

### 🔴 TO BE FIXED
- [ ] Critical (Blockers) #4: Hardcoded Secrets - `config.ts:2`

---

### 📊 SUMMARY

**Critical Fixes Completed:** 3/4  
**Total Security Fixes:** 3 critical vulnerabilities fixed  

---

## Releases

### v1.0.0 - Security Hardening Release (2024-08-26)
- ✅ Fixed SQL injection vulnerabilities  
- ✅ Replaced MD5 with bcrypt for password hashing
- ✅ Added ownership checks for note access
- ⏳ Pending: Remove hardcoded secrets and add proper validation