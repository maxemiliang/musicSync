FROM node:alpine
WORKDIR /app

copy package.json /app/package.json
RUN yarn install


COPY . .
CMD ["npm", "run", "start"]