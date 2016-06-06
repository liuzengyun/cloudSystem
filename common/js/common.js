// 定义统一url的前半部分
var url = "http://localhost/cloud_api/index.php/";
//var url = "https://cloud.beyondwinlaw.com/cloud_api/index.php/";

// 定义统一的console.log()
function consoleLog(data) {
    console.log(data);
}

// 进度
function speed($scope, $http, pid, uid) {
    $http.get(url + "common/records", {params: {uid: uid, pid: pid}}).success(function (data) {
        consoleLog(data);
        $scope.data = data;
        return $scope.data;
    })
}

// 文件
function files($scope, $http, pid, uid, file_type) {
    $http.get(url + "common/files", {params: {uid: uid, pid: pid, file_type: file_type}}).success(function (data) {
        $scope.filesData = data.data.data;
        $scope.fileStatus = data.status;
        consoleLog(data);
    })
}

// 结项
function result($scope, $http, pid, uid) {
    $http.get(url + "common/project_modules", {params: {uid: uid, pid: pid}}).success(function (data) {
        consoleLog(data);
        $scope.endProjectData = data;
    });
}

// 结项条目
function projectModule($scope, $http, pmid, uid) {
    $http.get(url + "common/items", {params: {pmid: pmid, uid: uid}}).success(function (data) {
        $scope.projectModuleData = data;
        consoleLog(data);
    })
}

// 操作条目 公共接口

function projectItem($scope, $http, data) {
    if (confirm("确定提交吗?")) {
        $http.post(url + "common/item_update", data).success(function (result) {
            if (result.status == true) {
                consoleLog(result);
                window.location.reload();
            }
            else {
                console.log(result);
                alert(result.message);
                window.location.reload();
            }
        })
    }
}

// 修改个人信息
function editBaseInfo($scope, $http, data) {
    $http.post(url + "common/user_update", data).success(function (data) {
        consoleLog(data);
        if (data.status == true) {
            window.location.reload();
        }
        else {
            $scope.editInfo = data.message;
        }
    })
}

// 查看项目信息
function commonProject($scope, $http, params) {
    $http.get(url + "common/project", {params: params}).success(function (data) {
        $scope.data = data.data;
        consoleLog($scope.data);
        sessionStorage.setItem("projectInfoStatus", data.data.project.status);
    })
}
