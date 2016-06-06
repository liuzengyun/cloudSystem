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
        .when("/addModel/:id", {
            controller: addModelCtrl,
            templateUrl: 'addModel.html'
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

    $http.get(url + "lawyer/projects", {params: {uid: id}}).success(function (data) {
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
        $http.get(url + "lawyer/projects", {params: {uid: id, status: $scope.status}}).success(function (data) {
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
        $http.get(url + "lawyer/projects", {
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


    // 单击签约按钮,传递签约pid
    $scope.sign = function (pid) {
        $scope.signPid = pid;
    };
    // 补充材料单击,传递pid
    $scope.addFiles = function (pid) {
        $scope.signPid = pid;
    };

    // 结束项目
    $scope.endProject = function (pid) {
        if (confirm("你确定要结束项目吗?")) {
            $http.post(url + "sales/sign_failed", {pid: pid}).success(function (data) {
                consoleLog(data);
                $http.post(url + "sales/commit_review", {uid: id, pid: pid}).success(function (data) {
                    consoleLog(data);
                    // 单击提交评审以后,界面重新调取数据,状态修改为待评审项目
                    $scope.status = "待签约撤销";
                    $http.get(url + "common/sales_manager_projects", {
                        params: {
                            uid: id,
                            status: "待签约撤销"
                        }
                    }).success(function (data) {
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
                })
            })
        }
    }
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


    //修改基本信息
    $scope.editInfo = function () {
        var goals = "";
        for (var i = 0; i < $(".msg").length; i++) {
            goals += $(".msg").eq(i).val() + "##";
        }
        var data = {
            pid: $routeParams.id,
            uid: id,
            name: $scope.data.project.name,
            money: $scope.data.project.money,
            opposite: $scope.data.project.opposite,
            third: $scope.data.project.third,
            brief: $scope.data.project.brief,
            goals: goals,
            middle_man: $scope.data.project.middle_man,
            middle_man_phone: $scope.data.project.middle_man_phone,
            middle_man_firm: $scope.data.project.middle_man_firm

        };
        consoleLog(data);
        $http.post(url + "sales/project_info_update", data).success(function (data) {
            if (data.status == true) {
                window.location.reload();
            }
            else {
                $scope.alarmMsg = data.message;
            }
            consoleLog(data);
        });
    };
    // 修改客户信息
    $scope.submitClientInfo = function () {
        var data = {
            pid: $routeParams.id,
            uid: id,
            client_id: $scope.data.client.id,
            name: $scope.data.client.name,
            phone: $scope.data.client.phone,
            firm: $scope.data.client.firm,
            position: $scope.data.client.position,
            email: $scope.data.client.email,
            department: $scope.data.client.department,
            tel: $scope.data.client.tel
        };
        consoleLog(data);
        $http.post(url + "sales/client_info_update", data).success(function (data) {
            consoleLog(data);
            alert(data.message);
            window.location.reload();
        })
    }
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
// 添加模块界面
function addModelCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    $http.get(url + "manager/modules").success(function (data) {
        $scope.data = data;
        consoleLog(data.data);
    });

    // 单击获取pid,模块id,模块名称
    $scope.queryName = function (mid, module) {
        $scope.modelData = {
            uid: id,
            pid: $routeParams.id,
            mid: mid,
            module: module
        };
    };

    // 单击添加模块
    $scope.addModel = function () {
        $http.post(url + "manager/module", $scope.modelData).success(function (data) {
            // 添加成功界面跳转
            window.location.href = "#/endProject/" + $routeParams.id;
            // 重新调取数据,相当于界面刷新
            $http.get(url + "manager/modules").success(function (data) {
                $scope.data = data;
                consoleLog(data.data);
            });
        });
    }


}
// 签约,上传文件
cloud.controller("signUploadFile", ['$scope', 'Upload', function ($scope, Upload) {
    $scope.fileInfo = $scope.file;
    $scope.edit = function () {
        if ($scope.signTime == "" || $scope.signTime == undefined) {
            $scope.warningMsg = true;
        }
        else {
            $scope.submitSign($scope.file);
        }
    };
    $scope.submitSign = function (file, pid) {
        Upload.upload({
            url: url + 'sales/sign_success',
            data: {
                uid: id,
                pid: $scope.signPid,
                time: $scope.signTime,
                file: file,
                mid: "签约阶段"
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

// 提交评审,补充材料,上传文件
cloud.controller("signFile", ['$scope', 'Upload', function ($scope, Upload) {
    $scope.fileInfo = $scope.file;
    $scope.signFile = function () {
        $scope.upload($scope.file);
    };
    $scope.upload = function (file) {
        Upload.upload({
            url: url + 'common/file',
            data: {
                uid: id,
                pid: $scope.signPid,
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