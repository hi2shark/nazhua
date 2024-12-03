FROM nginx:1.27.3

COPY ./dist /home/wwwroot/html
COPY ./nginx-default.conf.template /etc/nginx/templates/default.conf.template
