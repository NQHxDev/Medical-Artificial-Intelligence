'use client';

import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type FormData = {
   symptom: string;
   age: string;
   gender: string;
   duration: string;
};

type Medication = {
   name: string;
   dosage?: string;
};

type Diagnosis = {
   error?: string;
   diseaseName?: string;
   description?: string;
   treatments?: string[];
   recommendation?: string;
   medications?: Medication[];
};

export default function Home() {
   const [formData, setFormData] = useState<FormData>({
      symptom: '',
      age: '',
      gender: '',
      duration: '',
   });

   const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
   const [loading, setLoading] = useState<boolean>(false);

   const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target as HTMLInputElement;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      try {
         const response = await fetch('/api/diagnose', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
         });

         const data = (await response.json()) as Diagnosis;
         setDiagnosis(data);
      } catch (error) {
         console.error('Error:', error);
         setDiagnosis({
            error: 'Đã có lỗi xảy ra khi chẩn đoán. Vui lòng thử lại.',
         });
      } finally {
         setLoading(false);
      }
   };

   const handleDurationChange = (value: string) => {
      setFormData((prev) => ({ ...prev, duration: value }));
   };

   const handleGenderChange = (value: string) => {
      setFormData((prev) => ({ ...prev, gender: value }));
   };

   // Ensure we always have an array to render safely
   const meds: Medication[] = diagnosis?.medications ?? [];

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
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin bệnh nhân</h2>

                     <form onSubmit={handleSubmit} className="space-y-6">
                        {/* TRIỆU CHỨNG */}
                        <div>
                           <label className="block text-gray-700 mb-2 font-medium">
                              Triệu chứng chính *
                           </label>
                           <textarea
                              name="symptom"
                              value={formData.symptom}
                              onChange={handleChange}
                              required
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Mô tả chi tiết triệu chứng..."
                           />
                        </div>

                        {/* TUỔI + GIỚI TÍNH */}
                        <div className="grid md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-gray-700 mb-2 font-medium">Tuổi *</label>
                              <Input
                                 type="number"
                                 name="age"
                                 value={formData.age}
                                 onChange={handleChange}
                                 required
                                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                 placeholder="Nhập tuổi"
                              />
                           </div>

                           <div>
                              <label className="block text-gray-700 mb-2 font-medium">
                                 Giới tính *
                              </label>
                              <Select
                                 defaultValue={formData.gender}
                                 onValueChange={(value) => handleGenderChange(value)}
                              >
                                 <SelectTrigger className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <SelectValue placeholder="Chọn giới tính" />
                                 </SelectTrigger>

                                 <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
                                 </SelectContent>
                              </Select>

                              {/* keep a hidden input so the form contains the gender value */}
                              <input type="hidden" name="gender" value={formData.gender} />
                           </div>
                        </div>

                        {/* THỜI GIAN TRIỆU CHỨNG */}
                        <div>
                           <label className="block text-gray-700 mb-2 font-medium">
                              Thời gian triệu chứng *
                           </label>
                           <Select
                              defaultValue={formData.duration}
                              onValueChange={(value) => handleDurationChange(value)}
                           >
                              <SelectTrigger className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                 <SelectValue placeholder="Chọn thời gian" />
                              </SelectTrigger>

                              <SelectContent>
                                 <SelectItem value="1">Dưới 1 ngày</SelectItem>
                                 <SelectItem value="2">1–3 ngày</SelectItem>
                                 <SelectItem value="3">4–7 ngày</SelectItem>
                                 <SelectItem value="4">Trên 1 tuần</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                           type="submit"
                           disabled={loading}
                           className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                        >
                           {loading ? 'Đang chẩn đoán...' : 'Chẩn đoán ngay'}
                        </button>
                     </form>
                  </div>

                  {/* KẾT QUẢ */}
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6">Kết quả chẩn đoán</h2>

                     {/* Chưa có dữ liệu */}
                     {!diagnosis && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                           <h3 className="text-xl font-medium text-gray-700 mb-2">
                              Chưa có kết quả chẩn đoán
                           </h3>
                           <p className="text-gray-500 max-w-md">
                              Nhập thông tin và nhấn Chẩn đoán ngay để xem kết quả
                           </p>
                        </div>
                     )}

                     {/* Có lỗi */}
                     {diagnosis?.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
                           {diagnosis.error}
                        </div>
                     )}

                     {/* Có kết quả */}
                     {diagnosis && !diagnosis.error && (
                        <div className="space-y-6">
                           <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                              <h3 className="text-xl font-bold">
                                 {diagnosis.diseaseName || 'Bệnh được dự đoán'}
                              </h3>

                              {/* MÔ TẢ */}
                              <div className="mt-4">
                                 <h4 className="font-medium text-gray-700 mb-2">Mô tả:</h4>
                                 <p className="text-gray-600">
                                    {diagnosis.description || 'Không có mô tả.'}
                                 </p>
                              </div>

                              {/* ĐỀ XUẤT */}
                              <div className="mt-4">
                                 <h4 className="font-medium text-gray-700 mb-2">
                                    Đề xuất điều trị:
                                 </h4>
                                 <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                    {(diagnosis.treatments || []).map((t, i) => (
                                       <li key={i}>{t}</li>
                                    ))}
                                 </ul>
                              </div>

                              {/* KHUYẾN CÁO */}
                              <div className="mt-4">
                                 <h4 className="font-medium text-gray-700 mb-2">Khuyến cáo:</h4>
                                 <p className="text-gray-600">
                                    {diagnosis.recommendation || 'Không có khuyến cáo.'}
                                 </p>
                              </div>
                           </div>

                           {/* THUỐC */}
                           {meds.length > 0 && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                 <h4 className="font-medium text-gray-700 mb-3">Thuốc đề xuất:</h4>
                                 <div className="grid grid-cols-2 gap-3">
                                    {meds.map((med, index) => (
                                       <div key={index} className="bg-white p-3 rounded border">
                                          <div className="font-medium">{med.name}</div>
                                          <div className="text-sm text-gray-500">{med.dosage}</div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
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
