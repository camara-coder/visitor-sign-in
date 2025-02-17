'use client';

import { FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';

interface ConfirmationMessageProps {
  status: string | null;
  message: string | null;
}

export function ConfirmationMessage({ status, message }: ConfirmationMessageProps) {
  const socialLinks = {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '#',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#'
  };

  return (
    <div className="text-center">
      {status === 'success' ? (
        <div className="animate-fadeIn">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">
            Welcome!
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for signing in. You're all set!
          </p>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">
            Registration Error
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {message || 'An error occurred during registration. Please try again.'}
          </p>
        </div>
      )}

      {/* Social Media Links */}
      <div className="mt-8 flex justify-center space-x-6">
        <a
          href={socialLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Facebook</span>
          <FaFacebook className="h-6 w-6" />
        </a>
        <a
          href={socialLinks.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">YouTube</span>
          <FaYoutube className="h-6 w-6" />
        </a>
        <a
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Instagram</span>
          <FaInstagram className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}