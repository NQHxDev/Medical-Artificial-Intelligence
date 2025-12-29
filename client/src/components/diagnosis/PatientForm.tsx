'use client';

import { useState } from 'react';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type Props = {
   loading: boolean;
   onSubmit: (data: {
      symptoms: string;
      age: number;
      gender: string;
      symptom_duration: number;
   }) => void;
};

export function PatientForm({ loading, onSubmit }: Props) {
   const [formData, setFormData] = useState({
      symptom: '',
      age: '',
      gender: '',
      duration: '',
   });

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleGenderChange = (value: string) => {
      setFormData((prev) => ({
         ...prev,
         gender: value,
      }));
   };

   const handleDurationChange = (value: string) => {
      setFormData((prev) => ({
         ...prev,
         duration: value,
      }));
   };

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit({
         symptoms: formData.symptom,
         age: Number(formData.age),
         gender: formData.gender,
         symptom_duration: Number(formData.duration),
      });
   };

   return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
         <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin bệnh nhân</h2>

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* TRIỆU CHỨNG */}
            <div>
               <label className="block text-gray-700 mb-2 font-medium">Triệu chứng chính *</label>
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
                  <label className="block text-gray-700 mb-2 font-medium">Giới tính *</label>
                  <Select value={formData.gender} onValueChange={handleGenderChange}>
                     <SelectTrigger className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <SelectValue placeholder="Chọn giới tính" />
                     </SelectTrigger>

                     <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>

            {/* THỜI GIAN TRIỆU CHỨNG */}
            <div>
               <label className="block text-gray-700 mb-2 font-medium">
                  Thời gian triệu chứng *
               </label>
               <Select value={formData.duration} onValueChange={handleDurationChange}>
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
   );
}
