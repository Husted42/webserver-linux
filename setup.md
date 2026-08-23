````markdown
# Server Setup

**Linux version:** Ubuntu 24.04.3 LTS  
**Kernel:** 6.8.0-79-generic  

## Initial Setup

Update packages:

```bash
apt update && apt upgrade -y
````

Create a user:

```bash
adduser husted
```

Give the user sudo access:

```bash
usermod -aG sudo husted
```

## SSH

Generate an SSH key:

```bash
ssh-keygen -t rsa
```

Connect to the server:

```bash
ssh -i ssh-server root@91.210.59.86
```

## GitHub

Generate a GitHub SSH key:

```bash
ssh-keygen -t ed25519 -C "Husted42 GitHub"
```

View the public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Test the GitHub connection:

```bash
ssh -T git@github.com
```

Clone the repository:

```bash
git clone git@github.com:Husted42/webserver-linux.git
```

## Docker

Update packages:

```bash
sudo apt update
```

Install Docker:

```bash
sudo apt install -y docker.io
```

Add your user to the Docker group:

```bash
sudo usermod -aG docker $USER
```

Apply the new group:

```bash
newgrp docker
```

Verify Docker:

```bash
docker --version
```

Verify Docker Compose:

```bash
docker compose version
```

```
```
