# BLIP 오버레이 툴 서버

JSON 파일을 직접 수정할 수 있는 Node.js 서버입니다.

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버 실행
```bash
npm start
```

또는 Windows에서:
```bash
start-server.bat
```

### 3. 브라우저에서 접속
```
http://localhost:3000/pages/main.html
```

## 기능

- **JSON 직접 수정**: 오버레이 툴에서 저장하면 JSON 파일이 자동으로 업데이트됩니다
- **실시간 편집**: 컴포넌트를 클릭하여 실시간으로 편집할 수 있습니다
- **자동 저장**: 변경사항이 즉시 JSON 파일에 반영됩니다

## API 엔드포인트

- `PUT /api/update-json`: JSON 파일의 특정 컴포넌트 업데이트
- `GET /api/json/:filename`: JSON 파일 내용 조회

## 사용법

1. 서버를 실행합니다
2. 브라우저에서 `http://localhost:3000/pages/main.html`을 엽니다
3. 우측 상단의 "개발자 모드" 버튼을 클릭합니다
4. 편집하고 싶은 컴포넌트를 클릭합니다
5. 값을 수정하고 "저장" 버튼을 클릭합니다
6. JSON 파일이 자동으로 업데이트됩니다!

## 문제 해결

- **포트 충돌**: 3000번 포트가 사용 중이면 `server.js`에서 PORT 값을 변경하세요
- **권한 오류**: JSON 파일에 쓰기 권한이 있는지 확인하세요
- **CORS 오류**: 브라우저에서 localhost로 접속했는지 확인하세요
