/**
 * Static Pages Layout
 * 
 * This layout wraps all static (non-dynamic) pages that contain fixed content:
 * - About, Blog, Careers, Contact, Cookies, FAQ, Press, Privacy, Terms, Warranty
 * 
 * These pages don't depend on user authentication or dynamic parameters
 * and can be cached aggressively for better performance.
 */

export default function StaticLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
