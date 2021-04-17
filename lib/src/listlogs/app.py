"""
sup
"""
import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

logs_table = boto3.resource("dynamodb").Table(os.environ.get("TABLE_NAME"))


def replace_decimals(obj):
    """
    Convert all whole number decimals in `obj` to integers.
    Why does boto3 do this?
    https://github.com/boto/boto3/issues/369
    """
    if isinstance(obj, list):
        return [replace_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: replace_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else obj
    return obj


def handler(event, context):
    print(event)
    res = logs_table.scan()
    print(res)
    data = res["Items"]
    cleaned = []
    for log_entry in data:
        cleaned.append(replace_decimals(log_entry))
    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": json.dumps(cleaned),
    }
