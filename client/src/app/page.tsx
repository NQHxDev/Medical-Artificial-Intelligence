'use client';

import { DiagnosisResult } from '@/components/diagnosis/DiagnosisResult';
import { PatientForm } from '@/components/diagnosis/PatientForm';
import { useDiagnosis } from '@/hooks/useDiagnosis';

export default function Home() {
   const { diagnosis, loading, predict } = useDiagnosis();

   return (
      <main className="min-h-screen bg-linear-to-br from-blue-50 to-white">
         {/* HEADER */}
         <header className="absolute top-0 right-0 p-6">
            <div className="flex gap-4">
               <button
                  onClick={() => (window.location.href = '/login')}
                  className="px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
               >
                  Đăng nhập
               </button>

               <button
                  onClick={() => (window.location.href = '/register')}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
               >
                  Đăng ký
               </button>
            </div>
         </header>

         <div className="container mx-auto px-4 py-16 pt-24">
            <div className="max-w-6xl mx-auto">
               {/* TITLE */}
               <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">Hệ Thống Chẩn Đoán Bệnh</h1>
                  <p className="text-gray-600 text-lg">
                     Nhập thông tin triệu chứng để nhận chẩn đoán từ hệ thống
                  </p>
               </div>

               <div className="grid lg:grid-cols-2 gap-8">
                  {/* FORM */}
                  <PatientForm loading={loading} onSubmit={predict} />

                  {/* KẾT QUẢ */}
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6">Kết quả chẩn đoán</h2>

                     <DiagnosisResult diagnosis={diagnosis} />

                     {/* Hiển thị khi chưa có kết quả */}
                     {!diagnosis && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                           <h3 className="text-xl font-medium text-gray-700 mb-2">
                              Chưa có kết quả chẩn đoán
                           </h3>
                           <p className="text-gray-500 max-w-md">
                              Nhập thông tin và nhấn `Chẩn đoán ngay` để xem kết quả
                           </p>
                        </div>
                     )}
                  </div>
               </div>

               {/* FOOTER */}
               <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                  <p>Hệ thống chẩn đoán dựa trên Machine learning</p>
                  <p>© 2025 Hệ thống Y tế Thông minh</p>
               </div>
            </div>
         </div>
      </main>
   );
}
