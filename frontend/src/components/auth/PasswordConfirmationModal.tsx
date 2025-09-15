"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/use-auth';
import { useTranslations } from 'next-intl';

// Note: schema is built inside the component so translation hook can be used for messages

interface PasswordConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  isLoading?: boolean;
}

export default function PasswordConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  isLoading = false,
}: PasswordConfirmationModalProps) {
  const t = useTranslations();
  const { user, error, clearError } = useAuth();

  const confirmPasswordSchema = z.object({
    password: z.string().min(1, t('validation.required')),
  });

  type ConfirmPasswordFormData = z.infer<typeof confirmPasswordSchema>;

  const localTitle = title ?? t('auth.confirmPassword.title');
  const localDescription = description ?? t('auth.confirmPassword.subtitle');
  const localConfirmText = confirmText ?? t('auth.confirmPassword.confirmButton');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ConfirmPasswordFormData>({
    resolver: zodResolver(confirmPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  // Clear errors and reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      clearError();
      reset();
    }
  }, [isOpen, clearError, reset]);

  const onSubmit = async (data: ConfirmPasswordFormData) => {
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);

    try {
      await onConfirm(data.password);
      reset();
      onClose();
    } catch (error: any) {
      setError('password', {
        type: 'manual',
        message: error.message || 'Invalid password',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Center the modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {localTitle}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {localDescription}
                  </p>
                  {user && (
                    <p className="mt-1 text-xs text-gray-400">
                      {t('auth.confirmPasswordExtras.signedInAs')} <span className="font-medium">{user.email}</span>
                    </p>
                  )}
                </div>

                <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700">
                      {t('auth.confirmPassword.passwordLabel')}
                    </label>
                    <input
                      {...register('password')}
                      id="modal-password"
                      type="password"
                      autoComplete="current-password"
                      autoFocus
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                      placeholder={t('auth.confirmPassword.passwordPlaceholder')}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-3">
                      <div className="flex">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                  {isSubmitting || isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t('auth.confirmPassword.confirming')}
                    </>
                  ) : (
                    localConfirmText
                  )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                  {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}