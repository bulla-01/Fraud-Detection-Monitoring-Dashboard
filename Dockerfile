# Use Nginx base image
FROM nginx:stable-alpine

# Nginx it listens on port 8001)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets and HTML files
COPY ./html/ /usr/share/nginx/html/
COPY ./Images /usr/share/nginx/html/images
COPY ./styles /usr/share/nginx/html/styles
#COPY ./html/favicon.ico /usr/share/nginx/html/favicon.ico

# Expose port 8001 as per custom config
EXPOSE 8001

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
