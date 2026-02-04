# Google OAuth Setup Guide

## 🎯 Hướng dẫn cấu hình Google OAuth cho Successlink

### Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Nhập tên project: **"Successlink"**
4. Click **"Create"**

### Bước 2: Kích hoạt Google+ API

1. Trong Google Cloud Console, vào **"APIs & Services"** → **"Library"**
2. Tìm kiếm **"Google+ API"** hoặc **"Google Identity"**
3. Click vào và nhấn **"Enable"**

### Bước 3: Tạo OAuth 2.0 Credentials

1. Vào **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Nếu chưa có, click **"Configure Consent Screen"**:
   - User type: **External**
   - App name: **Successlink**
   - User support email: *email của bạn*
   - Developer contact: *email của bạn*
   - Click **"Save and Continue"** qua các bước
   
4. Quay lại **"Create Credentials"** → **"OAuth client ID"**:
   - Application type: **Web application**
   - Name: **Successlink Web Client**
   
5. **Authorized JavaScript origins**:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   ```
   
6. **Authorized redirect URIs**:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   ```
   
7. Click **"Create"**

### Bước 4: Lấy Client ID và Client Secret

Sau khi tạo xong, bạn sẽ thấy popup hiển thị:
- **Client ID**: `123456789-abc123.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123xyz...`

**Copy cả hai giá trị này!**

### Bước 5: Cấu hình Backend

1. Mở file `backend/.env`
2. Thay thế các giá trị:

```env
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz...
```

### Bước 6: Cấu hình Frontend

1. Mở file `js/google-login.js`
2. Tìm dòng:
```javascript
GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
```

3. Thay thế bằng Client ID thật:
```javascript
GOOGLE_CLIENT_ID: '123456789-abc123.apps.googleusercontent.com',
```

### Bước 7: Khởi động ứng dụng

#### Terminal 1 - Backend:
```bash
cd backend
npm install
npm start
```

#### Terminal 2 - Frontend:
```bash
# Tại thư mục gốc
python -m http.server 8080
```

### Bước 8: Kiểm tra

1. Mở trình duyệt: `http://localhost:8080`
2. Bạn sẽ thấy màn hình đăng nhập với nút **"Sign in with Google"**
3. Click vào nút Google Sign-In
4. Chọn tài khoản Google
5. Cho phép ứng dụng truy cập
6. Bạn sẽ được chuyển đến màn onboarding (lần đầu) hoặc workspace (lần sau)

---

## 🔧 Xử lý sự cố

### Lỗi: "redirect_uri_mismatch"
**Nguyên nhân**: URL không khớp với Authorized redirect URIs

**Giải pháp**:
1. Kiểm tra URL bạn đang truy cập (phải là `http://localhost:8080`)
2. Vào Google Cloud Console → Credentials
3. Edit OAuth client
4. Thêm chính xác URL bạn đang dùng vào Authorized JavaScript origins

### Lỗi: "Invalid Google token"
**Nguyên nhân**: Backend không verify được token

**Giải pháp**:
1. Kiểm tra `GOOGLE_CLIENT_ID` trong `backend/.env` có đúng không
2. Restart backend server
3. Clear browser cache và thử lại

### Lỗi: Google Sign-In button không hiện
**Nguyên nhân**: Google Identity Services chưa load

**Giải pháp**:
1. Kiểm tra console browser (F12) xem có lỗi gì
2. Đảm bảo có internet (Google script load từ CDN)
3. Thử hard refresh (Ctrl + Shift + R)

### Backend không chạy được
**Nguyên nhân**: PowerShell execution policy

**Giải pháp**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📝 Lưu ý quan trọng

### Bảo mật
- ⚠️ **KHÔNG** commit file `.env` lên Git
- ⚠️ **KHÔNG** share Client Secret công khai
- ✅ Thêm `.env` vào `.gitignore`

### Production
Khi deploy lên production:
1. Tạo OAuth client mới cho production
2. Thêm domain production vào Authorized origins:
   ```
   https://your-domain.com
   ```
3. Update `GOOGLE_CLIENT_ID` trong cả backend và frontend
4. Update CORS trong `backend/server.js`

---

## ✅ Checklist

- [ ] Đã tạo Google Cloud Project
- [ ] Đã enable Google+ API
- [ ] Đã tạo OAuth 2.0 credentials
- [ ] Đã copy Client ID và Client Secret
- [ ] Đã update `backend/.env`
- [ ] Đã update `js/google-login.js`
- [ ] Backend đang chạy trên port 3000
- [ ] Frontend đang chạy trên port 8080
- [ ] Đã test đăng nhập thành công

---

## 🎉 Hoàn thành!

Nếu tất cả các bước trên đều OK, bạn đã có hệ thống đăng nhập Google hoàn chỉnh!

**Luồng hoạt động:**
1. User click "Sign in with Google"
2. Google popup mở ra
3. User chọn tài khoản và authorize
4. Google trả về ID token
5. Frontend gửi token đến backend `/api/auth/google`
6. Backend verify token với Google
7. Backend tạo/update user trong database
8. Backend trả về JWT token
9. Frontend lưu token và navigate đến onboarding/workspace

**Thử nghiệm:**
- Đăng nhập lần đầu → Sẽ vào onboarding
- Chọn cấp học & môn → Lưu vào database
- Đăng nhập lần sau → Skip onboarding, vào workspace luôn
- Tạo bài giảng → Tự động lưu vào database với user ID
