# Kuka säätää?

Kuka säätää? on verkkosovellus, joka kokoaa ja esittää Suomen lainvalmisteluun liittyviä dokumentteja. Projekti hakee dokumentit eduskunnan rajapinnoista, tallentaa ne tietokantaan ja tarjoaa käyttöliittymän [https://kukasaataa-01.utu.fi/](https://kukasaataa-01.utu.fi/), jossa dokumentteja voi selata ja hakea.

## Arkkitehtuuri

### Backend
- Python + Flask
- Hakee dokumentit tietokannasta ja tarjoaa ne frontendille

### Frontend
- React
- Palvellaan Nginxin kautta
- Käyttöliittymä, jossa opettaja voi valita tietyt dokumentit oppilaiden nähtäväksi koodilla.

### Tietokanta
- MongoDB
- Sisältää kaikki lakihankkeet ja niihin liittyvät valmisteluasiakirjat, sekä toisessa kokoelmassa käyttäjien luomat rajatut dokumenttivalikoimat

### Datan haku (Fetcher)
- Python
- Hakee dokumentit Avoindata- ja Hankeikkuna-rajapinnoista ja päivittää uudet dokumentit sovelluksen tietokantaan kerran vuorokaudessa

Kaikki palvelut pyörivät Docker-konteissa.

## Lataaminen
Kloonaa projekti omalle koneelle ja käynnistä se dockerilla
```bash
git clone https://github.com/hilliaho/kukasaataa.git
cd kukasaataa
docker compose up --build
```
