# services/influx_logger.py

import os
from influxdb_client_3 import InfluxDBClient3, Point

# Configuração do cliente
token = os.environ.get("INFLUXDB_TOKEN")
org = "BotBlocker"
host = "https://eu-central-1-1.aws.cloud2.influxdata.com"
database = "vote"

client = InfluxDBClient3(host=host, token=token, org=org)

def log_evaluation_to_influx(evaluation):
    """
    Regista uma avaliação no InfluxDB.
    """
    try:
        point = (
            Point("evaluations")
            .tag("user_id", str(evaluation.user.id))
            .tag("profile_id", str(evaluation.profile.id))
            .field("is_bot", int(evaluation.is_bot))
            .field("notas_size", len(evaluation.notas))  # opcional: tamanho do texto
            .time(evaluation.created_at)  # ou usa datetime.utcnow() se necessário
        )
        client.write(database=database, record=point)
    except Exception as e:
        print(f"[InfluxDB Error] Failed to log evaluation: {e}")

def count_recent_evaluations_by_user(user_id, minutes=1):
    query = f"""
    SELECT COUNT(*) FROM "evaluations"
    WHERE time >= now() - interval '{minutes} minutes'
    AND "user_id" = '{user_id}'
    """
    table = client.query(query=query, database=database, language='sql')
    df = table.to_pandas()
    if df.empty:
        return 0
    
    count = df.select_dtypes(include='number').iloc[0].sum()
    return int(count)

def count_recent_evaluations_by_profile(profile_id, minutes=5):
    query = f"""
    SELECT COUNT(*) FROM "evaluations"
    WHERE time >= now() - interval '{minutes} minutes'
    AND "profile_id" = '{profile_id}'
    """
    table = client.query(query=query, database=database, language='sql')
    df = table.to_pandas()
    if df.empty:
        return 0
    
    count = df.select_dtypes(include='number').iloc[0].sum()
    return int(count)

# from app.services.influx_logger import *
    # recent_user_votes = count_recent_evaluations_by_user(user_bb.id, minutes=1)
    # recent_profile_votes = count_recent_evaluations_by_profile(profile.id, minutes=5)