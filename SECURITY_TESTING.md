# Security Testing Checklist

## Test 1: Authentication Requirement

### Test 1a: Missing JWT Token
```bash
# Should fail with 401 Unauthorized
curl https://your-app.com/api/cart
```
**Expected:** Returns 401 error  
**Actual:** ___________

### Test 1b: Invalid JWT Token
```bash
# Should fail with 401 Unauthorized
curl -H "Authorization: Bearer invalid_token" https://your-app.com/api/cart
```
**Expected:** Returns 401 error  
**Actual:** ___________

### Test 1c: Valid JWT Token
```bash
# Should succeed and return cart items
curl -H "Authorization: Bearer <valid_token>" https://your-app.com/api/cart
```
**Expected:** Returns 200 with cart items array  
**Actual:** ___________

---

## Test 2: User Data Isolation

### Setup
- Create 2 test accounts: `user_a@test.com` and `user_b@test.com`
- Login as User A and add 3 items to cart
- Note the JWT token for User A

### Test 2a: User A Can Read Own Cart
```bash
# Login as User A, get token
# Should return User A's cart items
curl -H "Authorization: Bearer <user_a_token>" https://your-app.com/api/cart
```
**Expected:** Returns 3 items in cart  
**Actual:** ___________

### Test 2b: User B Cannot Read User A's Cart
```bash
# Login as User B, get token
# Should NOT return User A's items
curl -H "Authorization: Bearer <user_b_token>" https://your-app.com/api/cart
```
**Expected:** Returns empty cart (0 items)  
**Actual:** ___________

### Test 2c: Cart Item Ownership Verified
```bash
# Get User A's cart item ID (e.g., "cart_123")
# Try to delete it using User B's token
# Should fail with 403 Forbidden
curl -X DELETE \
  -H "Authorization: Bearer <user_b_token>" \
  https://your-app.com/api/cart/cart_123
```
**Expected:** Returns 403 Forbidden  
**Actual:** ___________

---

## Test 3: Order Isolation

### Setup
- User A adds 2 items to cart and creates an order
- Note the order ID (e.g., "order_456")
- Login as User B

### Test 3a: User A Can Read Own Orders
```bash
curl -H "Authorization: Bearer <user_a_token>" https://your-app.com/api/orders
```
**Expected:** Returns 1 order with ID "order_456"  
**Actual:** ___________

### Test 3b: User B Cannot Read User A's Orders
```bash
curl -H "Authorization: Bearer <user_b_token>" https://your-app.com/api/orders
```
**Expected:** Returns empty orders array (0 items)  
**Actual:** ___________

### Test 3c: User B Cannot Access User A's Order Details
```bash
curl -H "Authorization: Bearer <user_b_token>" https://your-app.com/api/orders/order_456
```
**Expected:** Returns 404 Not Found  
**Actual:** ___________

---

## Test 4: No User ID Spoofing

### Setup
- User A JWT token is: `<user_a_token>`
- User A's actual user ID is: `user_id_aaa`
- User B's actual user ID is: `user_id_bbb`

### Test 4a: Cannot Create Cart Item for Another User
```bash
# Try to add item but claim it's for User B
# (This should fail because server uses auth.uid(), not request body)
curl -X POST \
  -H "Authorization: Bearer <user_a_token>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_123", "quantity": 1, "userId": "user_id_bbb"}' \
  https://your-app.com/api/cart
```
**Expected:** Item created with user_id=user_id_aaa (NOT bbb)  
**Actual:** ___________

### Test 4b: Cannot Create Order for Another User
```bash
curl -X POST \
  -H "Authorization: Bearer <user_a_token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id_bbb", "items": [...], "status": "pending"}' \
  https://your-app.com/api/orders
```
**Expected:** Order created with user_id=user_id_aaa (NOT bbb)  
**Actual:** ___________

---

## Test 5: CORS & Header Validation

### Test 5a: No Origin Header
```bash
curl https://your-app.com/api/cart \
  -H "Authorization: Bearer <valid_token>"
```
**Expected:** Returns 200 (should work)  
**Actual:** ___________

### Test 5b: Invalid Origin
```bash
curl https://your-app.com/api/cart \
  -H "Authorization: Bearer <valid_token>" \
  -H "Origin: https://evil.com"
```
**Expected:** May be blocked by CORS (browser-side enforcement)  
**Actual:** ___________

---

## Test 6: Product Access (Public)

### Test 6a: Products Readable Without Auth
```bash
curl https://your-app.com/api/products
```
**Expected:** Returns products (if endpoint exists)  
**Actual:** ___________

---

## Test 7: Rate Limiting & Throttling (Optional)

### Test 7a: Rapid Requests
```bash
# Send 100 requests in rapid succession
for i in {1..100}; do
  curl -H "Authorization: Bearer <token>" https://your-app.com/api/cart &
done
```
**Expected:** After N requests, returns 429 Too Many Requests  
**Actual:** ___________

---

## Test 8: Error Messages

### Test 8a: Generic Error Messages
```bash
# Trigger various errors and check response messages
# Should NOT leak sensitive info like table names, SQL, etc.
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' \
  https://your-app.com/api/cart
```
**Expected:** Generic error message like "Failed to add to cart"  
**Actual:** ___________

---

## Test 9: Logging & Monitoring

### Check API Logs
- Go to Supabase Dashboard → Logs
- Filter by timestamp (when you ran tests)
- Look for:
  - Unauthorized access attempts
  - Invalid token attempts
  - RLS policy violations

**Found Issues:** ___________

---

## Summary

| Test | Status | Notes |
|------|--------|-------|
| Auth Required | ✓ ✗ | |
| User Data Isolated | ✓ ✗ | |
| Order Isolation | ✓ ✗ | |
| No ID Spoofing | ✓ ✗ | |
| CORS Handling | ✓ ✗ | |
| Public Products | ✓ ✗ | |
| Error Messages | ✓ ✗ | |
| Logs Clean | ✓ ✗ | |

## Issues Found
1. ___________
2. ___________
3. ___________

## Remediation Steps
1. ___________
2. ___________
3. ___________
