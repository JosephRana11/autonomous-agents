from fastapi import HTTPException
from typing import Union
from pydantic import BaseModel, json
from croniter import croniter


class CronTriggerDTO(BaseModel):
    frequency: str
    probability: float


class TopicTriggerDTO(BaseModel):
    topic: str


class Action(BaseModel):
    function_name: str
    parameter: str


class TriggerCreateDTO(BaseModel):
    type: str
    action: Action
    data: Union[CronTriggerDTO, TopicTriggerDTO]


# validation for cron expression
async def validate_type_CRON(cron_expression: str, probability: float):
    try:
        croniter(cron_expression)
    except ValueError as e:
        raise HTTPException(400, f"Invalid CRON expression")
        # Validate probability
    if probability < 0 or probability > 1:
        raise HTTPException(400, "Probability must be between 0 and 1 (can include 1 or 0)")


# validation for Topic
async def validate_type_TOPIC(value: str):
    try:
        if value.isnumeric():
            raise HTTPException(400, f"Invalid topic :")

    except ValueError as e:
        return f"Validation error: {e}"
