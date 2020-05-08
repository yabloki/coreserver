FROM node:12
# TODO keccak compilation fail
WORKDIR /usr/src/app
COPY coreserver/package*.json ./
RUN npm ci
COPY coreserver .
COPY ethereumContracts/build/contracts/CNTVault.json  .
COPY ethereumContracts/build/contracts/CNTToken.json  .
EXPOSE 3000
CMD [ "node", "bin/www" ]