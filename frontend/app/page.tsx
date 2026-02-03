import Image from "next/image";
import Navbar from "@/shared/components/NavBar";
import { ArrowRight } from 'lucide-react';

export default function Home() {

  return (
    <div className="relative pt-32 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[100px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[60%] rounded-full bg-purple-100/40 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Navbar />

        {/* Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 border border-green-100 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
          <span className="text-xs font-bold tracking-wide text-green-700 uppercase">Community Impact Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
          Empower Your Community, <span></span>
          <span className="text-blue-600">Fix Your Neighbourhood</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
          The easiest way to report local issues, track their progress, and collaborate to build a better city together.
        </p>

        {/* CTAs */}
        <div className="flex sm:flex-row items-center justify-center gap-4">
          <button className="flex items-center justify-center px-7 py-3 bg-blue-600 rounded-full text-white font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-1 w-full sm:w-auto group cursor-pointer">
            Browse Reports
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
