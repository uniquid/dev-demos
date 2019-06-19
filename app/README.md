# App for dev-demos

#### System requirements:

- Node 8 (not higher) (+ npm)
- make
- cmake
- g++

#### Install Deps

```
cd $REPOROOT/app/server
npm install
```


#### Download and install latest Litecoin testnet headers Database

```
cd $REPOROOT/app/server
npx ltc-backup install testnet -t nodeHome
```

For detailed info about this operation [checkout this](https://github.com/uniquid/uidcore-js#ltc-backup-cli-tool)

#### environmental variables
```
export AWS_AGENT_CONFIG=$(cat configfile_from_cli.json)
```
or

```
export AWS_AGENT_CONFIG='
{
  "orgId": "...",
  "mqttUrl": "tcp://...:1883",
  "mqttTopic": "...",
  "registryUrl": "http://...:...",
  "awsAuthorizerName": "...",
  "awsPrivateKey": [
    "-----BEGIN RSA PRIVATE KEY-----",
    "...",
    "...",
    "...",
    "-----END RSA PRIVATE KEY-----"
  ],
  "awsTokenKey": "...",
  "awsAgentName": "...",
  "awsEndpointAddress": "...",
  "network": "..."
}
'
```

#### Quickstart

```
cd $REPOROOT/app/server
npm start
```

open your browser on `http://localhost:3000`<br>
You need to deploy a contract between the **device** (provider) and the **app** (user) with thefollowing functions enabled:
- 34 set led status
- 35 read LED status

For each node contract, check led status polling and test toggle-led function

#### App Config

You may want to tweak application and UIDNode configs editing `$REPOROOT/app/server/config.js`

#### Note:
this uidnode app currently points to uidcorejs#v0.1.6