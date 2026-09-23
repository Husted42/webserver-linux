
# Running the server
To run everything satrt all containser in docker with: <br>

Need root to access docker.scok <br>
```sudo docker compose up --build```

However to get live update when developing we can just use <br>
```npm run dev``` <br>
Otherwise we need to build the contatiner each time.

# Docker commands
List contatiners <br>
```docker compose ps```

View logs <br>
```docker comose logs {{SERVICE}}```

Accsess the postgresql database<br>
```docker exec -it webserver-postgres psql -U postgres -d {{database_name}}```

Remove containers and rebuild<br>
```bash
docker compose down -v
docker compose up --build
```


# Establish connection
### SSH
Login to server <br>
```ssh -i ssh-server root@91.210.59.86```
```exit```


Move files to server
```scp /path/to/local/file root@91.210.59.86:/path/on/remote/server/```

### Postgresql
We can open up a new terminal and connect to the postgresql database from there.
```
docker compose exec postgres psql -U postgres -d beerdb
```

# Common erros:
google.auth.exceptions.RefreshError: ('invalid_grant: Token has been expired or revoked.', {'error': 'invalid_grant', 'error_description': 'Token has been expired or revoked.'})

Just refresh the token by: (Note we have to delete the old token)
```
python cron/jobs/google_auth.py
```

Then copy the new token to the server and restart the cron container: <br>
```bash
scp -i ssh-server credentials/token.json root@91.210.59.86:~/github/webserver-linux/backend/credentials/token.json
```

