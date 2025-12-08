'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import API_URL from '@/configs/api';

interface LoginForm {
   username: string;
   password: string;
}

// Errors object includes per-field messages plus an optional form-level error `_form`.
type LoginErrors = Partial<Record<keyof LoginForm, string>> & { _form?: string };

export default function LoginPage() {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [rememberMe, setRememberMe] = useState(false);
   const [loading, setLoading] = useState(false);
   const router = useRouter();

   const [errors, setErrors] = useState<LoginErrors>({});

   const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof LoginForm, string>> = {};

      // Username validation
      if (!username) {
         newErrors.username = 'Vui lòng nhập tên đăng nhập';
      } else if (username.length < 6) {
         newErrors.username = 'Tên đăng nhập phải có ít nhất 6 ký tự';
      }

      // Password validation
      if (!password) {
         newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (password.length < 8) {
         newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      setLoading(true);
      setErrors({});

      try {
         const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: username, password, rememberMe }),
         });

         const data = await res.json();

         if (!res.ok) {
            setErrors((prev) => ({ ...prev, _form: data.error || 'Đăng nhập thất bại' }));
            return;
         }

         // Lưu thông tin remember me nếu được chọn (chỉ ở client-side)
         if (typeof window !== 'undefined' && rememberMe) {
            localStorage.setItem('rememberedUsername', username);
         } else if (typeof window !== 'undefined') {
            // Xóa nếu không chọn remember me
            localStorage.removeItem('rememberedUsername');
         }

         // Chuyển hướng theo role
         if (data.role === 'doctor') {
            router.push('/dashboard/doctor');
         } else if (data.role === 'admin') {
            router.push('/dashboard/admin');
         } else {
            router.push('/dashboard/patient');
         }
      } catch (err) {
         setErrors((prev) => ({
            ...prev,
            _form: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
         }));
         console.log('Error Login:', err);
      } finally {
         setLoading(false);
      }
   };

   // Thêm hàm clear error khi user nhập
   const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
      if (errors.username) {
         setErrors((prev) => ({ ...prev, username: '' }));
      }
   };

   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      if (errors.password) {
         setErrors((prev) => ({ ...prev, password: '' }));
      }
   };

   useEffect(() => {
      if (typeof window !== 'undefined') {
         const rememberedUsername = localStorage.getItem('rememberedUsername');
         if (rememberedUsername) {
            setUsername(rememberedUsername);
            setRememberMe(true);
         }
      }
   }, []);

   return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-100">
         <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md mx-4">
            {/* Logo/Hero */}
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                     />
                  </svg>
               </div>
               <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
               <p className="text-gray-600">Đăng nhập để tiếp tục sử dụng dịch vụ</p>
            </div>

            {/* Form Error (chỉ hiển thị lỗi lớn _form) */}
            {errors._form && (
               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm flex items-center">
                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                           fillRule="evenodd"
                           d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                           clipRule="evenodd"
                        />
                     </svg>
                     {errors._form}
                  </p>
               </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
               {/* Username field */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Tên đăng nhập hoặc Email *
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
                        placeholder="Nhập tên đăng nhập hoặc email"
                        value={username}
                        onChange={handleUsernameChange}
                        className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                           errors.username ? 'border-red-300' : 'border-gray-300'
                        }`}
                     />
                  </div>
                  {errors.username && (
                     <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
               </div>

               {/* Password field */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
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
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                           errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                     />
                  </div>
                  {errors.password && (
                     <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
               </div>

               {/* Remember me & Forgot password */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="border border-gray-400 data-[state=checked]:border-blue-600"
                     />
                     <Label
                        htmlFor="remember-me"
                        className="text-sm text-gray-700 font-normal cursor-pointer"
                     >
                        Ghi nhớ đăng nhập
                     </Label>
                  </div>

                  <Link
                     href="/forgot-password"
                     className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
                  >
                     Quên mật khẩu?
                  </Link>
               </div>

               {/* Login button */}
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
                        Đang đăng nhập...
                     </span>
                  ) : (
                     'Đăng nhập'
                  )}
               </button>

               {/* Divider */}
               <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                     <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
                  </div>
               </div>

               {/* Social login options */}
               <div className="grid grid-cols-2 gap-3">
                  <button
                     type="button"
                     className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                     <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                           fill="#4285F4"
                           d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                           fill="#34A853"
                           d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                           fill="#FBBC05"
                           d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                           fill="#EA4335"
                           d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                     </svg>
                     Google
                  </button>
                  <button
                     type="button"
                     className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                     <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                     </svg>
                     Facebook
                  </button>
               </div>

               {/* Register link */}
               <div className="text-center pt-4">
                  <p className="text-gray-600">
                     Chưa có tài khoản?{' '}
                     <Link
                        href="/register"
                        className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition"
                     >
                        Đăng ký ngay
                     </Link>
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                     Bằng việc đăng nhập, bạn đồng ý với{' '}
                     <Link href="/terms" className="text-blue-500 hover:underline">
                        Điều khoản dịch vụ
                     </Link>{' '}
                     và{' '}
                     <Link href="/privacy" className="text-blue-500 hover:underline">
                        Chính sách bảo mật
                     </Link>
                  </p>
               </div>
            </form>
         </div>
      </div>
   );
}
