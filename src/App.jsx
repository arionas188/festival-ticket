import { useTenant } from "./queries/useTenant";
import Header from "./components/Header/Header";

function App() {
  const testDomain = window.location.hostname;
  const { data, isLoading, error } = useTenant(testDomain);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const { tenant, settings } = data;

  return (
    <div
      style={{
        backgroundColor: settings?.primary_color || "#ffffff",
        minHeight: "100vh",
      }}
    >
      <Header tenant={tenant} settings={settings} />
    </div>
  );
}

export default App;