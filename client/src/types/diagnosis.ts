export type Medication = {
   name: string;
   dosage?: string;
};

export type FeaturePrimitive = string | number | boolean | null;
export type FeatureValue = FeaturePrimitive | FeaturePrimitive[] | Record<string, FeaturePrimitive>;
export type Features = Record<string, FeatureValue>;

export type Diagnosis =
   | {
        status: 'need_more_info';
        message: string;
        missing_features: string[];
        questions: string[];
        partial_features: Features;
        progress_percentage: number;
     }
   | {
        status: 'updated';
        updated_features: Features;
        still_missing: string[];
        progress_percentage: number;
        ready_for_prediction: boolean;
        message: string;
     }
   | {
        prediction: number;
        probability: number;
        risk_level: 'THẤP' | 'TRUNG BÌNH' | 'CAO';
        confidence: string;
        message: string;
        important_factors?: {
           feature: string;
           importance: number;
        }[];
        recommendations?: string[];
        medications?: Medication[];
        next_steps?: string[];
     }
   | {
        error: string;
     };

// ===== TYPE GUARDS =====
export const isError = (d: Diagnosis): d is { error: string } => 'error' in d;

export const isNeedMoreInfo = (
   d: Diagnosis
): d is Extract<Diagnosis, { status: 'need_more_info' }> =>
   'status' in d && d.status === 'need_more_info';

export const isUpdated = (d: Diagnosis): d is Extract<Diagnosis, { status: 'updated' }> =>
   'status' in d && d.status === 'updated';

export const isFinalResult = (d: Diagnosis): d is Extract<Diagnosis, { prediction: number }> =>
   'prediction' in d;
