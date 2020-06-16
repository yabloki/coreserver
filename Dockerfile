FROM node:12
# TODO keccak compilation fail
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY coreserver .
RUN curl https://storage.googleapis.com/ethereumc/CNTToken.json > CNTToken.json
RUN curl https://storage.googleapis.com/ethereumc/CNTVault.json > CNTVault.json
EXPOSE 3000
CMD [ "node", "bin/www" ]