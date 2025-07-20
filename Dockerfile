# Nginx base image
FROM nginx:stable-alpine

# Working directory
WORKDIR /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets and HTML files
COPY ./html/ ./
COPY ./Images ./images
COPY ./styles ./styles

# include favicon
# COPY ./html/favicon.ico ./favicon.ico

# Exposing port 8001
EXPOSE 8001

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
