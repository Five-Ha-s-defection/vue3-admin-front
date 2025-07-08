# 使用官方 Nginx 镜像
FROM nginx:latest

# 删除默认 nginx 页面
RUN rm -rf /usr/share/nginx/html/*

# 拷贝打包后的前端文件到 nginx 的 html 目录
COPY dist/ /usr/share/nginx/html/

# 拷贝你自定义的 nginx 配置文件（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
