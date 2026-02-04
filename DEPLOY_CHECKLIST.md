# 🚀 HƯỚNG DẪN DEPLOY NHANH - SUCCESSLINK

## 📍 THÔNG TIN HỆ THỐNG

### URLs
- **Frontend**: https://successlinkv26.vercel.app/
- **Backend**: https://successlinkv2-backend.onrender.com
- **Admin Dashboard**: https://successlinkv26.vercel.app/admin.html

### Tài khoản Admin mặc định
- **Email**: `admin@successlink.com`
- **Password**: `admin123456`

> ⚠️ **LƯU Ý**: Admin được tạo tự động mỗi khi backend khởi động (do dùng In-Memory Database)

---

## 📦 CÁC FILE CẦN UPLOAD LÊN GITHUB

Để hệ thống hoạt động đầy đủ, bạn cần upload các file sau:

### Backend Files (Quan trọng nhất)
1. ✅ `backend/server.js` - Đã thêm auto-seed admin
2. ✅ `backend/middleware/validator.js` - Đã fix lỗi validation đăng ký
3. ✅ `backend/config/database.js` - Cấu hình In-Memory DB

### Frontend Files
4. ✅ `index.html` - Đã thêm form đăng ký với tabs
5. ✅ `styles.css` - Đã thêm style cho tabs
6. ✅ `js/google-login.js` - Đã thêm logic đăng ký

### Documentation
7. ✅ `ADMIN_GUIDE.md` - Hướng dẫn quản trị hệ thống
8. ✅ `HUONG_DAN_DEPLOY.md` - Hướng dẫn deploy (nếu có)

---

## 🔧 CHECKLIST DEPLOY

### Bước 1: Upload Backend lên GitHub
- [ ] Upload `backend/server.js`
- [ ] Upload `backend/middleware/validator.js`
- [ ] Upload `backend/config/database.js`
- [ ] Commit với message: "Fix validation & add auto admin seed"

### Bước 2: Đợi Render Deploy
- [ ] Vào https://dashboard.render.com
- [ ] Kiểm tra service `successlinkv2-backend`
- [ ] Đợi status chuyển sang **Live** (màu xanh)
- [ ] Kiểm tra logs xem có dòng "✅ Admin user created" không

### Bước 3: Upload Frontend lên GitHub
- [ ] Upload `index.html`
- [ ] Upload `styles.css`
- [ ] Upload `js/google-login.js`
- [ ] Commit với message: "Add registration form with tabs"

### Bước 4: Đợi Vercel Deploy
- [ ] Vào https://vercel.com/dashboard
- [ ] Kiểm tra project `successlinkv22`
- [ ] Đợi status chuyển sang **Ready**
- [ ] Clear browser cache (`Ctrl + Shift + R`)

### Bước 5: Test hệ thống
- [ ] Vào https://successlinkv26.vercel.app/
- [ ] Thấy 2 tabs: "Đăng nhập" và "Đăng ký"
- [ ] Thử đăng ký tài khoản mới
- [ ] Thử đăng nhập với tài khoản vừa tạo
- [ ] Hoàn thành onboarding (chọn cấp học + môn)
- [ ] Vào workspace thành công

### Bước 6: Test Admin Dashboard
- [ ] Vào https://successlinkv26.vercel.app/admin.html
- [ ] Đăng nhập với `admin@successlink.com` / `admin123456`
- [ ] Xem được Dashboard với thống kê
- [ ] Xem được danh sách Users
- [ ] Thử thêm AI Provider (nếu có API key)

---

## 🐛 TROUBLESHOOTING

### Lỗi "Validation failed" khi đăng ký
**Nguyên nhân**: Backend chưa deploy phiên bản mới (chưa có fix validation)

**Giải pháp**:
1. Kiểm tra Render đã deploy xong chưa
2. Xem logs trên Render có lỗi gì không
3. Thử restart service trên Render

### Không thấy form Đăng ký
**Nguyên nhân**: Frontend chưa deploy hoặc browser cache

**Giải pháp**:
1. Nhấn `Ctrl + Shift + R` để hard refresh
2. Thử mở tab ẩn danh (`Ctrl + Shift + N`)
3. Kiểm tra Vercel đã deploy xong chưa

### Không vào được Admin Dashboard
**Nguyên nhân**: Tài khoản không có role admin

**Giải pháp**:
1. Đợi backend khởi động xong (2-3 giây)
2. Xem logs Render có dòng "✅ Admin user created" không
3. Nếu không có, restart service trên Render

### Backend trả về 404
**Nguyên nhân**: Route không tồn tại hoặc CORS chặn

**Giải pháp**:
1. Kiểm tra URL có đúng không (phải có `/api/`)
2. Xem Console (F12) có lỗi CORS không
3. Backend đã cho phép `.vercel.app` rồi nên không lo CORS

---

## 🎯 BƯỚC TIẾP THEO SAU KHI DEPLOY XONG

### 1. Thêm AI Provider
Vào Admin Dashboard → AI Providers → Add Provider

**Khuyên dùng Google Gemini (Miễn phí)**:
- Lấy API key: https://makersuite.google.com/app/apikey
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Model: `gemini-pro`

### 2. Test tạo bài giảng
- Đăng nhập với tài khoản teacher
- Vào Workspace
- Nhập topic và chọn loại nội dung
- Nhấn "Create" và xem AI có generate được không

### 3. Nâng cấp Database (Khuyên dùng)
**Vấn đề hiện tại**: In-Memory DB → Mất data khi restart

**Giải pháp**:
- Nâng cấp lên PostgreSQL trên Render (miễn phí)
- Hoặc dùng SQLite file-based + persistent storage

### 4. Bảo mật
- [ ] Đổi mật khẩu admin mặc định
- [ ] Thêm Environment Variable `ADMIN_PASSWORD` trên Render
- [ ] Thêm rate limiting để chống spam
- [ ] Enable 2FA cho tài khoản Vercel/Render

---

## 📚 TÀI LIỆU THAM KHẢO

- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - Hướng dẫn chi tiết quản trị hệ thống
- [Backend API Docs](./backend/README.md) - API documentation
- [Frontend Docs](./README.md) - Frontend documentation

---

## 💡 MẸO HAY

### Xem logs Backend realtime
```bash
# Vào Render Dashboard → Service → Logs
# Hoặc dùng Render CLI
render logs -f
```

### Test API trực tiếp
```bash
# Health check
curl https://successlinkv2-backend.onrender.com/health

# Test register
curl -X POST https://successlinkv2-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

### Clear cache nhanh
- Chrome/Edge: `Ctrl + Shift + Delete` → Chọn "Cached images and files"
- Hoặc: `Ctrl + Shift + R` (hard refresh)

---

**Chúc bạn deploy thành công! 🎉**

Nếu gặp vấn đề gì, hãy kiểm tra logs trên Render/Vercel hoặc xem Console (F12) trên browser.
