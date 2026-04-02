#!/bin/bash
# Smoke test — tous les cas d'utilisation (UC1-UC23)
BASE="http://localhost:3001"
PASS=0
FAIL=0

check() {
  local uc="$1" desc="$2" expected="$3" actual="$4"
  if echo "$actual" | grep -q "$expected"; then
    echo "  OK  $uc — $desc"
    PASS=$((PASS+1))
  else
    echo "  FAIL $uc — $desc (attendu: $expected, recu: $actual)"
    FAIL=$((FAIL+1))
  fi
}

echo "=== SMOKE TEST — La Ligue Informatique ==="
echo ""

# ────────────────────────────────────────────────────
# UC1 — S'inscrire
# ────────────────────────────────────────────────────
echo "--- UC1: S'inscrire ---"
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"Smoke","email":"smoke@test.com","password":"Password1!"}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC1" "Inscription nouvel utilisateur" "201" "$CODE"

# Doublon
R2=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"Smoke","email":"smoke@test.com","password":"Password1!"}')
CODE2=$(echo "$R2" | tail -1)
check "UC1" "Doublon email rejete" "409" "$CODE2"

# ────────────────────────────────────────────────────
# UC2 — Se connecter (obtenir un token CSRF + cookie)
# ────────────────────────────────────────────────────
echo "--- UC2: Se connecter ---"
# Get CSRF token
CSRF_PAGE=$(curl -s -c /tmp/smoke_cookies.txt "$BASE/api/auth/csrf")
CSRF=$(echo "$CSRF_PAGE" | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)

# Login as alice (admin)
LOGIN=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt -c /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=alice@example.com&password=Password1!&csrfToken=$CSRF" \
  -L -o /dev/null)
CODE=$(echo "$LOGIN" | tail -1)
check "UC2" "Connexion alice (admin)" "200" "$CODE"

# Verify session
SESSION=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/auth/session")
check "UC2" "Session active" "alice" "$SESSION"

# ────────────────────────────────────────────────────
# UC3 — Tableau de bord
# ────────────────────────────────────────────────────
echo "--- UC3: Tableau de bord ---"
DASH=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/smoke_cookies.txt "$BASE/dashboard")
check "UC3" "Page dashboard accessible" "200" "$DASH"

# ────────────────────────────────────────────────────
# UC4 — S'inscrire a un sport
# ────────────────────────────────────────────────────
echo "--- UC4: S'inscrire a un sport ---"
# Get sports list first
SPORTS=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/sports")
check "UC4" "Liste des sports" "Football" "$SPORTS"

# S'inscrire au Tennis (alice n'y est pas inscrite dans le seed)
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/inscriptions" \
  -H "Content-Type: application/json" \
  -d '{"sportId":4}')
CODE=$(echo "$R" | tail -1)
check "UC4" "Inscription au Tennis" "201" "$CODE"

# Doublon
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/inscriptions" \
  -H "Content-Type: application/json" \
  -d '{"sportId":4}')
CODE=$(echo "$R" | tail -1)
check "UC4" "Doublon inscription rejete" "409" "$CODE"

# ────────────────────────────────────────────────────
# UC5 — Se desinscrire d'un sport
# ────────────────────────────────────────────────────
echo "--- UC5: Se desinscrire d'un sport ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X DELETE "$BASE/api/inscriptions" \
  -H "Content-Type: application/json" \
  -d '{"sportId":4}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC5" "Desinscription du Tennis" "200" "$CODE"

# ────────────────────────────────────────────────────
# UC6 — Consulter les equipes
# ────────────────────────────────────────────────────
echo "--- UC6: Consulter les equipes ---"
EQUIPES=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/equipes")
check "UC6" "Liste des equipes" "FC Paris" "$EQUIPES"
check "UC6" "Equipe Lyon Basket presente" "Lyon Basket" "$EQUIPES"

# ────────────────────────────────────────────────────
# UC7 — Rejoindre une equipe (via API membres)
# ────────────────────────────────────────────────────
echo "--- UC7: Rejoindre une equipe ---"
# Ajouter smoke@test.com a Lyon Basket (id=2)
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/equipes/2/membres" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com"}')
CODE=$(echo "$R" | tail -1)
check "UC7" "Ajout smoke a Lyon Basket" "201" "$CODE"

# Doublon
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/equipes/2/membres" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com"}')
CODE=$(echo "$R" | tail -1)
check "UC7" "Doublon membre rejete" "409" "$CODE"

# ────────────────────────────────────────────────────
# UC8 — Quitter une equipe
# ────────────────────────────────────────────────────
echo "--- UC8: Quitter une equipe ---"
# Get smoke user id
SMOKE_ID=$(echo "$BODY" | grep -o '"utilisateurId":[0-9]*' | head -1 | cut -d: -f2)
if [ -z "$SMOKE_ID" ]; then
  # Fallback: get from equipe detail
  EQ_DETAIL=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/equipes/2")
  SMOKE_ID=$(echo "$EQ_DETAIL" | grep -o '"email":"smoke@test.com"' -B5 | grep -o '"utilisateurId":[0-9]*' | cut -d: -f2)
  if [ -z "$SMOKE_ID" ]; then
    SMOKE_ID=7
  fi
fi
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X DELETE "$BASE/api/equipes/2/membres" \
  -H "Content-Type: application/json" \
  -d "{\"utilisateurId\":$SMOKE_ID}")
CODE=$(echo "$R" | tail -1)
check "UC8" "Retrait smoke de Lyon Basket" "200" "$CODE"

# ────────────────────────────────────────────────────
# UC9 — Consulter les evenements
# ────────────────────────────────────────────────────
echo "--- UC9: Consulter les evenements ---"
EVENTS=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/evenements")
check "UC9" "Liste des evenements" "Entrainement collectif" "$EVENTS"

# ────────────────────────────────────────────────────
# UC10 — Repondre a un evenement
# ────────────────────────────────────────────────────
echo "--- UC10: Repondre a un evenement ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/reponses" \
  -H "Content-Type: application/json" \
  -d '{"evenementId":1,"reponse":"present"}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC10" "Reponse present a evenement 1" "200" "$CODE"
check "UC10" "Reponse contient present" "present" "$BODY"

# Upsert (changer la reponse)
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/reponses" \
  -H "Content-Type: application/json" \
  -d '{"evenementId":1,"reponse":"absent"}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC10" "Modification reponse en absent" "200" "$CODE"
check "UC10" "Reponse mise a jour" "absent" "$BODY"

# ────────────────────────────────────────────────────
# UC11 — Consulter un match
# ────────────────────────────────────────────────────
echo "--- UC11: Consulter un match ---"
MATCH=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/matchs/1")
check "UC11" "Detail match 1" "FC Paris" "$MATCH"
check "UC11" "Match a 2 equipes" "equipesParticipantes" "$MATCH"

# ────────────────────────────────────────────────────
# UC12 — Consulter le calendrier
# ────────────────────────────────────────────────────
echo "--- UC12: Calendrier ---"
CAL=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/smoke_cookies.txt "$BASE/calendar")
check "UC12" "Page calendrier accessible" "200" "$CAL"

# ────────────────────────────────────────────────────
# UC13 — Consulter son profil
# ────────────────────────────────────────────────────
echo "--- UC13: Profil ---"
PROFIL=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/smoke_cookies.txt "$BASE/profil")
check "UC13" "Page profil accessible" "200" "$PROFIL"

# ────────────────────────────────────────────────────
# UC14 — Creer un sport (admin)
# ────────────────────────────────────────────────────
echo "--- UC14: Creer un sport ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/sports" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Badminton"}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC14" "Creation sport Badminton" "201" "$CODE"
BADMINTON_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# ────────────────────────────────────────────────────
# UC15 — Supprimer un sport
# ────────────────────────────────────────────────────
echo "--- UC15: Supprimer un sport ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X DELETE "$BASE/api/sports/$BADMINTON_ID")
CODE=$(echo "$R" | tail -1)
check "UC15" "Suppression sport Badminton" "200" "$CODE"

# ────────────────────────────────────────────────────
# UC16 — Creer une equipe
# ────────────────────────────────────────────────────
echo "--- UC16: Creer une equipe ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/equipes" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Smoke Team","nombrePlaces":3}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC16" "Creation equipe Smoke Team" "201" "$CODE"
SMOKE_TEAM_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# ────────────────────────────────────────────────────
# UC17 — Supprimer une equipe
# ────────────────────────────────────────────────────
echo "--- UC17: Supprimer une equipe ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X DELETE "$BASE/api/equipes/$SMOKE_TEAM_ID")
CODE=$(echo "$R" | tail -1)
check "UC17" "Suppression equipe Smoke Team" "200" "$CODE"

# Re-creer pour les tests suivants
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/equipes" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test Equipe","nombrePlaces":2}')
BODY=$(echo "$R" | head -n -1)
TEST_TEAM_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# ────────────────────────────────────────────────────
# UC18 — Ajouter un membre a une equipe
# ────────────────────────────────────────────────────
echo "--- UC18: Ajouter un membre ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/equipes/$TEST_TEAM_ID/membres" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com"}')
CODE=$(echo "$R" | tail -1)
check "UC18" "Ajout bob a Test Equipe" "201" "$CODE"

# Test capacite (equipe de 2 places, alice + bob = 2, ajouter david devrait echouer)
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/equipes/$TEST_TEAM_ID/membres" \
  -H "Content-Type: application/json" \
  -d '{"email":"david@example.com"}')
CODE=$(echo "$R" | tail -1)
check "UC18" "Capacite max respectee (rejet)" "400" "$CODE"

# ────────────────────────────────────────────────────
# UC19 — Retirer un membre d'une equipe
# ────────────────────────────────────────────────────
echo "--- UC19: Retirer un membre ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X DELETE "$BASE/api/equipes/$TEST_TEAM_ID/membres" \
  -H "Content-Type: application/json" \
  -d '{"utilisateurId":2}')
CODE=$(echo "$R" | tail -1)
check "UC19" "Retrait bob de Test Equipe" "200" "$CODE"

# ────────────────────────────────────────────────────
# UC20 — Creer un evenement
# ────────────────────────────────────────────────────
echo "--- UC20: Creer un evenement ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/evenements" \
  -H "Content-Type: application/json" \
  -d '{"entitule":"Smoke Entrainement","participants":10,"dateHeure":"2026-05-01T18:00:00","sportId":1}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC20" "Creation evenement" "201" "$CODE"
SMOKE_EV_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# Verifier le detail
EV_DETAIL=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/evenements/$SMOKE_EV_ID")
check "UC20" "Detail evenement cree" "Smoke Entrainement" "$EV_DETAIL"

# ────────────────────────────────────────────────────
# UC21 — Creer un match (heritage XT)
# ────────────────────────────────────────────────────
echo "--- UC21: Creer un match ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/matchs" \
  -H "Content-Type: application/json" \
  -d '{"entitule":"Smoke Match","participants":22,"dateHeure":"2026-05-10T20:00:00","sportId":1,"equipe1Id":1,"equipe2Id":2,"description":"Match de test"}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC21" "Creation match (heritage XT)" "201" "$CODE"
check "UC21" "Match a un evenement parent" "entitule" "$BODY"
check "UC21" "Match a des equipes participantes" "equipesParticipantes" "$BODY"
SMOKE_MATCH_ID=$(echo "$BODY" | grep -o '"match":{[^}]*"id":[0-9]*' | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# Meme equipe des 2 cotes = erreur
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X POST "$BASE/api/matchs" \
  -H "Content-Type: application/json" \
  -d '{"entitule":"Bad Match","participants":22,"dateHeure":"2026-05-10T20:00:00","sportId":1,"equipe1Id":1,"equipe2Id":1}')
CODE=$(echo "$R" | tail -1)
check "UC21" "Match meme equipe rejete" "400" "$CODE"

# ────────────────────────────────────────────────────
# UC22 — Definir le gagnant d'un match
# ────────────────────────────────────────────────────
echo "--- UC22: Definir le gagnant ---"
# Get matchs list to find our match
MATCHS=$(curl -s -b /tmp/smoke_cookies.txt "$BASE/api/matchs")
# Use match 1 (seeded) which has known equipe IDs
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X PUT "$BASE/api/matchs/1" \
  -H "Content-Type: application/json" \
  -d '{"equipeGagnanteId":1}')
CODE=$(echo "$R" | tail -1)
BODY=$(echo "$R" | head -n -1)
check "UC22" "Gagnant defini (equipe 1)" "200" "$CODE"
check "UC22" "equipeGagnante presente" "equipeGagnante" "$BODY"

# Equipe non participante = erreur
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X PUT "$BASE/api/matchs/1" \
  -H "Content-Type: application/json" \
  -d '{"equipeGagnanteId":3}')
CODE=$(echo "$R" | tail -1)
check "UC22" "Gagnant non participant rejete" "400" "$CODE"

# Retirer le gagnant
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X PUT "$BASE/api/matchs/1" \
  -H "Content-Type: application/json" \
  -d '{"equipeGagnanteId":null}')
CODE=$(echo "$R" | tail -1)
check "UC22" "Gagnant retire (null)" "200" "$CODE"

# ────────────────────────────────────────────────────
# UC23 — Supprimer un evenement/match
# ────────────────────────────────────────────────────
echo "--- UC23: Supprimer evenement/match ---"
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  -X DELETE "$BASE/api/evenements/$SMOKE_EV_ID")
CODE=$(echo "$R" | tail -1)
check "UC23" "Suppression evenement" "200" "$CODE"

# Verifier suppression
R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
  "$BASE/api/evenements/$SMOKE_EV_ID")
CODE=$(echo "$R" | tail -1)
check "UC23" "Evenement supprime (404)" "404" "$CODE"

# Supprimer le match (cascade depuis evenement)
if [ -n "$SMOKE_MATCH_ID" ]; then
  R=$(curl -s -w "\n%{http_code}" -b /tmp/smoke_cookies.txt \
    -X DELETE "$BASE/api/matchs/$SMOKE_MATCH_ID")
  CODE=$(echo "$R" | tail -1)
  check "UC23" "Suppression match (cascade)" "200" "$CODE"
fi

# Cleanup test equipe
curl -s -b /tmp/smoke_cookies.txt -X DELETE "$BASE/api/equipes/$TEST_TEAM_ID" > /dev/null

# ────────────────────────────────────────────────────
# Pages frontend (smoke)
# ────────────────────────────────────────────────────
echo ""
echo "--- Pages frontend ---"
for page in "/sports" "/sports/1" "/equipes" "/equipes/1" "/evenements" "/evenements/1" "/matchs" "/matchs/1" "/calendar" "/profil" "/dashboard"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -b /tmp/smoke_cookies.txt "$BASE$page")
  check "PAGE" "$page" "200" "$CODE"
done

# Auth pages (no cookie needed)
for page in "/login" "/signup"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$page")
  check "PAGE" "$page (public)" "200" "$CODE"
done

# ────────────────────────────────────────────────────
# Nettoyage
# ────────────────────────────────────────────────────
rm -f /tmp/smoke_cookies.txt

echo ""
echo "==========================================="
echo "  RESULTATS: $PASS OK / $FAIL FAIL"
echo "==========================================="

if [ $FAIL -gt 0 ]; then
  exit 1
fi
