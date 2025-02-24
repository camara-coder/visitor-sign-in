'use client';

import { Suspense } from 'react';
import { ConfirmationContent } from '../../components/ConfirmationContent';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div>Loading...</div>}>
            <ConfirmationContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}