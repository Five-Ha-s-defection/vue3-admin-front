# 使用官方的 Nginx 镜像作为基础镜像
FROM nginx:latest

# 拷贝本地的 nginx.conf 到容器内的 /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# 拷贝本地的 html 文件到容器内的 /usr/share/nginx/html
COPY html /usr/share/nginx/html

# 暴露80端口
EXPOSE 80