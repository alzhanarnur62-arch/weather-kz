"""РЎРєР°С‡РёРІР°РµС‚ РіСЂР°РЅРёС†С‹ РіРѕСЂРѕРґРѕРІ РљР°Р·Р°С…СЃС‚Р°РЅР° РёР· OpenStreetMap (Nominatim) РѕРґРёРЅ СЂР°Р·
Рё СЃРѕС…СЂР°РЅСЏРµС‚ СѓРїСЂРѕС‰С‘РЅРЅС‹Рµ РєРѕРЅС‚СѓСЂС‹ РІ projects/weather-kz/data/city-shapes.json.
Р—Р°РїСѓСЃРє: python fetch_shapes.py [id ...]  вЂ” Р±РµР· Р°СЂРіСѓРјРµРЅС‚РѕРІ РєР°С‡Р°РµС‚ РІСЃРµ РіРѕСЂРѕРґР°."""
import json, sys, time, urllib.parse, urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data" / "city-shapes.json"
UA = "weather-kz-portfolio/1.0 (https://github.com/alzhanarnur62-arch)"

# id: Р·Р°РїСЂРѕСЃ РІ Nominatim
QUERIES = {
    "aktau": "Aktau, Mangystau Region", "oral": "Oral, West Kazakhstan Region", "atyrau": "Atyrau, Atyrau Region",
    "aktobe": "Aktobe, Aktobe Region", "kostanay": "Kostanay, Kostanay Region", "kyzylorda": "Kyzylorda, Kyzylorda Region",
    "zhezkazgan": "Zhezkazgan, Ulytau Region", "turkistan": "Turkistan, Turkistan Region", "petropavl": "Petropavl, North Kazakhstan Region",
    "kokshetau": "Kokshetau, Akmola Region", "shymkent": "Shymkent", "taraz": "Taraz, Jambyl Region", "astana": "Astana",
    "karaganda": "Karaganda, Karaganda Region", "almaty": "Almaty", "pavlodar": "Pavlodar, Pavlodar Region",
    "konaev": "Konaev, Almaty Region", "taldykorgan": "Taldykorgan, Jetisu Region", "semey": "Semey, Abai Region",
    "oskemen": "Oskemen, East Kazakhstan Region",
}


def fetch(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
        "q": q, "countrycodes": "kz", "format": "jsonv2", "polygon_geojson": 1,
        "polygon_threshold": 0.002, "limit": 5,
    })
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def pick(results):
    # РќСѓР¶РЅР° РёРјРµРЅРЅРѕ РіСЂР°РЅРёС†Р° (Polygon/MultiPolygon), Р¶РµР»Р°С‚РµР»СЊРЅРѕ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РёРІРЅР°СЏ
    polys = [r for r in results if r.get("geojson", {}).get("type") in ("Polygon", "MultiPolygon")]
    polys.sort(key=lambda r: (r.get("category") != "boundary", r.get("place_rank", 99)))
    return polys[0] if polys else None


def rings(geo):
    """Р’РЅРµС€РЅРёРµ РєРѕР»СЊС†Р°, РєРѕРѕСЂРґРёРЅР°С‚С‹ РѕРєСЂСѓРіР»РµРЅС‹ РґРѕ 3 Р·РЅР°РєРѕРІ (~100 Рј)."""
    parts = geo["coordinates"] if geo["type"] == "MultiPolygon" else [geo["coordinates"]]
    out = []
    for poly in parts:
        ring = [[round(x, 3), round(y, 3)] for x, y in poly[0]]
        if len(ring) >= 4:
            out.append(ring)
    return out


def main():
    ids = sys.argv[1:] or list(QUERIES)
    data = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    for cid in ids:
        res = fetch(QUERIES[cid])
        best = pick(res)
        if best:
            rs = rings(best["geojson"])
            data[cid] = {"name": best.get("display_name", "")[:80], "rings": rs}
            print(f"{cid}: {best.get('category')}/{best.get('type')} rank={best.get('place_rank')} "
                  f"parts={len(rs)} points={sum(len(r) for r in rs)} | {best.get('display_name','')[:70]}")
        else:
            print(f"{cid}: РќР•Рў РљРћРќРўРЈР Рђ ({len(res)} СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ: {[r.get('type') for r in res]})")
        time.sleep(1.2)  # РїСЂР°РІРёР»Рѕ Nominatim: РЅРµ С‡Р°С‰Рµ 1 Р·Р°РїСЂРѕСЃР° РІ СЃРµРєСѓРЅРґСѓ
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("saved", OUT, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()

