# Système de Session - Documentation

## Vue d'ensemble

Le système de session crée une **session utilisateur persistante** à chaque connexion, qui associe :
- **Panier (Cart)** - Synchronisé en base de données
- **Commandes (Orders)** - Historique persistant
- **Session utilisateur** - Suivi de l'activité

## Architecture

### 1. Session Management (`lib/session.ts`)
```typescript
initializeSession(userId)    // Crée/récupère une session
getCurrentSession(userId)    // Récupère la session active
updateSessionActivity(sessionId) // Met à jour last_activity
```

### 2. Cart Service (`lib/cart-service.ts`)
Gère les articles du panier en BD :
```typescript
addToCart(userId, productId, quantity)
removeFromCart(userId, cartItemId)
updateCartItemQuantity(userId, cartItemId, quantity)
getCartItems(userId)
clearCart(userId)
```

### 3. Orders Service (`lib/orders-service.ts`)
Gère les commandes passées :
```typescript
createOrder(userId, cartItems)
getOrders(userId)
getOrderDetail(orderId)
updateOrderStatus(orderId, status)
```

## Utilisation dans les composants

### 1. Auth Context avec Session
```typescript
'use client'
import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, sessionId, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>
  
  return <div>Welcome {user.email}, Session: {sessionId}</div>
}
```

### 2. Panier Persistant
```typescript
'use client'
import { useCart, useAddToCart, useRemoveFromCart } from '@/lib/hooks'

export function CartComponent() {
  const { data: items, isLoading } = useCart()
  const { trigger: addItem } = useAddToCart()
  
  return (
    <div>
      {items?.map(item => (
        <div key={item.id}>{item.product_name} x{item.quantity}</div>
      ))}
      <button onClick={() => addItem({ productId: '123', quantity: 1 })}>
        Add to Cart
      </button>
    </div>
  )
}
```

### 3. Commandes Utilisateur
```typescript
'use client'
import { useUserOrders } from '@/lib/hooks'

export function OrdersComponent() {
  const { data: orders, isLoading } = useUserOrders()
  
  return (
    <div>
      {orders?.map(order => (
        <div key={order.id}>
          Order #{order.id} - Status: {order.status}
        </div>
      ))}
    </div>
  )
}
```

## Flux de données

### À la connexion :
1. User se connecte via Supabase Auth
2. `AuthProvider` capture l'événement
3. `initializeSession(userId)` crée une session en BD
4. `sessionId` est stocké dans le contexte
5. Le panier est chargé depuis la BD

### Ajout d'article au panier :
1. `addToCart(productId, quantity)` via l'API
2. L'article est ajouté à `cart_items` en BD
3. SWR revalide le cache automatiquement
4. Le composant se met à jour

### Passage de commande :
1. `createOrder(userId, cartItems)` via l'API
2. Crée une entrée dans `orders` + `order_items`
3. Vide le panier
4. Retourne l'ID de la commande

## Base de données

### Tables utilisées :
```sql
-- Sessions
user_sessions (id, user_id, session_token, created_at, last_activity, expires_at)

-- Panier
cart_items (id, user_id, product_id, quantity, created_at, updated_at)

-- Commandes
orders (id, user_id, status, total_amount, created_at, updated_at)
order_items (id, order_id, product_id, quantity, price, created_at)
```

## Routes API

### Panier
- `GET /api/cart` - Récupère le panier de l'utilisateur
- `POST /api/cart` - Ajoute un article
- `PUT /api/cart/[id]` - Met à jour la quantité
- `DELETE /api/cart/[id]` - Supprime un article

### Commandes
- `GET /api/orders` - Liste les commandes de l'utilisateur
- `POST /api/orders` - Crée une nouvelle commande
- `GET /api/orders/[id]` - Détail d'une commande
- `PUT /api/orders/[id]` - Met à jour le statut

## Authentification

Tous les endpoints sont protégés :
- Vérifie que l'utilisateur est connecté
- Utilise `sessionId` pour l'attribution de la session
- Retourne 401 si non authentifié

## Exemple complet

```typescript
'use client'
import { useAuth } from '@/lib/auth-context'
import { useCart, useAddToCart, useCreateOrder } from '@/lib/hooks'

export default function ShoppingPage() {
  const { user, sessionId } = useAuth()
  const { data: cartItems } = useCart()
  const { trigger: addItem } = useAddToCart()
  const { trigger: createOrder } = useCreateOrder()

  const handleCheckout = async () => {
    if (!cartItems?.length) {
      alert('Cart is empty')
      return
    }
    
    const order = await createOrder({ items: cartItems })
    console.log('Order created:', order.id)
  }

  return (
    <div>
      <h1>Shopping Cart</h1>
      <p>Session: {sessionId}</p>
      
      <div>
        {cartItems?.map(item => (
          <div key={item.id}>
            {item.product_name} - {item.quantity}x
          </div>
        ))}
      </div>
      
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  )
}
```

## Notes importantes

1. **SWR Revalidation** - Les données se mettent à jour automatiquement après chaque action
2. **Session Timeout** - Les sessions expirent après 24h (configurable)
3. **Offline Support** - Le localStorage peut être utilisé comme fallback optionnel
4. **Security** - Tous les endpoints vérifient les droits d'accès côté serveur
