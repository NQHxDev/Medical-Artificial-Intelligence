# train_model.py
import pandas as pd
import numpy as np
import warnings
from evaluation_plots import generate_evaluation_plots

warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import joblib


# -------------------------------
# Load và tiền xử lý dữ liệu
# -------------------------------
def load_and_preprocess_data(csv_path='heart.csv'):
    df = pd.read_csv(csv_path)

    numerical_cols = ['Age', 'RestingBP', 'Cholesterol', 'MaxHR', 'Oldpeak']
    categorical_cols = ['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope']
    binary_cols = ['FastingBS']

    for col in numerical_cols:
        df[col].fillna(df[col].median(), inplace=True)
    for col in categorical_cols + binary_cols:
        df[col].fillna(df[col].mode()[0], inplace=True)

    n_healthy = (df['HeartDisease'] == 0).sum()
    n_sick = (df['HeartDisease'] == 1).sum()
    print(f"Class distribution: healthy={n_healthy}, sick={n_sick}")

    if n_healthy < n_sick:
        n_needed = n_sick - n_healthy
        healthy_sample = df[df['HeartDisease'] == 0].sample(
            n=1, replace=True, random_state=42
        )
        synthetic_healthy = pd.concat([healthy_sample] * n_needed, ignore_index=True)
        df = pd.concat([df, synthetic_healthy], ignore_index=True)
        print(f"Đã thêm {n_needed} dòng người khỏe mạnh để cân bằng dataset.")

    return df, numerical_cols, categorical_cols, binary_cols


# -------------------------------
# Train model RandomForest
# -------------------------------
def train_random_forest_model(csv_path='heart.csv'):
    print("Đang tải và tiền xử lý dữ liệu...")
    df, numerical_features, categorical_features, binary_features = load_and_preprocess_data(csv_path)

    X = df.drop('HeartDisease', axis=1)
    y = df['HeartDisease']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    numerical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    binary_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent'))
    ])

    preprocessor = ColumnTransformer([
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features),
        ('bin', binary_transformer, binary_features)
    ])

    pipeline = ImbPipeline([
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', RandomForestClassifier(random_state=42))
    ])

    param_grid = {
        'classifier__n_estimators': [100, 200],
        'classifier__max_depth': [10, 20, None],
        'classifier__min_samples_split': [2, 5],
        'classifier__min_samples_leaf': [1, 2],
        'classifier__max_features': ['sqrt', 'log2']
    }

    print("Đang tìm hyperparameters tối ưu...")
    grid_search = GridSearchCV(
        pipeline,
        param_grid,
        cv=5,
        scoring='f1',
        n_jobs=-1,
        verbose=1
    )

    grid_search.fit(X_train, y_train)
    best_model = grid_search.best_estimator_

    y_pred = best_model.predict(X_test)
    y_pred_proba = best_model.predict_proba(X_test)[:, 1]

    print("\n" + "=" * 50)
    print("KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH")
    print("=" * 50)
    print(f"Best Parameters: {grid_search.best_params_}")
    print(f"Best CV Score: {grid_search.best_score_:.4f}")
    print(f"Test Accuracy: {(y_pred == y_test).mean():.4f}")
    print(f"ROC AUC Score: {roc_auc_score(y_test, y_pred_proba):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # ===============================
    # LẤY FEATURE NAMES (ĐÚNG CÁCH)
    # ===============================
    preprocessor_fitted = best_model.named_steps['preprocessor']

    feature_names = []
    for name, transformer, cols in preprocessor_fitted.transformers_:
        if name in ['num', 'bin']:
            feature_names.extend(cols)
        elif name == 'cat':
            cat_features = transformer.named_steps['onehot'].get_feature_names_out(cols)
            feature_names.extend(cat_features)

    # ===============================
    # VẼ BIỂU ĐỒ
    # ===============================
    generate_evaluation_plots(
        y_test=y_test,
        y_pred=y_pred,
        y_pred_proba=y_pred_proba,
        best_model=best_model,
        feature_names=feature_names,
        save_dir="."
    )

    # ===============================
    # LƯU MODEL
    # ===============================
    model_data = {
        'model': best_model,
        'feature_names': feature_names,
        'numerical_features': numerical_features,
        'categorical_features': categorical_features,
        'binary_features': binary_features
    }

    joblib.dump(model_data, 'heart_disease_model.pkl')
    print("\nMô hình đã lưu vào 'heart_disease_model.pkl'")

    return best_model


# -------------------------------
# Main
# -------------------------------
if __name__ == "__main__":
    model = train_random_forest_model()
