FROM node:18.20.4

# Create app directory
WORKDIR /usr/src/app
COPY backend/package*.json ./

# Enable Corepack to make Yarn available globally
RUN corepack enable

COPY backend .
RUN yarn install

# Copy GCP cloud proxy
COPY --from=gcr.io/cloudsql-docker/gce-proxy /cloud_sql_proxy /cloudsql/cloud_sql_proxy

RUN yarn build

ENV PATH="/root/.local/bin:$PATH"

EXPOSE 3000
ENTRYPOINT ["yarn"]