FROM fusuf/whatsasena:latest

RUN git clone https://music-sir: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@github.com/music-sir/music-box /root/music-box
WORKDIR /root/music-box/
ENV TZ=Asia/Kolkata
RUN npm i -g pm2
RUN yarn install --ignore-engines

CMD ["node", "index.js"]
