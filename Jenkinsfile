pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'ahlemman26125831'
        BACKEND_IMAGE = "backend-projectflow"
        FRONTEND_IMAGE = "frontend-projectflow"
    }

    stages {
        stage('Build Images') {
            steps {
                echo 'Construction des images Docker...'
                sh "docker build -t ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${BUILD_NUMBER} ./backend"
                sh "docker build -t ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${BUILD_NUMBER} ./frontend"
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                echo 'Analyse de sécurité avec Trivy...'
                sh "trivy image ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${BUILD_NUMBER}"
                sh "trivy image ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${BUILD_NUMBER}"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    // "docker-hub-credentials" est l'ID de vos identifiants créés dans Jenkins
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                        sh "echo $PASS | docker login -u $USER --password-stdin"
                        sh "docker push ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                    }
                }
            }
        }
    }
}