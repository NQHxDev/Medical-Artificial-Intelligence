import csv
from pathlib import Path

BASE_DIR = Path(__file__).parent

INPUT_FILE = BASE_DIR / "heart.csv"
OUTPUT_FILE = BASE_DIR / "output_converted.csv"

sex_map = {
    "1": "M",
    "0": "F"
}

cp_map = {
    "0": "TA",
    "1": "ATA",
    "2": "NAP",
    "3": "ASY"
}

rest_ecg_map = {
    "0": "Normal",
    "1": "ST",
    "2": "LVH"
}

exang_map = {
    "1": "Y",
    "0": "N"
}

slope_map = {
    "0": "Up",
    "1": "Flat",
    "2": "Down"
}

with open(INPUT_FILE, newline='', encoding="utf-8") as infile, \
     open(OUTPUT_FILE, "w", newline='', encoding="utf-8") as outfile:

    reader = csv.DictReader(infile)

    fieldnames = [
        "Age", "Sex", "ChestPainType", "RestingBP", "Cholesterol",
        "FastingBS", "RestingECG", "MaxHR", "ExerciseAngina",
        "Oldpeak", "ST_Slope", "HeartDisease"
    ]

    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        new_row = {
            "Age": row["age"],
            "Sex": sex_map.get(row["sex"], row["sex"]),
            "ChestPainType": cp_map.get(row["cp"], row["cp"]),
            "RestingBP": row["trtbps"],
            "Cholesterol": row["chol"],
            "FastingBS": row["fbs"],
            "RestingECG": rest_ecg_map.get(row["restecg"], row["restecg"]),
            "MaxHR": row["thalachh"],
            "ExerciseAngina": exang_map.get(row["exng"], row["exng"]),
            "Oldpeak": row["oldpeak"],
            "ST_Slope": slope_map.get(row["slp"], row["slp"]),
            "HeartDisease": row["output"]
        }

        writer.writerow(new_row)

print("Convert CSV thành công!")
