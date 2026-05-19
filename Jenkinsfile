pipeline{
    agent any
    stages{

        stage('DEV'){
            when {expression { env.BRANCH_NAME ==~ /^(dev|develop|hotfix|bugfix|feature)(.*)?/ }}

            stages{
                 stage('Preparing'){
                    steps{
                        sh "find deploy/ -type f -exec dos2unix {} +"
                    }
                }               
                 stage('Build'){
                    steps{
                        sh "bash -v deploy/common/build.sh dev"
                    }
                }
                 stage('Deploy'){
                    steps{
                        sh "bash -v deploy/dev/deploy.sh dev"
                    }
                }
            }
        }

        stage('PROD'){
            when {expression { env.BRANCH_NAME ==~ /^(master)(.*)?/ }}

            stages{
                 stage('Preparing'){
                    steps{
                        sh "find deploy/ -type f -exec dos2unix {} +"
                    }
                }    
                 stage('Build'){
                    steps{
                        sh "bash -v deploy/common/build.sh prod"
                    }
                }

                stage('Deploying Production'){
                    steps{
                        sh "bash -v deploy/prod/deploy.sh prod"
                    }
                }
            }
        }
    }
    post {
        always {
           echo 'Deleting Directory!'
           deleteDir()
         }
   }
}