import urllib.request, json

r = urllib.request.urlopen('http://127.0.0.1:8000/api/v1/alerts/')
data = json.loads(r.read())
print(f'Got {len(data)} alerts from API:')
for d in data:
    print(f"  [{d['severity'].upper():10}] {d['headline'][:60]}")
