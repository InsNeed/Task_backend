FROM node:20


WORKDIR /app/

COPY . .

COPY package*.json ./

RUN npm install


EXPOSE 8000

# CMD ["nodemon", "src/index.ts"]
CMD ["npm", "run","dev"]