.PHONY: install dev backend frontend test lint format e2e codegen

install:
	cd backend && uv sync --group dev
	cd frontend && npm install

backend:
	cd backend && uv run fastapi dev src/backend/main.py --port 8000

frontend:
	cd frontend && npm run dev

dev:
	@echo "Start backend and frontend in two terminals:"
	@echo "  make backend"
	@echo "  make frontend"

test:
	cd backend && uv run pytest
	cd frontend && npm test

lint:
	cd backend && uv run ruff check src tests
	cd frontend && npm run lint

format:
	cd backend && uv run ruff format src tests
	cd frontend && npm run format

e2e:
	cd frontend && npx playwright install chromium && npm run test:e2e

codegen:
	cd frontend && npm run codegen:api
