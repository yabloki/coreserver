sleep 40;
git pull;
sudo docker build -t coreserver:latest  .;
sudo docker-compose down; sudo docker-compose up -d;
echo "coreserver started"
