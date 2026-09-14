FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=7860
WORKDIR /app
COPY --chown=node:node package.json server.mjs ./
COPY --chown=node:node dist ./dist
COPY --chown=node:node providers ./providers
USER node
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:7860/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
