# Kuka säätää?

## Lataaminen
Kloonaa projekti omalle koneelle
```bash
git clone git@github.com:hilliaho/kukasaataa.git
```
Asenna backendin riippuvuudet
```bash
poetry install
```
Asenna frontendin riippuvuudet
```bash
cd src/frontend/
npm install
```
Tarvitset ohjelman käyttämiseen tietokannan osoitteen, joka pitää tallentaa .env-tiedostoon projektin juurikansioon.

## Käynnistysohjeet

Käynnistä backend
```bash
poetry run invoke backend
```
tai vaihtoehtoisesti
```bash
cd src/backend
source venv/bin/activate
python3 app.py
```

Käynnistä frontend
```bash
poetry run invoke frontend
```
tai
```bash
cd src/frontend/kukasaataa
npm start
```

