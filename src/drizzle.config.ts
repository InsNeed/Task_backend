import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv';
const result = dotenv.config({ path: '../.env' });

if (result.error) {
  console.error("Failed to load .env file:", result.error);
}


export default defineConfig({
    dialect: "postgresql", // 数据类型
    schema: "./db/schema.ts", // 模式的路径
    out: "./drizzle", // 迁移文件输出位置
    dbCredentials: { // 数据库连接凭证
        host: "localhost", // 连接容器内部的！
        port: 5432,
        database: process.env.DB_NAME as string,
        user: process.env.DB_USER as string,
        password: process.env.DB_PASSWORD as string,
        ssl: false // debug ONLY! FOR HTTPS
    }
});