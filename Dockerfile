# ---------- Angular build ----------
FROM node:22-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ---------- Spring Boot build ----------
FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /app

COPY backend/ ./backend/
COPY --from=frontend-build /frontend/dist/carfixhub/browser/ ./backend/src/main/resources/static/

RUN mvn -f backend/pom.xml clean package -DskipTests

# ---------- Runtime ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=backend-build /app/backend/target/carfixhub.jar /app/carfixhub.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/carfixhub.jar"]
