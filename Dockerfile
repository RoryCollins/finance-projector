FROM node:latest

WORKDIR /finance-projector/

COPY /build /finance-projector/build
COPY package.json /finance-projector/package.json
COPY tsconfig.json /finance-projector/tsconfig.json

RUN npm install

CMD ["npm", "install -g serve"]
CMD ["serve", "-s build"]
