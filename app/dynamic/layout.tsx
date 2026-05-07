/**
 * Dynamic Pages Layout
 * 
 * This layout wraps all dynamic pages that depend on:
 * - User authentication (auth, account, orders, cart)
 * - URL parameters (product/[id])
 * - User session state (checkout, session-demo)
 * 
 * These pages may need re-rendering based on user state or parameters
 * and should not be cached statically.
 */

export default function DynamicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
