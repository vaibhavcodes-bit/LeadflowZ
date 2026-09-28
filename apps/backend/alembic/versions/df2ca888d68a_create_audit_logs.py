"""create leads and audit logs

Revision ID: df2ca888d68a
Revises:
Create Date: 2026-09-27 21:56:42.166195

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "df2ca888d68a"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create leads and audit_logs tables."""

    # ---------------------------------------------------------
    # 1. Create leads table
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # 2. Create audit_logs table
    # ---------------------------------------------------------

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("lead_id", sa.Uuid(), nullable=False),
        sa.Column(
            "event_type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["lead_id"],
            ["leads.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_audit_logs_event_type"),
        "audit_logs",
        ["event_type"],
        unique=False,
    )

    op.create_index(
        op.f("ix_audit_logs_lead_id"),
        "audit_logs",
        ["lead_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop audit_logs and leads tables."""

    # Drop child table first because it references leads.
    op.drop_index(
        op.f("ix_audit_logs_lead_id"),
        table_name="audit_logs",
    )

    op.drop_index(
        op.f("ix_audit_logs_event_type"),
        table_name="audit_logs",
    )

    op.drop_table("audit_logs")

    op.drop_index(
        op.f("ix_leads_external_lead_id"),
        table_name="leads",
    )

    op.drop_table("leads")