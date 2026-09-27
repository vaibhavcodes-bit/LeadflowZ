from app.db.base import Base
from app.models.lead import Lead


def test_lead_model_is_registered() -> None:
    assert Lead.__tablename__ == "leads"
    assert Lead.__table__ in Base.metadata.tables.values()


def test_lead_model_has_required_columns() -> None:
    columns = set(Lead.__table__.columns.keys())

    expected_columns = {
        "id",
        "external_lead_id",
        "name",
        "email",
        "phone",
        "status",
        "source",
        "notes",
        "created_at",
        "updated_at",
    }

    assert expected_columns.issubset(columns)