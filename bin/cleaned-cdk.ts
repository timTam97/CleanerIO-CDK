#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CleanedCdkStack } from "../lib/infrastructure/cleaned-cdk-stack";

const app = new cdk.App();
new CleanedCdkStack(app, "CleanedCdkStack");
