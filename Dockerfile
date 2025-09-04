FROM node:18-alpine

WORKDIR /app

# Copy everything first, then install from server directory
COPY . .

# Change to server directory and install dependencies
WORKDIR /app/server
RUN npm install --production

EXPOSE 3001

CMD ["npm", "start"]
