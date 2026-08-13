# Zoder

Marketplace đa gian hàng, vendor thụ động — shop chỉ được tạo và điều
hành bởi Admin, không có tài khoản vendor tự quản lý. Khách vãng lai
duyệt gian hàng/sản phẩm, thêm giỏ hàng, checkout COD (không tích hợp
thanh toán online ở bản MVP này).

**Live:** https://zoder.zeebee.io.vn

## Stack

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma 7](https://www.prisma.io) + PostgreSQL (driver adapter `@prisma/adapter-pg`)
- JWT tự host (`jose`) cho phiên đăng nhập Admin
- [Zustand](https://zustand.docs.pmnd.rs) (persist localStorage) cho giỏ hàng client-side

## Mô hình dữ liệu

```
Admin      — email, passwordHash
Category   — name, slug
Shop       — name, slug, description, logoUrl, categoryId
Product    — shopId, name, slug, description, price, imageUrl, stock
Order      — customerName, customerPhone, customerAddress, status, totalAmount
OrderItem  — orderId, productId, shopId, quantity, priceAtOrder
```

Một Order có thể gồm sản phẩm từ nhiều Shop khác nhau — `OrderItem`
denormalize `shopId` để tách theo shop khi Admin xử lý đơn.

## Trang

| Route | Mô tả |
|---|---|
| `/` | Trang chủ — category + shop nổi bật |
| `/shops/[slug]` | Trang shop — thông tin + danh sách sản phẩm |
| `/products/[slug]` | Chi tiết sản phẩm + thêm giỏ hàng |
| `/cart` | Giỏ hàng (client-side) |
| `/checkout` | Nhập thông tin khách → tạo Order |
| `/admin/login` | Đăng nhập Admin |
| `/admin` | Dashboard — quản lý Shop / Product / Order |

## API

```
GET    /api/shops                    danh sách shop (public)
GET    /api/products?shopId=         danh sách sản phẩm (public)
GET    /api/categories               danh sách category (public)
POST   /api/orders                   tạo order (checkout khách)

POST   /api/admin/auth               đăng nhập admin (set cookie JWT)
GET    /api/admin/auth               kiểm tra phiên hiện tại
DELETE /api/admin/auth               đăng xuất

GET    /api/admin/shops              PUT/DELETE /api/admin/shops/[id]
POST   /api/admin/shops
GET    /api/admin/products           PUT/DELETE /api/admin/products/[id]
POST   /api/admin/products
GET    /api/admin/orders             PUT /api/admin/orders/[id]  (cập nhật status)
```

Mọi route `/admin/*` và `/api/admin/*` (trừ `/api/admin/auth` và
`/admin/login`) được bảo vệ bởi `src/proxy.ts` — kiểm tra JWT trong
cookie `zoder_admin_session`.

## Chạy local (dev)

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Cần biến môi trường trong `.env` (không commit vào git):

```
DATABASE_URL="postgresql://user:pass@localhost:PORT/zoder_db"
JWT_SECRET="<random hex string>"
```

## Docker

```bash
docker compose up -d --build
```

`docker-compose.yml` dựng 2 service:

- `zos-postgres` — PostgreSQL 16, dữ liệu lưu tại `/mnt/data/ssd/zoder-pgdata`
- `zoder` — app Next.js, port `8101:3000`

Biến `POSTGRES_PASSWORD` và `JWT_SECRET` đọc từ `.env` cùng thư mục
(không commit). Khi container khởi động, `docker-entrypoint.sh` tự
chạy `prisma migrate deploy` + seed (idempotent, dùng `upsert`) trước
khi start server.

## Seed data mặc định

1 admin (`admin@zoder.local`) · 1 category (Thời trang) · 2 shop
(Shop Hoa Mai, Shop Nam Phong) · 4 sản phẩm. Mật khẩu admin seed nên
đổi trước khi dùng thật — không lưu trong repo, xem note bàn giao nội
bộ.

## Ghi chú hạ tầng

Deploy trên homelab (Docker network `homelab-net`), lộ ra ngoài qua
Cloudflare Tunnel (`zoder.zeebee.io.vn` → `localhost:8101`). Không
tích hợp cổng thanh toán — checkout chỉ ghi nhận đơn hàng (COD/thoả
thuận ngoài).
