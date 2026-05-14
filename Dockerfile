FROM nginx:1.31-alpine-slim

COPY ./dist /home/wwwroot/html
COPY ./nginx-default.conf.template /etc/nginx/templates/default.conf.template

ENV DOMAIN=_

# 暴露端口
EXPOSE 80
