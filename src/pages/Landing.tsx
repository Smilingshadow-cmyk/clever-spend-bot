import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Receipt, ShieldCheck, Sparkles, LogIn, ChevronRight } from "lucide-react";
import { AiFlowAnimation } from "@/components/AiFlowAnimation";

export default function Landing() {
  return (
    <div className="min-h-screen text-foreground relative z-10 overflow-hidden font-sans">
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-50 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight relative">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)] flex items-center justify-center z-10">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground text-2xl">
            SpendGuard AI
          </span>
        </div>
        <Link 
          to="/login"
          className="glass-card hover:bg-foreground/5 px-6 py-2.5 rounded-full text-base font-semibold transition-all flex items-center gap-2 border border-border shadow-lg"
        >
          Sign In <LogIn className="w-4 h-4 ml-1" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col lg:flex-row items-center justify-center px-6 pt-24 pb-12 max-w-7xl mx-auto gap-8 lg:gap-16">
        <div className="flex-1 flex flex-col gap-8 text-center lg:text-left z-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card border-primary/40 text-primary w-max mx-auto lg:mx-0 shadow-[0_0_25px_rgba(var(--primary),0.25)]">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">Next-Gen Audit Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-muted-foreground">
            Autonomous<br className="hidden md:block" /> Expense Auditor.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-medium mx-auto lg:mx-0">
            Frictionless financial auditing, powered by intelligence. Detect anomalies, halt duplicate subscriptions, and secure your ledger instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-6 mx-auto lg:mx-0">
            <Link 
              to="/login"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(var(--primary),0.5)] flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Get Started <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full max-w-xl xl:max-w-2xl relative mt-12 lg:mt-0">
          <AiFlowAnimation />
        </div>
      </section>

      {/* Problems & Features Section */}
      <section className="py-24 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
              Stop Manual Auditing
            </h2>
            <p className="text-xl text-muted-foreground mt-6 max-w-3xl mx-auto">
              Our AI engine catches what human eyes miss, analyzing thousands of ledger rows per second to enforce compliance effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Receipt className="w-10 h-10 text-pink-400" />}
              title="End Duplicate Billing"
              description="SaaS sprawl wastes thousands of dollars annually. Our AI flags duplicate vendor charges and concurrent identical subscriptions in real-time."
              glow="shadow-[0_0_30px_rgba(236,72,153,0.15)]"
            />
            <FeatureCard 
              icon={<BrainCircuit className="w-10 h-10 text-blue-400" />}
              title="Automated Triage"
              description="Stop reviewing endless rows of flat data. The AI categorizes, verifies, and triages transactions automatically with confidence scoring."
              glow="shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-primary" />}
              title="Smart Vendor Rules"
              description="Establish strict ledger enforcement policies. Auto-reject unauthorized vendors out-of-bounds immediately without human intervention."
              glow="shadow-[0_0_30px_rgba(var(--primary),0.15)]"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative z-20 text-center flex flex-col items-center justify-center mb-12">
        <div className="glass-card max-w-5xl w-full p-16 md:p-24 rounded-[3rem] border border-border shadow-2xl flex flex-col items-center gap-10 relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10 rounded-full" />
          <h2 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground text-center">
            Ready to secure your spend?
          </h2>
          <p className="text-2xl text-muted-foreground font-medium max-w-2xl text-center">
            Join the smart finance revolution and protect your company's ledger.
          </p>
          <Link 
            to="/login"
            className="group mt-6 bg-foreground text-background hover:-translate-y-1 px-12 py-6 rounded-full font-bold text-2xl transition-all shadow-[0_0_50px_rgba(var(--foreground),0.2)] flex items-center gap-4"
          >
            Enter Dashboard
            <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, glow }: { icon: React.ReactNode, title: string, description: string, glow: string }) {
  return (
    <div className={`glass-card p-10 rounded-[2rem] border border-border hover:border-foreground/20 hover:-translate-y-2 transition-all flex flex-col gap-6 ${glow}`}>
      <div className="w-20 h-20 rounded-2xl bg-foreground/5 flex items-center justify-center border border-border mb-2 shadow-inner">
        {icon}
      </div>
      <h3 className="text-3xl font-bold text-foreground tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-xl">{description}</p>
    </div>
  );
}
