# Innate — Landing page

Trang giới thiệu Innate, tách riêng khỏi bản demo (thư mục `web/` trong repo Innate_Odylytics). Vite + React + TypeScript, build ra site tĩnh.
Mọi nút "Mở demo", "Xem tình huống", "Tự thử trên ví demo", "Bảng vận hành" trỏ sang site demo (`VITE_DEMO_URL`).

## Chạy

```bash
cd Innate_Landing
npm install
npm run dev        # http://localhost:5175 (demo web/ chạy ở 5173)
npm run build      # site tĩnh trong dist/
```

## Deploy (cho người phụ trách deploy)

Site tĩnh, host nào cũng được (Vercel, Netlify, GitHub Pages...). Không cần rewrite vì chỉ dùng hash route.

| Cài đặt | Giá trị |
|---|---|
| Thư mục gốc | gốc repo |
| Lệnh build | `npm run build` |
| Thư mục output | `dist` |
| `VITE_DEMO_URL` | URL site demo (`web/`) đã deploy, **bắt buộc**; mặc định `http://localhost:5173` chỉ dùng khi chạy máy |
| `VITE_API_URL` | URL API Innate (mặc định `https://nhip-api-taupe.vercel.app`), dùng cho link Swagger/OpenAPI/health ở footer |

Biến `VITE_*` được gắn vào lúc build: đổi giá trị thì phải build lại.
