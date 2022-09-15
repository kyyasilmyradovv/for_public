const axios = require("axios");
exports.send_notification = async (notification) => {
  await axios({
    method: "post",
    url: "https://fcm.googleapis.com/fcm/send",
    headers: {
      Authorization:
        "key=" +
        "AAAA9y6asdS3o9:APA91bF0RasasddmvLGm6-NMvmy-NuLar29ZasdJk7asd9EtYMVsaGamVUqdAlfY-ziHkR5OIpM1Qasd7wC7Sna4VbzYTPypuL2vG7casd2qasd8olZo9Ly_Rw6oHj0asdN0JwdtCwYAXSOLvRB8asdFDY-cPZ_fiqLF9lL",
    },
    data: notification,
  });
};
