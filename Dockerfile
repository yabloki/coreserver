FROM node:12
WORKDIR /usr/src/app
COPY coreserver/package*.json ./
RUN npm ci
COPY coreserver .
COPY ethereumContracts/build/contracts/SPRVault.json  .
EXPOSE 3000
CMD [ "node", "bin/www" ]