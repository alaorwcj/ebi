import urllib.request
import os

url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzhhMDEzNTNkNTJlZjRiNTY5NmVmMzlhYTM1N2VjNjYwEgsSBxDSuri42gEYAZIBJAoKcHJvamVjdF9pZBIWQhQxODEyNjgyNDk4OTkyNjcwMzQ4NA&filename=&opi=89354086"
output_path = r"f:\ebi\frontend\stitch_design.html"

try:
    print(f"Downloading {url} to {output_path}")
    urllib.request.urlretrieve(url, output_path)
    print(f"Success! File size: {os.path.getsize(output_path)} bytes")
except Exception as e:
    print(f"Error: {e}")
