// hooks/useDiagnosis.ts
import { useState } from 'react';
import { Diagnosis } from '@/types/diagnosis';

export function useDiagnosis() {
   const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
   const [loading, setLoading] = useState(false);

   const predict = async (data: {
      symptoms: string;
      age: number;
      gender: string;
      symptom_duration: number;
   }) => {
      setLoading(true);
      try {
         const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         });

         if (!response.ok) {
            throw new Error('Network response was not ok');
         }

         const result = await response.json();
         setDiagnosis(result);
      } catch (error) {
         console.error('Error predicting:', error);
         setDiagnosis({
            error: 'Có lỗi xảy ra khi chẩn đoán. Vui lòng thử lại.',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
         } as any);
      } finally {
         setLoading(false);
      }
   };

   return {
      diagnosis,
      loading,
      predict,
   };
}
