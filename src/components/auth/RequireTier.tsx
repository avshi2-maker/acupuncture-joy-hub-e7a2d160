import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTier } from "@/hooks/useTier";

export default function RequireTier({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { tier, daysRemaining } = useTier();

  const isTierActive = Boolean(tier) && (daysRemaining === null || daysRemaining > 0);

  if (!isTierActive) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/gate?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
