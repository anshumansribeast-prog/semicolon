# Site on nginx:80. Ada's Python bridge listens on 127.0.0.1:8420 and
# nginx proxies /api/ada there. Ada talks to an OpenAI-compatible API
# (Groq by default) — pass AI_API_KEY at deploy time.
FROM nginx:alpine

RUN apk add --no-cache python3

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/40-start-ada.sh /docker-entrypoint.d/40-start-ada.sh
RUN chmod +x /docker-entrypoint.d/40-start-ada.sh

COPY ada_server.py /opt/ada/ada_server.py
COPY ada_knowledge.py /opt/ada/ada_knowledge.py
COPY sitecustomize.py /opt/ada/sitecustomize.py
COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/ada_server.py \
           /usr/share/nginx/html/sitecustomize.py \
           /usr/share/nginx/html/docker \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/docker-compose.yml \
           /usr/share/nginx/html/.github

EXPOSE 80
