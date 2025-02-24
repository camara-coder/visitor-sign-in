'use client';

import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { useForm, Controller } from 'react-hook-form';
import { classNames } from 'primereact/utils';

interface SignInFormData {
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
}

export function SignInForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    // ... existing submit logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md mx-auto">
      <div className="flex flex-col">
        <Controller
          name="firstName"
          control={control}
          rules={{ required: 'First name is required' }}
          render={({ field, fieldState }) => (
            <>
              <label htmlFor={field.name} className="mb-2 font-normal text-gray-700">
                First Name *
              </label>
              <InputText
                id={field.name}
                {...field}
                className={classNames('p-inputtext-lg w-full', { 'p-invalid': fieldState.error })}
                placeholder="Enter your first name"
              />
              {fieldState.error && (
                <small className="text-red-600 mt-1">{fieldState.error.message}</small>
              )}
            </>
          )}
        />
      </div>

      <div className="flex flex-col">
        <Controller
          name="lastName"
          control={control}
          rules={{ required: 'Last name is required' }}
          render={({ field, fieldState }) => (
            <>
              <label htmlFor={field.name} className="mb-2 font-normal text-gray-700">
                Last Name *
              </label>
              <InputText
                id={field.name}
                {...field}
                className={classNames('p-inputtext-lg w-full', { 'p-invalid': fieldState.error })}
                placeholder="Enter your last name"
              />
              {fieldState.error && (
                <small className="text-red-600 mt-1">{fieldState.error.message}</small>
              )}
            </>
          )}
        />
      </div>

      <div className="flex flex-col">
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <>
              <label htmlFor={field.name} className="mb-2 font-normal text-gray-700">
                Address
              </label>
              <InputText
                id={field.name}
                {...field}
                className="p-inputtext-lg w-full"
                placeholder="Enter your address"
              />
            </>
          )}
        />
      </div>

      <div className="flex flex-col">
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <>
              <label htmlFor={field.name} className="mb-2 font-normal text-gray-700">
                Phone Number
              </label>
              <InputMask
                id={field.name}
                {...field}
                mask="(999) 999-9999"
                placeholder="(999) 999-9999"
                className="p-inputtext-lg w-full"
              />
            </>
          )}
        />
      </div>

      <Button
        type="submit"
        label="Continue"
        loading={isSubmitting}
        className="p-button-lg w-full mt-4"
      />
    </form>
  );
}