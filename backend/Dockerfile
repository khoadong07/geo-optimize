FROM node:22-alpine
WORKDIR /app

# geo-optimizer-skill (https://github.com/Auriti-Labs/geo-optimizer-skill) —
# invoked as a subprocess by SiteAuditService for the Gap & Citation audit.
# Installed into its own venv so it never touches Alpine's system Python.
RUN apk add --no-cache python3 py3-pip && \
    python3 -m venv /opt/geo-venv && \
    /opt/geo-venv/bin/pip install --no-cache-dir geo-optimizer-skill
ENV PATH="/opt/geo-venv/bin:${PATH}"

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start:dev"]
