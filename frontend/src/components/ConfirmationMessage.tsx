'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { registerVisitor } from '../utils/api';

interface SignInFormData {
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
}

export function SignInForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await registerVisitor(data);
      if (response.success) {
        router.push('/confirm?status=success');
      } else {
        router.push(`/confirm?status=error&message=${response.error}`);
      }
    } catch (error) {
      router.push('/confirm?status=error&message=An unexpected error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          First Name *
        </label>
        <input
          type="text"
          id="firstName"
          {...register('firstName', { required: 'First name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.firstName && (
          <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      {/* Similar fields for lastName, address, phoneNumber */}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Continue
      </button>
    </form>
  );
}