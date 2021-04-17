"""
hello
"""
import json
import os

import boto3
from boto3.dynamodb.conditions import Key

logs_table = boto3.resource("dynamodb").Table(os.environ.get("TABLE_NAME"))


def handler(event, context):
    print(event)
    payload = json.loads(event["body"])
    print(payload)
    logs_table.put_item(
        Item={
            "fleetID": payload["fleetID"],
            "trainID": payload["trainID"],  # partition key
            "startTime": payload["startTime"],  # sort key
            "carriage": payload["carriage"],  # (number)
            "endTime": payload["endTime"],
            "usedSupplies": payload["usedSupplies"],
        }
    )
    return {"isBase64Encoded": False, "statusCode": 200, "body": json.dumps("hi")}
