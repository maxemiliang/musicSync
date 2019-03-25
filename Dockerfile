FROM node:alpine
WORKDIR /app

copy package.json /app/package.json
RUN npm install


COPY . .
COPY CHECKS /app/CHECKS
CMD ["npm", "run", "start"]