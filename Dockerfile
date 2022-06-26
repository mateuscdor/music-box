FROM fusuf/whatsasena:latest

RUN git clone https://music-sir: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@github.com/music-sir/music-box /root/music-box
WORKDIR /root/music-box/
ENV TZ=Asia/Kolkata
RUN npm i -g pm2
RUN yarn install --ignore-engines

CMD ["node", "index.js"]
