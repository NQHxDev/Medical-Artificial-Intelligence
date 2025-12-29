import { Diagnosis } from '@/types/diagnosis';

export function FinalResultView({ data }: { data: Extract<Diagnosis, { prediction: number }> }) {
   return (
      <div className="p-4 bg-blue-50 rounded-lg">
         <h3 className="text-xl font-bold text-gray-800 mb-2">
            Nguy cơ mắc bệnh: {data.risk_level}
         </h3>
         <p className="text-lg text-gray-700">{data.message}</p>
         {data.recommendations && (
            <div className="mt-4">
               <h4 className="font-medium text-gray-800 mb-2">Khuyến nghị:</h4>
               <ul className="list-disc pl-5 text-gray-600">
                  {data.recommendations.map((rec, index) => (
                     <li key={index}>{rec}</li>
                  ))}
               </ul>
            </div>
         )}
         {data.next_steps && (
            <div className="mt-4">
               <h4 className="font-medium text-gray-800 mb-2">Các bước tiếp theo:</h4>
               <ul className="list-disc pl-5 text-gray-600">
                  {data.next_steps.map((rec, index) => (
                     <li key={index}>{rec}</li>
                  ))}
               </ul>
            </div>
         )}
      </div>
   );
}
