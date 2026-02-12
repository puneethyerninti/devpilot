# // GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
FROM node:20-bullseye AS base

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml ./
COPY backend ./backend
COPY worker ./worker
COPY frontend ./frontend

RUN pnpm install

ARG APP_DIR=backend
ARG START_SCRIPT=dev
ENV APP_DIR=${APP_DIR}
ENV START_SCRIPT=${START_SCRIPT}
WORKDIR /workspace/${APP_DIR}

EXPOSE 4000

CMD ["sh", "-c", "pnpm ${START_SCRIPT}"]
