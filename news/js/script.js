$(document).ready(function() {
    var num_news = 0;
    var responseData = [
        0, []
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
        var ind = 0;
        while (true) {
            ind++;
            var path = "tag/" + ind.toString() + '/Info.txt';
            await fetchTXT(path);
            if (voidFolder) {
                break;
            } else {
                let tmp_obj = {
                    tittle: RdrRes.split('\n')[0],
                    date: RdrRes.split('\n')[1]
                };
                responseData[1][ind - 1] = tmp_obj;
            }
        }
        responseData[0] = ind - 1;
        for (var i = 1; i < ind; i++) {
            var path = "tag/" + i.toString() + '/Image.jpg';
            await fetchIMG(path);
            responseData[1][i - 1].tag_img = RdrRes;
        }
        num_news = responseData[0];
        var elle_px = 600; //竖直高度
        var hori_px = 800; //水平宽度
        $(".news-area").height((num_news - 0) * (elle_px + 50) + 50);
        for (var k = 0; k < num_news; k++) {
            (function(i) {
                var index = i + 1;
                var title = responseData[1][i].tittle;
                var date = responseData[1][i].date;
                var image = responseData[1][i].tag_img;
                var newDiv = $("<div>");
                var cur_id = "news-box" + index.toString();
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
                        "background-color": "rgba(64,64,64,0.6)",
                        "font-size": "36px",
                        "color": "white",
                        "text-align": "center",
                        "line-height": "80px",
                        "padding-top": "200px",
                        "transition": "background-color 0.5s"
                    }).html(title + "<br> <br>" + date);
                cov_div.hover(
                    function() {
                        $(this).queue(function(next) { // 延迟500毫秒
                            $(this).css("background-color", "rgba(64,64,64,0)"); // 添加动画效果
                            $(this).css("color", "transparent");
                            next();
                        });
                    },
                    function() {
                        $(this).css("background-color", "rgba(64,64,64,0.6)"); // 恢复初始背景色
                        $(this).css("color", "white");
                        $(this).css("cursor", "pointer");

                    }
                );
                newDiv.hover(
                    function() {
                        $(this).css("cursor", "pointer");
                    }
                );
                $(".news-area").append(newDiv);
                $(".news-area").append(cov_div);
                cov_div.click(function() {
                    window.location.href = "./sources/" + index.toString() + ".html"; // 将 "页面a的URL" 替换为你想要跳转的页面的URL
                });
            })(k);
        }
    }
    MAIN();
});