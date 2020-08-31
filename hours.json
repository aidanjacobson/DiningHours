let data = {};
async function getData() {
    return await fetch("hours.json").then(response => response.json());
    
}

var hash = +window.location.hash.substring(1);
async function main() {
    data = await getData();
    var current = data.locations[hash];
    doDisplay(current);
}
main();

function doDisplay(current) {
    console.log(current);
    document.querySelector("title").innerText = `${current.name} - Tempe Dining Hours`;
    viewing.innerText = current.name;
    var categoryString = current.category;
    if (current.subcategory != "") {
        categoryString += " (" + current.subcategory + ")";
    }
    category.innerText = categoryString;
    var currentDate = new Date();
    
    if (isOpen(current, currentDate.getDay(), currentDate.getHours(), currentDate.getMinutes())) {
        openDisplay.innerText = "Open";
        openContainer.style.backgroundColor = "green";
    }
    for (var i = 0; i < 7; i++) {
        hourSet = current.hours[i];
        hourString = "";
        if (hourSet[0] == "closed") {
            hourString = "Closed";
        } else {
            var FAM = true;
            firstHour = hourSet[0];
            if (firstHour == 0) {
                firstHour = 12;
            } else if (firstHour == 12) {
                FAM = false;
            } else if (firstHour > 12) {
                firstHour -= 12;
                FAM = false;
            }
            firstMinute = hourSet[1];
            if (firstMinute.toString().length == 1) {
                firstMinute = "0" + firstMinute;
            }

            var LAM = true;
            lastHour = hourSet[2];
            if (lastHour >= 24) {
                lastHour -= 24;
            }
            if (lastHour == 0) {
                lastHour = 12;
            } else if (lastHour > 12) {
                lastHour -= 12;
                LAM = false;
            }
            lastMinute = hourSet[3];
            if (lastMinute.toString().length == 1) {
                lastMinute = "0" + lastMinute;
            }

            hourString = `${firstHour}:${firstMinute} ${FAM ? "AM" : "PM"} - ${lastHour}:${lastMinute} ${LAM ? "AM" : "PM"}`;
        }
        if (new Date().getDay() == i) {
            hourstable.children[0].children[i].children[1].innerHTML = `<b>${hourString}</b>`;
        } else {
            hourstable.children[0].children[i].children[1].innerHTML = hourString;
        }
    }
}



function isWithinTimeframe(searchHour, searchMinute, hourSet) { // copied from main.js
    if (searchHour < hourSet[0]) {
        return false;
    } else if (searchHour == hourSet[0]) {
        if (searchMinute < hourSet[1]) {
            return false;
        }
    }
    if (searchHour > hourSet[2]) {
        return false;
    } else if (searchHour == hourSet[2]) {
        if (searchMinute >= hourSet[3]) {
            return false;
        }
    }
    return true;
}

function isOpen(loc, day, setHours, setMinutes) { // copied from main.js
    if (loc.hours[day][0] == "closed") {
        return false;
    }
    var args = [setHours, setMinutes, loc.hours[day]];
    var prevDay = loc.hours[(day+6) % 7];
    if (prevDay[0] != "closed") {
        if (prevDay[2] >= 24 && setHours <= prevDay[2]-24) { // late night, next day early morning
            args = [setHours + 24, setMinutes, prevDay];
        }
    }
    return isWithinTimeframe(...args);
}

function back() {
    window.close();
}

var favoriteCheck = document.getElementById("favoriteCheck");
var favoriteIndex = JSON.parse(localStorage.getItem("favorites") || "[]");
localStorage.setItem("favorites", JSON.stringify(favoriteIndex));
favoriteCheck.checked = favoriteIndex.indexOf(hash) > -1;
function doFavoriteUpdate() {
    if (!favoriteCheck.checked) {
        if (favoriteIndex.indexOf(hash) > -1) {
            favoriteIndex.splice(favoriteIndex.indexOf(hash), 1);
        }
    } else {
        if (favoriteIndex.indexOf(hash) == -1) {
            favoriteIndex.push(hash);
        }
    }
    localStorage.setItem("favorites", JSON.stringify(favoriteIndex));
}

if (!window.opener) {
    backbutton.hidden = true;
}
