**LINUX-VERSION :** Ubuntu 24.04.3 LTS
**LINUX-KERNAL :** Linux kernel 6.8.0-79-generic

### Init
Update: <br>
```apt update && apt upgrade -y```

Add user <br>
```adduser husted``` <br>
```usermod -aG sudo husted```


### SSH
I prefer to connect and develop via Ubuntu, so for my windows PC I use WSL. 

Generate ssh keys <br>
```ssh-keygen -t rsa```

Connect via <br>
```ssh -i ssh-server root@91.210.59.86```

### Github
Create public key <br>
```ssh-keygen -t ed25519 -C "Husted42 GitHub```

This key get's saved to /root/.ssh/id_ed25519, and can be viewed with ```cat ~/.ssh/id_ed25519.pub``` 

We can test the conneciton with: <br>
```ssh -T git@github.com```

Then it can be cloned with: <br>
```git clone git@github.com:Husted42/webserver-linux.git```


## Docker install
# Update package lists
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Add your user to docker group (avoid sudo each time)
sudo usermod -aG docker $USER

# Restart WSL or run:
sudo apt install util-linux-extra
newgrp docker

# Verify
docker --version
