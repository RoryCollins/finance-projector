FROM node:latest

WORKDIR /finance-projector/

COPY /public /finance-projector/public
COPY /src /finance-projector/src
COPY package.json /finance-projector/package.json
COPY tsconfig.json /finance-projector/tsconfig.json

RUN npm install

CMD ["npm", "start"]
