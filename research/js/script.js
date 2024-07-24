$(document).ready(function() {
    var responseData = [
        0, []
    ];
    //获取文件内容
    async function fetchFile(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.text();
    }
    async function fetchImage(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    //打包单一文件夹数据
    async function fetchFolderData(folderIndex0) {
        var folderIndex = folderIndex0;
        const infoUrl = `tag/${folderIndex}/Info.txt`;
        const imageUrl = `tag/${folderIndex}/Image.jpg`;
        const [infoContent, imageBase64] = await Promise.all([
            fetchFile(infoUrl),
            fetchImage(imageUrl),
        ]);
        return {
            tittle: infoContent.split("\r\n")[0],
            date: infoContent.split("\r\n")[1],
            tag_img: imageBase64,
            no: folderIndex,
        };
    }
    //打包所有文件夹数据
    async function fetchAllFoldersData() {
        let num = responseData[0];
        const folderIndices = Array.from({ length: num }, (_, i) => i + 1);
        const folderPromises = folderIndices.map(fetchFolderData);
        return Promise.all(folderPromises);
    }
    async function MAIN() {
        //获取项目数量
        responseData[0] = Number(await fetchFile('tag/cnt.txt'));
        //获取内容
        var data_tmp = await fetchAllFoldersData();
        //归类
        responseData[1] = data_tmp;
        //排序
        responseData[1].sort((a, b) => a.no - b.no);
        var num_news = responseData[0];
        var elle_px = 550; //竖直高度
        var hori_px = 1090; //水平宽度
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
                        "color": "white",
                        "text-align": "left",
                        "line-height": "40px",
                        "padding-top": "150px",
                        "padding-left": "150px",
                        "transition": "background-color 0.5s"
                    }).html("<p style=\"font-size:52px\">" + title + "</p><br><br><p style=\"font-size:32px; font-family: Georgia, 'Times New Roman', Times, serif\">" + date + "</p>");
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