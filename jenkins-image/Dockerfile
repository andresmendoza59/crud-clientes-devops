FROM jenkins/jenkins:2.568.3-jdk21

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-venv \
        python3-pip \
        docker-cli \
        git \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

USER jenkins