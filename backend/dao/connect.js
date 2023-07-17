const dbConfig = require("../lib/db_config");
const mongoose = require("mongoose");

async function dbConnect() {
    mongoose
    .connect(dbConfig.dbUrl + "/" + dbConfig.dbName, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
    })
    .then(console.log("mongoDB connected..."))
    .catch((e) => console.error(e));

    // 몽구스 연결 에러 발생 시 에러내용 출력, 재연결
    mongoose.connection.on("error", (error) => {
    console.error("mongoDB connect error", error);
    });
}

module.exports = dbConnect;