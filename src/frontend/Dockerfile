FROM node:18-alpine as build

USER node
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --omit=dev && npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
