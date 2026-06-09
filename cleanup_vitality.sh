#!/bin/bash
# =============================================================
# SCRIPT DE LIMPIEZA - VITALITY
# Ejecutar desde la raíz del proyecto: bash cleanup_vitality.sh
# =============================================================

set -e  # Detener si algo falla

PROJECT_ROOT="$(pwd)"
ARCHIVE_DIR="$PROJECT_ROOT/_archive"

echo "=================================================="
echo "  VITALITY - Limpieza y reorganización del repo"
echo "  Raíz del proyecto: $PROJECT_ROOT"
echo "=================================================="
echo ""

# ---------------------------------------------------------
# PASO 0: Verificar que estamos en la raíz correcta
# ---------------------------------------------------------
if [ ! -f "package.json" ]; then
  echo "❌ ERROR: No se encontró package.json."
  echo "   Asegúrate de correr este script desde la raíz de Vitality-main/"
  exit 1
fi

echo "✅ package.json encontrado. Continuando..."
echo ""

# ---------------------------------------------------------
# PASO 1: Crear carpeta _archive (para archivos problemáticos)
# ---------------------------------------------------------
echo "📦 Creando carpeta _archive..."
mkdir -p "$ARCHIVE_DIR"
echo "   → _archive/ creada"
echo ""

# ---------------------------------------------------------
# PASO 2: 🔴 CRÍTICO - Token de GitHub
# ---------------------------------------------------------
echo "🔴 [CRÍTICO] Buscando archivos de token expuesto..."

TOKEN_FILES=("token de github" "token_de_github" "github_token" "github token")
for f in "${TOKEN_FILES[@]}"; do
  if [ -f "$PROJECT_ROOT/$f" ]; then
    mv "$PROJECT_ROOT/$f" "$ARCHIVE_DIR/"
    echo "   ⚠️  '$f' movido a _archive/"
    echo "   ⚠️  IMPORTANTE: Revoca y regenera este token en:"
    echo "      GitHub → Settings → Developer settings → Personal access tokens"
  fi
done

# También buscar en subdirectorios
find "$PROJECT_ROOT" -maxdepth 2 -iname "*token*github*" -o -iname "*github*token*" 2>/dev/null | while read -r f; do
  if [[ "$f" != *"_archive"* ]] && [[ "$f" != *".git"* ]]; then
    mv "$f" "$ARCHIVE_DIR/"
    echo "   ⚠️  '$f' movido a _archive/ (token encontrado)"
  fi
done

echo ""

# ---------------------------------------------------------
# PASO 3: 🔴 server.js duplicado en la raíz
# ---------------------------------------------------------
echo "🔴 [DUPLICADO] Verificando server.js en raíz vs backend/..."

if [ -f "$PROJECT_ROOT/server.js" ] && [ -f "$PROJECT_ROOT/backend/server.js" ]; then
  mv "$PROJECT_ROOT/server.js" "$ARCHIVE_DIR/server.js.OLD_ROOT"
  echo "   → server.js de la RAÍZ movido a _archive/server.js.OLD_ROOT"
  echo "   → backend/server.js conservado como servidor principal"
elif [ -f "$PROJECT_ROOT/server.js" ] && [ ! -f "$PROJECT_ROOT/backend/server.js" ]; then
  echo "   ⚠️  Solo existe server.js en la raíz (no hay backend/server.js)"
  echo "   → No se mueve. Revisa manualmente."
else
  echo "   → Sin conflicto, server.js ya está solo en backend/"
fi

echo ""

# ---------------------------------------------------------
# PASO 4: 🟠 Rutas IA duplicadas (ia.js vs ia-1.js)
# ---------------------------------------------------------
echo "🟠 [DUPLICADO] Verificando rutas de IA..."

IA_PATH="$PROJECT_ROOT/backend/routes"
IA1="$IA_PATH/ia.js"
IA2="$IA_PATH/ia-1.js"

if [ -f "$IA1" ] && [ -f "$IA2" ]; then
  # Comparar tamaños para dar una pista
  SIZE1=$(wc -c < "$IA1")
  SIZE2=$(wc -c < "$IA2")
  echo "   ia.js   → $SIZE1 bytes"
  echo "   ia-1.js → $SIZE2 bytes"
  
  # El más grande suele ser el más completo/nuevo
  if [ "$SIZE2" -gt "$SIZE1" ]; then
    mv "$IA1" "$ARCHIVE_DIR/ia.js.OLD"
    # Renombrar ia-1.js a ia.js
    mv "$IA2" "$IA_PATH/ia.js"
    echo "   → ia-1.js era más grande: renombrado a ia.js (nuevo principal)"
    echo "   → ia.js antiguo movido a _archive/ia.js.OLD"
    echo "   ⚠️  Verifica en backend/server.js que el require sea: require('./routes/ia')"
  else
    mv "$IA2" "$ARCHIVE_DIR/ia-1.js.OLD"
    echo "   → ia.js era más grande o igual: conservado como principal"
    echo "   → ia-1.js movido a _archive/ia-1.js.OLD"
  fi
else
  echo "   → Sin duplicado detectado"
fi

echo ""

# ---------------------------------------------------------
# PASO 5: 🟡 script copy.js - archivo copia
# ---------------------------------------------------------
echo "🟡 [LIMPIEZA] Buscando archivos copia de script..."

SCRIPT_COPY_FILES=("public/script copy.js" "public/script_copy.js" "public/script-copy.js")
for f in "${SCRIPT_COPY_FILES[@]}"; do
  if [ -f "$PROJECT_ROOT/$f" ]; then
    mv "$PROJECT_ROOT/$f" "$ARCHIVE_DIR/"
    echo "   → '$f' movido a _archive/"
  fi
done

# Búsqueda más amplia por si tiene otro nombre
find "$PROJECT_ROOT/public" -maxdepth 1 -name "* copy*" -o -name "*_copy*" -o -name "*backup*" 2>/dev/null | while read -r f; do
  if [[ "$f" != *"_archive"* ]]; then
    mv "$f" "$ARCHIVE_DIR/"
    echo "   → '$f' movido a _archive/ (archivo copia detectado)"
  fi
done

echo ""

# ---------------------------------------------------------
# PASO 6: 🟢 Archivos sueltos en la raíz (notas, .txt)
# ---------------------------------------------------------
echo "🟢 [ORDEN] Moviendo archivos de notas sueltos..."

mkdir -p "$PROJECT_ROOT/docs"

LOOSE_FILES=("notas" "proyecto_vitality.txt" "notas.txt")
for f in "${LOOSE_FILES[@]}"; do
  if [ -f "$PROJECT_ROOT/$f" ]; then
    mv "$PROJECT_ROOT/$f" "$PROJECT_ROOT/docs/"
    echo "   → '$f' movido a docs/"
  fi
done

echo ""

# ---------------------------------------------------------
# PASO 7: Actualizar .gitignore
# ---------------------------------------------------------
echo "📝 Actualizando .gitignore..."

GITIGNORE="$PROJECT_ROOT/.gitignore"

# Entradas que deben estar sí o sí
ENTRIES=(
  "# Archivos sensibles"
  "*token*"
  "*github_token*"
  "token de github"
  ""
  "# Archivos temporales y copias"
  "*copy.js"
  "*_copy.js"
  "*.OLD"
  "*.OLD_ROOT"
  ""
  "# Carpeta de archivos archivados"
  "_archive/"
  ""
  "# Notas locales"
  "docs/notas"
  "docs/proyecto_vitality.txt"
)

echo "" >> "$GITIGNORE"
echo "# ---- Agregado por cleanup_vitality.sh ----" >> "$GITIGNORE"
for entry in "${ENTRIES[@]}"; do
  # Solo agregar si no existe ya
  if ! grep -qF "$entry" "$GITIGNORE" 2>/dev/null; then
    echo "$entry" >> "$GITIGNORE"
  fi
done

echo "   → .gitignore actualizado"
echo ""

# ---------------------------------------------------------
# PASO 8: Verificar package.json → script "start"
# ---------------------------------------------------------
echo "🔍 Verificando package.json → script start..."

if grep -q '"start"' "$PROJECT_ROOT/package.json"; then
  START_CMD=$(grep '"start"' "$PROJECT_ROOT/package.json" | head -1)
  echo "   → $START_CMD"
  
  if echo "$START_CMD" | grep -q "server.js"; then
    if ! echo "$START_CMD" | grep -q "backend/"; then
      echo "   ⚠️  ATENCIÓN: El start podría apuntar a server.js de la raíz (ya archivado)"
      echo "   → Verifica que package.json diga: \"start\": \"node backend/server.js\""
    else
      echo "   ✅ start apunta a backend/server.js — correcto"
    fi
  fi
else
  echo "   ⚠️  No se encontró script 'start' en package.json"
fi

echo ""

# ---------------------------------------------------------
# RESUMEN FINAL
# ---------------------------------------------------------
echo "=================================================="
echo "  ✅ LIMPIEZA COMPLETADA"
echo "=================================================="
echo ""
echo "📁 Archivos movidos a _archive/:"
ls "$ARCHIVE_DIR" 2>/dev/null || echo "   (ninguno)"
echo ""
echo "📁 Archivos movidos a docs/:"
ls "$PROJECT_ROOT/docs" 2>/dev/null || echo "   (ninguno)"
echo ""
echo "⚠️  ACCIONES MANUALES PENDIENTES:"
echo ""
echo "  1. URGENTE: Si había un token de GitHub en el repo:"
echo "     → Ve a github.com → Settings → Developer settings"
echo "     → Personal access tokens → Revoca el token expuesto"
echo "     → Genera uno nuevo"
echo ""
echo "  2. Verifica package.json:"
echo "     → \"start\" debe apuntar a: node backend/server.js"
echo ""
echo "  3. Verifica backend/server.js:"
echo "     → require('./routes/ia') debe cargar el ia.js correcto"
echo ""
echo "  4. Haz commit de la limpieza:"
echo "     git add -A"
echo "     git commit -m 'chore: limpieza de archivos duplicados y sensibles'"
echo "     git push"
echo ""
echo "  5. script.js en public/ → migración a módulos js/ (siguiente paso)"
echo ""
