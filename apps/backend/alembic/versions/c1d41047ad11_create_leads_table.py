"""create leads table

Revision ID: c1d41047ad11
Revises: df2ca888d68a
Create Date: 2026-09-28 12:33:36.446163

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c1d41047ad11"
down_revision: Union[str, Sequence[str], None] = "df2ca888d68a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create leads table."""

    op.create_table(
        "leads",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column(
            "external_lead_id",
            sa.String(length=255),
            nullable=True,
        ),
        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "email",
            sa.String(length=255),
            nullable=True,
        ),
        sa.Column(
            "phone",
            sa.String(length=50),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "source",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "notes",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("external_lead_id"),
    )

    op.create_index(
        op.f("ix_leads_external_lead_id"),
        "leads",
        ["external_lead_id"],
        unique=True,
    )


def downgrade() -> None:
    """Drop leads table."""

    op.drop_index(
        op.f("ix_leads_external_lead_id"),
        table_name="leads",
    )

    op.drop_table("leads")