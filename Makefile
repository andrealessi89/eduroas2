.PHONY: help
help:
	@echo "Comandos disponíveis:"
	@echo "  make up        - Inicia o banco de dados PostgreSQL"
	@echo "  make down      - Para o banco de dados"
	@echo "  make logs      - Mostra os logs do banco"
	@echo "  make db-clean  - Remove o banco e volumes (CUIDADO: apaga todos os dados)"
	@echo "  make migrate   - Executa as migrations do Prisma"
	@echo "  make studio    - Abre o Prisma Studio"
	@echo "  make dev       - Inicia o servidor de desenvolvimento"
	@echo "  make setup     - Configuração inicial completa"

.PHONY: up
up:
	docker-compose up -d
	@echo "Aguardando o banco iniciar..."
	@sleep 5
	@echo "Banco de dados PostgreSQL iniciado!"
	@echo "Connection string: postgresql://sistemaedu:sistemaedu123@localhost:5432/sistemaedu_db"

.PHONY: down
down:
	docker-compose down

.PHONY: logs
logs:
	docker-compose logs -f postgres

.PHONY: db-clean
db-clean:
	docker-compose down -v
	@echo "Banco de dados e volumes removidos!"

.PHONY: migrate
migrate:
	cd sistemaedu && npx prisma migrate dev

.PHONY: studio
studio:
	cd sistemaedu && npx prisma studio

.PHONY: dev
dev:
	cd sistemaedu && npm run dev

.PHONY: setup
setup: up
	@echo "Aguardando banco de dados..."
	@sleep 10
	cd sistemaedu && npx prisma migrate dev --name init
	@echo "Setup completo! Execute 'make dev' para iniciar o servidor"