#!/bin/sh
sudo cp kaptajn-srv.service /etc/systemd/system/
sudo chmod u+rw /etc/systemd/system/kaptajn-srv.service

sudo systemctl enable kaptajn-srv

# Start the service
#sudo systemctl start kaptajn-srv

# Stop the service
#sudo systemctl stop kaptajn-srv