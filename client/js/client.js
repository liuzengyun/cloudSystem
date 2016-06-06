function cloudCtrl($routeProvider) {
    $routeProvider
        .when("/", {
            controller: projectCtrl,
            templateUrl: 'project.html'
        })
        .when("/baseInfo/:id", {
            controller: baseInfoCtrl,
            templateUrl: 'baseInfo.html'
        })
        .when("/speed/:id", {
            controller: speedCtrl,
            templateUrl: 'speed.html'
        })
        .when("/files/:id", {
            controller: filesCtrl,
            templateUrl: 'files.html'
        })
        .when("/fileInfo/:pid/:id", {
            controller: fileInfoCtrl,
            templateUrl: 'fileInfo.html'
        })
        .when("/endProject/:id", {
            controller: endProjectCtrl,
            templateUrl: 'endProject.html'
        })
        .when("/endProjectInfo/:id", {
            controller: endProjectInfoCtrl,
            templateUrl: 'endProjectInfo.html'
        })
        .when("/trial/:id", {
            controller: trialCtrl,
            templateUrl: 'trial.html'
        })
        .otherwise({
            redirectTo: "/"
        });
}
// 配置路由到angularjs
cloud.config(cloudCtrl);
// 读取项目的控制器
function projectCtrl($scope, $http) {
    // 单击存储项目名称
    $scope.projectName = function(projectName) {
        sessionStorage.setItem("projectName", projectName);
    };
    // 项目接口
    $scope.status = "";
    $http.get(url + "client/projects", {params: {uid: id}}).success(function (data) {
        consoleLog(data);
        if (data.status == true) {
            $scope.data = data.data.data;
            $scope.maxItems = data.data.maxRows;
            $scope.maxPage = data.data.maxPage;

            // 插件中默认是10条为一页,现在是9条一页 所以要修改插件
            $scope.maxSize = 5; // 显示最大页数
            $scope.bigTotalItems = $scope.maxItems;
            $scope.bigCurrentPage = 1;
        }
    });
    // 搜索项目
    // 初始化
    $scope.statusChange = function () {
        $http.get(url + "client/projects", {params: {uid: id, status: $scope.status}}).success(function (data) {
            consoleLog(data);
            if (data.status == true) {
                $scope.data = data.data.data;
                $scope.maxItems = data.data.maxRows;
                $scope.maxPage = data.data.maxPage;

                $scope.maxSize = 5; // 显示最大页数
                $scope.bigTotalItems = $scope.maxItems;
                $scope.bigCurrentPage = 1;
            }
        });
    };
    // 分页ng-change()传递参数为当前页
    //页面传递过来单击页码参数
    $scope.pageChanged = function (page) {
        $http.get(url + "client/projects", {
            params: {
                uid: id,
                page: page,
                status: $scope.status
            }
        }).success(function (data) {
            $scope.data = data.data.data;
            consoleLog(data);
        });
    };
}
// 项目基本信息的控制器
function baseInfoCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 每次单击将pid存储到session中
    sessionStorage.setItem("commonPid", $routeParams.id);
    $scope.commonPid = $routeParams.id;

    // 调取公共接口 获取项目基本信息
    var params = {
        pid: $routeParams.id
    };
    consoleLog(params);
    commonProject($scope, $http, params);
}
function speedCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 每次单击将pid存储到session中
    sessionStorage.setItem("commonPid", $routeParams.id);
    $scope.commonPid = $routeParams.id;
    // 调用进度公共的方法
    speed($scope, $http, $scope.commonPid, id);
}
function filesCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 每次单击将pid存储到session中
    sessionStorage.setItem("commonPid", $routeParams.id);
    $scope.commonPid = $routeParams.id;

}
function fileInfoCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 获取项目状态.判断是否显示删除按钮
    $scope.projectInfoStatus = sessionStorage.getItem("projectInfoStatus");

    $scope.commonPid = sessionStorage.getItem("commonPid");
    // 调用这个就会返回 filesData
    files($scope, $http, $scope.commonPid, id, $routeParams.id);
    $scope.typeId = $routeParams.id;
    // 删除文件
    $scope.deleteFile = function (file_id) {
        if (confirm("您确定要删除文件吗?")) {
            var params = {
                pid: $scope.commonPid,
                uid: id,
                file_id: file_id
            };
            $http.get(url + "sales/file_delete", {params: params}).success(function (data) {
                consoleLog(data);
                window.location.reload();
                if (data.status == false) {
                    alert(data.message);
                }
            })
        }
        else {
            return false;
        }
    }

}
function endProjectCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 每次单击将pid存储到session中
    sessionStorage.setItem("commonPid", $routeParams.id);
    $scope.commonPid = $routeParams.id;
    // 调用公共方法,返回接口数据
    result($scope, $http, $scope.commonPid, id);

    // 评分
    $scope.commentedModel = function (mid, pmid) {
        $scope.commentMid = mid;
        $scope.commentPmid = pmid;
        // 获取要评论律师和项目经理的名称
        $http.get(url + "common/project", {params: {pid: $scope.commonPid}}).success(function (data) {
            $scope.lawyerName = data.data.lawyer.name;
            $scope.managerName = data.data.manager.name;
            consoleLog($scope.lawyerName+$scope.managerName);
        });

    };
    $scope.submitComment = function () {
        $scope.managerscore = $("#managerstar").val();
        $scope.lawyerscore = $("#lawyerstar").val();
        var data = {
            client_id: id,
            project_id: $scope.commonPid,
            module_id: $scope.commentMid,
            pmid: $scope.commentPmid,
            lawyer_star: $scope.lawyerscore,
            lawyer_comment: $scope.lawyerText,
            manager_star: $scope.managerscore,
            manager_comment: $scope.managerText
        };
        consoleLog(data);
        $http.post(url + "client/comment", data).success(function (data) {
            console.log(data);
            if (data.status == false) {
                alert("评论失败,请重新尝试!");
            }
            else {
                window.location.reload();
            }
        });
    }
    // 单击模块存储模块名称
    $scope.moduleName = function(module) {
        sessionStorage.setItem("moduleName", module);
    }
}
function endProjectInfoCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 调取模块名称 显示
    $scope.moduleName = sessionStorage.getItem("moduleName");
    $scope.commonPid = sessionStorage.getItem("commonPid");
    // 公共方法, 返回条目
    projectModule($scope, $http, $routeParams.id, id);

    // type==0选择复选框,传递参数,调接口
    $scope.itemChange = function (pmiid, detail, mid, pid, pmid) {
        $scope.pmiid = pmiid;
        $scope.detail = detail;
        $scope.mid = mid;
        $scope.pid = pid;
        $scope.pmid = pmid;

        var data = {
            pmiid: $scope.pmiid,
            uid: id,
            item_detail: $scope.detail,
            mid: $scope.mid,
            pid: $scope.pid,
            pmid: $scope.pmid,
            operate: 0
        };
        // 调用定义的公共接口 操作条目
        projectItem($scope, $http, data);
    };
    //type == 1
    $scope.itemChangeType = function (pmiid, detail, mid, pid, pmid) {
        $scope.pmiid = pmiid;
        $scope.detail = detail;
        $scope.mid = mid;
        $scope.pid = pid;
        $scope.pmid = pmid;
    };
    // type==2
    $scope.fileTypeTwo = function (stime, sadd) {
        var data = {
            pmiid: $scope.pmiid,
            uid: id,
            item_detail: $scope.detail,
            mid: $scope.mid,
            pid: $scope.pid,
            pmid: $scope.pmid,
            trial_time: stime,
            trial_addr: sadd,
            operate: 2
        };
        consoleLog(data);
        // 调用定义的公共接口 操作条目
        projectItem($scope, $http, data);
    };
    // type==3
    $scope.fileTypeThree = function (tname, tfirm, tdepartment, tposition, tphone, ttel, temail) {
        var data = {
            pmiid: $scope.pmiid,
            uid: id,
            item_detail: $scope.detail,
            mid: $scope.mid,
            pid: $scope.pid,
            pmid: $scope.pmid,
            name: tname,
            firm: tfirm,
            department: tdepartment,
            position: tposition,
            phone: tphone,
            tel: ttel,
            email: temail,
            operate: 3
        };
        consoleLog(data);
        // 调用定义的公共接口 操作条目
        projectItem($scope, $http, data);
    };
    // type==5
    $scope.fileTypeFive = function (stime, sadd) {
        var data = {
            pmiid: $scope.pmiid,
            uid: id,
            item_detail: $scope.detail,
            mid: $scope.mid,
            pid: $scope.pid,
            pmid: $scope.pmid,
            trial_time: stime,
            trial_addr: sadd,
            operate: 5
        };
        consoleLog(data);
        // 调用定义的公共接口 操作条目
        projectItem($scope, $http, data);
    };
}
//庭审信息
function trialCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    $scope.commonPid = sessionStorage.getItem("commonPid");
    $http.get(url + "common/trials", {params: {pid: $scope.commonPid}}).success(function (data) {
        $scope.tData = data;
        consoleLog(data);
    })
}
// 上传案件材料
cloud.controller("uploadFile", ['$scope', 'Upload', function ($scope, Upload) {
    $scope.fileInfo = $scope.file;
    $scope.signFile = function () {
        $scope.upload($scope.file);
    };
    $scope.upload = function (file) {
        Upload.upload({
            url: url + 'common/file',
            data: {
                uid: id,
                pid: $scope.commonPid,
                file: file,
                type: 1,
                mid: "案源阶段"
            }
            //成功的情况
        }).progress(function (evt) {
            //这就是进度的对象
            consoleLog(evt);
            //进度条
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.pro = progressPercentage;
            consoleLog('progess:' + progressPercentage + '%');
            $(".progress-striped").show();
            $scope.progress = $scope.pro;
            //失败的情况
        }).success(function (data, status, headers, config) {
            if (data.status == true) {
                window.location.reload();
            }
            else {
                alert("上传失败,请检查文件大小");
                window.location.reload();
            }
            consoleLog(data);
        }).error(function (data) {
            consoleLog(data);
        })
    }
}]);

// 操作条目 如果type = 1 条目操作上传材料
cloud.controller("itemUploadFile", ['$scope', 'Upload', function ($scope, Upload) {
    $scope.fileInfo = $scope.file;
    $scope.fileTypeOne = function () {
        $scope.upload($scope.file);
    };
    $scope.upload = function (file) {
        Upload.upload({
            url: url + 'common/item_update',
            data: {
                pmiid: $scope.pmiid,
                uid: id,
                item_detail: $scope.detail,
                mid: $scope.mid,
                pid: $scope.pid,
                pmid: $scope.pmid,
                file: file,
                file_type: $scope.fileType,
                operate: 1
            }
            //成功的情况
        }).progress(function (evt) {
            //这就是进度的对象
            consoleLog(evt);
            //进度条
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.pro = progressPercentage;
            consoleLog('progess:' + progressPercentage + '%');
            $(".progress-striped").show();
            $scope.progress = $scope.pro;
            //失败的情况
        }).success(function (data, status, headers, config) {
            if (data.status == true) {
                window.location.reload();
            }
            else {
                alert("上传失败,请检查文件大小");
                window.location.reload();
            }
            consoleLog(data);
        }).error(function (data) {
            consoleLog(data);
        })
    }
}]);