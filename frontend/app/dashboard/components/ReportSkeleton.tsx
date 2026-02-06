import React from 'react';

const ReportSkeleton = () => {
    return (
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-96 animate-pulse">
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200" />

            {/* Content placeholders */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Title placeholder */}
                <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3" />

                {/* Description placeholders */}
                <div className="h-4 bg-gray-100 rounded-md w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded-md w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded-md w-1/2" />
            </div>

            {/* Divider */}
            <hr className="border-gray-50 mx-4" />

            {/* Footer placeholders */}
            <div className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-100 rounded-full" />
                    <div className="h-4 bg-gray-100 rounded-md w-20" />
                </div>
                <div className="h-8 bg-gray-200 rounded-xl w-24" />
            </div>
        </div>
    );
};

export default ReportSkeleton;
