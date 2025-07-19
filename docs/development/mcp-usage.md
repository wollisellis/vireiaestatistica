# Uso de MCP Servers

## Configuração

Os MCP Servers estão configurados no arquivo `mcp-servers.json` na raiz do projeto. Este arquivo não é versionado (está no `.gitignore`).

## Como usar

Para usar o Claude Code com os MCPs configurados:

```bash
claude -p "Sua tarefa aqui" --mcp-config mcp-servers.json
```

## MCPs Disponíveis

1. **sequential-thinking**: Melhora o raciocínio sequencial do Claude
2. **filesystem**: Acesso aos diretórios Documents, Desktop, Downloads e Projects  
3. **puppeteer**: Automação de navegador
4. **fetch**: Requisições HTTP avançadas
5. **browser-tools**: Integração com Chrome DevTools

## Instalação alternativa via CLI

Se preferir adicionar MCPs individualmente:

```bash
# Sequential Thinking
claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking

# Filesystem Access
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem ~/Documents ~/Desktop ~/Downloads ~/Projects

# Puppeteer
claude mcp add puppeteer -s user -- npx -y @modelcontextprotocol/server-puppeteer

# Web Fetching  
claude mcp add fetch -s user -- npx -y @kazuph/mcp-fetch

# Browser Tools
claude mcp add browser-tools -s user -- npx -y @agentdeskai/browser-tools-mcp@1.2.1
```