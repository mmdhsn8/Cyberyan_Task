# Cyberyan Task - DID/VC Issuance

This project is a demo implementation of a KYC-style identity onboarding flow including DID issuance, Verifiable Credential (VC) generation, identity wallet display, QR badge, and audit logging using SHA-256.

## Tech Stack

- Frontend: React Native + TypeScript  
- Backend: Node.js + Express + TypeScript (Mock API)  
- State Management: Context API  
- Mock Data: Faker.js  
- Auth: JWT (mock)  
- Hashing: SHA-256  

## Interview Delivery Checklist

- GitHub repository:  
  https://github.com/mmdhsn8/Cyberyan_Task.git  

- 2 minute demo video:
  https://drive.google.com/file/d/1fgWXVsPJgZpGm8hfAWP7cQuuK11R-0I0/view?usp=sharing  

  Register -> DID/VC issuance -> Wallet -> QR -> Audit  

## Flow

Register -> Upload Passport -> Selfie -> Confirm  
-> POST /api/register -> DID + VC  
-> POST /api/auth/login -> JWT  
-> GET /api/audit/:did (Bearer token) -> SHA-256 issuance hash  
-> Wallet -> QR badge  

## Core Features

- User registration with name and email  
- Passport upload (gallery) and selfie capture (camera) with preview  
- DID + VC issuance from mock backend  
- JWT-based mock login  
- Wallet screen displaying DID and VC fields  
- QR badge generation (DID + VC payload)  
- Audit trail with SHA-256 issuance hash  
- Local identity/auth persistence (encrypted when secure crypto is available)  

## Requirement Coverage (Task -> Implementation)

TypeScript (FE & BE): `Frontend/tsconfig.json`, `backend/tsconfig.json`  
State management: Context API (`AuthContext`, `IdentityContext`)  
Registration + image preview: `RegisterScreen`, `PassportUploadScreen`, `SelfieCaptureScreen`  
DID/VC issuance: `Frontend/src/services/api/identity.service.ts`, `backend/src/modules/identity/identity.routes.ts`  
Mock JWT auth: `backend/src/modules/auth/auth.routes.ts`, `backend/src/modules/auth/auth.service.ts`  
SHA-256 audit: `backend/src/modules/audit/audit.routes.ts`, `backend/src/modules/audit/audit.service.ts`  
Faker.js mock data: `backend/src/shared/utils/faker.util.ts`  
Wallet + QR: `Frontend/src/screens/wallet/WalletScreen.tsx`, `Frontend/src/components/qr/QRModal.tsx`  
Audit screen: `Frontend/src/screens/audit/AuditScreen.tsx`  

--------------------------------------------------------------------------------------------------

## API Contracts

POST /api/register  

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "passportImage": "file:///passport.jpg",
  "selfieImage": "file:///selfie.jpg"
}
```

Response:
```json
{
  "did": "DID:abc123def456ghi789jk",
  "vc": {
    "id": "urn:uuid:9a244790-131f-4c5f-9de6-c1cc3a8d7ff8",
    "issuer": "DID:issuer:example123",
    "issuanceDate": "2026-02-23T10:00:00.000Z",
    "type": ["VerifiableCredential", "IdentityCredential"],
    "credentialSubject": {
      "id": "DID:abc123def456ghi789jk",
      "name": "John Doe",
      "email": "john@example.com",
      "passportHash": "sha256(passportImage)"
    }
  }
}
```

POST /api/auth/login  

Request:
```json
{
  "email": "john@example.com"
}
```

Response:
```json
{
  "token": "mock-jwt-token"
}
```

GET /api/audit/:did  

Headers:
`Authorization: Bearer <token>`

Response:
```json
{
  "did": "DID:abc123def456ghi789jk",
  "hash": "SHA-256 hash value",
  "timestamp": "2026-02-23T10:05:00.000Z"
}
```

## Repo Structure

Frontend/ -> React Native mobile app  
backend/ -> Mock API server  

## Quick Start

### 1) Run Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:
- PowerShell:
```powershell
Copy-Item .env.example .env
```
- macOS/Linux:
```bash
cp .env.example .env
```

Run backend:
```bash
npm run dev
```

Backend runs on:

Android Emulator -> `http://10.0.2.2:4000/api`  
iOS Simulator -> `http://localhost:4000/api`  

Example `.env`:

```env
JWT_SECRET=replace-with-a-long-random-secret
```

### 2) Run Frontend

```bash
cd Frontend
npm install
npm run android
```
 
## Tests

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd Frontend
npm test
```
--------------------------------------------------------------------------------------------------

## QR Content

The QR code encodes a JSON string containing:  
- `did`  
- full `vc` object  

## Short Project Analysis

- Clear separation between mobile app and API server  
- Realistic KYC-style flow instead of a simple form  
- In-memory backend suitable for demo scope (data resets when server restarts)  
- Simple validated API contracts  
- Confirm step performs: register -> login -> audit -> wallet display  

## Security Note

This is a demo implementation. No real KYC verification, key management, or production-grade authentication is applied.
JWT and audit validation are mock-oriented for interview/demo scope.

## Note for Reviewer

این پروژه با رویکرد Mock-First پیاده‌سازی شده و تمرکز آن بر ارائه‌ی یک جریان کامل، مرحله‌به‌مرحله و منطبق با نیازمندی‌های تسک است؛ به‌گونه‌ای که تمامی قابلیت‌ها به‌صورت قابل تست محلی بوده و با معیارهای ارزیابی تطابق کامل دارند.

برای بهبود رابط کاربری و تجربه کاربری، به‌جای پیاده‌سازی تمام مراحل در یک صفحه واحد، از یک فرآیند چندمرحله‌ای به سبک KYC استفاده شده است. این تصمیم باعث تفکیک وظایف در هر مرحله (اطلاعات کاربر، پاسپورت، سلفی و تأیید نهایی) شده و در عین سادگی، ساختاری منظم و حرفه‌ای برای اپلیکیشن ایجاد می‌کند، بدون اینکه پوشش کامل نیازمندی‌های تسک تحت تأثیر قرار بگیرد.

علاوه بر این، طراحی چندمرحله‌ای باعث شده کد ماژولار و قابل نگهداری باشد و امکان افزودن یا تغییر مراحل در آینده به‌سادگی فراهم شود.

با توجه به کوچک بودن مقیاس پروژه و محدود بودن پیچیدگی state، به‌جای استفاده از Redux از Context API استفاده شده است تا مدیریت state به‌شکلی سبک‌تر انجام شود، از پیچیدگی غیرضروری جلوگیری گردد و در عین حال ساختاری تمیز، قابل توسعه و خوانا حفظ شود.
