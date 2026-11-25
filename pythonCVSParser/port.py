from pathlib import Path
import sqlite3
import csv


db_path = Path(__file__).resolve().parents[1] / "mock_db.sqlite"
csv_path = "PORT_ADDRESS.csv"


with open(csv_path, "r") as f:
    reader = csv.reader(f)
    next(reader)

    for row in reader:
        row = row[0]
        row = row.split(";")
        print(row)
        print(type(row))
        print(len(row))
        with sqlite3.connect(db_path) as db:
            db.execute(
                "INSERT INTO abat_persistence_Port "
                "(location, name, city, postl_code, street) VALUES (?, ?, ?, ?, ?)",
                (row[0], row[1], row[2], row[3], row[4]),
            )
