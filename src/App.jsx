import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import EkdiloseisNew from "./components/Ekdiloseis/EkdiloseisNew";

function App() {
  const [tenant, setTenant] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testDomain = window.location.hostname;

  useEffect(() => {
    async function resolveTenant() {
      setLoading(true);

      const { data: domainData, error: domainError } = await supabase
        .from("tenant_domains")
        .select(`
          tenant_id,
          tenants (
            id,
            name,
            slug
          )
        `)
        .eq("domain", testDomain)
        .single();

      if (domainError || !domainData) {
        setError("Tenant not found for this domain");
        setLoading(false);
        return;
      }

      setTenant(domainData.tenants);

      const { data: settingsData, error: settingsError } = await supabase
        .from("tenant_settings")
        .select("*")
        .eq("tenant_id", domainData.tenant_id)
        .single();

      if (settingsError) {
        setError("Settings not found for this tenant");
        setLoading(false);
        return;
      }

      setSettings(settingsData);
      setLoading(false);
    }

    resolveTenant();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      style={{
        backgroundColor: settings?.primary_color || "#ffffff",
        minHeight: "100vh",
        color: "#fff",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      {settings?.logo_url && (
        <img
          src={settings.logo_url}
          alt={`${tenant?.name} logo`}
          style={{ maxWidth: "200px", marginBottom: "1rem" }}
        />
      )}
      <h1>{settings?.display_name || tenant?.name}</h1>
      <p>Slug: {tenant?.slug}</p>

      <hr style={{ margin: "2rem 0", opacity: 0.3 }} />

      <h2 style={{ marginBottom: "1rem" }}>Upcoming Events</h2>

      <EkdiloseisNew tenantId={tenant?.id} />
    </div>
  );
}

export default App;