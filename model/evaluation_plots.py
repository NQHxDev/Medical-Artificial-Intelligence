# evaluation_plots.py
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc

def generate_evaluation_plots(
    y_test,
    y_pred,
    y_pred_proba,
    best_model,
    feature_names,
    save_dir="results",
    folder_name="evaluation_plots"
):
    """
    Sinh các biểu đồ đánh giá mô hình:
    - Confusion Matrix
    - ROC Curve
    - Feature Importance
    Tất cả được lưu trong cùng một thư mục
    """

    # ===============================
    # Tạo thư mục lưu kết quả
    # ===============================
    output_dir = os.path.join(save_dir, folder_name)
    os.makedirs(output_dir, exist_ok=True)

    # ===============================
    # 1. Confusion Matrix
    # ===============================
    cm = confusion_matrix(y_test, y_pred)

    plt.figure(figsize=(6, 5))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=['Không bệnh', 'Có bệnh'],
        yticklabels=['Không bệnh', 'Có bệnh']
    )
    plt.xlabel('Dự đoán')
    plt.ylabel('Thực tế')
    plt.title('Confusion Matrix - Random Forest')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "confusion_matrix.png"), dpi=300)
    plt.close()

    # ===============================
    # 2. ROC Curve
    # ===============================
    fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, lw=2, label=f'ROC Curve (AUC = {roc_auc:.2f})')
    plt.plot([0, 1], [0, 1], linestyle='--', label='Random Classifier')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve - Random Forest')
    plt.legend(loc="lower right")
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "roc_curve.png"), dpi=300)
    plt.close()

    # ===============================
    # 3. Feature Importance
    # ===============================
    importances = best_model.named_steps['classifier'].feature_importances_

    importance_df = pd.DataFrame({
        'Feature': feature_names[:len(importances)],
        'Importance': importances
    }).sort_values('Importance', ascending=False).head(15)

    plt.figure(figsize=(10, 6))
    sns.barplot(
        x='Importance',
        y='Feature',
        data=importance_df,
        palette='viridis'
    )
    plt.title('Top 15 Feature Importance - Random Forest')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, "feature_importance.png"), dpi=300)
    plt.close()

    print(f"✅ Đã lưu toàn bộ biểu đồ vào thư mục: {output_dir}")
