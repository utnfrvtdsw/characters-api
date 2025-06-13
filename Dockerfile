# MongoDB Dockerfile
FROM mongo:latest

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME admin
ENV MONGO_INITDB_ROOT_PASSWORD admin

# Create data directory
VOLUME /data/db

# Expose MongoDB port
EXPOSE 27017

# Start MongoDB
CMD ["mongod"]