@echo off
call "E:\My Project\TriTueNhanTao\.venv\Scripts\activate.bat"

cd /d "E:\My Project\TriTueNhanTao\model"

@REM python api.py
python ./api/app.py
pause
