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

## Remaining Critical Issues

### 🔴 TO BE FIXED
- [ ] Critical (Blockers) #2: Weak Password Hashing (MD5) - `src/db.ts:21-23`
- [ ] Critical (Blockers) #3: Authentication Bypass - Note Access - `notes.ts:20-24`  
- [ ] Critical (Blockers) #4: Hardcoded Secrets - `config.ts:2`

---

### 📊 SUMMARY

**Critical Fixes Completed:** 1/4  
**Total Security Fixes:** 1 critical vulnerability fixed  

---

## Releases

### v1.0.0 - Security Hardening Release (2024-08-26)
- ✅ Fixed SQL injection vulnerabilities  
- ⏳ Pending: Replace MD5 with bcrypt for password hashing
- ⏳ Pending: Add ownership checks for note access
- ⏳ Pending: Remove hardcoded secrets and add proper validation