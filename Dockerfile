FROM node:alpine
WORKDIR /app

copy package.json /app/package.json
RUN npm install


COPY . ./app
CMD ["npm", "run", "start"]