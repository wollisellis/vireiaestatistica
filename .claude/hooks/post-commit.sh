#!/bin/bash
# Hook para automação pós-commit

# Verifica se há alterações não commitadas
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Existem alterações não commitadas no repositório"
fi

# Log do commit
echo "✅ Commit realizado com sucesso: $(git log -1 --pretty=format:'%h - %s')"

# Sugestão automática de push
echo "💡 Para enviar as alterações para o repositório remoto, use: git push"