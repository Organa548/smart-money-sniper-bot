
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

# Adicionar o repositório remoto
git remote add origin https://github.com/Organa548/sniperproderiv.git

# Fazer push para o repositório remoto
git push -u origin main

echo "Repositório preparado e enviado para o GitHub!"
