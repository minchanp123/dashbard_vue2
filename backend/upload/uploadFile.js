var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var fs = require('fs-extra');
var multer = require('multer');

router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

var storage = multer.diskStorage({
    
    destination: function(req, file, cb) {
        const name = file.originalname;
        if (name.toLowerCase().includes('steel')) {
            cb(null, './public/pdf/iron/');
        } else if (name.toLowerCase().includes('bm')) {
            cb(null, './public/pdf/Non_iron/');
        } else {
            cb(null, './public/pdf/petrochemical/');
        }
    },
    filename: (req, file, cb) => {
        let newFileName = file.originalname;
        console.log('newFileName', newFileName);
        cb(null, newFileName);
    }
});

var uploadPdf = multer({storage: storage})

existDirectory();

function existDirectory() {
    const directoryCsv = fs.existsSync('./public/csv');
    const directoryPdf = fs.existsSync('./public/pdf');
    const directoryIron = fs.existsSync('./public/pdf/iron');
    const directoryNon_iron = fs.existsSync('./public/pdf/Non_iron');
    const directoryPetrochmical = fs.existsSync('./public/pdf/petrochemical');

    if (!directoryCsv) {
        console.log('csv 폴더 없음 > 생성');
        fs.mkdir('./public/csv');

        existDirectories();
    }

    if (!directoryPdf) {
        console.log('pdf 폴더 없음 > 생성');
        fs.mkdir('./public/pdf');

        existDirectories();
    }

    if (directoryPdf) {
        console.log('pdf 폴더 있음');

        existDirectories();
    }

    function existDirectories() {
        if (!directoryIron) {
            console.log('iron 폴더 없음 > 생성');
            fs.mkdir('./public/pdf/iron');
        } 
    
        if (!directoryNon_iron) {
            console.log('Non_iron 폴더 없음 > 생성');
            fs.mkdir('./public/pdf/Non_iron');
        } 
        
        if (!directoryPetrochmical) {
            console.log('petrochemical 폴더 없음 > 생성');
            fs.mkdir('./public/pdf/petrochemical');
        }
    }
}

router.post('/upload_csv', async function (req, res, next) {
    var successMessage = "전송 완료";
    var errMessage = "csv 양식 오류!! 수정 후 전송 부탁드립니다.";
    if (req.body.name.indexOf("csv") != -1) {

        let output = "./public/csv"
        var csv_header = JSON.stringify(req.body.csv).replace(/"/g, "").split("\\r\\n")[0];
        var csv_content = JSON.stringify(req.body.csv).replace(/"/g, "").split("\\r\\n")[1];

        if (!csv_content) {
            csv_content = JSON.stringify(req.body.csv).replace(/"/g, "").split("\\n")[1];
        }
        
        if (csv_header.indexOf("datetime,price,material,material_other") != -1) {
            var content_check = csv_content.split(",");
            if (content_check.length != 4) {
                res.send(errMessage + " material값 뒤에 \",\" 필요");
            } else {
                var c = content_check[0];
                if (c.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/) != null) {
                    c = content_check[1];
                    if (isNaN(c) == false) {
                        c = content_check[2];
                        if (c == "PC" || c == "HR" || c == "PP") {
                            c = content_check[3];
                            if(c == "" || c =="BPA"){
                                console.log("csv 생성 : " + output + "/" + req.body.name);
                                fs.writeFileSync(output + "/" + req.body.name, req.body.csv, 'utf8');
                                res.send(successMessage);
                            }else{
                                res.send(errMessage + " 부원자재 오류");
                            }
                        } else {
                            res.send(errMessage + " 원자재 입력 오류");
                        }
                    } else {
                        res.send(errMessage + " 가격값 입력 오류");
                    }
                } else {
                    res.send(errMessage + " 날짜 형식 오류");
                }
            }
            console.log(csv_content.split(",").length);
        } else {
            res.send(errMessage);
        }

    } else if (req.body.name.indexOf("pdf") != -1) {

    } else {
        res.send("파일 형식 오류 csv, pdf만 전송 가능합니다.");
    }
    
});

router.post('/upload_pdf', uploadPdf.single('pdf'), async function(req, res, next) {

    console.log('api 호출::', 'upload_pdf');
});

module.exports = router;