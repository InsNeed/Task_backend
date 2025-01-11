import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';
dotenv.config(); 

export default defineConfig({
    dialect: "postgresql",//数据类型
    schema: "./db/schema.ts",//模式的路径
    out: "./drizzle",//迁移文件输出位置
    dbCredentials: {//数据库连接凭证
        host: "localhost",//连接容器内部的！
        port: 5432,
        database: process.env.POSTGRES_DB as string,
        user: process.env.POSTGRES_USER as string,
        password: process.env.POSTGRES_PASSWORD as string,
        ssl: false//debug ONLY!  FOR HTTPS
    }
})