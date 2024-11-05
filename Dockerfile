# 使用 nginx 作为基础镜像
FROM nginx:1.27.0


COPY dist/ /usr/share/nginx/html

# 使用容器内的默认 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露容器端口
EXPOSE 80

# 启动 nginx 服务
CMD ["nginx", "-g", "daemon off;"]
