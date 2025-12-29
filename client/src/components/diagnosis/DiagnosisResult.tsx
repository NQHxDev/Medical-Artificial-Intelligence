import { FinalResultView } from '@/components/diagnosis/FinalResultView';
import { NeedMoreInfoView } from '@/components/diagnosis/NeedMoreInfoView';
import { isError, isNeedMoreInfo, isUpdated, isFinalResult } from '@/types/diagnosis';
import { Diagnosis } from '@/types/diagnosis';

type Props = {
   diagnosis: Diagnosis | null;
};

export function DiagnosisResult({ diagnosis }: Props) {
   if (!diagnosis) return <p>Chưa có kết quả</p>;

   if (isError(diagnosis)) return <p>{diagnosis.error}</p>;

   if (isNeedMoreInfo(diagnosis)) return <NeedMoreInfoView data={diagnosis} />;

   if (isUpdated(diagnosis)) return <p>{diagnosis.message}</p>;

   if (isFinalResult(diagnosis)) return <FinalResultView data={diagnosis} />;

   return null;
}
