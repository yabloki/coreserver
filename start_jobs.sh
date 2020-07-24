sudo docker build -t coreserver:latest  .;
sudo docker-compose down;
sudo docker-compose -f docker-compose-jobs.yml down; sudo docker-compose -f docker-compose-jobs.yml up -d;
