import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent

FILE_1 = BASE_DIR / "heart.csv"
FILE_2 = BASE_DIR / "output_converted.csv"
OUTPUT_FILE = BASE_DIR / "dataset_merged.csv"

# Đọc 2 file CSV
df1 = pd.read_csv(FILE_1)
df2 = pd.read_csv(FILE_2)

print(f"Dataset 1: {df1.shape}")
print(f"Dataset 2: {df2.shape}")

merged_df = pd.concat([df1, df2], ignore_index=True)

# Xoá dòng trùng nhau
merged_df = merged_df.drop_duplicates()

print(f"Dataset sau merge: {merged_df.shape}")

# Ghi ra file mới
merged_df.to_csv(OUTPUT_FILE, index=False)

print("Merge dataset thành công!")
