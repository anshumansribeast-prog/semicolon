# Site on nginx:80. Ada's Python bridge listens on 127.0.0.1:8420 and
# nginx proxies /api/ada there. Pair with docker-compose.yml so Ollama
# is on the same Docker network (OLLAMA_URL=http://ollama:11434/...).
FROM nginx:alpine

RUN apk add --no-cache python3

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/40-start-ada.sh /docker-entrypoint.d/40-start-ada.sh
RUN chmod +x /docker-entrypoint.d/40-start-ada.sh

COPY ada_server.py /opt/ada/ada_server.py
COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/ada_server.py \
           /usr/share/nginx/html/docker \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/docker-compose.yml \
           /usr/share/nginx/html/.github

EXPOSE 80
