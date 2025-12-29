import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TCM Clinic | Therapist Login</title>
        <meta
          name="description"
          content="Therapist login to access the TCM Clinic system. Choose a tier and enter your access password to continue."
        />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.origin + "/" : "/"} />
      </Helmet>

      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <section className="w-full max-w-xl text-center">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground">
            TCM Clinic
          </h1>
          <p className="mt-3 text-muted-foreground">
            Therapist access only. Choose your tier and enter your password to continue.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg" variant="hero">
              <Link to="/gate">Therapist Login</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;

