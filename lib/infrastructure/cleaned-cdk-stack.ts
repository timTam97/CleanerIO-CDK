import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw_integrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class CleanedCdkStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
        super(app, id);

        const api = new apigw.HttpApi(this, "CleanedHTTPApi");

        const cleaningRecordTable = new dynamodb.Table(this, "CleaningTable", {
            partitionKey: {
                name: "trainID",
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            sortKey: {
                name: "startTime",
                type: dynamodb.AttributeType.STRING,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const ingressFunction = new lambda.Function(this, "IngressFunction", {
            code: new lambda.AssetCode("lib/src/ingress"),
            handler: "app.handler",
            runtime: lambda.Runtime.PYTHON_3_8,
            environment: {
                TABLE_NAME: cleaningRecordTable.tableName,
            },
        });

        const viewLogsFunction = new lambda.Function(this, "ViewLogsFunction", {
            code: new lambda.AssetCode("lib/src/viewlogs"),
            handler: "app.handler",
            runtime: lambda.Runtime.PYTHON_3_8,
            environment: {
                TABLE_NAME: cleaningRecordTable.tableName,
            },
        });

        const listLogsFunction = new lambda.Function(this, "ListLogsFunction", {
            code: new lambda.AssetCode("lib/src/listlogs"),
            handler: "app.handler",
            runtime: lambda.Runtime.PYTHON_3_8,
            environment: {
                TABLE_NAME: cleaningRecordTable.tableName,
            },
        });

        cleaningRecordTable.grantReadWriteData(ingressFunction);
        cleaningRecordTable.grantReadData(viewLogsFunction);
        cleaningRecordTable.grantReadData(listLogsFunction);

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

        api.addRoutes({
            integration: new apigw_integrations.LambdaProxyIntegration({
                handler: listLogsFunction,
                payloadFormatVersion: apigw.PayloadFormatVersion.VERSION_2_0,
            }),
            path: "/list",
            methods: [apigw.HttpMethod.GET],
        });
    }
}

const app = new cdk.App();
new CleanedCdkStack(app, "CleanedCdkStack");
app.synth();

// start time
//  end time
// person who cleaned
// date
// fleet string
// train number
// carraige number
