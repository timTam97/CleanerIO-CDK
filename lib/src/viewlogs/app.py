"""
todo lol
"""
import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

logs_table = boto3.resource("dynamodb").Table(os.environ.get("TABLE_NAME"))


def handler(event, context):
    print(event)
    payload = json.loads(event["body"])
    print(payload)
    res = logs_table.get_item(
        Key={"trainID": payload["trainID"], "startTime": payload["startTime"]}
    )
    data = res["Item"]
    print(data)
    # mini rant - why does boto3 return numbers as decimals??????????
    # have to go and turn everything into an integer now
    for key, val in data.items():
        if isinstance(val, Decimal):
            data[key] = int(val)
        elif isinstance(val, list) and all(isinstance(x, Decimal) for x in val):
            data[key] = list(map(int, data[key]))
    print(res)
    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": json.dumps(res["Item"]),
    }
