# ---------- Frontend Build ----------
FROM node:20 AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---------- Backend ----------
FROM node:20

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

COPY --from=frontend-build /app/dist ./public

EXPOSE 10000

CMD ["npm", "start"]
