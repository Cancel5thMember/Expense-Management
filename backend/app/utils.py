import requests
from typing import Dict, List


def fetch_countries_and_currencies() -> List[Dict]:
    url = "https://restcountries.com/v3.1/all?fields=name,currencies"
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    result = []
    for item in data:
        name = item.get("name", {}).get("common")
        currencies = item.get("currencies", {})
        codes = list(currencies.keys()) if currencies else []
        result.append({"name": name, "currencies": codes})
    return result


def fetch_exchange_rates(base_currency: str) -> Dict:
    url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    return resp.json()