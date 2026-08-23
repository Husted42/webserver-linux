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
```ssh -i ssh-server husted42.dk@ssh.simply.com```

### Github
Create public key <br>
```ssh-keygen -t ed25519 -C "Husted42 GitHub```

This key get's saved to /var/www/husted42.dk/.ssh/id_ed25519.pub, and can be viewed with ```cat ~/.ssh/id_ed25519.pub``` 

We can test the conneciton with: <br>
```ssh -T git@github.com```

Then it can be cloned with: <br>
```git clone git@github.com:Husted42/webserver-linux.git```
