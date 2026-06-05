FROM node:20-alpine AS build

WORKDIR /app 

ARG VITE_API_GW
ENV VITE_API_GW=$VITE_API_GW

COPY package*.json ./
RUN npm install 

COPY . .
RUN npm run build 

FROM nginx:alpine 

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]