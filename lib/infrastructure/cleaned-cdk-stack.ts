import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw_integrations from "@aws-cdk/aws-apigatewayv2-integrations";

export class CleanedCdkStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
        super(app, id);

        const api = new apigw.HttpApi(this, "CleanedHTTPApi");

        const ingressFunction = new lambda.Function(this, "IngressFunction", {
            code: new lambda.AssetCode("lib/src/ingress"),
            handler: "app.handler",
            runtime: lambda.Runtime.PYTHON_3_8,
        });

        const viewLogsFunction = new lambda.Function(this, "ViewLogsFunction", {
            code: new lambda.AssetCode("lib/src/viewlogs"),
            handler: "app.handler",
            runtime: lambda.Runtime.PYTHON_3_8,
        });

        api.addRoutes({
            integration: new apigw_integrations.LambdaProxyIntegration({
                handler: ingressFunction,
                payloadFormatVersion: apigw.PayloadFormatVersion.VERSION_2_0,
            }),
            path: "/add",
            methods: [apigw.HttpMethod.POST],
        });

        api.addRoutes({
            integration: new apigw_integrations.LambdaProxyIntegration({
                handler: viewLogsFunction,
                payloadFormatVersion: apigw.PayloadFormatVersion.VERSION_2_0,
            }),
            path: "/view",
            methods: [apigw.HttpMethod.GET],
        });

        // The code that defines your stack goes here
    }
}

const app = new cdk.App();
new CleanedCdkStack(app, "CleanedCdkStack");
app.synth();