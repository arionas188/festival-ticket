import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTenant(domain) {
  return useQuery({
    queryKey: ['tenant', domain],
    queryFn: async () => {
      const { data: domainData, error: domainError } = await supabase
        .from('tenant_domains')
        .select(`
          tenant_id,
          tenants (
            id,
            name,
            slug
          )
        `)
        .eq('domain', domain)
        .single()

      if (domainError || !domainData) {
        throw new Error('Tenant not found for this domain')
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', domainData.tenant_id)
        .single()

      if (settingsError) {
        throw new Error('Settings not found for this tenant')
      }

      return {
        tenant: domainData.tenants,
        settings: settingsData,
      }
    },
    enabled: !!domain,
  })
}