pipeline {
    agent any

    parameters {
        choice(
            name: 'TEST_TYPE',
            choices: ['smoke', 'load', 'stress', 'spike'],
            description: 'Type of load test to run'
        )
        string(
            name: 'VIRTUAL_USERS',
            defaultValue: '10',
            description: 'Number of virtual users'
        )
        string(
            name: 'DURATION',
            defaultValue: '30s',
            description: 'Test duration (e.g., 30s, 1m, 5m)'
        )
        string(
            name: 'BASE_URL',
            defaultValue: 'https://indodax.com',
            description: 'Target base URL'
        )
    }

    environment {
        REPORTS_DIR = 'reports'
        HTML_REPORT = 'k6-report.html'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out load testing code..."
                checkout scm
            }
        }

        stage('Setup K6') {
            steps {
                echo "Checking K6 installation..."
                sh '''
                    if ! command -v k6 &> /dev/null; then
                        echo "K6 not found. Installing..."
                        brew install k6
                    else
                        echo "K6 already installed"
                        k6 version
                    fi
                '''
            }
        }

        stage('Run Load Test') {
            steps {
                script {
                    def testType = params.TEST_TYPE
                    def vus = params.VIRTUAL_USERS
                    def duration = params.DURATION
                    def baseUrl = params.BASE_URL

                    echo "Running ${testType} test"
                    echo "VUs: ${vus}, Duration: ${duration}"
                    echo "Target: ${baseUrl}"

                    dir('load-testing-k6') {
                        sh """
                            chmod +x run_load_test.sh
                            ./run_load_test.sh ${testType} ${vus} ${duration} || true
                        """
                    }
                }
            }
        }

        stage('Publish Report') {
            steps {
                echo "Publishing K6 HTML report..."
                dir('load-testing-k6') {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'reports',
                        reportFiles: 'k6-report.html',
                        reportName: 'K6 Load Test Report',
                        reportTitles: 'K6 Performance Report'
                    ])
                }
            }
        }

        stage('Archive Results') {
            steps {
                echo "Archiving test results..."
                dir('load-testing-k6') {
                    archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            echo "Load test execution completed"
        }
        success {
            echo "Load test passed successfully!"
        }
        failure {
            echo "Load test failed. Check the report for details."
        }
    }
}
