'use client'

import { DashboardPage } from '@/components/admin/dashboard-page'
import { AdvancedAnalytics } from '@/components/admin/management-pages'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Page() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="advanced">Analyse avancée</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <DashboardPage analyticsOnly />
      </TabsContent>
      <TabsContent value="advanced" className="mt-6">
        <AdvancedAnalytics />
      </TabsContent>
    </Tabs>
  )
}
