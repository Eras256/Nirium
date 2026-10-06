# ═══════════════════════════════════════════════════════════════
# Nirium Contracts — Makefile
# ═══════════════════════════════════════════════════════════════

.PHONY: build test deploy-testnet clean fmt check

build:
	soroban contract build
	@echo "✓ Contracts built → target/wasm32-unknown-unknown/release/"

test:
	cargo test
	@echo "✓ All tests passed"

deploy-testnet:
	@test -n "$(STELLAR_SECRET_KEY)" || (echo "Error: STELLAR_SECRET_KEY not set" && exit 1)
	@test -n "$(STELLAR_PUBLIC_KEY)" || (echo "Error: STELLAR_PUBLIC_KEY not set" && exit 1)
	bash deploy.sh

clean:
	cargo clean
	@echo "✓ Build artifacts cleaned"

fmt:
	cargo fmt
	@echo "✓ Code formatted"

check:
	cargo clippy -- -D warnings
	@echo "✓ Clippy checks passed"

# Optimize WASM for smallest binary size
optimize: build
	@echo "Optimizing WASM binaries..."
	@if command -v wasm-opt > /dev/null; then \
		wasm-opt -Oz target/wasm32-unknown-unknown/release/nirium_contracts.wasm \
			-o target/wasm32-unknown-unknown/release/nirium_contracts.optimized.wasm; \
		echo "✓ Optimized WASM binary created"; \
	else \
		echo "⚠ wasm-opt not found. Install binaryen for optimization."; \
	fi
