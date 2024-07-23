$(document).ready(function() {
    var responseData = [
        [],
        [
            [],
            [],
            []
        ]
    ];
    var pre_path = ["tag/fac/", "tag/staf/", "tag/stu/"];
    //获取子文件夹数量
    async function getSubCnt(path) {
        var cnt = 0;
        for (var i = 1; i < 100; i++) {
            var response = await fetch(path + i.toString() + '/Info.txt');
            if (response.ok) {
                cnt++;
            } else {
                return cnt;
            }
        }
    }
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
            name: infoContent.split("\r\n")[0],
            tittle: infoContent.split("\r\n")[1],
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
        for (var j = 0; j < 3; j++) {
            var subcnt = await getSubCnt(pre_path[j]);
            responseData[0][j] = subcnt;
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
        console.log(responseData);
        var item_num = responseData[0];
        var pre_let = ['A', 'B', 'C'];
        var pre_div;
        for (var i = 0; i < 3; i++) {
            //设置第一步
            var start_id = '#' + pre_let[i] + '1';
            $(start_id).css('background-image', "url(" + responseData[1][i][0].tag_img + ")");
            $(start_id).css('z-index', "1");
            $(start_id + ' .overlay').html(responseData[1][i][0].name + "<br> <br>" + responseData[1][i][0].title);
            pre_div = $(start_id);
            //复制后面几步
            var cur_tol_num = item_num[i]; //目前这个栏目的总条目数
            for (var j = 1; j < cur_tol_num; j++) {
                //1. 复制一个最父元素、修改id；2. 接到原来的后面；3. 修改其图片；4. 修改其文字
                var copy_div = $(start_id).clone();
                copy_div.attr('id', pre_let[i] + (j + 1).toString());
                copy_div.insertAfter(pre_div);
                copy_div.css('background-image', "url(" + responseData[1][i][j].tag_img + ")");
                copy_div.find(".overlay").html(responseData[1][i][j].name + "<br> <br>" + responseData[1][i][j].title);
                pre_div = copy_div;
            }
        }
    }

    MAIN();
});
