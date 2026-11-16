import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [App, setApp] = useState<ComponentType | null>(null);
  useEffect(() => {
    let live = true;
    void import("@/poser/ui/PoserApp").then((mod) => {
      if (live) setApp(() => mod.PoserApp);
    });
    return () => {
      live = false;
    };
  }, []);
  if (!App) {
    return (
      <main className="grid h-dvh place-items-center bg-bg text-muted">
        <p>Opening the stage…</p>
      </main>
    );
  }
  return <App />;
}
