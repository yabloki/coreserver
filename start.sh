cd coreserver;
git pull;
sudo docker build -t coreserver:latest  .;
sudo docker-compose down;docker-compose up -d;