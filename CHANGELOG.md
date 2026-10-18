# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-10-18

Primeira versão: listagem, reserva e cancelamento de salas, com administração de salas.

### Adicionado

- **Setup do projeto (SALA-0)**: Next.js 16 com TypeScript strict, Prisma 7 + SQLite com migrations, seed idempotente (setup em 3 comandos), Vitest e CI no GitHub Actions com lint, typecheck, testes e build. ([#1](https://github.com/marianeors/reserva-salas/pull/1))
- **Listagem de salas (SALA-1)**: filtros por capacidade mínima e por recursos, guardados na URL. ([#2](https://github.com/marianeors/reserva-salas/pull/2))
- **Reserva de sala (SALA-2)**: login fake "Entrar como" e reserva com validação no servidor. Não aceita sobreposição na mesma sala, reserva no passado nem duração fora do intervalo de 15 min a 4 h. ([#3](https://github.com/marianeors/reserva-salas/pull/3))
- **Minhas reservas (SALA-3)**: lista das próximas reservas e do histórico; cada usuário cancela apenas as próprias reservas que ainda não começaram. ([#4](https://github.com/marianeors/reserva-salas/pull/4))
- **Admin de salas (SALA-4)**: cadastro, edição e desativação de salas. Usuários comuns não acessam a área, nem pela URL. ([#5](https://github.com/marianeors/reserva-salas/pull/5))
- **Observabilidade**: logs estruturados em JSON para eventos de negócio e registro de erros inesperados do servidor. ([#3](https://github.com/marianeors/reserva-salas/pull/3))

[1.0.0]: https://github.com/marianeors/reserva-salas/releases/tag/v1.0.0
