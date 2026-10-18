# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.1] - 2026-10-18

Release só de documentação, para o README final chegar à `main`. Não há mudança de código.

### Alterado

- **README final**: arquitetura na AWS (parágrafo e diagrama), o que ficou de fora, limitações conhecidas, próximos passos e histórico do Git flow. ([#13](https://github.com/marianeors/reserva-salas/pull/13))

## [1.1.0] - 2026-10-18

Duração máxima de reserva definida por sala.

### Adicionado

- **Duração máxima por sala (SALA-6)**: cada sala tem sua própria duração máxima de reserva, de 15 min a 8 h, editável pelo admin e exibida no card e na página da sala. Salas existentes começam com 4 h. ([#8](https://github.com/marianeors/reserva-salas/pull/8))

### Alterado

- O limite fixo de 4 h por reserva foi substituído pelo limite de cada sala. A regra de horário comercial da 1.0.1 continua valendo junto com ele. ([#10](https://github.com/marianeors/reserva-salas/pull/10))

## [1.0.1] - 2026-10-18

Hotfix para um incidente em produção.

### Corrigido

- **Horário comercial (SALA-5)**: reservas só podem acontecer em dias úteis (segunda a sexta), das 08h às 20h, no horário de Brasília. Antes era possível reservar em fins de semana e a qualquer hora. ([#9](https://github.com/marianeors/reserva-salas/pull/9))

## [1.0.0] - 2026-10-18

Primeira versão: listagem, reserva e cancelamento de salas, com administração de salas.

### Adicionado

- **Setup do projeto (SALA-0)**: Next.js 16 com TypeScript strict, Prisma 7 + SQLite com migrations, seed idempotente (setup em 3 comandos), Vitest e CI no GitHub Actions com lint, typecheck, testes e build. ([#1](https://github.com/marianeors/reserva-salas/pull/1))
- **Listagem de salas (SALA-1)**: filtros por capacidade mínima e por recursos, guardados na URL. ([#2](https://github.com/marianeors/reserva-salas/pull/2))
- **Reserva de sala (SALA-2)**: login fake "Entrar como" e reserva com validação no servidor. Não aceita sobreposição na mesma sala, reserva no passado nem duração fora do intervalo de 15 min a 4 h. ([#3](https://github.com/marianeors/reserva-salas/pull/3))
- **Minhas reservas (SALA-3)**: lista das próximas reservas e do histórico; cada usuário cancela apenas as próprias reservas que ainda não começaram. ([#4](https://github.com/marianeors/reserva-salas/pull/4))
- **Admin de salas (SALA-4)**: cadastro, edição e desativação de salas. Usuários comuns não acessam a área, nem pela URL. ([#5](https://github.com/marianeors/reserva-salas/pull/5))
- **Observabilidade**: logs estruturados em JSON para eventos de negócio e registro de erros inesperados do servidor. ([#3](https://github.com/marianeors/reserva-salas/pull/3))

[1.1.1]: https://github.com/marianeors/reserva-salas/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/marianeors/reserva-salas/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/marianeors/reserva-salas/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/marianeors/reserva-salas/releases/tag/v1.0.0
