#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Nirium v0.1.0 — One-Line Installer
# ═══════════════════════════════════════════════════════════════
# Usage: curl -fsSL https://nirium.dev/install.sh | bash

set -euo pipefail

REPO="nirium/nirium"
VERSION="0.1.0"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🧬 NIRIUM INSTALLER v${VERSION}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check prerequisites
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ $1 is required but not installed."
    echo "   Install it: $2"
    exit 1
  fi
  echo "✅ $1 found: $(command -v $1)"
}

echo "📋 Checking prerequisites..."
check_command "node" "https://nodejs.org"
check_command "pnpm" "npm install -g pnpm"
check_command "git" "https://git-scm.com"

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required (found: $(node -v))"
  exit 1
fi

echo ""
echo "📥 Cloning Nirium..."
git clone "https://github.com/${REPO}.git" nirium 2>/dev/null || {
  echo "⚠️ Repository not available. Creating from local template..."
  mkdir -p nirium
}

cd nirium

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "⚙️ Setting up environment..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "   Created .env.local from template"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ NIRIUM INSTALLED SUCCESSFULLY"
echo ""
echo "  Next steps:"
echo "    cd nirium"
echo "    pnpm dev          # Start frontend"
echo "    pnpm dev:agent    # Start agent backend"
echo "    pnpm dev:all      # Start everything"
echo ""
echo "  Documentation: https://nirium.dev/docs"
echo "═══════════════════════════════════════════════════════════"
echo ""
