# 使用官方的 nginx 镜像
FROM nginx:alpine

# 拷贝静态页面资源
COPY dist/ /usr/share/nginx/html/

# 拷贝自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80