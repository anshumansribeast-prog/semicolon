# Semicolon is a static site (no build step, no server code), so all
# this image needs is a small web server to hand out the files.
# nginx:alpine is ~40MB and is the standard choice for that job.
FROM nginx:alpine

# nginx's default config already serves /usr/share/nginx/html on port 80.
# We only override it to point 404s at the site's own 404.html instead
# of nginx's generic error page.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the site itself in. .dockerignore keeps .git, .env, and docs out.
COPY . /usr/share/nginx/html

EXPOSE 80

# nginx:alpine's base image already runs nginx in the foreground as the
# container's main process — nothing else to start here.
