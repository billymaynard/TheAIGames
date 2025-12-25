FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production || (echo "If npm install fails, ensure registry access." && exit 1)

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
