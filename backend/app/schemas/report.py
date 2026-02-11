from pydantic import BaseModel


class ReportGeneral(BaseModel):
    people: list[dict]
    total_coordenadoras: int
    total_colaboradoras: int
    by_group: dict[str, int]
    average_presence_month: float
    average_presence_year: float
    last_3_months_counts: list[int]
    last_12_months_avg: list[float]


class EbiReport(BaseModel):
    ebi_id: int
    ebi_date: str
    group_number: int
    coordinator_name: str
    collaborators: list[str]
    presences: list[dict]
