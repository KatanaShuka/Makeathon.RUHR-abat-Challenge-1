import sqlite3
from pathlib import Path

db_path = Path(__file__).resolve().parents[1] / "db.sqlite"

with sqlite3.connect(db_path) as db:
    db.execute(
        "INSERT INTO abat_persistence_Port "
        "(location, name, city, postl_code, street) VALUES (?, ?, ?, ?, ?)",
        ("PORT01", "Beispielhafen", "Duisburg", "47051", "Hafenstrasse"),
    )