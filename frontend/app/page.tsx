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
    <>
      <div className="relative pt-32 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}

        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/60 blur-[120px]" />
          <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[60%] rounded-full bg-purple-200/50 blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-orange-200/40 blur-[100px]" />
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

      {/* How It Works Section */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <h2 className="text-center md:text-left text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-outfit">
              A Simpler Way to <br />
              <span className="text-brand-primary italic font-playfair">Take Action</span>
            </h2>
            <p className="text-center md:text-left text-gray-500 max-w-xl text-lg">
              We've refined the civic engagement process into three effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Step 1: Capture & Report */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-sm border border-gray-100 flex flex-row lg:flex-col justify-between h-full group hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="relative z-10 flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 sm:6">Step 01</span>
                <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:4">Capture & Report</h3>
                <p className="text-gray-500 text-xs sm:text-base leading-relaxed max-w-sm mb-4 sm:8">
                  Spot an issue? Just point and shoot so that the authorities and community are aware.
                </p>
                <div className="hidden sm:flex absolute sm:bottom-auto sm:relative lg:absolute lg:bottom-40 lg:left-15 z-20 items-center gap-2 sm:gap-3 bg-gray-900 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl w-fit shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white border-2 border-gray-900 ring-2 ring-white"></div>
                  </div>
                  <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">Open Camera</span>
                </div>
              </div>
              <div className="mt-0 sm:mt-auto flex justify-center w-24 sm:w-auto lg:absolute lg:bottom-8 lg:right-5 lg:w-3/5">
                <img src="/lp_capture_issue.png" alt="Capture Issue" className="rounded-full w-full sm:w-60  object-contain transform group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Right Column (Steps 2 & 3) */}
            <div className="flex flex-col gap-8">
              {/* Step 2: Live Tracking */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-row items-center gap-4 sm:gap-6 group hover:shadow-md transition-shadow relative overflow-hidden h-full">
                <div className="flex-1 relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 sm:4">Step 02</span>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:3">Live Tracking</h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                    Watch progress in real-time as the issue gets resolved.
                  </p>
                </div>
                <div className="w-20 sm:w-40 flex justify-center shrink-0">
                  <img src="/lp_track_issues.png" alt="Track Issues" className="w-full rounded-xl object-contain transform group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>

              {/* Step 3: Community Verify */}
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-row items-center gap-4 sm:gap-6 group hover:shadow-md transition-shadow relative overflow-hidden h-full">
                <div className="w-20 sm:w-40 flex justify-center shrink-0">
                  <img src="/lp_community_celebrate.png" alt="Community Verify" className="w-full rounded-xl object-contain transform group-hover:rotate-3 transition-transform duration-500" />
                </div>
                <div className="flex-1 relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 sm:4">Step 03</span>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:3">Community Verify</h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                    The community confirms if the issue is resolved, ensuring a better city for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
