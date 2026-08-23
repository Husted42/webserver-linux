````markdown
# Server Setup
**Linux version:** Ubuntu 24.04.3 LTS  
**Kernel:** 6.8.0-79-generic  

## Initial Setup
Update packages: <br>
```bash
apt update && apt upgrade -y
````

Create a user: <br>
```bash
adduser husted
```

Give the user sudo access: <br>
```bash
usermod -aG sudo husted
```

## SSH
Generate an SSH key: <br>
```bash
ssh-keygen -t rsa
```

Connect to the server: <br>
```bash
ssh -i ssh-server root@91.210.59.86
```

## GitHub
Generate a GitHub SSH key: <br>
```bash
ssh-keygen -t ed25519 -C "Husted42 GitHub"
```

View the public key: <br>
```bash
cat ~/.ssh/id_ed25519.pub
```

Test the GitHub connection: <br>
```bash
ssh -T git@github.com
```

Clone the repository: <br>
```bash
git clone git@github.com:Husted42/webserver-linux.git
```

## Docker
Update packages: <br>
```bash
sudo apt update
```

Install Docker: <br>
```bash
sudo apt install -y docker.io
```

Add your user to the Docker group: <br>
```bash
sudo usermod -aG docker $USER
```

Apply the new group: <br>
```bash
newgrp docker
```

Verify Docker: <br>
```bash
docker --version
```

Verify Docker Compose: <br>
```bash
docker compose version
```
