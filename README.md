# CleanerIO-CDK

Welcome! This repo contains the backend AWS infrastructure and Lambda functions for Cleaner.io.

Cleaner.io is a quick and secure way for cleaners of public transport to verify when they last cleaned the train, tram, or bus and allows for total transparency and assurance for passengers.

Check out our project on [Devpost](https://devpost.com/software/cleaned), and also our [frontend app](https://github.com/timTam97/CleanerIO-Frontend).

## Infrastructure
Basically, it's a HTTP API backed by some Lambdas. These Lambda functions talk to a dynamoDB table which stores the cleaning logs.

<img src="https://raw.githubusercontent.com/timTam97/CleanerIO-CDK/master/diagram.png" width=50% height=50%>

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
  
