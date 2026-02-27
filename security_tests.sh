#!/bin/bash
API="http://69.169.103.28:8000"
GREEN='\033[0;32m' RED='\033[0;31m' NC='\033[0m'

pass() { echo -e "${GREEN}✅ PASS${NC} $1 — $2"; }
fail() { echo -e "${RED}❌ FAIL${NC} $1 — $2"; }

echo "══════════════════════════════════════════════"
echo " EBI Vila Paula — Testes de Segurança (API)"
echo "══════════════════════════════════════════════"

# Get tokens
ADMIN_TOKEN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@ebi.local&password=admin001" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))")

COORD_TOKEN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=coord@ebi.local&password=coord001" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))")

COLAB_TOKEN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=colab@ebi.local&password=colab001" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))")

echo "Admin token: ${ADMIN_TOKEN:0:20}..."
echo "Coord token: ${COORD_TOKEN:0:20}..."
echo "Colab token: ${COLAB_TOKEN:0:20}..."
echo ""

# S1 - Colab GET /users -> 403
S=$(curl -s -o /dev/null -w "%{http_code}" "$API/users" -H "Authorization: Bearer $COLAB_TOKEN")
[[ "$S" == "403" ]] && pass "S1" "Colab GET /users → $S" || fail "S1" "Colab GET /users → $S (esperado 403)"

# S2 - Colab GET /reports/general -> 403
S=$(curl -s -o /dev/null -w "%{http_code}" "$API/reports/general" -H "Authorization: Bearer $COLAB_TOKEN")
[[ "$S" == "403" ]] && pass "S2" "Colab GET /reports/general → $S" || fail "S2" "Colab GET /reports/general → $S (esperado 403)"

# S3 - Colab POST /ebi/1/close -> 403
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/ebi/1/close" -H "Authorization: Bearer $COLAB_TOKEN" -H "Content-Type: application/json")
[[ "$S" == "403" ]] && pass "S3" "Colab POST /ebi/1/close → $S" || fail "S3" "Colab POST /ebi/1/close → $S (esperado 403)"

# S4 - Login senha errada -> 401
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@ebi.local&password=wrongpassword")
[[ "$S" == "401" ]] && pass "S4" "Login senha errada → $S" || fail "S4" "Login senha errada → $S (esperado 401)"

# S5 - Token inválido -> 401
S=$(curl -s -o /dev/null -w "%{http_code}" "$API/users" -H "Authorization: Bearer invalid.token.here")
[[ "$S" == "401" ]] && pass "S5" "Token inválido → $S" || fail "S5" "Token inválido → $S (esperado 401)"

# S6 - Admin GET /reports/general -> 403 (admin não tem acesso a relatórios!)
S=$(curl -s -o /dev/null -w "%{http_code}" "$API/reports/general" -H "Authorization: Bearer $ADMIN_TOKEN")
[[ "$S" == "403" ]] && pass "S6a" "Admin GET /reports/general → $S (bloqueado corretamente)" || fail "S6a" "Admin GET /reports/general → $S"

# S6b - Coord GET /reports/general -> 200
S=$(curl -s -o /dev/null -w "%{http_code}" "$API/reports/general" -H "Authorization: Bearer $COORD_TOKEN")
[[ "$S" == "200" ]] && pass "S6b" "Coord GET /reports/general → $S" || fail "S6b" "Coord GET /reports/general → $S (esperado 200)"

# S7 - Colab POST /ebi (criar) -> 403
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/ebi" \
  -H "Authorization: Bearer $COLAB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ebi_date":"2026-02-28","group_number":1,"coordinator_id":1,"collaborator_ids":[]}')
[[ "$S" == "403" ]] && pass "S7" "Colab POST /ebi → $S" || fail "S7" "Colab POST /ebi → $S (esperado 403)"

# S8 - Colab POST /ebi/:id/reopen -> 403
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/ebi/1/reopen" \
  -H "Authorization: Bearer $COLAB_TOKEN" \
  -H "Content-Type: application/json")
[[ "$S" == "403" ]] && pass "S8" "Colab POST /ebi/1/reopen → $S" || fail "S8" "Colab POST /ebi/1/reopen → $S (esperado 403)"

# S9 - Checkout com PIN errado -> 403
EBI_LIST=$(curl -s "$API/ebi?page=1" -H "Authorization: Bearer $COORD_TOKEN")
EBI_ID=$(echo $EBI_LIST | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['items'][0]['id'] if d.get('items') else '')" 2>/dev/null)
echo ""
echo "EBI ID para teste: $EBI_ID"
if [ -n "$EBI_ID" ]; then
  EBI_DETAIL=$(curl -s "$API/ebi/$EBI_ID" -H "Authorization: Bearer $COORD_TOKEN")
  PRESENCE_ID=$(echo $EBI_DETAIL | python3 -c "import sys,json; d=json.load(sys.stdin); p=d.get('presences',[]); print(p[0]['id'] if p else '')" 2>/dev/null)
  if [ -n "$PRESENCE_ID" ]; then
    S=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/ebi/presence/$PRESENCE_ID/checkout" \
      -H "Authorization: Bearer $COORD_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"pin_code":"0000"}')
    [[ "$S" == "403" || "$S" == "409" ]] && pass "S9" "Checkout PIN errado → $S" || fail "S9" "Checkout PIN errado → $S (esperado 403/409)"
  else
    echo "⚠️  S9 – Nenhuma presença ativa encontrada para testar PIN errado"
  fi
fi

# Check admin can create EBI (not restricted)
S=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/ebi" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ebi_date":"2026-03-01","group_number":1,"coordinator_id":1,"collaborator_ids":[]}')
echo ""
echo "Admin POST /ebi → $S (esperado 403 ou 409 se lógica bloqueia admin)"

echo ""
echo "══════════════════════════════════════════════"
echo " Verificações concluídas"
echo "══════════════════════════════════════════════"
