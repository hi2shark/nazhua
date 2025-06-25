FROM nginx:1.27-alpine

COPY ./dist /home/wwwroot/html
COPY ./nginx-default.conf.template /etc/nginx/templates/default.conf.template

ENV DOMAIN=_

# 暴露端口
EXPOSE 80
