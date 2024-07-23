$(document).ready(function() {
    var responseData = [
        [],
        [
            [],
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
        var pre_path = ["tag/fac/", "tag/staf/", "tag/stu/"];
        for (var j = 0; j < 3; j++) {
            var ind = 0;
            while (true) {
                ind++;
                var path = pre_path[j] + ind.toString() + '/Info.txt';
                await fetchTXT(path);
                if (voidFolder) {
                    break;
                } else {
                    let tmp_obj = {
                        name: RdrRes.split('\n')[0],
                        tittle: RdrRes.split('\n')[1]
                    };
                    responseData[1][j][ind - 1] = tmp_obj;
                }
            }
            responseData[0][j] = ind - 1;
            for (var i = 1; i < ind; i++) {
                var path = pre_path[j] + i.toString() + '/Image.jpg';
                await fetchIMG(path);
                responseData[1][j][i - 1].tag_img = RdrRes;
            }
        }
        var item_num = responseData[0];
        var pre_let = ['A', 'B', 'C'];
        var pre_div;
        for (var i = 0; i < 3; i++) {
            //设置第一步
            var start_id = '#' + pre_let[i] + '1';
            $(start_id).css('background-image', "url(" + responseData[1][i][0].tag_img + ")");
            $(start_id).css('z-index', "1");
            $(start_id + ' .overlay').html(responseData[1][i][0].name + "<br> <br>" + responseData[1][i][0].tittle);
            pre_div = $(start_id);
            //复制后面几步
            var cur_tol_num = item_num[i]; //目前这个栏目的总条目数
            for (var j = 1; j < cur_tol_num; j++) {
                //1. 复制一个最父元素、修改id；2. 接到原来的后面；3. 修改其图片；4. 修改其文字
                var copy_div = $(start_id).clone();
                copy_div.attr('id', pre_let[i] + (j + 1).toString());
                copy_div.insertAfter(pre_div);
                dataset = responseData[1][i][j];
                copy_div.css('background-image', "url(" + dataset.tag_img + ")");
                copy_div.find(".overlay").html(dataset.name + "<br> <br>" + dataset.tittle);
                pre_div = copy_div;
            }
        }
    }
    MAIN();
});