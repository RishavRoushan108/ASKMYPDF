```
chmod 400 "ASK_MYPDF.pem"
ssh -i "ASK_MYPDF.pem" ubuntu@ec2-13-53-134-254.eu-north-1.compute.amazonaws.com

sudo apt-get update

GO TO THIS LINK TO INTALL DOCKER -->
https://docs.docker.com/engine/install/ubuntu/

CLONE THE PROJECT -->
ubuntu@ip-172-31-34-133:~$ git clone https://github.com/RishavRoushan108/ASKMYPDF.git

UPDATE THE .env FILE ACCORDING TO IPV4 ADRESS ->
nano .env.local in client->

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=#############
CLERK_SECRET_KEY=##################
NEXT_PUBLIC_BASE_URL=http://13.53.134.254:8000

     nano .env in server-> add the

GEMINI_API_KEY=#############
REDIS_HOST=valkey
QDRANT_URL=http://qdrant:6333
VALKEY_URL=redis://valkey:6379
FRONTEND_URL=http://13.53.134.254:3000

THIS IS BECAUSE OF LOW RAM
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

IN SECURITY TAB
Type,Port,Source,Why?
Custom TCP,3000,0.0.0.0/0,This allows you to see the Frontend.
Custom TCP,8000,0.0.0.0/0,This allows the Frontend to talk to the API.
SSH,22,My IP,(Optional but safer) Limits terminal access only to your computer.

sudo docker compose up -d --build
```
