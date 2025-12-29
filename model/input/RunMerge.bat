@echo off
call "E:\My Project\TriTueNhanTao\.venv\Scripts\activate.bat"

cd /d "E:\My Project\TriTueNhanTao\model"

echo Convert...
python input\merge_data.py
pause
