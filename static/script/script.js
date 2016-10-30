(function () {
    "use strict";

    P.rules = P.rules.substr ? JSON.parse(P.rules) : P.rules;

    var lines = {x: [], y: [], z: []},
        rules = {x: P.rules.x, y: P.rules.y, z: P.rules.z},
        strings = {x: [], y: [], z: []},
        checked = {x: [], y: [], z: []},
        count = P.count,
        solve = P.solve,
        baseUrl;

    function displayRules () {
        var i,
            els = {
                x: document.querySelectorAll(".xRules .rule"),
                y: document.querySelectorAll(".yRules .rule"),
                z: document.querySelectorAll(".zRules .rule")
            };
        changeCapacity(count);
        if (solve) {
            for (i = 7 - count; i < 13 - (7 - count); i++) {
                if (rules['x'][i]) {
                    els['x'][i].childNodes[0].innerHTML = rules['x'][i].substr(1, rules['x'][i].length - 3);
                    els['y'][i].childNodes[0].innerHTML = rules['y'][i].substr(1, rules['y'][i].length - 3);
                    els['z'][i].childNodes[0].innerHTML = rules['z'][i].substr(1, rules['z'][i].length - 3);
                    rules['x'][i] = new RegExp(rules['x'][i].substr(1, rules['x'][i].length - 3), "g");
                    rules['y'][i] = new RegExp(rules['y'][i].substr(1, rules['y'][i].length - 3), "g");
                    rules['z'][i] = new RegExp(rules['z'][i].substr(1, rules['z'][i].length - 3), "g");
                }
            }
        }
    }

    function disabling (selector, remove) {
        var temp = document.querySelectorAll(selector),
            i = temp.length,
            func = remove ? HTMLElement.prototype.removeAttribute : HTMLElement.prototype.setAttribute;
        while (i--) {
            func.call(temp[i], "disabled", "true");
        }
    }

    function removeGoodBad () {
        var elements = document.querySelectorAll(".good, .bad"),
            i = elements.length;
        while (i--) {
            elements[i].classList.remove("good");
            elements[i].classList.remove("bad");
        }
    }

    function changeCapacity (c) {
        var i = 7 - c,
            length = 12;
        count = c;
        removeGoodBad();
        disabling("[disabled=\"true\"]", true);
        document.querySelector(".puzzle").setAttribute("data-type", count);
        while (i--) {
            disabling(".p" + i + ", .p" + (length - i));
        }
    }

    function addRuleListeners () {
        var els = {
                x: document.querySelectorAll(".xRules .rule"),
                y: document.querySelectorAll(".yRules .rule"),
                z: document.querySelectorAll(".zRules .rule")
            },
            i = els['x'].length;

        function addChangeListener (element, axis, i) {
            element.addEventListener("keyup", function (e) {
                try {
                    rules[axis][i] = RegExp(e.target.value, "g");
                    checkLine(axis, i);
                } catch (e) {}
            });
        }

        while (i--) {
            addChangeListener(els['x'][i], 'x', i);
            addChangeListener(els['y'][i], 'y', i);
            addChangeListener(els['z'][i], 'z', i);
        }
    }

    function checkLine (axis, index) {
        var els, i, element, tempArr, rule, string;
        rule = rules[axis][index] ? rules[axis][index].toString() : "";
        els = document.querySelectorAll("[data-" + axis + "=\"" + index + "\"]:not([disabled])");
        i = els.length;
        string = "";
        while (i--) {
            string += els[i].childNodes[0].value;
        }
        if ((axis === "y") || (axis === "z")) {
            string = string.split("").reverse().join("");
        }
        element = document.querySelector("." + axis + "Rules .rule" + index);
        element.classList.remove("good");
        element.classList.remove("bad");
        checked[axis][index] = false;
        tempArr = string.match(RegExp(rule.substr(1, rule.length - 3), "g"));

        i = els.length;
        if (string.length === i) {
            if (tempArr) {
                if (tempArr.indexOf(string) >= 0) {
                    element.classList.add("good");
                    strings[axis][index] = string;
                    checked[axis][index] = true;
                } else {
                    element.classList.add("bad");
                }
            } else {
                element.classList.add("bad");
            }
        }
    }

    function initialize () {
        var i = 13;
        while (i--) {
            lines['x'][i] = document.querySelectorAll("[data-x=\"" + i + "\"]");
            lines['y'][i] = document.querySelectorAll("[data-y=\"" + i + "\"]");
            lines['z'][i] = document.querySelectorAll("[data-z=\"" + i + "\"]");
            addEventListeners(lines['x'][i], "blur", removeActiveClass);
            addEventListeners(lines['x'][i], "focus", focus);
            addEventListeners(lines['x'][i], "keyup", change);
        }
        function focus (x, y, z) {
            return function () {
                addActiveClass({
                    x: x,
                    y: y,
                    z: z
                })
            }
        }
        function change (x, y, z) {
            return function () {
                checkLine("x", x);
                checkLine("y", y);
                checkLine("z", z);
            }
        }

        displayRules();

        if (!solve){
            addRuleListeners();
            document.getElementById("range").addEventListener("change", function (e) {
                changeCapacity(e.target.value);
            });
            document.getElementById("save").addEventListener("click", submit);
        }

        if (navigator.userAgent.toLowerCase().indexOf('safari') != -1) {
            if (!(navigator.userAgent.toLowerCase().indexOf('chrome') > -1)) {
                var a = document.querySelectorAll('.line');
                i = a.length;
                while (i--) {
                    console.log(a[i]);
                    a[i].style.marginTop = "-12px";
                }
            }
        }
    }

    function addEventListeners (line, type, listener) {
        var i = line.length,
            item, x, y, z;
        while (i--) {
            item = line.item(i);
            x = item.getAttribute("data-x");
            y = item.getAttribute("data-y");
            z = item.getAttribute("data-z");
            item.childNodes[0].addEventListener(type, listener(x, y, z));
        }
    }

    function removeActiveClass () {
        return function () {
            var items = document.getElementsByClassName("active"),
                i = items.length;
            while (i--) {
                items[i].classList.remove("active");
            }
        }
    }

    function addActiveClass (coord) {
        var xLine = document.querySelectorAll("[data-x=\"" + coord.x + "\"]"),
            yLine = document.querySelectorAll("[data-y=\"" + coord.y + "\"]"),
            zLine = document.querySelectorAll("[data-z=\"" + coord.z + "\"]"),
            i;
        document.querySelector(".xRules .rule" + coord.x).classList.add("active");
        document.querySelector(".yRules .rule" + coord.y).classList.add("active");
        document.querySelector(".zRules .rule" + coord.z).classList.add("active");
        i = xLine.length;
        while(i--) {
            xLine[i].classList.add("active");
        }
        i = yLine.length;
        while(i--) {
            yLine[i].classList.add("active");
        }
        i = zLine.length;
        while(i--) {
            zLine[i].classList.add("active");
        }
    }

    function checkPuzzle() {
        var i,
            result = true;
        for (i = 12 - (7 - count); i >= (7 - count); i--) {
            checkLine('x', i);
            checkLine('y', i);
            checkLine('z', i);
            if (!checked['x'][i] || !checked['y'][i] || !checked['z'][i]) {
                result = false;
                break;
            }
        }
        return result;
    }

    function send (data, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    callback(request.responseText);
                }
            }
        };
        request.open('POST', baseUrl + "regexp/api/puzzle", true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send("data=" + JSON.stringify(data));
    }

    function submit () {
        var data = {
            rules: rules,
            strings: strings,
            count: count
        };
        if (checkPuzzle()) {
            send(data, function (message) {
                var id = message.indexOf("/") >= 0 ? message.split("/")[1] : undefined;
                if (id) {
                    alert("Saved");
                    window.location = baseUrl + "regexp/solve?id=" + id;
                } else {
                    alert(message);
                }
            });
        } else {
            alert("Puzzle is not resolved");
        }
    }

    if (window.location.href === "http://lisovyk-oleksandr.azurewebsites.net/regexp/create") {
        baseUrl = 'http://lisovyk-oleksandr.azurewebsites.net/';
    } else {
        baseUrl = 'http://127.0.0.1:1337/';
    }

    RegExp.prototype.toJSON = RegExp.prototype.toString;
    initialize();
})();