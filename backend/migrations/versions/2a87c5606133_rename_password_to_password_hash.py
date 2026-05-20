"""Rename password to password_hash

Revision ID: 2a87c5606133
Revises: aa52b103be62
Create Date: 2026-05-20 08:12:14.486739

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2a87c5606133'
down_revision = 'aa52b103be62'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('password_hash', sa.String(length=255), nullable=True))

    op.execute('UPDATE users SET password_hash = password')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('password_hash', nullable=False)
        batch_op.drop_column('password')


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('password', sa.VARCHAR(length=255), nullable=True))

    op.execute('UPDATE users SET password = password_hash')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('password', nullable=False)
        batch_op.drop_column('password_hash')