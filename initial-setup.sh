
#!/bin/bash

# Configurar git globalmente se ainda não estiver configurado
git config --global user.name "Smart Money Sniper Bot"
git config --global user.email "bot@smartmoneysniper.com"

# Inicializar o repositório se ainda não foi feito
git init

# Adicionar todos os arquivos do projeto
git add .

# Fazer o primeiro commit
git commit -m "Initial commit: Smart Money Sniper Bot project setup"

# IMPORTANTE: Substitua <REPOSITORY_URL> pela URL do seu repositório GitHub
# Exemplo: https://github.com/seu-usuario/smart-money-sniper-bot.git
git remote add origin <REPOSITORY_URL>

# Fazer push para o repositório remoto
git push -u origin main

echo "Repositório preparado e enviado para o GitHub!"

