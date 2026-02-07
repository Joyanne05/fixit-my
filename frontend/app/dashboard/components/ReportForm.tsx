"use client";
import React, { useState } from 'react';
import { Camera, CheckCircle, ChevronDown, User, ArrowLeft, WifiOff } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Modal from '@/shared/components/Modal';



const CreateReportForm = () => {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    photo: null
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).filter(f => f.type.startsWith('image/')) : [];
    if (files.length) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleClickUpload = () => {
    inputRef.current?.click();
  };

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate required fields before submit
    if (!form.title || !form.category || !form.description || !form.location) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (!navigator.onLine) {
      setErrorMsg("You are currently offline. Please connect to the internet to submit request.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('location', form.location);
    if (selectedFiles.length > 0) {
      formData.append('photo', selectedFiles[0]); // Only the first image is sent
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    try {
      const res = await api.post('report/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log("Report submitted successfully:", res);
      // Only redirect if form is not empty and submission succeeded
      setForm({
        title: '',
        category: '',
        description: '',
        location: '',
        photo: null
      });
      setSelectedFiles([]);
      // Show success modal instead of direct push
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting report:", error);
      // Do not redirect if error
      setErrorMsg("An error occurred while submitting the report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button on the top left side */}
        <div className="flex justify-start mb-6 md:mb-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Report</h1>
            <p className="text-gray-600">
              Help improve your community by reporting. Your contribution makes a difference.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

              {/* Report Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What's the issue? (e.g., Street light out on Elm St)"
                  className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 bg-white appearance-none focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all cursor-pointer">
                    <option defaultValue="">Select a category</option>
                    <option value="infrastructure">Infrastructure (Potholes, Roads)</option>
                    <option value="lighting">Street Lighting</option>
                    <option value="sanitation">Sanitation & Trash</option>
                    <option value="parks">Parks & Recreation</option>
                    <option value="safety">Public Safety</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4} required
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide as much detail as possible to help us resolve the issue quickly."
                  className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Location */}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Enter the location of the issue (e.g., 89 Petaling St, Kuala Lumpur)"
                  className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Attach Photos */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Attach 1 Photo (Optional)
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-brand-primary bg-brand-bg-light' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleClickUpload}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="w-12 h-12 bg-brand-bg-light text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera size={24} />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">Click to upload or drag and drop</h3>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={inputRef}
                    value={form.photo ? undefined : ''}
                    onChange={handleFileChange}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="w-16 h-16 rounded overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errorMsg && (
                  <div className="mb-4 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-center font-semibold">
                    {errorMsg}
                  </div>
                )}
              </div>


              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-gray-100 mt-8">
                <button
                  type="button"

                  className="w-full sm:w-auto px-6 py-3 text-gray-600 font-semibold hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full cursor-pointer sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Submit Report
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-brand-bg-light border border-brand-primary/20 rounded-xl p-4 flex gap-4 items-start">
            <div className="text-brand-primary mt-1 flex-shrink-0">
              <div className="w-5 h-5 bg-brand-primary rounded text-white flex items-center justify-center text-xs">
                <CheckCircle size={12} fill="white" className="text-brand-primary" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Community-Driven</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                FixIt relies on community members to verify closed reported issues. Once submitted, your report will be reviewed by local volunteers to ensure accuracy after being resolved.
              </p>
            </div>
          </div>

        </div>
      </div>
      <Modal
        isOpen={showSuccessModal}
        onClose={() => router.push('/dashboard')}
        title="Report Submitted"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for your report!</h3>
          <p className="text-gray-600 mb-6">
            Your issue has been successfully submitted and is now pending review. You can track its status in the dashboard.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CreateReportForm;