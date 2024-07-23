$(document).ready(function() {
    // 定义一个函数，用于获取图片信息并保存到数组中
    var responseData = [
        [],
        [
            [],
            []
        ]
    ];
    var voidFolder = false;
    var RdrRes;
    async function fetchTXT(folderName) {
        try {
            // 使用fetch获取图片的base64内容
            var response = await fetch(folderName);
            if (response.ok) {
                voidFolder = false;
            } else {
                voidFolder = true;
            }
            RdrRes = await response.text();
        } catch (error) {
            console.error(error);
        }
    }
    async function fetchIMG(folderName) {
        try {
            // 使用fetch获取图片的base64内容
            var response = await fetch(folderName);
            var base64Image;
            if (response.ok) {
                voidFolder = false;
            } else {
                voidFolder = true;
            }
            var blob = await response.blob();
            // 使用FileReader读取Blob，并将其转换为BASE64编码
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            // 等待FileReader完成读取
            await new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    base64Image = reader.result;
                    resolve();
                };
                reader.onerror = reject;
            });
            RdrRes = base64Image;
        } catch (error) {
            console.error(error);
        }
    }
    async function MAIN() {
        var ind = [0, 0];
        //获取lab
        while (true) {
            ind[0]++;
            var path = 'tag/lab/' + ind[0].toString() + '/info.txt';
            await fetchTXT(path);
            if (voidFolder) {
                break;
            } else {
                let tmp_obj = {
                    tittle: RdrRes
                };
                responseData[1][0][ind[0] - 1] = tmp_obj;
            }
        }
        responseData[0][0] = ind[0] - 1;
        for (var i = 1; i < ind[0]; i++) {
            var path = 'tag/lab/' + i.toString() + '/Image.jpg';
            await fetchIMG(path);
            responseData[1][0][i - 1].tag_img = RdrRes;
        }
        //获取daily
        while (true) {
            ind[1]++;
            var path = 'tag/daily/' + ind[1].toString() + '/info.txt';
            await fetchTXT(path);
            if (voidFolder) {
                break;
            } else {
                let tmp_obj = {
                    tittle: RdrRes
                };
                responseData[1][1][ind[1] - 1] = tmp_obj;
            }
        }
        responseData[0][1] = ind[1] - 1;
        for (var i = 1; i < ind[1]; i++) {
            var path = 'tag/daily/' + i.toString() + '/Image.jpg';
            await fetchIMG(path);
            responseData[1][1][i - 1].tag_img = RdrRes;
        }
        //continue
        var num_news = responseData[0];
        var elle_px = 600; //竖直高度
        var hori_px = 800; //水平宽度
        for (var j = 0; j < 2; j++) {
            var con_name = "";
            if (j == 0) {
                con_name = ".news-area1";
            } else {
                con_name = ".news-area2";
            }
            $(con_name).height((num_news[j] - 0) * (elle_px + 50) + 50);
            for (var i = 0; i < num_news[j]; i++) {
                var index = i + 1;
                var title = responseData[1][j][i].tittle;
                var image = responseData[1][j][i].tag_img;
                var newDiv = $("<div>");
                var cur_id = "news-box" + j.toString() + index.toString();
                var cur_top = ((index - 1) * (elle_px + 50) + 50).toString() + "px";
                newDiv.attr("id", cur_id)
                    .css({
                        "position": "absolute",
                        "top": cur_top,
                        "left": "50%",
                        "margin-left": Math.floor((0 - hori_px) / 2).toString() + "px",
                        "display": "inline-block",
                        "width": hori_px.toString() + "px",
                        "height": elle_px.toString() + "px",
                        "background-size": "cover",
                    });
                newDiv.css("background-image", "url(" + image + ")");
                var cov_div = $("<div>");
                cov_div.attr("class", "div-cov")
                    .css({
                        "position": "absolute",
                        "top": cur_top,
                        "left": "50%",
                        "margin-left": Math.floor((0 - hori_px) / 2).toString() + "px",
                        "display": "inline-block",
                        "width": hori_px.toString() + "px",
                        "height": elle_px.toString() + "px",
                        "background-color": "rgba(0,0,0,0.5)",
                        "font-size": "36px",
                        "color": "white",
                        "text-align": "center",
                        "line-height": "80px",
                        "padding-top": "200px",
                        "transition": "background-color 0.5s"
                    }).html(title);
                $(con_name).append(newDiv);
                $(con_name).append(cov_div);
                cov_div.hover(
                    function() {
                        $(this).queue(function(next) { // 延迟500毫秒
                            $(this).css("background-color", "rgba(0,0,0,0)"); // 添加动画效果
                            $(this).css("color", "transparent");
                            next();
                        });
                    },
                    function() {
                        $(this).css("background-color", "rgba(0,0,0,0.5)"); // 恢复初始背景色
                        $(this).css("color", "white");
                        $(this).css("cursor", "pointer");
                    }
                );
            }
        }
    }
    MAIN();
});