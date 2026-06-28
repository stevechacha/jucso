import { useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { mapUser } from "@/api/mappers";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

function readQueryParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export function VerifyEmailPage() {
  const { setPage, refreshPortalData, setUser } = useApp();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    const uid = readQueryParam("uid");
    const token = readQueryParam("token");
    if (!uid || !token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    void jucsoApi
      .verifyEmail(uid, token)
      .then(async (res) => {
        setStatus("success");
        setMessage(res.detail);
        setUser(mapUser(res.user));
        await refreshPortalData();
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof ApiError ? error.message : "Verification failed.");
      });
  }, [refreshPortalData, setUser]);

  return (
    <div>
      <Hero
        badge="Email verification"
        title="Confirm your JUCSO account"
        subtitle={message}
        cta={
          status === "success" ? (
            <Button variant="gold" onClick={() => setPage("dashboard")}>
              Go to dashboard →
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setPage("home")}>
              Back to home
            </Button>
          )
        }
      />
      <Footer />
    </div>
  );
}
