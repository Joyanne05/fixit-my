"use client";
import Navbar from "@/shared/components/NavBarPublic";
import { ArrowRight } from 'lucide-react';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/fixitmy_logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          </div>
        </div>
        <p className="mt-4 text-brand-primary font-bold animate-pulse">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="relative pt-32 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[100px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[60%] rounded-full bg-purple-100/40 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center font-outfit">
        <Navbar />

        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 border border-teal-100 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-primary mr-2"></span>
          <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Community Impact Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-[#124076] tracking-tight mb-8 leading-[1.05]">
          Empower Your <span className="text-brand-primary">Community</span>, <br />
          <span className="font-playfair italic font-medium text-[#124076]">Report. Resolve. Refresh.</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl text-gray-600 mb-7 max-w-2xl mx-auto leading-relaxed font-medium">
          The easiest way to report local issues, track progress, and collaborate to build a better city together.
        </p>

        {/* CTAs */}
        <div className="flex sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="flex items-center justify-center px-8 py-3 bg-[#124076] rounded-full text-white hover:bg-brand-primary transition-all shadow-xl hover:shadow-brand-primary/20 hover:-translate-y-1 w-full sm:w-auto group cursor-pointer text-md">
            Browse Reports
            <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}
