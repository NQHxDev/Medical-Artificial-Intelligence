'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import API_URL from '@/configs/api';

interface RegisterForm {
   fullName: string;
   email: string;
   phone: string;
   username: string;
   password: string;
   confirmPassword: string;
   role: 'patient' | 'doctor';
   acceptTerms: boolean;
}

// Errors object includes per-field messages plus an optional form-level error `_form`.
type RegisterErrors = Partial<Record<keyof RegisterForm, string>> & { _form?: string };

export default function RegisterPage() {
   const router = useRouter();
   const [formData, setFormData] = useState<RegisterForm>({
      fullName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      acceptTerms: false,
   });

   const [errors, setErrors] = useState<RegisterErrors>({});
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
   ) => {
      const { name, value, type } = e.target;

      if (type === 'checkbox') {
         const checked = (e.target as HTMLInputElement).checked;
         setFormData((prev) => ({ ...prev, [name]: checked }));
      } else {
         setFormData((prev) => ({ ...prev, [name]: value }));
      }

      // Clear error when user starts typing
      if (errors[name as keyof RegisterForm]) {
         setErrors((prev) => ({ ...prev, [name]: '' }));
      }
   };

   const handleAcceptTermsChange = (checked: boolean) => {
      setFormData((prev) => ({ ...prev, acceptTerms: checked }));
      if (errors.acceptTerms) {
         setErrors((prev) => ({ ...prev, acceptTerms: '' }));
      }
   };

   const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof RegisterForm, string>> = {};

      // Full name validation
      if (!formData.fullName.trim()) {
         newErrors.fullName = 'Vui lòng nhập họ tên';
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
         newErrors.email = 'Vui lòng nhập email';
      } else if (!emailRegex.test(formData.email)) {
         newErrors.email = 'Email không hợp lệ';
      }

      // Phone validation
      let phone = formData.phone.replace(/\s/g, '').trim();
      if (phone.startsWith('+84')) {
         phone = '0' + phone.substring(3);
      }
      const phoneRegex = /^0[35789][0-9]{8}$/;
      if (!phoneRegex.test(phone)) {
         newErrors.phone = 'Số điện thoại không hợp lệ';
      }

      // Username validation
      if (!formData.username) {
         newErrors.username = 'Vui lòng nhập tên đăng nhập';
      } else if (formData.username.length < 6) {
         newErrors.username = 'Tên đăng nhập phải có ít nhất 6 ký tự';
      }

      // Password validation
      if (!formData.password) {
         newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (formData.password.length < 8) {
         newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
         newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = 'Mật khẩu không khớp';
      }

      // Terms acceptance validation
      if (!formData.acceptTerms) {
         newErrors.acceptTerms = 'Bạn phải đồng ý với điều khoản dịch vụ';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      setLoading(true);
      setErrors({});

      try {
         const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
         });

         const data = await res.json();
         console.log(data);

         if (!res.ok) {
            if (data.errors && Array.isArray(data.errors)) {
               const combinedMessage = data.errors
                  .map((err: { message?: string }) => err.message ?? '')
                  .filter(Boolean)
                  .join(', ');

               setErrors((prev) => ({
                  ...prev,
                  _form: `Đăng ký thất bại: ${combinedMessage}`,
               }));
            } else if (data.field) {
               setErrors((prev) => ({
                  ...prev,
                  [data.field]: data.message || 'Có lỗi xảy ra',
               }));
            } else {
               setErrors((prev) => ({
                  ...prev,
                  _form: data.message || 'Đăng ký thất bại',
               }));
            }

            return;
         }

         // Registration successful
         setSuccess(true);

         // Auto redirect to login after 3 seconds
         setTimeout(() => {
            router.push('/login');
         }, 3000);
      } catch (err) {
         setErrors((prev) => ({
            ...prev,
            _form: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.',
         }));
         console.error('Registration error:', err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 py-12 px-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl mx-4">
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                     />
                  </svg>
               </div>
               <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
               <p className="text-gray-600">Đăng ký để trải nghiệm dịch vụ chẩn đoán thông minh</p>
            </div>

            {/* Success Message */}
            {success && (
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
                     <p className="text-green-700 font-medium">
                        Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                     </p>
                  </div>
               </div>
            )}

            {/* Form Error */}
            {errors._form && (
               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{errors._form}</p>
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
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
                                 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                           </svg>
                        </div>
                        <input
                           type="text"
                           name="fullName"
                           value={formData.fullName}
                           onChange={handleChange}
                           className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                              errors.fullName ? 'border-red-300' : 'border-gray-300'
                           }`}
                           placeholder="Nguyễn Văn A"
                        />
                     </div>
                     {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                     )}
                  </div>

                  {/* Email */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
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
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                           }`}
                           placeholder="nguyenvana@example.com"
                        />
                     </div>
                     {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
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
                                 d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                           </svg>
                        </div>
                        <input
                           type="tel"
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                              errors.phone ? 'border-red-300' : 'border-gray-300'
                           }`}
                           placeholder="0912345678"
                        />
                     </div>
                     {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  {/* Username */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đăng nhập *
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
                                 d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                              />
                           </svg>
                        </div>
                        <input
                           type="text"
                           name="username"
                           value={formData.username}
                           onChange={handleChange}
                           className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                              errors.username ? 'border-red-300' : 'border-gray-300'
                           }`}
                           placeholder="nguyenvana"
                        />
                     </div>
                     {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                     )}
                  </div>

                  {/* Password */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu *
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
                           name="password"
                           value={formData.password}
                           onChange={handleChange}
                           className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                              errors.password ? 'border-red-300' : 'border-gray-300'
                           }`}
                           placeholder="Ít nhất 8 ký tự"
                        />
                     </div>
                     {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                     )}
                  </div>

                  {/* Confirm Password */}
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
                           name="confirmPassword"
                           value={formData.confirmPassword}
                           onChange={handleChange}
                           className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                           }`}
                           placeholder="Nhập lại mật khẩu"
                        />
                     </div>
                     {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                     )}
                  </div>

                  {/* Role */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bạn là *
                     </label>
                     <div className="grid grid-cols-2 gap-3">
                        <label
                           className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition ${
                              formData.role === 'patient'
                                 ? 'border-blue-500 bg-blue-50'
                                 : 'border-gray-300 hover:bg-gray-50'
                           }`}
                        >
                           <input
                              type="radio"
                              name="role"
                              value="patient"
                              checked={formData.role === 'patient'}
                              onChange={handleChange}
                              className="sr-only"
                           />
                           <div className="text-center">
                              <svg
                                 className="w-6 h-6 mx-auto mb-2 text-gray-600"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                 />
                              </svg>
                              <span className="font-medium">Bệnh nhân</span>
                           </div>
                        </label>

                        <label
                           className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition ${
                              formData.role === 'doctor'
                                 ? 'border-blue-500 bg-blue-50'
                                 : 'border-gray-300 hover:bg-gray-50'
                           }`}
                        >
                           <input
                              type="radio"
                              name="role"
                              value="doctor"
                              checked={formData.role === 'doctor'}
                              onChange={handleChange}
                              className="sr-only"
                           />
                           <div className="text-center">
                              <svg
                                 className="w-6 h-6 mx-auto mb-2 text-gray-600"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                 />
                              </svg>
                              <span className="font-medium">Bác sĩ</span>
                           </div>
                        </label>
                     </div>
                  </div>
               </div>

               {/* Terms and Conditions */}
               <div>
                  <div className="flex items-start space-x-2">
                     <div className="flex items-center space-x-2">
                        <Checkbox
                           id="acceptTerms"
                           name="acceptTerms"
                           checked={formData.acceptTerms}
                           onCheckedChange={(checked) => handleAcceptTermsChange(checked === true)}
                           className={`border border-gray-400 data-[state=checked]:border-blue-600 ${
                              errors.acceptTerms ? 'border-red-400' : ''
                           }`}
                        />
                        <Label
                           htmlFor="acceptTerms"
                           className="text-sm text-gray-700 font-normal cursor-pointer"
                        >
                           Tôi đồng ý với{' '}
                           <Link href="/terms" className="text-blue-600 hover:underline">
                              Điều khoản dịch vụ
                           </Link>{' '}
                           và{' '}
                           <Link href="/privacy" className="text-blue-600 hover:underline">
                              Chính sách bảo mật
                           </Link>{' '}
                           của hệ thống
                        </Label>
                     </div>
                  </div>
                  {errors.acceptTerms && (
                     <p className="mt-1 text-sm text-red-600 ml-6">{errors.acceptTerms}</p>
                  )}
               </div>

               {/* Submit Button */}
               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
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
                     'Đăng ký tài khoản'
                  )}
               </button>

               {/* Login Link */}
               <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-gray-600">
                     Đã có tài khoản?{' '}
                     <Link
                        href="/login"
                        className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition"
                     >
                        Đăng nhập ngay
                     </Link>
                  </p>
               </div>
            </form>
         </div>
      </div>
   );
}
