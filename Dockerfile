FROM node:alpine
copy package.json package.json
RUN npm install

COPY . .
CMD ["npm", "run", "start"]