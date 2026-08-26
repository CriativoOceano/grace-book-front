FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4200

# --host 0.0.0.0 pra ficar acessível fora do container; --poll porque bind
# mount do macOS/Windows não propaga eventos de filesystem nativos, então
# sem isso o live-reload do ng serve não percebe as mudanças.
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
