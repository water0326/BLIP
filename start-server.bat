@echo off
echo BLIP 오버레이 툴 서버 시작 중...
echo.

REM 의존성 설치 확인
if not exist "node_modules" (
    echo 의존성 패키지를 설치합니다...
    npm install
    echo.
)

REM 서버 시작
echo 서버를 시작합니다...
echo 브라우저에서 http://localhost:3000/pages/main.html 을 열어주세요.
echo.
node server.js

pause
