let data = {};
async function getData() {
    return await fetch("hours.json").then(response => response.json());
    
}
window.onload = function() {
    var primaryFilterOptions = [];
    var secondaryFilterOptions = {};
    main();
}

var primaryFilter = document.getElementById("primaryFilter");
var secondaryFilter = document.getElementById("secondaryFilter");

async function compileFilterOptions() {
    primaryFilterOptions = ["All"];
    secondaryFilterOptions = {All:["All"]};
    for (var i = 0; i < data.locations.length; i++) {
        var current = data.locations[i];
        if (primaryFilterOptions.indexOf(current.category) == -1) {
            primaryFilterOptions.push(current.category);
            secondaryFilterOptions[current.category] = ["All"];
        }
        if (secondaryFilterOptions[current.category].indexOf(current.subcategory) == -1 && current.subcategory != "") {
            secondaryFilterOptions[current.category].push(current.subcategory);
        }
    }
}

function populatePrimaryFilter() {
    primaryFilter.innerHTML = "";
    for (var i = 0; i < primaryFilterOptions.length; i++) {
        primaryFilter.innerHTML += `<option value='${primaryFilterOptions[i]}'>${primaryFilterOptions[i]}</option>`;
    }
    primaryFilter.onchange = function() {
        populateSecondaryFilter();
    }
}

function populateSecondaryFilter() {
    secondaryFilter.innerHTML = "";
    var curOption = secondaryFilterOptions[primaryFilter.options[primaryFilter.selectedIndex].value];
    for (var i = 0; i < curOption.length; i++) {
        var option = curOption[i];
        secondaryFilter.innerHTML += `<option value='${option}'>${option}</option>`;
    }
    if (secondaryFilter.options.length == 1) {
        secondaryFilter.setAttribute("disabled", "disabled");
    } else {
        secondaryFilter.removeAttribute("disabled");
    }
}

function setDateToCurrent() {
    var curDate = new Date();
    var year = curDate.getFullYear();
    var month = curDate.getMonth() + 1;
    if (month.toString().length == 1) {
        month = "0" + month;
    }
    var day = curDate.getDate();
    var dateString = `${year}-${month}-${day}`;
    onDayDate.value = dateString;
}

function setTimeToCurrent() {
    var curDate = new Date();
    var hour = curDate.getHours();
    if (hour.toString().length == 1) {
        hour = "0" + hour;
    }

    var minute = curDate.getMinutes();
    if (minute.toString().length == 1) {
        minute = "0" + minute;
    }

    var timeString = `${hour}:${minute}`;
    atTimeSelect.value = timeString;
}

function initDateAndTime() {
    onDayDate.setAttribute("disabled", "disabled");
    atTimeSelect.setAttribute("disabled", "disabled");
    
    dateFilter.onchange = function() {
        switch (dateFilter.selectedIndex) {
            case 0: 
                onDayDate.setAttribute("disabled", "disabled");
                break;
            case 1:
                onDayDate.setAttribute("disabled", "disabled");
                setDateToCurrent();
                break;
            case 2:
                onDayDate.removeAttribute("disabled");
                break;
        }
    }
    timeFilter.onchange = function() {
        switch (timeFilter.selectedIndex) {
            case 0: 
                atTimeSelect.setAttribute("disabled", "disabled");
                break;
            case 1:
                atTimeSelect.setAttribute("disabled", "disabled");
                setTimeToCurrent();
                break;
            case 2:
                atTimeSelect.removeAttribute("disabled");
                break;
        }
    }
    setDateToCurrent();
    setTimeToCurrent();
    setInterval(function() {
        if (timeFilter.selectedIndex == 1) {
            setTimeToCurrent();
        }
        if (dateFilter.selectedIndex == 1) {
            setDateToCurrent();
        }
    }, 1000);
}

function doDefaultIfAvailable() {
    if (localStorage.getItem("defaultFilters")) {
        options = JSON.parse(localStorage.getItem("defaultFilters"));
        primaryFilter.selectedIndex = options.primaryFilter;
        primaryFilter.onchange();
        secondaryFilter.selectedIndex = options.secondaryFilter;
        favSelect.selectedIndex = options.favSelect;
        favSelect.onchange();
        dateFilter.selectedIndex = options.dateFilter;
        dateFilter.onchange();
        onDayDate.value = options.onDayDate;
        timeFilter.selectedIndex = options.timeFilter;
        timeFilter.onchange();
        atTimeSelect.value = options.atTimeSelect;
        clearButton.removeAttribute("disabled");
        filter();
    }
}

async function main() {
    data = await getData();
    compileFilterOptions();
    populatePrimaryFilter();
    populateSecondaryFilter();
    initDateAndTime();

    doDefaultIfAvailable();
}

function preset(presetOption) {
    switch (presetOption) {
        case 'default':
            doDefaultIfAvailable();
            break;
        case 'openNow':
            primaryFilter.selectedIndex = 0;
            populateSecondaryFilter();
            favSelect.selectedIndex = 0;
            dateFilter.selectedIndex = 1;
            timeFilter.selectedIndex = 1;
            break;
        case 'favorites':
            primaryFilter.selectedIndex = 0;
            populateSecondaryFilter();
            favSelect.selectedIndex = 1;
            dateFilter.selectedIndex = 0;
            timeFilter.selectedIndex = 0;
            break;
        case 'all':
            primaryFilter.selectedIndex = 0;
            populateSecondaryFilter();
            secondaryFilter.selectedIndex = 0;  
            favSelect.selectedIndex = 0;
            dateFilter.selectedIndex = 0;
            timeFilter.selectedIndex = 0;
    }
    dateFilter.onchange();
    timeFilter.onchange();
    favSelect.onchange();
    filter();
}

var favoriteIndex = JSON.parse(localStorage.getItem("favorites") || "[]");
favSelect.onchange = function() {
    favoriteIndex = JSON.parse(localStorage.getItem("favorites") || "[]")
}


function filter() {
    var results = data.locations.filter(function(loc, i) {
        loc.index = i;
        // place filters
        if (primaryFilter.selectedIndex != 0) {
            if (primaryFilter.options[primaryFilter.selectedIndex].value != loc.category) {
                return false;
            }
            if (secondaryFilter.selectedIndex != 0) {
                if (secondaryFilter.options[secondaryFilter.selectedIndex].value != loc.subcategory) {
                    return false;
                }
            }
        }

        // favorite filters
        if (favSelect.selectedIndex == 1) {
            if (favoriteIndex.indexOf(i) == -1) {
                return false;
            }
        }

        // date filters
        if (dateFilter.selectedIndex != 0) {
            var setDate = new Date(onDayDate.value + " 00:00");
            if (loc.hours[setDate.getDay()][0] == "closed") {
                return false;
            }
        }

        // time filters
        if (timeFilter.selectedIndex != 0) {
            var checkDays = [];
            if (dateFilter.selectedIndex == 0) { // search for any day with hours
                checkDays = [0, 1, 2, 3, 4, 5, 6];
            } else { // search for setDate day with hours
                var setDate = new Date(onDayDate.value + " 00:00");
                checkDays = [setDate.getDay()];
            }
            dayResults = checkDays.map(function(day) {
                if (loc.hours[day][0] == "closed") {
                    return false;
                }
                var setTime = atTimeSelect.valueAsNumber / 60000;
                var setHours = Math.floor(setTime / 60);
                var setMinutes = setTime - setHours*60;

                return isOpen(loc, day, setHours, setMinutes);
            });
            console.log(dayResults, loc);
            somePass = dayResults.some(r=>r); // at least one day open?
            if (!somePass) {
                return false;
            }
        }
        return true;
    })
    console.log(results);
    populateResults(results);
}

function isWithinTimeframe(searchHour, searchMinute, hourSet) {
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

function isOpen(loc, day, setHours, setMinutes) {
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

function setDefaultSearch() {
    var options = {
        primaryFilter: primaryFilter.selectedIndex,
        secondaryFilter: secondaryFilter.selectedIndex,
        favSelect: favSelect.selectedIndex,
        dateFilter: dateFilter.selectedIndex,
        onDayDate: onDayDate.value,
        timeFilter: timeFilter.selectedIndex,
        atTimeSelect: atTimeSelect.value
    };
    localStorage.setItem("defaultFilters", JSON.stringify(options));
    clearButton.removeAttribute("disabled");
}

var searchResults = document.getElementById("searchResults");

function populateResults(results) {
    searchResults.innerHTML = "";
    var list = document.createElement("ul");
    var favoriteResults = results.filter(loc=>favoriteIndex.indexOf(loc.index) > -1);
    var unfavoriteResults = results.filter(loc=>favoriteIndex.indexOf(loc.index) == -1);
    results = favoriteResults.concat(unfavoriteResults);
    for (var i = 0; i < results.length; i++) {
        var item = document.createElement("li");
        item.innerHTML = `<b>${results[i].name}</b>`;
        var infoContainer = document.createElement("ul");
        var curOpen = isOpen(results[i], new Date().getDay(), new Date().getHours(), new Date().getMinutes());
        var openInfo = document.createElement("li");
        openInfo.innerText = curOpen ? "Open now" : "Closed now";
        openInfo.style.color = curOpen ? "green" : "red";
        var locationString = results[i].category;
        if (results[i].subcategory != "") {
            locationString += " (" + results[i].subcategory + ")";
        }
        var locationInfo = document.createElement("li");
        locationInfo.innerText = locationString;
        var moreInfo = document.createElement("li");
        moreInfo.innerHTML = `<a href='view.html#${results[i].index}' target='_blank'>More Info</a>`;
        infoContainer.append(openInfo);
        infoContainer.append(locationInfo);
        infoContainer.append(moreInfo);
        item.append(infoContainer);
        list.append(item);
        list.append(document.createElement("br"));
    }
    searchResults.append(list);
}

function clearDefault() {
    localStorage.removeItem('defaultFilters');
    clearButton.setAttribute("disabled", "disabled");
}
