# cvs-tsk-edh-dispatcher-inbound
Handles incoming update requests from EDH and calls the actual services for update

### Git Hooks

Git Hooks should be automatically set up by Husky. 
In case there's any issue with Husky, please set up the following prepush git hook in .git/hooks/pre-push
```
#!/bin/sh
npm run prepush
```
and in .git/hooks/pre-commit
```
#!/bin/sh
npm run prepush && npm run security-checks
```

#### Security

Please install and run the following securiy programs as part of your testing process:

https://github.com/awslabs/git-secrets

- After installing, do a one-time set up with `git secrets --register-aws`. Run with `git secrets --scan`.

https://github.com/UKHomeOffice/repo-security-scanner

- After installing, run with `git log -p | scanrepo`.

These will be run as part of prepush so please make sure you set up the git hook above so you don't accidentally introduce any new security vulnerabilities.

### Testing
In order to test, you need to run the following:
- `npm run test` for unit tests
- `npm run test-i` for integration tests

### SonarQube
In order to generate SonarQube reports on local, follow the steps:
- Download SonarQube server -> https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-7.6.zip
- Download SonarQube scanner -> https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.3.0.1492-macosx.zip
- Add sonar-scanner in environment variables -> In .brash_profile add the line "export PATH=<PATH_TO_SONAR_SCANNER>/sonar-scanner-3.3.0.1492-macosx/bin:$PATH"
- Start the SonarQube server -> cd <PATH_TO_SONARQUBE_SERVER>/bin/macosx-universal-64 ./sonar.sh start
- In the microservice folder run the command -> npm run sonar-scanner

### Environmental variables

- The `BRANCH` environment variable indicates in which environment is this application running. Not setting this variable will result in defaulting to `local`.
- The `DEBUG` environment variable is used as a feature flag, to enable more extensive logging. Does more logging if value is `TRUE`, otherwise off
- The `VALIDATION` environment variable is used as a feature flag, to enable validation. Does validation if value is `TRUE`, otherwise off
 
