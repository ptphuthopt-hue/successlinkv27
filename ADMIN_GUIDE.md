# 🔐 HƯỚNG DẪN QUẢN TRỊ HỆ THỐNG SUCCESSLINK

## 📋 MỤC LỤC
1. [Tạo tài khoản Admin đầu tiên](#tạo-tài-khoản-admin)
2. [Truy cập Admin Dashboard](#truy-cập-admin-dashboard)
3. [Thêm API Key của các AI Model](#thêm-api-key-ai)
4. [Quản lý người dùng](#quản-lý-người-dùng)
5. [Nâng cấp user lên Pro](#nâng-cấp-user-pro)

---

## 1️⃣ TẠO TÀI KHOẢN ADMIN ĐẦU TIÊN

### Cách 1: Sử dụng SQL trực tiếp (Khuyên dùng cho lần đầu)

Vì backend đang dùng **In-Memory Database** trên Render, bạn cần tạo admin mỗi khi server khởi động lại.

**Bước 1: Đăng ký tài khoản bình thường**
1. Vào https://successlinkv26.vercel.app/
2. Đăng ký tài khoản với email của bạn (ví dụ: `admin@successlink.com`)
3. Hoàn thành onboarding

**Bước 2: Nâng cấp lên Admin qua Backend**

Vì database là in-memory, cách tốt nhất là **thêm code tự động tạo admin** khi server khởi động.

Tôi sẽ tạo file script để làm điều này.

### Cách 2: Tự động tạo Admin khi server khởi động (Khuyên dùng)

Thêm đoạn code sau vào `backend/server.js`:

```javascript
// Seed admin user on startup (for in-memory database)
const seedAdminUser = async () => {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@successlink.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    
    try {
        const existingAdmin = await User.findByEmail(adminEmail);
        if (!existingAdmin) {
            const userId = await User.create({
                email: adminEmail,
                password: adminPassword,
                name: 'System Admin',
                role: 'admin',
                teaching_level: 'middle',
                subject: 'toan'
            });
            console.log('✅ Admin user created:', adminEmail);
        } else {
            console.log('ℹ️  Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};

// Call after database initialization
setTimeout(seedAdminUser, 2000);
```

**Thêm vào Render Environment Variables:**
- `ADMIN_EMAIL`: `admin@successlink.com`
- `ADMIN_PASSWORD`: `YourSecurePassword123!`

---

## 2️⃣ TRUY CẬP ADMIN DASHBOARD

### URL Admin Dashboard
```
https://successlinkv26.vercel.app/admin.html
```

### Đăng nhập
1. Vào URL trên
2. Đăng nhập bằng tài khoản admin (email/password đã tạo ở bước 1)
3. Hệ thống sẽ kiểm tra role, nếu không phải admin sẽ bị từ chối

---

## 3️⃣ THÊM API KEY CỦA CÁC AI MODEL

### Các AI Provider được hỗ trợ:
- **Google Gemini** (Miễn phí, khuyên dùng)
- **OpenRouter** (Trả phí, nhiều model)
- **OpenAI ChatGPT** (Trả phí, GPT-4)
- **Anthropic Claude** (Trả phí, Claude 3)

### Hướng dẫn thêm AI Provider:

**Bước 1: Vào Admin Dashboard**
- Truy cập: https://successlinkv26.vercel.app/admin.html
- Đăng nhập với tài khoản admin

**Bước 2: Chọn tab "AI Providers"**
- Click vào menu bên trái: **AI Providers**

**Bước 3: Nhấn "Add Provider"**
- Click nút **"+ Add Provider"** ở góc trên bên phải

**Bước 4: Điền thông tin**

#### Ví dụ: Thêm Google Gemini (Miễn phí)

1. **Provider Type**: Chọn `gemini`
2. **Display Name**: `Google Gemini Pro`
3. **API Key**: Lấy từ https://makersuite.google.com/app/apikey
4. **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
5. **Model**: `gemini-pro`
6. **Priority**: `5` (càng cao càng ưu tiên)
7. **Rate Limit**: `60` (requests/phút)
8. **Cost per 1K tokens**: `0` (miễn phí)

#### Ví dụ: Thêm OpenAI GPT-4

1. **Provider Type**: Chọn `chatgpt`
2. **Display Name**: `OpenAI GPT-4`
3. **API Key**: Lấy từ https://platform.openai.com/api-keys
4. **Endpoint**: `https://api.openai.com/v1/chat/completions`
5. **Model**: `gpt-4`
6. **Priority**: `3`
7. **Rate Limit**: `60`
8. **Cost per 1K tokens**: `0.03`

**Bước 5: Lưu và Test**
- Nhấn **"Save"**
- Nhấn nút **"Test"** để kiểm tra kết nối
- Nếu thành công, sẽ hiện ✅ "Connection successful!"

---

## 4️⃣ QUẢN LÝ NGƯỜI DÙNG

### Xem danh sách Users
1. Vào Admin Dashboard
2. Chọn tab **"Users"**
3. Bạn sẽ thấy:
   - Email
   - Tên
   - Cấp học
   - Môn học
   - Role (teacher/admin)
   - Số bài giảng đã tạo
   - Ngày đăng ký

### Tìm kiếm User
- Dùng ô **Search** ở trên cùng
- Gõ email hoặc tên để tìm

### Phân trang
- Dùng nút **Previous/Next** ở dưới cùng
- Mỗi trang hiển thị 20 users

---

## 5️⃣ NÂNG CẤP USER LÊN PRO

> ⚠️ **Lưu ý**: Hiện tại hệ thống chưa có tính năng "Pro" được code sẵn. 
> Bạn cần thêm cột `subscription_tier` vào database và logic kiểm tra.

### Cách thêm tính năng Pro (Hướng dẫn nhanh):

**1. Thêm cột vào Database:**

Sửa file `backend/config/database.js`, thêm cột `subscription_tier`:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    teaching_level TEXT,
    subject TEXT,
    role TEXT DEFAULT 'teacher',
    subscription_tier TEXT DEFAULT 'free',  -- ← THÊM DÒNG NÀY
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**2. Thêm API endpoint nâng cấp:**

Tạo file `backend/routes/subscription.js`:

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const adminAuth = require('../middleware/admin-auth');

// Upgrade user to Pro
router.put('/users/:userId/upgrade', adminAuth, async (req, res) => {
    const { userId } = req.params;
    const { tier } = req.body; // 'free', 'pro', 'premium'
    
    db.run(
        'UPDATE users SET subscription_tier = ? WHERE id = ?',
        [tier, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to upgrade user' 
                });
            }
            
            res.json({ 
                success: true, 
                message: `User upgraded to ${tier}` 
            });
        }
    );
});

module.exports = router;
```

**3. Mount route trong `server.js`:**

```javascript
const subscriptionRoutes = require('./routes/subscription');
app.use('/api/subscription', subscriptionRoutes);
```

**4. Thêm nút "Upgrade to Pro" trong Admin Dashboard:**

Sửa file `js/admin.js`, thêm nút trong bảng users:

```javascript
<button class="btn-sm btn-success" 
        onclick="AdminDashboard.upgradeUser(${user.id}, 'pro')">
    Upgrade to Pro
</button>
```

Và thêm function:

```javascript
async upgradeUser(userId, tier) {
    if (!confirm(`Upgrade user to ${tier}?`)) return;
    
    try {
        await this.apiCall(`/subscription/users/${userId}/upgrade`, {
            method: 'PUT',
            body: JSON.stringify({ tier })
        });
        
        alert('User upgraded successfully!');
        this.loadUsers();
    } catch (error) {
        alert('Failed to upgrade user: ' + error.message);
    }
}
```

**5. Kiểm tra subscription khi tạo bài giảng:**

Trong `backend/routes/ai.js`, thêm check:

```javascript
router.post('/generate', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    
    // Check subscription
    if (user.subscription_tier === 'free') {
        // Giới hạn 5 bài/tháng cho free user
        const lessonCount = await Lesson.countByUser(req.user.id);
        if (lessonCount >= 5) {
            return res.status(403).json({
                success: false,
                message: 'Free tier limit reached. Please upgrade to Pro.'
            });
        }
    }
    
    // Continue with AI generation...
});
```

---

## 📊 DASHBOARD ANALYTICS

Admin Dashboard hiển thị:

### Tổng quan (Dashboard tab)
- 📊 **Tổng số users**
- 📈 **Users mới tuần này**
- 📚 **Tổng số bài giảng**
- 🆕 **Bài giảng mới tuần này**
- 🤖 **Số lượng AI requests**
- 💰 **Tổng chi phí AI**

### Biểu đồ
- **Usage Trend**: Xu hướng sử dụng theo ngày
- **Provider Distribution**: Phân bố requests theo AI provider
- **Cost by Provider**: Chi phí theo từng provider

### Users gần đây
- 5 users đăng ký gần nhất
- Thông tin: Tên, Email, Số bài giảng, Role

---

## 🔒 BẢO MẬT

### Khuyến nghị:
1. **Đổi mật khẩu admin mặc định** ngay sau khi deploy
2. **Không share API keys** của AI providers
3. **Sử dụng Environment Variables** cho mọi thông tin nhạy cảm
4. **Bật HTTPS** (Vercel và Render đã tự động bật)
5. **Giới hạn rate limit** để tránh abuse

### Environment Variables quan trọng:
```
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-encryption-key-for-api-keys
ADMIN_EMAIL=admin@successlink.com
ADMIN_PASSWORD=YourSecurePassword123!
```

---

## 🆘 TROUBLESHOOTING

### Không vào được Admin Dashboard?
- ✅ Kiểm tra đã đăng nhập với tài khoản có `role = 'admin'`
- ✅ Xóa cache trình duyệt (`Ctrl + Shift + R`)
- ✅ Kiểm tra Console (F12) xem có lỗi gì

### AI Provider không hoạt động?
- ✅ Test connection bằng nút "Test"
- ✅ Kiểm tra API key còn hạn không
- ✅ Kiểm tra rate limit
- ✅ Xem logs trên Render

### Database bị reset?
- ⚠️ **In-Memory Database** sẽ mất data khi server restart
- 💡 **Giải pháp**: Nâng cấp lên PostgreSQL (miễn phí trên Render)
- 📝 Hoặc thêm script seed admin tự động khi khởi động

---

## 📞 HỖ TRỢ

Nếu cần hỗ trợ thêm, hãy liên hệ với developer hoặc tham khảo:
- 📖 [Backend API Documentation](./backend/README.md)
- 🎨 [Frontend Documentation](./README.md)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)

---

**Chúc bạn quản trị hệ thống thành công! 🚀**
