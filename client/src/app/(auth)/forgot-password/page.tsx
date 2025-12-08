'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'email' | 'verify' | 'reset' | 'success';

export default function ForgotPasswordPage() {
   const router = useRouter();
   const [step, setStep] = useState<Step>('email');
   const [email, setEmail] = useState('');
   const [verificationCode, setVerificationCode] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [successMessage, setSuccessMessage] = useState('');
   const [countdown, setCountdown] = useState(0);
   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

   const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
   };

   const validatePassword = (password: string): boolean => {
      return password.length >= 8;
   };

   const handleSendCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!validateEmail(email)) {
         setError('Vui lòng nhập email hợp lệ');
         return;
      }

      setLoading(true);

      // Simulate API call
      setTimeout(() => {
         setLoading(false);
         setStep('verify');
         startCountdown(120); // 2 minutes
         setSuccessMessage(`Mã xác nhận đã được gửi đến ${email}`);
      }, 1500);
   };

   const handleVerifyCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!verificationCode || verificationCode.length !== 6) {
         setError('Vui lòng nhập mã xác nhận 6 số');
         return;
      }

      setLoading(true);

      // Simulate API verification
      setTimeout(() => {
         setLoading(false);
         if (verificationCode === '123456') {
            // Test code
            setStep('reset');
            setSuccessMessage('Mã xác nhận hợp lệ. Vui lòng đặt mật khẩu mới');
         } else {
            setError('Mã xác nhận không đúng. Vui lòng thử lại');
         }
      }, 1500);
   };

   const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!validatePassword(newPassword)) {
         setError('Mật khẩu phải có ít nhất 8 ký tự');
         return;
      }

      if (newPassword !== confirmPassword) {
         setError('Mật khẩu không khớp');
         return;
      }

      setLoading(true);

      // Simulate API call
      setTimeout(() => {
         setLoading(false);
         setStep('success');
         setSuccessMessage('Mật khẩu đã được đặt lại thành công!');

         // Auto redirect to login after 3 seconds
         setTimeout(() => {
            router.push('/login');
         }, 3000);
      }, 1500);
   };

   const startCountdown = (seconds: number) => {
      if (timer) clearInterval(timer);

      setCountdown(seconds);
      const newTimer = setInterval(() => {
         setCountdown((prev) => {
            if (prev <= 1) {
               clearInterval(newTimer);
               return 0;
            }
            return prev - 1;
         });
      }, 1000);

      setTimer(newTimer);
   };

   const resendCode = () => {
      if (countdown > 0) return;

      setLoading(true);
      setError('');

      // Simulate resend API call
      setTimeout(() => {
         setLoading(false);
         startCountdown(120);
         setSuccessMessage('Mã xác nhận mới đã được gửi');
      }, 1500);
   };

   const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

   // Cleanup timer on unmount
   useState(() => {
      return () => {
         if (timer) clearInterval(timer);
      };
   });

   return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 py-12 px-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="text-center mb-8">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg
                     className="w-8 h-8 text-blue-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                     />
                  </svg>
               </div>
               <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {step === 'email' && 'Quên mật khẩu'}
                  {step === 'verify' && 'Xác nhận mã'}
                  {step === 'reset' && 'Đặt mật khẩu mới'}
                  {step === 'success' && 'Thành công!'}
               </h1>
               <p className="text-gray-600">
                  {step === 'email' && 'Nhập email để nhận mã xác nhận đặt lại mật khẩu'}
                  {step === 'verify' && 'Nhập mã 6 số đã được gửi đến email của bạn'}
                  {step === 'reset' && 'Tạo mật khẩu mới cho tài khoản của bạn'}
                  {step === 'success' && 'Mật khẩu đã được đặt lại thành công'}
               </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
               <div className="flex items-center">
                  {/* Step 1 */}
                  <div
                     className={`flex flex-col items-center ${
                        step !== 'email' ? 'text-blue-600' : 'text-gray-500'
                     }`}
                  >
                     <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                           step !== 'email' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}
                     >
                        {step !== 'email' ? (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        ) : (
                           <span className="font-medium">1</span>
                        )}
                     </div>
                     <span className="text-xs mt-1">Email</span>
                  </div>

                  {/* Connector */}
                  <div
                     className={`w-16 h-0.5 mx-2 ${
                        step !== 'email' ? 'bg-blue-600' : 'bg-gray-300'
                     }`}
                  ></div>

                  {/* Step 2 */}
                  <div
                     className={`flex flex-col items-center ${
                        step === 'reset' || step === 'success'
                           ? 'text-blue-600'
                           : step === 'verify'
                           ? 'text-gray-800'
                           : 'text-gray-400'
                     }`}
                  >
                     <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                           step === 'reset' || step === 'success'
                              ? 'bg-blue-100'
                              : step === 'verify'
                              ? 'bg-gray-100 border-2 border-gray-300'
                              : 'bg-gray-100'
                        }`}
                     >
                        {step === 'reset' || step === 'success' ? (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        ) : (
                           <span className="font-medium">2</span>
                        )}
                     </div>
                     <span className="text-xs mt-1">Xác nhận</span>
                  </div>

                  {/* Connector */}
                  <div
                     className={`w-16 h-0.5 mx-2 ${
                        step === 'reset' || step === 'success' ? 'bg-blue-600' : 'bg-gray-300'
                     }`}
                  ></div>

                  {/* Step 3 */}
                  <div
                     className={`flex flex-col items-center ${
                        step === 'success'
                           ? 'text-blue-600'
                           : step === 'reset'
                           ? 'text-gray-800'
                           : 'text-gray-400'
                     }`}
                  >
                     <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                           step === 'success'
                              ? 'bg-blue-100'
                              : step === 'reset'
                              ? 'bg-gray-100 border-2 border-gray-300'
                              : 'bg-gray-100'
                        }`}
                     >
                        {step === 'success' ? (
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        ) : (
                           <span className="font-medium">3</span>
                        )}
                     </div>
                     <span className="text-xs mt-1">Mật khẩu mới</span>
                  </div>
               </div>
            </div>

            {/* Success Message */}
            {successMessage && (
               <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                     <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                           clipRule="evenodd"
                        />
                     </svg>
                     <p className="text-green-700 text-sm">{successMessage}</p>
                  </div>
               </div>
            )}

            {/* Error Message */}
            {error && (
               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                     <svg
                        className="w-5 h-5 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                           clipRule="evenodd"
                        />
                     </svg>
                     <p className="text-red-600 text-sm">{error}</p>
                  </div>
               </div>
            )}

            {/* Step 1: Email Input */}
            {step === 'email' && (
               <form onSubmit={handleSendCode} className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ email *
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth="2"
                                 d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                           </svg>
                        </div>
                        <input
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                           placeholder="Nhập email đăng ký tài khoản"
                        />
                     </div>
                     <p className="mt-2 text-sm text-gray-500">
                        Mã xác nhận sẽ được gửi đến email này
                     </p>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                  >
                     {loading ? (
                        <span className="flex items-center justify-center">
                           <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                              />
                              <path
                                 className="opacity-75"
                                 fill="currentColor"
                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                           </svg>
                           Đang xử lý...
                        </span>
                     ) : (
                        'Gửi mã xác nhận'
                     )}
                  </button>
               </form>
            )}

            {/* Step 2: Verification Code */}
            {step === 'verify' && (
               <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã xác nhận *
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth="2"
                                 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                           </svg>
                        </div>
                        <input
                           type="text"
                           maxLength={6}
                           value={verificationCode}
                           onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                           className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-center text-lg tracking-widest"
                           placeholder="123456"
                           required
                        />
                     </div>

                     {/* Resend Code */}
                     <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                           Không nhận được mã?{' '}
                           <button
                              type="button"
                              onClick={resendCode}
                              disabled={countdown > 0 || loading}
                              className={`font-medium ${
                                 countdown > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'
                              }`}
                           >
                              Gửi lại {countdown > 0 && `(${formatTime(countdown)})`}
                           </button>
                        </span>
                     </div>

                     {/* Test Code Hint */}
                     <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                           <strong>Lưu ý:</strong> Sử dụng mã{' '}
                           <code className="bg-yellow-100 px-2 py-1 rounded">123456</code> để test
                        </p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                     >
                        {loading ? (
                           <span className="flex items-center justify-center">
                              <svg
                                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                 />
                                 <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                 />
                              </svg>
                              Đang xác nhận...
                           </span>
                        ) : (
                           'Xác nhận mã'
                        )}
                     </button>

                     <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors"
                     >
                        ← Quay lại nhập email khác
                     </button>
                  </div>
               </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 'reset' && (
               <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới *
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth="2"
                                 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                           </svg>
                        </div>
                        <input
                           type="password"
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                           className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                           placeholder="Ít nhất 8 ký tự"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu *
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth="2"
                                 d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                           </svg>
                        </div>
                        <input
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                           placeholder="Nhập lại mật khẩu mới"
                           required
                        />
                     </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                     <h4 className="font-medium text-gray-700 mb-2">Yêu cầu mật khẩu:</h4>
                     <ul className="text-sm text-gray-600 space-y-1">
                        <li
                           className={`flex items-center ${
                              newPassword.length >= 8 ? 'text-green-600' : ''
                           }`}
                        >
                           <svg
                              className={`w-4 h-4 mr-2 ${
                                 newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                           >
                              <path
                                 fillRule="evenodd"
                                 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                 clipRule="evenodd"
                              />
                           </svg>
                           Ít nhất 8 ký tự
                        </li>
                        <li
                           className={`flex items-center ${
                              newPassword === confirmPassword && newPassword.length > 0
                                 ? 'text-green-600'
                                 : ''
                           }`}
                        >
                           <svg
                              className={`w-4 h-4 mr-2 ${
                                 newPassword === confirmPassword && newPassword.length > 0
                                    ? 'text-green-500'
                                    : 'text-gray-400'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                           >
                              <path
                                 fillRule="evenodd"
                                 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                 clipRule="evenodd"
                              />
                           </svg>
                           Mật khẩu khớp
                        </li>
                     </ul>
                  </div>

                  <div className="space-y-3">
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                     >
                        {loading ? (
                           <span className="flex items-center justify-center">
                              <svg
                                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                 />
                                 <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                 />
                              </svg>
                              Đang xử lý...
                           </span>
                        ) : (
                           'Đặt lại mật khẩu'
                        )}
                     </button>

                     <button
                        type="button"
                        onClick={() => setStep('verify')}
                        className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors"
                     >
                        ← Quay lại nhập mã xác nhận
                     </button>
                  </div>
               </form>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
               <div className="space-y-6 text-center">
                  <div className="p-4">
                     <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <svg
                           className="w-10 h-10 text-green-600"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                           xmlns="http://www.w3.org/2000/svg"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                           />
                        </svg>
                     </div>
                     <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Mật khẩu đã được đặt lại!
                     </h3>
                     <p className="text-gray-600">
                        Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                     </p>
                  </div>

                  <div className="space-y-3">
                     <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                     >
                        Đăng nhập ngay
                     </button>

                     <Link
                        href="/"
                        className="inline-block w-full py-3 text-gray-600 hover:text-gray-800 transition-colors"
                     >
                        ← Quay lại trang chủ
                     </Link>
                  </div>
               </div>
            )}

            {/* Back to Login */}
            {step !== 'success' && (
               <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600">
                     Nhớ mật khẩu?{' '}
                     <Link
                        href="/login"
                        className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition"
                     >
                        Đăng nhập ngay
                     </Link>
                  </p>
               </div>
            )}
         </div>
      </div>
   );
}
