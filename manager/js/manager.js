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
        .when("/newProject", {
            controller: newProjectCtrl,
            templateUrl: 'newProject.html'
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
    $scope.projectName = function (projectName) {
        sessionStorage.setItem("projectName", projectName);
    };
    //// 查询项目
    //if ($scope.Mposition == "总监") {
    //    $scope.status = "待指派项目经理";
    //}
    //else {
    //    $scope.status = "";
    //}
    $scope.status = "";
    $http.get(url + "manager/projects", {params: {uid: id, status: $scope.status}}).success(function (data) {
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
        $http.get(url + "manager/projects", {params: {uid: id, status: $scope.status}}).success(function (data) {
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
        $http.get(url + "manager/projects", {
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

    // 指派项目经理列表
    $scope.assignList = function (pid) {
        $http.get(url + "manager/managers").success(function (data) {
            $scope.managerListData = data.data;
            $scope.mPid = pid;
            consoleLog(data);
        });
    };

    // 指派
    $scope.changeName = function (mid) {
        $scope.mmid = mid;
    };
    $scope.assignManager = function () {
        $http.get(url + "manager/assign", {
            params: {
                uid: id,
                pid: $scope.mPid,
                manager_id: $scope.mmid
            }
        }).success(function (data) {
            $scope.status = "督办";
            consoleLog(data);
            $http.get(url + "manager/projects", {params: {uid: id, status: "督办"}}).success(function (data) {
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
        if (confirm("您确定已经完成此事项吗?")) {
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
function endProjectCtrl($scope, $http, $routeParams, $rootScope) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 每次单击将pid存储到session中
    sessionStorage.setItem("commonPid", $routeParams.id);
    $scope.commonPid = $routeParams.id;
    // 调用公共方法,返回接口数据
    result($scope, $http, $scope.commonPid, id);
    // 单击模块存储模块名称
    $scope.moduleName = function (module) {
        sessionStorage.setItem("moduleName", module);
    }
}
function endProjectInfoCtrl($scope, $http, $routeParams, $rootScope) {
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
    //标记tab页是哪个选中的
    $scope.markLawyerType = 1;
    $scope.inputLawyer = function () {
        $scope.markLawyerType = 1;
    };
    $scope.checkLawyer = function () {
        $scope.markLawyerType = 2;
        $http.get(url + "common/users", {params: {type: 5, user_type: 5}}).success(function (data) {
            consoleLog(data);
            //if (data.status == true) {
            $scope.data = data.data;
            $scope.maxItems = data.maxRows;
            $scope.maxPage = data.maxPage;

            // 插件中默认是10条为一页,现在是9条一页 所以要修改插件
            $scope.maxSize = 5; // 显示最大页数
            $scope.bigTotalItems = $scope.maxItems;
            $scope.bigCurrentPage = 1;
            //}

            // 选中
            $scope.changeInfo = function (i) {
                $scope.lname = $scope.data[i].name;
                $scope.lfirm = $scope.data[i].firm;
                $scope.ldepartment = $scope.data[i].department;
                $scope.lposition = $scope.data[i].position;
                $scope.lphone = $scope.data[i].phone;
                $scope.ltel = $scope.data[i].tel;
                $scope.lemail = $scope.data[i].email;
            };
        });


        //分页
        $scope.pageChanged = function (page) {
            $http.get(url + "common/users", {
                params: {
                    type: 5,
                    page: page,
                    user_type: 5
                }
            }).success(function (data) {
                $scope.data = data.data;
                $scope.maxItems = data.maxRows;
                $scope.maxPage = data.maxPage;

                // 插件中默认是10条为一页,现在是9条一页 所以要修改插件
                $scope.maxSize = 5; // 显示最大页数
                $scope.bigTotalItems = $scope.maxItems;
                $scope.bigCurrentPage = 1;
            });
        };
    };
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
        if (tphone != "" || tphone != undefinded) {
            projectItem($scope, $http, data);
        }
        else {
            return false;
        }

    };
    // 选择
    $scope.fileTypeThreeCheck = function () {
        var data = {
            pmiid: $scope.pmiid,
            uid: id,
            item_detail: $scope.detail,
            mid: $scope.mid,
            pid: $scope.pid,
            pmid: $scope.pmid,

            name: $scope.lname,
            firm: $scope.lfirm,
            department: $scope.ldepartment,
            position: $scope.lposition,
            phone: $scope.lphone,
            tel: $scope.ltel,
            email: $scope.lemail,
            operate: 3
        };
        consoleLog(data);
        // 调用定义的公共接口 操作条目
        if ($scope.lphone != "" || $scope.lphone != undefinded) {
            projectItem($scope, $http, data);
        }
        else {
            return false;
        }
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

    // 结束所有条目
    $scope.endAllItems = function (pmid) {
        $http.get(url + "manager/finish_module", {params: {pmid: pmid}}).success(function (data) {
            consoleLog(data);
        })
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
        if (confirm("确定添加吗?")) {
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


}
// 新建项目
function newProjectCtrl($scope, $http) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 初始化变量
    $scope.name = "";
    $scope.tel = "";
    $scope.email = "";
    $scope.inputClient = function () {
        $scope.uName = "";
        $scope.phone = "";
        $scope.email = "";
        $scope.firm = "";
        $scope.department = "";
        $scope.position = "";
        $scope.tel = "";
    };
    // 查找用户
    $scope.changeClient = function () {
        var params = {
            uid: id,
            // 4. 客户, 5. 律师
            user_type: 4
        };
        $http.get(url + "common/users", {params: params}).success(function (data) {
            consoleLog(data);
            $scope.clientList = data.data;
            // 分页
            $scope.maxSize = 5; // 显示最大页数
            $scope.bigTotalItems = data.maxRows;  // 最大条目,变量
            $scope.bigCurrentPage = 1;
        });
    };
    // 查找用户 搜索单击的时候
    $scope.submitSearchClient = function () {
        var params = {
            uid: id,
            // 4. 客户, 5. 律师
            user_type: 4,
            name: $scope.searchName
        };
        $http.get(url + "common/users", {params: params}).success(function (data) {
            consoleLog(data);
            $scope.clientList = data.data;
            // 分页
            $scope.maxSize = 5; // 显示最大页数
            $scope.bigTotalItems = data.maxRows;  // 最大条目,变量
            $scope.bigCurrentPage = 1;
        })
    };
    // 单击分页
    //页面传递过来单击页码参数
    $scope.pageChanged = function (page) {
        $scope.proPage = page;
        $http.get(url + "common/users", {
            params: {
                uid: id,
                // 4. 客户, 5. 律师
                user_type: 4,
                name: $scope.searchName,
                page: page
            }
        }).success(function (data) {
            $scope.clientList = data.data;
            consoleLog(data);
        });
    };

    // 如果单击单选框选择 那么就根据id查找字段
    $scope.changeClientInfo = function (id) {
        var params = {
            uid: id,
            // 4. 客户, 5. 律师
            user_type: 4,
            id: id,
            name: $scope.searchName,
            page: $scope.proPage
        };
        $http.get(url + "common/users", {params: params}).success(function (data) {
            consoleLog(data);
            for (var i = 0; i < data.data.length; i++) {
                $scope.uName = data.data[i].name;
                $scope.phone = data.data[i].phone;
                $scope.email = data.data[i].email;
                $scope.firm = data.data[i].firm;
                $scope.department = data.data[i].department;
                $scope.position = data.data[i].position;
                $scope.tel = data.data[i].tel;
            }

            consoleLog($scope.uName + $scope.phone + $scope.email + $scope.firm);
        });
    };

    // 添加和删除客户目标
    $scope.arr = [];
    var i = 0;
    $scope.addClientTarget = function () {
        i++;
        $scope.arr.push(i);
        consoleLog($scope.arr);
    };
    $scope.deleteClientTarget = function () {
        if ($scope.arr.length > 0) {
            $scope.arr.splice(-1, 1);
        }
        consoleLog($scope.arr);
    };

    // 新增项目
    $scope.phone = "";
    $scope.addProjectClient = function () {
        if ($scope.pName == undefined || $scope.money == undefined || $scope.uName == undefined || $scope.phone == undefined || $scope.brief == undefined || $scope.goals == undefined) {
            $scope.warnMsg = true;
            return false;
        }
        else {
            if (confirm("确认已经填写清楚,现在添加项目吗?")) {
                // 拼接目标字符串 ##
                var targetString = "";
                for (var j = 0; j < $scope.arr.length; j++) {
                    targetString += "##" + $(".target" + j).val();
                }
                var goals = $scope.goals + targetString;
                // 拼接字符串技术
                var data = {
                    uid: id,
                    phone: $scope.phone,
                    u_name: $scope.uName,
                    email: $scope.email,
                    firm: $scope.firm,
                    department: $scope.department,
                    position: $scope.position,
                    tel: $scope.tel,

                    p_name: $scope.pName,
                    money: $scope.money,
                    opposite: $scope.opposite,
                    third: $scope.third,
                    brief: $scope.brief,
                    goals: goals,
                    middle_man: $scope.middleMan,
                    middle_man_firm: $scope.middleManFirm,
                    middle_man_phone: $scope.middleManPhone
                };
                console.log(data);
                $http.post(url + "sales/project", data).success(function (data) {
                    consoleLog(data);
                    if (data.status == false) {
                        alert(data.message);
                    }
                    else {
                        window.location.href = "#/"
                    }
                })
            }
        }
    };

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
            $(".progress-striped").show();
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
            $(".progress-striped").show();
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
cloud.controller("uploadFile1", ['$scope', 'Upload', function ($scope, Upload) {
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
                mid: $scope.midName
            }
            //成功的情况
        }).progress(function (evt) {
            //进度条
            $(".progress-striped").show();
            //失败的情况
        }).success(function (data, status, headers, config) {
            consoleLog(data);
            if (data.status == true) {
                window.location.reload();
            }
            else {
                alert("上传失败,请检查文件大小");
                window.location.reload();
            }
        }).error(function (data) {
            consoleLog(data);
        })
    }
}]);
// 上传案件材料
cloud.controller("uploadFile2", ['$scope', 'Upload', function ($scope, Upload) {
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
                type: 2,
                mid: $scope.midName
            }
            //成功的情况
        }).progress(function (evt) {
            //进度条
            $(".progress-striped").show();
            //失败的情况
        }).success(function (data, status, headers, config) {
            consoleLog(data);
            if (data.status == true) {
                window.location.reload();
            }
            else {
                alert("上传失败,请检查文件大小");
                window.location.reload();
            }
        }).error(function (data) {
            consoleLog(data);
        })
    }
}]);
// 上传案件材料
cloud.controller("uploadFile3", ['$scope', 'Upload', function ($scope, Upload) {
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
                type: 3,
                mid: $scope.midName
            }
            //成功的情况
        }).progress(function (evt) {
            //进度条
            $(".progress-striped").show();
            //失败的情况
        }).success(function (data, status, headers, config) {
            consoleLog(data);
            if (data.status == true) {
                window.location.reload();
            }
            else {
                alert("上传失败,请检查文件大小");
                window.location.reload();
            }
        }).error(function (data) {
            consoleLog(data);
        })
    }
}]);
// 上传案件材料
cloud.controller("uploadFile4", ['$scope', 'Upload', function ($scope, Upload) {
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
                type: 4,
                mid: $scope.midName
            }
            //成功的情况
        }).progress(function (evt) {
            //进度条
            $(".progress-striped").show();
            //失败的情况
        }).success(function (data, status, headers, config) {
            consoleLog(data);
            if (data.status == true) {
                window.location.reload();
            }
            else {
                alert("上传失败,请检查文件大小");
                window.location.reload();
            }
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
            $(".progress-striped").show();
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