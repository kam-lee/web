$(document).ready(function() {
    // 定义一个函数，用于获取图片信息并保存到数组中
    var responseData = [
        [],
        [
            [],
            []
        ]
    ];
    var pre_path = ["tag/lab/", "tag/daily/"];
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
        var sum_tmp = 0;
        var pre_ind = 0;
        while (folderIndex0 > sum_tmp) {
            pre_ind++;
            sum_tmp += responseData[0][pre_ind - 1];
        }
        var folderIndex = folderIndex0 - (sum_tmp - responseData[0][pre_ind - 1]);
        const infoUrl = `${pre_path[pre_ind-1]}${folderIndex}/Info.txt`;
        const imageUrl = `${pre_path[pre_ind-1]}${folderIndex}/Image.jpg`;
        const [infoContent, imageBase64] = await Promise.all([
            fetchFile(infoUrl),
            fetchImage(imageUrl),
        ]);
        return {
            tittle: infoContent,
            tag_img: imageBase64,
            no: folderIndex,
            area: pre_ind - 1
        };
    }
    //打包所有文件夹数据
    async function fetchAllFoldersData() {
        let num = 0;
        for (let i = 0; i < responseData[0].length; i++) {
            num += responseData[0][i];
        }
        const folderIndices = Array.from({ length: num }, (_, i) => i + 1);
        const folderPromises = folderIndices.map(fetchFolderData);
        return Promise.all(folderPromises);
    }
    //主函数
    async function MAIN() {
        //获取项目数量
        var obj_tmp = JSON.parse(await fetchFile('tag/cnt.txt'));
        for (let j = 0; j < pre_path.length; j++) {
            responseData[0][j] = obj_tmp[pre_path[j].split("/")[1]];
        }
        //获取内容
        var data_tmp = await fetchAllFoldersData();
        //归类
        for (let j = 0; j < data_tmp.length; j++) {
            responseData[1][data_tmp[j].area].push(data_tmp[j]);
        }
        //排序
        for (let i = 0; i < pre_path.length; i++) {
            responseData[1][i].sort((a, b) => a.no - b.no);
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
                        "font-size": "40px",
                        "color": "white",
                        "text-align": "center",
                        "line-height": "80px",
                        "padding-top": "240px",
                        "font-family": "Times New Roma",
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