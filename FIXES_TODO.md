# Correções Pendentes

## Segurança - Validação de Token

**Problema:** Não permitir usar token de outro usuário enviando accountId qualquer

**Descrição:** A verificação tem que ser feita de ambos para ver se bate account id com token. Atualmente é possível usar o token de um usuário com o accountId de outro, o que representa uma falha de segurança.

**Solução proposta:** Implementar validação que verifique se o accountId fornecido na requisição corresponde ao accountId do token JWT decodificado.

## Validação de Account ID

**Problema:** Fazer verificação se account ID é válido

**Descrição:** Necessário implementar validação para verificar se o accountId fornecido é válido e existe no sistema antes de processar requisições.