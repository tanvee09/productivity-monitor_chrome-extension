console.log('popup.js loaded');

let productivitymonitor = angular.module("productivitymonitor", ["ui.router"]);

productivitymonitor.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '../views/home.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: '../views/login.html'
        })
        .state('signup', {
            url: '/signup',
            templateUrl: '../views/signup.html'
        })
        .state('welcome', {
            url: '/welcome',
            templateUrl: '../views/welcome.html'
        })
        // this basically tells whether to open welcome or login
    $urlRouterProvider.otherwise(getStorageItem('user') ? 'welcome' : 'login');
    console.log(getStorageItem('user'));
    // $urlRouterProvider.otherwise('login');
});

productivitymonitor.controller("PopupCtrl", ["$scope", "$state", function($scope, $state) {
    console.log('Popup control initialized');

    $scope.login = function(formData) {
        console.log('Form Data from login: ', formData);
        chrome.runtime.sendMessage({ type: "login", data: formData },
            function(response) {
                console.log('Response from background: ', response)
                if (response.user) {
                    $scope.name = response.user.username;
                    $state.go('welcome');
                }
            }
        );
    }

    $scope.signup = function(formData) {
        console.log('Form Data from signup: ', formData);
        // he wrote login here
        chrome.runtime.sendMessage({ type: "signup", data: formData },
            function(response) {
                console.log('Response from background: ', response)
                if (response.token) {
                    $state.go('login');
                }
            }
        );
    }
}]);

productivitymonitor.controller("WelcomeCtrl", ["$scope", "$state", function($scope, $state) {
    console.log('Welcome control initialized');
    console.log(JSON.parse(localStorage.getItem('user')));
    $scope.name = JSON.parse(localStorage.getItem('user')).username;
    document.getElementById('logoutButton').addEventListener('click', function() {
        localStorage.removeItem('user');
        $state.go('login');
    });

}]);

function getStorageItem(varName) {
    if (JSON.parse(localStorage.getItem(varName))) {
        console.log(JSON.parse(localStorage.getItem(varName)).username);
    }
    return JSON.parse(localStorage.getItem(varName));
}


/*
 * Copyright 2013 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var tabId_re = /tabId=([0-9]+)/; // gives the tab id
var match = tabId_re.exec(window.location.hash);
console.log(window.location.hash);
if (match) {
    var hist = chrome.extension.getBackgroundPage().History[match[1]];
    console.log(hist);
    var table = document.createElement("table");
    for (var i = 0; i < hist.length; i++) {
        var r = table.insertRow(-1);

        var date = "";
        // the produces the date to show
        if (i == hist.length - 1 ||
            (hist[i][0].toLocaleDateString() != hist[i + 1][0].toLocaleDateString())) {
            date = hist[i][0].toLocaleDateString();
        }
        // basically get the time the page was loaded and the date when it was loaded
        r.insertCell(-1).textContent = date;

        r.insertCell(-1).textContent = hist[i][0].toLocaleTimeString();

        var end_time;
        if (i == 0) {
            end_time = new Date();
        } else {
            end_time = hist[i - 1][0];
        }
        r.insertCell(-1).textContent = FormatDuration(end_time - hist[i][0]);

        var a = document.createElement("a");
        a.textContent = hist[i][1]; // url
        a.setAttribute("href", hist[i][1]);
        a.setAttribute("target", "_blank");
        r.insertCell(-1).appendChild(a);
    }
    document.body.appendChild(table);
}