# 🚀 HƯỚNG DẪN DEPLOY SUCCESSLINK (CHO NGƯỜI KHÔNG BIẾT CODE)

Hướng dẫn này sẽ giúp bạn đưa ứng dụng Successlink lên internet để mọi người có thể truy cập, hoàn toàn MIỄN PHÍ!

---

## 📋 CHUẨN BỊ (5 phút)

### Bước 1: Tạo tài khoản GitHub
1. Vào https://github.com
2. Nhấn nút **Sign up** (Đăng ký)
3. Nhập email, tạo mật khẩu, chọn username
4. Xác nhận email
5. ✅ Xong! Bạn đã có tài khoản GitHub

### Bước 2: Upload code lên GitHub
1. Vào https://github.com và đăng nhập
2. Nhấn nút **+** ở góc trên bên phải → Chọn **New repository**
3. Đặt tên: `successlink` (hoặc tên bạn thích)
4. Chọn **Public** (công khai)
5. Nhấn **Create repository**
6. Bạn sẽ thấy màn hình hướng dẫn, chọn **uploading an existing file**
7. Kéo thả toàn bộ thư mục `CSL` vào (hoặc nhấn **choose your files**)
8. Nhấn **Commit changes**
9. ✅ Code đã lên GitHub!

---

## 🌐 DEPLOY FRONTEND (Giao diện web - 10 phút)

### Bước 1: Tạo tài khoản Vercel
1. Vào https://vercel.com
2. Nhấn **Sign Up**
3. Chọn **Continue with GitHub** (Đăng nhập bằng GitHub)
4. Cho phép Vercel truy cập GitHub
5. ✅ Xong!

### Bước 2: Deploy Frontend
1. Ở trang chủ Vercel, nhấn **Add New...** → **Project**
2. Bạn sẽ thấy danh sách các repo GitHub, tìm `successlink`
3. Nhấn **Import** bên cạnh repo `successlink`
4. **Quan trọng**: Ở phần **Root Directory**, nhấn **Edit** và để trống (hoặc chọn thư mục gốc)
5. Ở phần **Framework Preset**, chọn **Other** (vì đây là HTML thuần)
6. Nhấn **Deploy**
7. Đợi 1-2 phút... 
8. ✅ Xong! Bạn sẽ thấy màn hình chúc mừng với link như: `https://successlink-abc123.vercel.app`

**Lưu link này lại**, đây là link frontend của bạn!

---

## ⚙️ DEPLOY BACKEND (Server API - 15 phút)

### Bước 1: Tạo tài khoản Render
1. Vào https://render.com
2. Nhấn **Get Started**
3. Chọn **Sign up with GitHub**
4. Cho phép Render truy cập GitHub
5. ✅ Xong!

### Bước 2: Deploy Backend
1. Ở trang Dashboard của Render, nhấn **New +** → **Web Service**
2. Chọn **Build and deploy from a Git repository** → **Next**
3. Tìm repo `successlink` và nhấn **Connect**
4. Điền thông tin:
   - **Name**: `successlink-backend` (hoặc tên bạn thích)
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Branch**: `main` (hoặc `master`)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

5. **Quan trọng - Thêm Environment Variables**:
   Kéo xuống phần **Environment Variables**, nhấn **Add Environment Variable** và thêm từng cái sau:

   ```
   PORT = 3000
   JWT_SECRET = successlink-secret-key-2024
   DB_PATH = ./database/successlink.db
   ENCRYPTION_KEY = encryption-key-for-api-keys-2024
   ```

   > **Lưu ý**: Bạn có thể đổi các giá trị `successlink-secret-key-2024` và `encryption-key-for-api-keys-2024` thành bất kỳ chuỗi ký tự nào bạn muốn (càng dài càng an toàn)

6. Nhấn **Create Web Service**
7. Đợi 5-10 phút để Render build và deploy...
8. ✅ Xong! Bạn sẽ thấy link như: `https://successlink-backend.onrender.com`

**Lưu link này lại**, đây là link backend của bạn!

---

## 🔗 KẾT NỐI FRONTEND VỚI BACKEND (5 phút)

Bây giờ cần nói cho Frontend biết Backend ở đâu.

### Cách 1: Sửa trực tiếp trên GitHub (Dễ nhất)

1. Vào https://github.com và mở repo `successlink`
2. Tìm file `js/google-login.js`, nhấn vào file đó
3. Nhấn nút **Edit** (biểu tượng cái bút)
4. Tìm dòng số 6: `API_BASE_URL: 'http://localhost:3000/api',`
5. Đổi thành: `API_BASE_URL: 'https://successlink-backend.onrender.com/api',`
   (Thay `successlink-backend.onrender.com` bằng link backend của bạn)
6. Nhấn **Commit changes** → **Commit changes**
7. Làm tương tự với file `js/admin.js` (dòng số 7)

### Cách 2: Sửa trên máy tính rồi upload lại

1. Mở file `d:/@Github/CSL/js/google-login.js` bằng Notepad
2. Tìm dòng `API_BASE_URL: 'http://localhost:3000/api',`
3. Đổi thành link backend của bạn
4. Lưu file
5. Làm tương tự với `js/admin.js`
6. Upload lại lên GitHub (kéo thả file vào repo)

### Bước cuối: Vercel tự động deploy lại

1. Vào https://vercel.com/dashboard
2. Chọn project `successlink`
3. Vercel sẽ tự động phát hiện thay đổi từ GitHub và deploy lại
4. Đợi 1-2 phút
5. ✅ Xong!

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có thể:

1. **Truy cập ứng dụng**: Mở link Vercel của bạn (vd: `https://successlink-abc123.vercel.app`)
2. **Đăng ký tài khoản**: Nhập email, mật khẩu → Nhấn "Đăng ký"
3. **Sử dụng**: Tạo bài giảng, quiz, slide...

---

## 🔧 TẠO ADMIN ACCOUNT (Tùy chọn)

Để truy cập Admin Dashboard và quản lý AI providers:

### Cách 1: Sử dụng SQLite Viewer Online
1. Vào Render Dashboard → Chọn service `successlink-backend`
2. Nhấn **Shell** (ở menu bên trái)
3. Gõ lệnh: `sqlite3 database/successlink.db`
4. Gõ: `UPDATE users SET role='admin' WHERE email='your@email.com';`
   (Thay `your@email.com` bằng email bạn đã đăng ký)
5. Gõ: `.exit`
6. ✅ Xong! Bây giờ đăng nhập lại và vào `/admin.html`

### Cách 2: Sửa trực tiếp trong code (Dễ hơn)
1. Mở file `backend/config/database.js`
2. Tìm dòng `role TEXT DEFAULT 'teacher',`
3. Đổi thành `role TEXT DEFAULT 'admin',`
4. Upload lên GitHub
5. Render sẽ tự động deploy lại
6. Đăng ký tài khoản mới → Tự động là admin
7. **Nhớ đổi lại thành 'teacher' sau khi tạo xong admin!**

---

## ❓ TROUBLESHOOTING (Xử lý lỗi)

### Lỗi: "Failed to fetch" hoặc "Network Error"
- **Nguyên nhân**: Frontend không kết nối được Backend
- **Giải pháp**: Kiểm tra lại link `API_BASE_URL` trong `js/google-login.js` và `js/admin.js`

### Lỗi: Backend không chạy trên Render
- **Nguyên nhân**: Thiếu environment variables
- **Giải pháp**: Vào Render → Service → Environment → Thêm lại các biến

### Lỗi: "Database is locked"
- **Nguyên nhân**: SQLite không phù hợp cho production
- **Giải pháp**: Nâng cấp lên PostgreSQL (hướng dẫn riêng)

---

## 📞 HỖ TRỢ

Nếu gặp khó khăn:
1. Chụp màn hình lỗi
2. Ghi lại bước nào bạn đang làm
3. Hỏi lại tôi với thông tin chi tiết

---

## 🎯 CHECKLIST

- [ ] Tạo tài khoản GitHub
- [ ] Upload code lên GitHub
- [ ] Tạo tài khoản Vercel
- [ ] Deploy Frontend trên Vercel
- [ ] Lưu link Frontend
- [ ] Tạo tài khoản Render
- [ ] Deploy Backend trên Render
- [ ] Thêm Environment Variables
- [ ] Lưu link Backend
- [ ] Sửa API_BASE_URL trong code
- [ ] Test đăng ký/đăng nhập
- [ ] Tạo admin account (nếu cần)
- [ ] ✅ HOÀN THÀNH!

---

**Chúc bạn deploy thành công! 🚀**
