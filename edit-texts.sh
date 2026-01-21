#!/bin/bash

set -e

ORIGINAL="./src/frontend/src/texts.json"
WORKING="./src/frontend/src/texts.json.edit"
BACKUP="./src/frontend/src/texts.json.bak"
VALIDATE_CMD="node scripts/validate-texts.js"


echo "Luodaan muokattava kopio"
cp "$ORIGINAL" "$WORKING"

while true; do
  echo "Avataan tiedosto Nano-editorissa"
  nano "$WORKING"

  echo "Tarkistetaan"
  if $VALIDATE_CMD "$WORKING"; then
    echo "Testi meni läpi!"

    echo "Tallennetaan varmuuskopio ./src/frontend/src/texts.json.bak"
    cp "$ORIGINAL" "$BACKUP"

    echo "Korvataan tiedosto uudella"
    mv "$WORKING" "$ORIGINAL"

    echo
    echo "Tiedoston päivitys onnistui. Aja vielä: sudo docker compose build frontend && sudo docker compose up -d frontend"


    exit 0
  else
    echo
    echo "Testi epäonnistui, eli json-tiedoston syntaksissa on virhe"
    echo "Mitä haluat tehdä? Kirjoita merkki ja paina Enter:"
    echo "  [p] Peruuta ja hylkää muutokset"
    echo "  [j] Jatka muokkaamista"
    read -r -p "> " choice

    case "$choice" in
      p|P)
        echo "Peruutetaan. Alkuperäinen tiedosto säilyi ennallaan."
        rm -f "$WORKING"
        exit 1
        ;;
      j|J)
        echo "Palataan muokkaukseen"
        ;;
      *)
        echo
        ;;
    esac
  fi
done
