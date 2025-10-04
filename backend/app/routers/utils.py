import requests
from fastapi import APIRouter

router = APIRouter(prefix="/utils", tags=["utils"])


@router.get("/countries")
def countries():
    url = "https://restcountries.com/v3.1/all?fields=name,currencies"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()
    items = []
    for c in data:
        name = c.get("name", {}).get("common")
        currencies = list((c.get("currencies") or {}).keys())
        items.append({"name": name, "currencies": currencies})
    return items


@router.get("/rates/{base}")
def rates(base: str):
    r = requests.get(f"https://api.exchangerate-api.com/v4/latest/{base}", timeout=10)
    r.raise_for_status()
    return r.json()