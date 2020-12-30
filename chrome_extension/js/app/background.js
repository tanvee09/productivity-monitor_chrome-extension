console.log('background.js running')

let domain = "http://localhost:8000/";

ajaxCall("GET", "user/me", {}, getStorageItem('user') ? getStorageItem('user').token : '', function(response) {
    console.log('response from server is: ', response);
})

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch (message.type) {
            case "login":
                console.log('Got login from content.js: ', message);
                ajaxCall("POST", "user/login", message.data, '', function(response) {
                    console.log('Response from server: ', response);
                    if (response.user) {
                        setStorageItem('user', response.user);
                    }
                    sendResponse(response);
                });
                return true;
            case "signup":
                console.log('Got signup from content.js: ', message);
                ajaxCall("POST", "user/signup", message.data, '', function(response) {
                    console.log('Response from server: ', response);
                    sendResponse(response);
                });
                return true;
            default:
                console.log("Couldn't find matching case");
        }
    }
);


function ajaxCall(type, path, data, token, callback) {
    $.ajax({
        url: domain + path, // .
        type: type, // .
        data: data, // .
        headers: {
            token: token
        },
        success: function(response) {
            // console.log('response: ', response);
            callback(response);
        },
        error: function(response) {
            // console.log('response: ', response);
            callback(response);
        }
    });
}


function setStorageItem(varName, data) {
    console.log('varName: ', varName);
    if (varName != 'searchPageData') {
        console.log('data: ', data);
        window.localStorage.setItem(varName, JSON.stringify(data));
    }
}


function getStorageItem(varName) {
    return JSON.parse(localStorage.getItem(varName));
}







var History = {};
var urlHistory = {};
var urlHistoryLastSent = {};
var lastUpdated = {};

function showHistory() {

}

// tab -> history
chrome.browserAction.setBadgeText({ 'text': '?' }); // initializing text
chrome.browserAction.setBadgeBackgroundColor({ 'color': "#e75480" }); // changes text color bg

function Update(t, tabId, url) {
    if (!url) {
        return;
    }
    if (tabId in History) {
        if (url == History[tabId][0][1]) {
            return;
        }
    } else {
        History[tabId] = [];
    }
    History[tabId].unshift([t, url]);

    var history_limit = parseInt(localStorage["history_size"]);
    if (!history_limit) {
        history_limit = 23;
    }
    while (History[tabId].length > history_limit) {
        History[tabId].pop();
    }

    chrome.browserAction.setBadgeText({ 'tabId': tabId, 'text': '0:00' });
    // chrome.browserAction.setPopup({ 'tabId': tabId, 'popup': "../../views/welcome.html#tabId=" + tabId });
}

function HandleUpdate(tabId, changeInfo, tab) {
    Update(new Date(), tabId, changeInfo.url);
}

function HandleRemove(tabId, removeInfo) {
    delete History[tabId];
}

function HandleReplace(addedTabId, removedTabId) {
    var t = new Date();
    delete History[removedTabId];
    chrome.tabs.get(addedTabId, function(tab) {
        Update(t, addedTabId, tab.url);
    });
}


function UpdateBadges() {
    var now = new Date();
    for (tabId in History) {
        var url = History[tabId][0][1];
        url = new URL(url);
        url = url.hostname;
        var totalTime = now;
        if (tabId in lastUpdated) {
            totalTime -= lastUpdated[tabId];
        } else {
            totalTime -= History[tabId][0][0];
        }
        lastUpdated[tabId] = now;
        totalTime /= 60000;
        if (url in urlHistory) {
            urlHistory[url] += totalTime
        } else {
            urlHistory[url] = totalTime
        }
        if (localStorage.getItem('user')) {
            var description = FormatDuration(now - History[tabId][0][0]);
            chrome.browserAction.setBadgeText({ 'tabId': parseInt(tabId), 'text': description });
        } else {
            var description = FormatDuration(now - now);
            chrome.browserAction.setBadgeText({ 'tabId': parseInt(tabId), 'text': description });
            History = {};
            urlHistory = {};
            urlHistoryLastSent = {};
            lastUpdated = {};
        }
    }
    var historyToSend = Object.assign({}, urlHistory);
    console.log('-----', historyToSend);
    console.log('=====', urlHistoryLastSent);
    for (i in urlHistoryLastSent) {
        if (i in historyToSend)
            historyToSend[i] -= urlHistoryLastSent[i];
    }
    if (JSON.parse(localStorage.getItem('user'))) {
        let email = JSON.parse(localStorage.getItem('user')).email;
        // console.log(username);
        let data = { email: email, timespent: historyToSend };
        // console.log(data);
        ajaxCall("POST", "user/timespent", data, '', function(response) {
            // console.log('Response from server after storing data: ', response);
            // sendResponse(response);
        });
    }
    console.log("Sent ====> ", historyToSend);
    urlHistoryLastSent = Object.assign({}, urlHistory);
}

setInterval(UpdateBadges, 1000);
setInterval(showHistory, 1000);
chrome.tabs.onUpdated.addListener(HandleUpdate);
chrome.tabs.onRemoved.addListener(HandleRemove);
chrome.tabs.onReplaced.addListener(HandleReplace);