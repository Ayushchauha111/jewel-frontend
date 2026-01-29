FROM node

WORKDIR /TYPOGRAM

COPY package*.json ./ 

RUN npm install

COPY . .

EXPOSE 3000

CMD npm start
