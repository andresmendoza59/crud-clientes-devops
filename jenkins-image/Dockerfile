FROM jenkins/jenkins:2.568.3-jdk21

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        python3-venv \
        python3-pip \
        docker-cli \
        unzip \
        git \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install SonarScanner
RUN mkdir -p /opt/sonar-scanner && \
    curl -fsSL https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip -o /tmp/sonar-scanner.zip && \
    unzip -q /tmp/sonar-scanner.zip -d /opt && \
    mv /opt/sonar-scanner-5.0.1.3006-linux/* /opt/sonar-scanner && \
    rm -rf /opt/sonar-scanner-5.0.1.3006-linux /tmp/sonar-scanner.zip && \
    chmod +x /opt/sonar-scanner/bin/sonar-scanner
 
# Create symlink for Jenkins tool discovery
RUN mkdir -p /var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner && \
    ln -s /opt/sonar-scanner /var/jenkins_home/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner/sonar-scanner
 
# Set SONAR_HOME environment variable
ENV SONAR_HOME=/opt/sonar-scanner
ENV PATH=$PATH:$SONAR_HOME/bin

USER jenkins
