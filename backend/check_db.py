import sqlite3

conn = sqlite3.connect('idrs.db')
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("Tables:", c.fetchall())

c.execute("SELECT COUNT(*), status FROM alerts GROUP BY status")
print("Alerts by status:", c.fetchall())

c.execute("SELECT id, headline, severity, status FROM alerts LIMIT 5")
print("Sample alerts:", c.fetchall())
