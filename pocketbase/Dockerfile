FROM alpine:latest

ARG PB_VERSION=0.22.20

RUN apk add --no-cache \
    unzip \
    wget \
    ca-certificates

# Download PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip \
    && mv pocketbase /pb/pocketbase

VOLUME /pb/pb_data

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
