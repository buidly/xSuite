#!/bin/sh

REPOSRC="git@github.com:multiversx/mx-chain-simulator-go.git"
REPOVERSION="v1.7.4"
LOCALREPO_VC_DIR="mx-chain-simulator-go/.git"

if [ ! -d $LOCALREPO_VC_DIR ]
then
    git clone $REPOSRC
    cd mx-chain-simulator-go
    git checkout $REPOVERSION
    cd ..
else
    cd mx-chain-simulator-go
    git fetch --all
    git checkout $REPOVERSION
    git pull $REPOSRC
    cd ..
fi

cd mx-chain-simulator-go/cmd/chainsimulator

if [ "$PLATFORM" = "darwin" ]; then
  echo 'Building darwin binary...'
  export GOOS=darwin GOARCH=amd64
  go install
  go build -o ../../../bin/csproxy-darwin-amd64 -ldflags "-extldflags '-Wl,-rpath,@loader_path'"
else
  echo 'Building linux binary...'
  export GOOS=linux GOARCH=amd64
  go install
  go build -o ../../../bin/csproxy-linux-amd64 -ldflags "-extldflags '-Wl,-rpath,\$ORIGIN'"
fi

echo 'Binary built!'
