## 현대모비스 원부자재 수급 리스크 예측 관리 대시보드

### 담당 업무

#### **백엔드**
  - expressjs 기반 API 설계 및 개발 담당
  - MongoDB 설계
  - AWS EC2서버(리눅스)에 MongoDB, 웹서버 설치
  

#### **프론트엔드** 
  - vue2 기반 전체적인 설계, 구축, 개발 진행
  - webpack 구축 및 배포


#### **기타 업무**
  - 개발 작업 분담 및 고객사 대응
  - 데이터 적재 모듈 개발 및 스케줄링

### Install
```bash
#frontend npm 설치
cd frontend && npm install

#backend npm 설치
cd backend && npm install

### Build
```bash
cd frontend && npm run build
```

### Serve(개발환경)
```bash
cd frontend %% npm run serve
```
### Start(배포판 실행) 
```bash
cd backend && npm start
```

### Info

- **build 수정** 빌드파일 backend/dist 폴더로 이동 기존 방식인 js, css폴더 내부의 파일 지울 필요 없이 배포 가능
- **serve 추가** 개발환경 시 webpack이용 가능(front수정 후 바로 적용확인)
- web server port : 8080
- api server port : 3000
