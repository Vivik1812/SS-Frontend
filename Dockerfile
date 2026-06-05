FROM node:200-alpine AS buuild

WORKDIR /app 

COPY packag*.json ./
RUN npm run build 

COPY . .
RUN npm run build 

FROM nginx:alpine 

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]