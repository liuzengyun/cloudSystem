//这些事一些公用的angularJS文件,所以统一定义到这里
var id = sessionStorage.getItem("id");
// 引入路由和动态懒加载和分页依赖
var cloud = angular.module("cloud", ["ngRoute", "infinite-scroll", "ui.bootstrap", "ngFileUpload"]);
if (id == "" || id == "undefined" || id == null) {
    window.location.href = "../index.html";
}
// 公用的一些接口
cloud.controller("commonCtrl", function ($scope, $http) {
    $scope.uid = sessionStorage.getItem("id");
    $scope.Mposition = sessionStorage.getItem("position");
    $scope.checkLoginStatus = sessionStorage.getItem("status");
    if ($scope.checkLoginStatus == 4) {
        $(".fa-key").click();
    }
    // 登陆成功,获取登陆信息
    //$http.get(url + "common/user", {params: {id: id}}).success(function (data) {
    //    consoleLog(data);
    $scope.name = sessionStorage.getItem("name");
    $scope.email = sessionStorage.getItem("email");
    $scope.phone = sessionStorage.getItem("phone");
    $scope.tel = sessionStorage.getItem("tel");
    $scope.position = sessionStorage.getItem("position");
    //});

    // 修改基本信息
    $scope.editBaseInfo = function () {
        var data = {
            id: id,
            phone: $scope.phone,
            tel: $scope.tel,
            email: $scope.email
        };
        editBaseInfo($scope, $http, data);
    };
    // 退出
    $scope.loginOut = function () {
        // 清除h5本地session
        sessionStorage.clear();
        $http.get(url + "login/logout").success(function (data) {
            window.location.href = "../index.html";
            console.log(data);
        });
    };
    //修改密码
    $scope.updatePassword = function (argue) {
        if ($scope.newPass != $scope.oldPassToo) {
            $scope.passMsg = "新密码两次输入不一致";
            return false;
        }
        else {
            if ($scope.newPass == "") {
                $scope.passMsg = "新密码不能为空";
                return false;
            }
            else {
                var data = {
                    uid: $scope.uid,
                    old_pass: $scope.oldPass,
                    new_pass: $scope.newPass
                };
                consoleLog(data);
                $http.post(url + argue, data).success(function (data) {
                    $scope.passMsg = data.message;
                    if (data.status == true) {
                        sessionStorage.setItem("status", 1);
                        window.location.reload();
                    }
                    consoleLog(data);
                })
            }
        }
    };

    $scope.passMidName = function(id) {
        $scope.passMidName = id;
    };
    //// 通知是否过期
    //$http.get(url + "common/item_status", {params: {uid: id}}).success(function (data) {
    //    consoleLog(data);
    //});
    //// 是否有新的通知
    //$http.get(url + "common/notices", {params: {uid: id}}).success(function (data) {
    //    consoleLog(data);
    //    if (data.length > 0) {
    //        $scope.noticeData = data;
    //        $scope.noticeLength = data.length;
    //        $scope.noticeStatus = false;
    //    }
    //    else {
    //        $scope.noticeStatus = true;
    //    }
    //});
    // 修改通知状态
    $scope.noticeStatusFun = function (nid, href, pid) {
        $http.get(url + "common/notice_update", {params: {nid: nid}}).success(function (data) {
            consoleLog(data);
            if (href == 1) {
                window.location.reload();
                window.location.href = "#/speed/" + pid;
            }
            if (href == 2) {
                window.location.reload();
                window.location.href = "#/files/" + pid;
            }
            if (href == 3) {
                window.location.reload();
                window.location.href = "#/endProject/" + pid;
            }
            if (href == 4) {
                window.location.reload();
                window.location.href = "#/endProject/" + pid;
            }
        });
    }
});


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
                    finalString += i + 1 + ". " + arr[i] + "  ";
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
            return "";
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

cloud.directive("changeBgColor", function () {
    return {
        restrict: 'C',
        link: function (scope, element, attrs) {
            element.click(function () {
                element.css("background-color", "#fff");
                element.parent().parent().siblings().find(".well").css("background-color", "#f5f5f5");
            })
        }
    }
});

cloud.directive("rowBg", function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            // 获取element.inde()第几个元素
            if(element.index() % 2 == 0) {
                element.css("background", "#f5f5f5");
            }
        }
    }
});