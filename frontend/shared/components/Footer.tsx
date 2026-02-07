"use client";
import React from 'react';
import { useRouter } from "next/navigation";

const Footer: React.FC = () => {
    const router = useRouter();

    return (
        <footer >
            <div className="border-t border-gray-100 py-10 flex flex-col justify-center md:flex-row">
                <p className="text-gray-400 text-sm italic">
                    &copy; {new Date().getFullYear()} FixItMY Platform. Designed with heart for a better city.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
