'use client';

import { SignInForm } from '../components/SignInForm';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <Image
            src="/images/brand-logo.png"
            alt="Event Host Brand"
            width={150}
            height={50}
            className="h-12 w-auto"
          />
        </div>
      </header>
      
      <main className="max-w-lg mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Event Sign-in
            </h1>
            <SignInForm />
          </div>
        </div>
      </main>
    </div>
  );
}