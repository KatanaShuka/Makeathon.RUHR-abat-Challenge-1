from pathlib import Path
import sqlite3
import uuid
import csv


db_path = Path(__file__).resolve().parents[1] / "mock_db.sqlite"
csv_path = "Beispieldate.csv"


with open("Beispieldaten_Challenge2.csv", "r") as f:
    reader = csv.reader(f)
    next(reader)

    for row in reader:
        row = row[0].split(";")[:5]

        event_id = str(uuid.uuid4())
        ereigniscode = row[0]
        zeitraum_von = row[1].split("/")[2] + "/" + row[1].split("/")[0] + "/" + row[1].split("/")[1]
        zeitraum_bis = row[2].split("/")[2] + "/" + row[2].split("/")[0] + "/" + row[2].split("/")[1]
        warnstufe = row[3]
        betroffene_lokation = row[4]

        print("==============================")
        print(event_id)
        print(ereigniscode)
        print(zeitraum_von)
        print(zeitraum_bis)
        print(warnstufe)
        print(betroffene_lokation)

        with sqlite3.connect(db_path) as db:
            db.execute(
                "INSERT INTO abat_persistence_Event "
                "(event_id, zeitraum_von, zeitraum_bis, betroffene_lokation_location, warnstufe_warnstufe, event_bezeichnung_bezeichnung) VALUES (?, ?, ?, ?, ?, ?)",
                (event_id, zeitraum_von, zeitraum_bis, betroffene_lokation, warnstufe, ereigniscode),
            )
