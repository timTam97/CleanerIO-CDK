import * as cdk from "@aws-cdk/core";
import * as apigw from "@aws-cdk/aws-apigatewayv2";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigw_integrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

interface lambdaNames {
    addLogs: string;
    viewLogs: string;
    listLogs: string;
    passengerViewLog: string;
    runtime: lambda.Runtime;
}

const generatePaths = (lang: "py" | "ts"): lambdaNames => {
    return {
        addLogs: `lib/src/${lang}/addlogs`,
        viewLogs: `lib/src/${lang}/viewlogs`,
        listLogs: `lib/src/${lang}/listlogs`,
        passengerViewLog: `lib/src/${lang}/passengerview`,
        runtime: lang === "py" ? lambda.Runtime.PYTHON_3_8 : lambda.Runtime.NODEJS_14_X
    };
};

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

        const codePaths = generatePaths("py");

        const addLogsFunction = new lambda.Function(this, "AddLogsFunction", {
            code: new lambda.AssetCode(codePaths.addLogs),
            handler: "app.handler",
            runtime: codePaths.runtime,
            environment: {
                TABLE_NAME: cleaningRecordTable.tableName,
            },
        });

        const viewLogsFunction = new lambda.Function(this, "ViewLogsFunction", {
            code: new lambda.AssetCode(codePaths.viewLogs),
            handler: "app.handler",
            runtime: lambda.Runtime.PYTHON_3_8,
            environment: {
                TABLE_NAME: cleaningRecordTable.tableName,
            },
        });

        const listLogsFunction = new lambda.Function(this, "ListLogsFunction", {
            code: new lambda.AssetCode(codePaths.listLogs),
            handler: "app.handler",
            runtime: codePaths.runtime,
            environment: {
                TABLE_NAME: cleaningRecordTable.tableName,
            },
        });

        const passengerViewLogsFunction = new lambda.Function(
            this,
            "PassengerViewLogsFunction",
            {
                code: new lambda.AssetCode(codePaths.passengerViewLog),
                handler: "app.handler",
                runtime: codePaths.runtime,
                environment: {
                    TABLE_NAME: cleaningRecordTable.tableName,
                },
            }
        );

        cleaningRecordTable.grantReadWriteData(addLogsFunction);
        cleaningRecordTable.grantReadData(viewLogsFunction);
        cleaningRecordTable.grantReadData(listLogsFunction);
        cleaningRecordTable.grantReadData(passengerViewLogsFunction);

        api.addRoutes({
            integration: new apigw_integrations.LambdaProxyIntegration({
                handler: addLogsFunction,
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

        api.addRoutes({
            integration: new apigw_integrations.LambdaProxyIntegration({
                handler: passengerViewLogsFunction,
                payloadFormatVersion: apigw.PayloadFormatVersion.VERSION_2_0,
            }),
            path: "/passengerview/{code}",
            methods: [apigw.HttpMethod.GET],
        });
    }
}

const app = new cdk.App();
new CleanedCdkStack(app, "CleanedCdkStack");
app.synth();
