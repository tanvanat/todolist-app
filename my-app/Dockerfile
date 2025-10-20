# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
# native deps สำหรับแพ็กเกจอย่าง sharp/bcrypt ฯลฯ
RUN apk add --no-cache libc6-compat python3 make g++
COPY package*.json ./
# ถ้ามี lock ใช้ npm ci; ถ้าไม่มีใช้ npm install
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# กันเคสไม่มีโฟลเดอร์ public
RUN mkdir -p public
# ต้องตั้งค่าใน next.config.js: module.exports = { output: 'standalone' }
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# เฉพาะไฟล์ที่จำเป็น
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD ["node", "server.js"]
