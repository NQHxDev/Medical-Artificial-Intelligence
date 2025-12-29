import { Diagnosis } from '@/types/diagnosis';

export function NeedMoreInfoView({
   data,
}: {
   data: Extract<Diagnosis, { status: 'need_more_info' }>;
}) {
   console.log(JSON.stringify(data));
   return (
      <>
         {/* Thông báo chính */}
         <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
            {data.message.split(' - ').map((line, index) => (
               <p key={index} className="text-orange-700 font-semibold">
                  {line}
               </p>
            ))}
            <p className="mt-1 text-sm text-orange-600">
               Vui lòng cung cấp thêm thông tin theo các câu hỏi sau
            </p>
         </div>

         {/* Danh sách câu hỏi */}
         <div className="space-y-3">
            {data.questions.map((q, i) => (
               <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm"
               >
                  {/* Số thứ tự */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                     {i + 1}
                  </span>

                  {/* Nội dung câu hỏi */}
                  <p className="text-gray-800 leading-relaxed">{q}</p>
               </div>
            ))}
         </div>
      </>
   );
}
