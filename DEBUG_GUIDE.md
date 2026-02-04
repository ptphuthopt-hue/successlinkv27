# 🔍 HƯỚNG DẪN DEBUG LỖI ĐĂNG NHẬP

## Bước 1: Kiểm tra Console (QUAN TRỌNG)

1. Mở website: https://sclv2-orcin.vercel.app/
2. Nhấn phím **F12** trên bàn phím
3. Chọn tab **Console** (ở trên cùng)
4. Nhập email và password bất kỳ
5. Nhấn nút **Đăng nhập**
6. **CHỤP MÀN HÌNH** những dòng chữ màu đỏ trong Console
7. Gửi ảnh cho tôi

## Bước 2: Kiểm tra Network

1. Vẫn ở DevTools (F12)
2. Chọn tab **Network**
3. Thử đăng nhập lại
4. Tìm request có tên `login` hoặc `register`
5. Nhấn vào request đó
6. **CHỤP MÀN HÌNH** phần Response
7. Gửi ảnh cho tôi

## Bước 3: Test Backend

Mở link này trong trình duyệt mới:
```
https://successlinkv2-backend.onrender.com/api/health
```

Bạn thấy gì? Gửi cho tôi.

## Các lỗi thường gặp:

### ❌ Lỗi CORS
Console hiện: `CORS policy` hoặc `Access-Control-Allow-Origin`
→ Cần sửa backend

### ❌ Lỗi 404
Network tab hiện: `404 Not Found`
→ API endpoint sai

### ❌ Lỗi 500
Network tab hiện: `500 Internal Server Error`
→ Backend có bug

### ❌ Failed to fetch
Console hiện: `Failed to fetch` hoặc `Network Error`
→ Backend offline hoặc CORS

---

**Hãy gửi cho tôi screenshot của Console hoặc Network tab để tôi biết chính xác lỗi gì!**
