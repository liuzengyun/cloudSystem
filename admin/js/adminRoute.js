var id = sessionStorage.getItem("id");
consoleLog(sessionStorage.getItem("type"));
if (id == "" || id == "undefined" || id == null) {
    window.location.href = "../index.html";
}
// 引入路由和动态懒加载和分页依赖
var cloud = angular.module("cloud", ["ngRoute", "infinite-scroll", 'ui.bootstrap', "ngFileUpload"]);
// 公用的一些接口
cloud.controller("commonCtrl", function ($scope, $http) {
    // 登陆成功,获取登陆信息
    $scope.name = sessionStorage.getItem("name");
    $scope.id = sessionStorage.getItem("id");
    // 退出
    $scope.loginOut = function () {
        // 清除h5本地session
        sessionStorage.clear();
        $http.get(url + "login/logout").success(function (data) {
            window.location.href = "../index.html";
            consoleLog(data);
        });
    };
    // 修改登录用户的密码 获取登录用户的id
    $scope.updatePassword = function () {
        if ($scope.newPass != $scope.newPassToo) {
            alert("新密码两次输入不一致");
            return false;
        }
        else {
            if ($scope.newPass == "") {
                alert("新密码不能为空");
            }
            else {
                var data = {
                    uid: $scope.id,
                    old_pass: $scope.oldPass,
                    new_pass: $scope.newPass
                };
                consoleLog(data);
                $http.post(url + "common/pass_update", data).success(function (data) {
                    alert(data.message);
                    window.location.reload();
                    consoleLog(data);
                })
            }
        }
    };
});
//定义路由
function cloudCtrl($routeProvider) {
    $routeProvider
        .when("/", {
            controller: dynamicCtrl,
            templateUrl: 'dynamic.html'
        })
        .when("/project", {
            controller: projectCtrl,
            templateUrl: 'project.html'
        })
        .when("/project/baseInfo/:id", {
            controller: projectInfoCtrl,
            templateUrl: 'projectInfo.html'
        })
        .when("/project/files/:id", {
            controller: filesCtrl,
            templateUrl: 'files.html'
        })
        .when("/fileInfo/:pid/:id", {
            controller: fileInfoCtrl,
            templateUrl: 'fileInfo.html'
        })
        .when("/project/speed/:id", {
            controller: speedCtrl,
            templateUrl: 'speed.html'
        })
        .when("/project/module/:id", {
            controller: moduleCtrl,
            templateUrl: 'module.html'
        })
        //.when("/module/item/:id", {
        //    controller: moduleItemCtrl,
        //    templateUrl: 'moduleInfo.html'
        //})
        .when("/user", {
            controller: userCtrl,
            templateUrl: 'user.html'
        })
        .when("/node", {
            controller: nodeCtrl,
            templateUrl: 'node.html'
        })
        .when("/node/:id", {
            controller: nodeInfoCtrl,
            templateUrl: 'nodeInfo.html'
        })
        .otherwise({
            redirectTo: "/"
        })
}
// 配置路由到angularjs
cloud.config(cloudCtrl);
// 定义控制器,来加载数据
function dynamicCtrl($scope, $http) {
    // 这个事初始数据先调取第一页十条数据
    $http.get(url + 'admin/records', {params: {page: 1}}).success(function (data) {
        $scope.newsInit = data.data.data;
        consoleLog(data.data.data);
    });
    $http.get(url + 'admin/records', {params: {page: 2}}).success(function (data) {
        $scope.news = data.data.data;
        consoleLog(data);
        consoleLog(data.data.data);
    });
    var j = 2;
    // 定义无限滚动追加代码, 页码从2开始
    $scope.loadMore = function () {
        // 每次滚动分页加1
        j = j + 1;
        // 调用一次分页显示几条数据
        $http.get(url + 'admin/records', {params: {page: j}}).success(function (data) {
            consoleLog(data);
            var newsTwo = data.data.data;
            var maxPage = data.data.maxPage;
            $scope.maxPage = data.data.maxPage;
            var maxRows = data.data.maxRows;
            //获取最大分页数,如果小于这个页数那么滚动就不在追加
            if (j <= maxPage) {
                for (var i = 0; i < newsTwo.length; i++) {
                    // 将数据追加到界面显示数组中, 判断一下 刚开始还没有加载完成的时候就push,返回false
                    if ($scope.news == undefined) {
                        return false;
                    }
                    $scope.news.push(newsTwo[i]);
                }
            }
        });
    };
}
// 项目
function projectCtrl($scope, $http) {
    // 传递项目名称
    $scope.passName = function (name) {
        sessionStorage.setItem("passName", name);
    };
    $scope.name = "";
    // 首先调取所有数据 分页
    $http.get(url + "admin/projects").success(function (data) {
        $scope.data = data.data.data;
        $scope.maxItems = data.data.maxRows;
        $scope.maxPage = data.data.maxPage;

        $scope.maxSize = 5; // 显示最大页数
        $scope.bigTotalItems = $scope.maxItems;
        $scope.bigCurrentPage = 1;
        consoleLog(data);
    });
    // 单击查询调取数据 分页
    $scope.submit = function () {
        $http.get(url + "admin/projects", {
            params: {
                name: $scope.name,
                status: $scope.status
            }
        }).success(function (data) {
            $scope.data = data.data.data;
            $scope.maxItems = data.data.maxRows;
            $scope.maxPage = data.data.maxPage;

            $scope.maxSize = 5; // 显示最大页数
            $scope.bigTotalItems = $scope.maxItems;
            $scope.bigCurrentPage = 1;

        });
    };
    // 分页ng-change()传递参数为当前页
    $scope.name = "";
    $scope.status = "";
    $scope.pageChanged = function (page) {
        $http.get(url + "admin/projects", {
            params: {
                page: page,
                name: $scope.name,
                status: $scope.status
            }
        }).success(function (data) {
            $scope.data = data.data.data;
        });
    };
    // 删除项目
    $scope.deleteProject = function (pid) {
        if (confirm("删除之后,所有的项目文件,资料都将无法找回?")) {
            $http.get(url + "admin/project_delete", {params: {pid: pid}}).success(function (data) {
                if (data.status == true) {
                    window.location.reload();
                }
                else {
                    alert(data.message);
                    window.location.reload();
                }
            })
        }
    }
}
// 项目详细信息 基本信息|文件|进度
function projectInfoCtrl($scope, $routeParams, $http) {
    //基本信息
    // 单击项目存储项目id
    $scope.receivePname = sessionStorage.getItem("passName");
    sessionStorage.setItem("pid", $routeParams.id);
    var params = {
        pid: $routeParams.id
    };
    consoleLog(params);
    $http.get(url + "common/project", {params: params}).success(function (data) {
        $scope.data = data.data;
        consoleLog(data);
    });

    //修改基本信息
    $scope.editInfo = function () {
        var goals = "";
        for (var i = 0; i < $(".msg").length; i++) {
            goals += $(".msg").eq(i).val() + "##";
        }
        var data = {
            pid: $routeParams.id,
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
        if (confirm("您确定修改基本信息吗?")) {
            $http.post(url + "admin/project_update", data).success(function (data) {
                if (data.status == true) {
                    window.location.reload();
                }
                else {
                    alert(data.message);
                    window.location.reload();
                }
                consoleLog(data);
            });
        }
    };
}
// 文件
function filesCtrl($scope, $http, $routeParams) {
    $scope.receivePname = sessionStorage.getItem("passName");
    $scope.projectName = sessionStorage.getItem("projectName");
    // 每次单击将pid存储到session中
    sessionStorage.setItem("pid", $routeParams.id);
    $scope.pid = $routeParams.id;

}
function fileInfoCtrl($scope, $http, $routeParams) {
    $scope.receivePname = sessionStorage.getItem("passName");
    $scope.projectName = sessionStorage.getItem("projectName");
    // 获取项目状态.判断是否显示删除按钮
    $scope.projectInfoStatus = sessionStorage.getItem("projectInfoStatus");

    $scope.pid = sessionStorage.getItem("pid");
    // 调用这个就会返回 filesData
    files($scope, $http, $scope.pid, id, $routeParams.id);
    $scope.typeId = $routeParams.id;
    // 删除文件
    $scope.deleteFile = function (id) {
        consoleLog(id);
        if (confirm("你确定要删除文件吗?")) {
            $http.get(url + "common/file_delete", {
                params: {
                    uid: id,
                    pid: $scope.pid,
                    file_id: id
                }
            }).success(function (data) {
                if (data.status == true) {
                    window.location.reload();
                    consoleLog(data);
                }
                else {
                    alert(data.message);
                }
            });
        }
        else {
            return false;
        }
    };

}
//进度
function speedCtrl($scope, $http, $routeParams) {
    $scope.receivePname = sessionStorage.getItem("passName");
    $scope.pid = sessionStorage.getItem("pid");
    //function speedCtrl($scope, $http, $routeParams) {
    $scope.projectName = sessionStorage.getItem("projectName");
    // 每次单击将pid存储到session中
    sessionStorage.setItem("pid", $routeParams.id);
    $scope.pid = $routeParams.id;
    // 调用进度公共的方法
    speed($scope, $http, $scope.pid, id);
    //}
}
function moduleCtrl($scope, $http) {
    $scope.receivePname = sessionStorage.getItem("passName");
    $scope.pid = sessionStorage.getItem("pid");
    // 查看项目中的模块
    var params = {
        pid: $scope.pid
    };
    consoleLog(params);
    $http.get(url + "common/project_modules", {params: params}).success(function (data) {
        if (data.status == false) {
            $scope.moduleStatus = true;
        }
        else {
            $scope.data = data.data;
            $scope.moduleStatus = false;
        }
        consoleLog(data);
    });
    // 删除项目中的模块
    $scope.delModule = function (pmid) {
        if (confirm("您确定要删除吗?")) {
            var params = {
                pmid: pmid
            };
            $http.get(url + "admin/project_module_delete", {params: params}).success(function (data) {
                window.location.reload();
            })
        }
        else {
            return false;
        }
    };

    // 项目模块中的条目
    $scope.moduleItems = function (mid) {
        var pid = $scope.pid;
        var mid = mid;
        var params = {
            pid: pid,
            mid: mid
        };
        consoleLog(params);
        $http.get(url + "admin/project_module_items", {params: params}).success(function (data) {
            $scope.dataItem = data.data;
            consoleLog(data);
        });
    };

    $scope.deleteItem = function (pmiid) {
        if (confirm("您确定要删除吗?")) {
            var params = {
                pmiid: pmiid
            };
            $http.get(url + "admin/project_module_item_delete", {params: params}).success(function (data) {
                consoleLog(data);
                window.location.reload();
            });
        }
    }
}
// 用户
function userCtrl($scope, $http) {
    $scope.receivePname = sessionStorage.getItem("passName");
    $scope.name = "";
    // 所有数据 分页 总页数
    $http.get(url + "admin/users").success(function (data) {
        $scope.data = data.data.data;
        $scope.maxItems = data.data.maxRows;
        $scope.maxPage = data.data.maxPage;

        $scope.maxSize = 5; // 显示最大页数
        $scope.bigTotalItems = $scope.maxItems;
        $scope.bigCurrentPage = 1;
        consoleLog(data);
    });
    // 查询 分页 分页页数
    $scope.searchUser = function () {
        $http.get(url + "admin/users", {params: {name: $scope.name, type: $scope.type}}).success(function (data) {
            $scope.data = data.data.data;
            $scope.maxItems = data.data.maxRows;
            $scope.maxPage = data.data.maxPage;

            consoleLog(data);
            $scope.maxSize = 5; // 显示最大页数
            $scope.bigTotalItems = $scope.maxItems;
            $scope.bigCurrentPage = 1;
        });
    };
    // 单击传递页码 调用数据
    $scope.name = "";
    $scope.type = "";
    $scope.pageChanged = function (page) {
        $http.get(url + "admin/users", {
            params: {
                page: page,
                name: $scope.name,
                type: $scope.type
            }
        }).success(function (data) {
            $scope.data = data.data.data;
        });
    };
    // 删除用户
    $scope.delClientInfo = function (id) {
        consoleLog(id);
        if (confirm("您确定要删除此用户吗?")) {
            var params = {
                uid: id
            };
            $http.get(url + "admin/user_delete", {params: params}).success(function (data) {
                consoleLog(data);
                window.location.reload();
            })
        }
        else {
            return false;
        }
    };

    // 修改用户信息
    // 单击修改按钮传递过来的参数 获取初始化 并显示在修改框中
    $scope.editClientInfo = function (id, name, firm, phone, position, department, email, tel, type, status) {
        $scope.id = id;
        $scope.name = name;
        $scope.firm = firm;
        $scope.phone = phone;
        $scope.position = position;
        $scope.department = department;
        $scope.email = email;
        $scope.tel = tel;
        $scope.type = type;
        $scope.status = status;
    };
    //修改
    $scope.submitClientInfo = function () {
        var data = {
            uid: $scope.id,
            phone: $scope.phone,
            email: $scope.email,
            name: $scope.name,
            type: $scope.type,
            firm: $scope.firm,
            department: $scope.department,
            position: $scope.position,
            tel: $scope.tel,
            status: $scope.status
        };
        consoleLog(data);
        $http.post(url + "admin/user_update", data).success(function (data) {
            consoleLog(data);
            alert(data.message);
            window.location.reload();
        });

    };
    //添加
    $scope.addClientInfo = function () {
        var data = {
            create_by: id,
            phone: $scope.phone,
            email: $scope.email,
            name: $scope.name,
            type: $scope.type,
            firm: $scope.firm,
            department: $scope.department,
            position: $scope.position,
            tel: $scope.tel,
            status: $scope.status
        };
        consoleLog(data);
        $http.post(url + "admin/user", data).success(function (data) {
            consoleLog(data);
            alert(data.message);
            //window.location.reload();
        });

    };
    // 修改密码
    $scope.editPass = function (id) {
        $scope.userId = id;
    };
    $scope.updatePass = function () {
        if ($scope.newPass != $scope.oldPassToo) {
            alert("新密码两次输入不一致");
            return false;
        }
        else {
            if ($scope.newPass == "") {
                alert("新密码不能为空");
            }
            else {
                var data = {
                    uid: $scope.userId,
                    old_pass: $scope.oldPass,
                    new_pass: $scope.newPass
                };
                consoleLog(data);
                $http.post(url + "common/pass_update", data).success(function (data) {
                    alert(data.message);
                    window.location.reload();
                    consoleLog(data);
                })
            }
        }
    };
    $scope.goprojectInfo = function () {
        window.location.reload();
    };
    $scope.goProjectItems = function (id) {
        // 获取所有数据
        var params = {
            uid: id
        };
        $http.get(url + "admin/individual_projects", {params: params}).success(function (data) {
            consoleLog(data);
            if (data.status == true) {
                $scope.dataPro = data.data.data;
                $scope.maxItemsPro = data.data.maxRows;
                $scope.maxPagePro = data.data.maxPage;

                $scope.PromaxSize = 5; // 显示最大页数
                $scope.ProbigTotalItems = $scope.maxItemsPro;
                $scope.ProbigCurrentPage = 1;
                consoleLog(data);
            }
            else {
                $scope.dataPro = "";
            }
        });

        // 单击传递页码 调用数据
        $scope.pageChangedPro = function (page) {
            var params = {
                page: page,
                uid: id
            };
            $http.get(url + "admin/individual_projects", {params: params}).success(function (data) {
                if (data.status == true) {
                    $scope.dataPro = data.data.data;
                    consoleLog(data);
                }
            });
        };

    }
}
// 环节与节点
function nodeCtrl($scope, $http) {
    $scope.passNodeName = function (name) {
        sessionStorage.setItem("passNname", name);
    };
    $scope.receivePname = sessionStorage.getItem("passName");
    $http.get(url + "admin/modules").success(function (data) {
        $scope.data = data.data.data;
        consoleLog(data);
    });

    // 添加模块
    $scope.name = "";
    $scope.addModel = function () {
        var data = {
            name: $scope.name
        };
        consoleLog(name);
        $http.post(url + "admin/module", data).success(function (data) {
            alert(data.message);
            window.location.reload();
            consoleLog(data);
        })
    };
    // 删除模块
    $scope.delNode = function (id) {
        if (confirm("您确定要删除模块吗?")) {
            $http.get(url + "admin/module_delete", {params: {mid: id}}).success(function (data) {
                window.location.reload();
            })
        }
        else {
            return false;
        }
    };
    // 修改模块
    $scope.editNode = function (id, name) {
        $scope.nodeId = id;
        $scope.nodeName = name;
    };

    $scope.editModel = function () {
        var data = {
            mid: $scope.nodeId,
            name: $scope.nodeName
        };
        consoleLog(data);
        $http.post(url + "admin/module_update", data).success(function (data) {
            alert(data.message);
            consoleLog(data);
            window.location.reload();
        })
    }
}
// 节点细节
function nodeInfoCtrl($scope, $routeParams, $http) {
    $scope.passNname = sessionStorage.getItem("passNname");
    $scope.receivePname = sessionStorage.getItem("passName");
    var params = {
        mid: $routeParams.id
    };
    $http.get(url + "admin/items", {params: params}).success(function (data) {
        if (data.status == true) {
            $scope.data = data.data;
            consoleLog(data);
        }
        else {
            // 如果条目为空 跳转到环节界面
            alert(data.message);
            window.location.href = "#/node"
        }
    });

    //删除条目
    $scope.delItems = function (iid) {
        if (confirm("您确定要删除吗?")) {
            var params = {
                iid: iid
            };
            consoleLog(params);
            $http.get(url + "admin/item_delete", {params: params}).success(function (data) {
                consoleLog(data);
                window.location.reload();
            })
        }
        else {
            return false;
        }
    };

    // 新增条目
    $scope.addItems = function () {
        var id = $routeParams.id;
        var data = {
            mid: id,
            detail: $scope.detail,
            due_time: $scope.due_time,
            user_type: $scope.user_type,
            operate: $scope.operate
        };
        consoleLog(data);
        $http.post(url + "admin/item", data).success(function (data) {
            alert(data.message);
            consoleLog(data);
            window.location.reload();
        });

    };

    // 修改条目
    $scope.editItemsInfo = function (iid, detail, due_time, user_type, operate) {
        $scope.itemsIid = iid;
        $scope.itemsDetail = detail;
        $scope.itemsDue_time = due_time;
        $scope.itemsUser_type = user_type;
        $scope.itemsOperate = operate;
    };
    $scope.editItems = function () {
        var data = {
            iid: $scope.itemsIid,
            detail: $scope.itemsDetail,
            due_time: $scope.itemsDue_time,
            user_type: $scope.itemsUser_type,
            operate: $scope.itemsOperate
        };
        $http.post(url + "admin/item_update", data).success(function (data) {
            alert(data.message);
            window.location.reload();
            consoleLog(data);
        });
    }

}
// 自定义鼠标单击效果指令
cloud.directive('hoverBg', function () {
    return {
        restrict: "C",
        link: function (scope, element, attrs) {
            element.mouseover(function () {
                element.addClass('hoverBg');
            });
            element.mouseout(function () {
                element.removeClass('hoverBg');
            });
        }
    }
});
// 自定义分割过滤 名称splite
cloud.filter('splite', function () {
    return function (str) {
        // 刚加载 先判断一下 如果为空 那么就停止执行, 如果有值,那么菜分割
        if (str == undefined) {
            return false;
        }
        var arr = str.split("##");
        var finalString = "";
        if (arr.length == 1) {
            finalString = arr[0];
        }
        else {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != "") {
                    finalString += i + 1 + ". " + arr[i] + " ";
                }
            }
        }
        return finalString;
    }
});
// splitArr
cloud.filter('splitArr', function () {
    return function (str) {
        // 刚加载 先判断一下 如果为空 那么就停止执行, 如果有值,那么菜分割
        if (str == undefined) {
            return false;
        }
        var splitArr = str.split("##");
        return splitArr;
    }
});
// 自定义过滤 如果没有天数 那么默认为0
cloud.filter('underfinedNull', function () {
    return function (str) {
        if (str == "" || str == "undefined" || str == null) {
            str = 0;
            return str;
        }
        else {
            return str;
        }
    }
});
// 自定义单击导航字体高亮 指令
cloud.directive("clickBg", function () {
    return {
        restrict: 'C',
        link: function (scope, element, attrs) {
            element.click(function () {
                element.css("color", "#fff");
                element.parent().siblings().not(".dropdown").find("a").css("color", "#ddd");
            });
        }
    }
});
// 修改上传文件,注意这个$scope.id是单击的时候在路由绑定的全界面的控制器中获取的. $scope.editFile
cloud.controller("fileCtrl1", ['$scope', 'Upload', function ($scope, Upload) {
    $scope.fileInfo = $scope.file;
    $scope.edit = function () {
        $scope.upload($scope.file);
    };
    $scope.upload = function (file, type) {
        Upload.upload({
            url: url + 'admin/file_update',
            data: {file: file, fid: $scope.id}
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
            setTimeout(function () {
                if ($scope.progress == 100) {
                    window.location.reload();
                }
            }, 1000);
        }).success(function (data, status, headers, config) {

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
                pid: $scope.pid,
                file: file,
                type: 1,
                mid: ""
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
                pid: $scope.pid,
                file: file,
                type: 2,
                mid: ""
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
                pid: $scope.pid,
                file: file,
                type: 3,
                mid: ""
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
                pid: $scope.pid,
                file: file,
                type: 4,
                mid: ""
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
