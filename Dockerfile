FROM node:alpine
copy package.json package.json
RUN npm install

WORKDIR /app

COPY . ./app
CMD ["npm", "run", "start"]