git pull;
sudo docker build -t coreserver:latest  .;
sudo docker-compose down; sudo docker-compose up -d;
sleep 40;
echo "coreserver started"