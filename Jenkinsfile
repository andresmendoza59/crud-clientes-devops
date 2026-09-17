pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        SONAR_PROJECT_KEY = 'crud-clientes-devops'
        SONAR_PROJECT_NAME = 'CRUD Clientes DevOps'
        VENV_DIR = '.venv'
        IMAGE_NAME = 'crud-clientes-api'
        CONTAINER_NAME = 'crud-clientes-api-container'
    }

    stages {
        stage('Verify Environment') {
            steps {
                sh '''
                    set -e
                    python3 --version
                    docker --version
                    java -version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -e
                    python3 -m venv --clear "$VENV_DIR"
                    . "$VENV_DIR/bin/activate"
                    python -m pip install --upgrade pip
                    python -m pip install -r requirements.txt
                '''
            }
        }

        stage('Run Tests with Coverage') {
            steps {
                sh '''
                    set -e
                    . "$VENV_DIR/bin/activate"
                    python -m pytest \
                        --junitxml=test-results.xml
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool(
                        name: 'SonarScanner',
                        type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    )

                    withSonarQubeEnv('SonarQube') {
                        sh """
                            set -e
                            . "${env.VENV_DIR}/bin/activate"

                            "${scannerHome}/bin/sonar-scanner" \
                                -Dsonar.projectKey="${env.SONAR_PROJECT_KEY}" \
                                -Dsonar.projectName="${env.SONAR_PROJECT_NAME}" \
                                -Dsonar.sources=src \
                                -Dsonar.tests=tests \
                                -Dsonar.python.version=3.13 \
                                -Dsonar.python.coverage.reportPaths=coverage.xml \
                                -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -e
                    docker build \
                        --pull \
                        -t "$IMAGE_NAME:$BUILD_NUMBER" \
                        -t "$IMAGE_NAME:latest" \
                        .
                '''
            }
        }

        stage('Deploy API') {
            steps {
                sh '''
                    set -e

                    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

                    docker run -d \
                        --name "$CONTAINER_NAME" \
                        --restart unless-stopped \
                        -p 8000:8000 \
                        "$IMAGE_NAME:$BUILD_NUMBER"
                '''
            }
        }

        stage('Verify Container Health') {
            steps {
                sh '''
                    set -e

                    for attempt in $(seq 1 12); do
                        HEALTH_STATUS=$(docker inspect \
                            --format='{{.State.Health.Status}}' \
                            "$CONTAINER_NAME" 2>/dev/null || true)

                        echo "Estado del contenedor: $HEALTH_STATUS"

                        if [ "$HEALTH_STATUS" = "healthy" ]; then
                            exit 0
                        fi

                        if [ "$HEALTH_STATUS" = "unhealthy" ]; then
                            docker logs "$CONTAINER_NAME"
                            exit 1
                        fi

                        sleep 5
                    done

                    docker logs "$CONTAINER_NAME"
                    echo "El contenedor no alcanzo el estado healthy."
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            junit(
                testResults: 'test-results.xml',
                allowEmptyResults: true
            )

            archiveArtifacts(
                artifacts: 'coverage.xml,test-results.xml',
                fingerprint: true,
                allowEmptyArchive: true
            )
        }

        failure {
            sh '''
                docker logs "$CONTAINER_NAME" 2>/dev/null || true
            '''
        }
    }
}