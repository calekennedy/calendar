//Hacked by Cale Kennedy
//26 April 2013

var calendarCssFilePath = '/calendar.css';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// This is the basic setup code that gets the user's input sets variable values and draws the calendar. /////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
    How to use the calendar:
    1.  $(#my-calendar-wrapper).calendar() is the only function you should ever call. Again, this is the only function you should ever call.
    2.  Pass it a month in integer format [1-12]. I decided to use human friendly month formatting. Code monkey was being nice.
    3.  Pass it a year in integer format (e.g., 2013). 
    4.  Pass it a json array of dates that you want the calendar to select automatically.
        The array requires the following format: {day: 1, month: 4, year: 2013}. //April 1, 2013
*/

(function ($) {
        var methods = {
            init: function (options) {

                //variables used to load default values
                var now = moment();
                var defaultMonth = now.month() + 1; //adjust the index to be human friendly
                var defaultYear = now.year();
                var defaultSelectedDates = new Array();
                // Create some defaults, extending them with any options that were provided
                var settings = $.extend({
                    'month': defaultMonth, // current month
                    'year': defaultYear, // current year
                    'selectedDates': defaultSelectedDates // empty json array of format {day: 26, month: 4, year: 2013}
                }, options);
                
                console.log("initializing calendar.");
                console.log("options = month: " + settings.month + ", year: " + settings.year + ", selectedDates: " + settings.selectedDates.length);
                
                return this.each(function () {
                    
                    var $this = $(this), data = $this.data('calendar');
                    
                    // If the plugin hasn't been initialized yet
                    if (!data) {
                        $(this).data('calendar', {
                            month: settings.month, //This is used throughout the navigation methods
                            year: settings.year, //This is used throughout the navigation methods
                            
                            inputDateWrapper: setInputDateWrapper(settings.month, settings.year), // this is my moment() object I create from the options
                            iteratedDate: setIteratedDate(inputDateWrapper), // this is my moment() object I create by cloning inputDateWrapper then manipulating. 

                            selectedDates: settings.selectedDates,
                            
                            calendarWrapper: $this, // this is the div where we want to generate the calendar.
                            monthNames: new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"),
                            displayWeeks: setDisplayWeeks(inputDateWrapper), // the number of rows that have to be shown on the calendar
                            hasEventListeners: false
                        });
                    }

                    drawCalendar($this);
                    
                    if (! $this.data.hasEventListeners) {
                        includeCalendarEventListeners($this);
                        $this.data.hasEventListeners = true;
                    }
                });
            },
            setDates: function (selectedDates) {
                console.log("not yet implemented");
            },
            clearDates: function() {
                console.log("not yet implemented");
            }
        };

        $.fn.calendar = function (method) {

            // Method calling logic
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.calendar');
                return $.error('Method ' + method + ' does not exist on jQuery.calendar');
            }
        };
    
})(jQuery);

function setInputDateWrapper(month, year) {
    //subtract one from the month because Date uses 0-11 month indexing
    var inputDate = new Date(year, month - 1, 1); 

    if (moment(inputDate).isValid()) {
        return inputDateWrapper = moment(inputDate);
    } else {
        return inputDateWrapper = moment().startOf('month');
    }
}

function setIteratedDate(dateWrapper) {
    var dayOfWeek = dateWrapper.day(); // 0 = sunday, 1 = monday,..., 6 = saturday
    var iteratedDate = moment(dateWrapper).subtract('days', dayOfWeek).startOf('day');
    return iteratedDate;
}

function setDisplayWeeks(dateWrapper) {
    var startDate = moment(dateWrapper);
    var startMonth = startDate.month();
    //February, not leap year, with first day on sunday
    var weekDay = startDate.day();
    var plus28 = moment(startDate).add('day', 28);
    var plus28Month = plus28.month();
    var plus30 = moment(startDate).add('day', 30);
    var plus30Month = plus30.month();
    if ((weekDay == 0) && (plus28Month != startMonth)){ return 4; }
    //31 day month with first day on friday or 29, 30, 31 day month with first day on saturday
    else if ( ((weekDay == 5) && (plus30Month == startMonth)) || ((weekDay == 6) && (plus28Month == startMonth))){ return 6; }
    //all other months
    else { return 5; }
}

function drawCalendar(calendarWrapper) {
    
    includeCalendarCss(); //Make sure the css file has been loaded.

    var data = calendarWrapper.data('calendar'); // this is the data object we set above.

    var monthHeader = $('<div class="month-header"></div>');
    var navBack = $('<span></span>')
        .addClass('navigation')
        .addClass('navigation-back')
        .addClass('glyphicon-left-arrow');
    var monthName = $('<span class="month-name">'+ data.monthNames[data.inputDateWrapper.month()] + " " + data.year +'</span>');
    var navForward = $('<span></span>')
        .addClass('navigation')
        .addClass('navigation-forward')
        .addClass('glyphicon-right-arrow');
    
    monthHeader.append(navBack)
        .append(monthName)
        .append(navForward);

    var dayNames = $('<div class="day-names"></div>');
        var sunday = $('<span class="calendar-cell">SU</span>');
        var monday = $('<span class="calendar-cell">MO</span>');
        var tuesday = $('<span class="calendar-cell">TU</span>');
        var wednesday = $('<span class="calendar-cell">WE</span>');
        var thursday = $('<span class="calendar-cell">TH</span>');
        var friday = $('<span class="calendar-cell">FR</span>');
        var saturday = $('<span class="calendar-cell">SA</span>');
    
    dayNames.append(sunday)
        .append(monday)
        .append(tuesday)
        .append(wednesday)
        .append(thursday)
        .append(friday)
        .append(saturday);
    
    var calendarDays = $('<div class="calendar-days"></div>');
    for (var row = 0; row < data.displayWeeks; row++) {
        var daysRow = $('<span class="days-row"></span>');
            //scoping these variables outside the following for loop will optimize memory usage
            var isCurrentMonth;
            var isSunday;
            var isSaturday;
            var isNotWeekend;
            var today = moment().startOf('day');
            var isToday;
            for (var col = 0; col < 7; col++) {
                isCurrentMonth = data.iteratedDate.month() == data.inputDateWrapper.month();
                isSunday = data.iteratedDate.day() == 0;
                isSaturday = data.iteratedDate.day() == 6;
                isNotWeekend = !(isSunday || isSaturday);
                isToday = data.iteratedDate.toString() == today.toString();//This removes any weird time components. We only need accuracy to the day and I'm not that familiar with the moments.js library.
                var calendarCell = $('<span class="calendar-cell"></span>');
                    var calendarDay = $('<span class="calendar-day">'+ data.iteratedDate.date() +'</span>')
                        .addClass(isCurrentMonth ? "" : "obscure-day")
                        .addClass(isSunday ? "left-end" : "")
                        .addClass(isSaturday ? "right-end" : "")
                        .addClass(isNotWeekend ? "" : "obscure-text")
                        .addClass(isToday ? "current-day" : "")
                        .attr("day", data.iteratedDate.date())
                        .attr("month", (data.iteratedDate.month() +1)) // change the month to human friendly months, 1-12 vs 0-11
                        .attr("year", data.iteratedDate.year());
                
                    data.iteratedDate.add('days', 1);
                
                    calendarCell.append(calendarDay);
                
                daysRow.append(calendarCell);
            }
        calendarDays.append(daysRow);
    }
    var clear = $('<div class="calendar-clear"></div>');
    calendarDays.append(clear); //this will force the calendar-days div to resize

    calendarWrapper.empty();
    calendarWrapper.addClass("calendar");
    
    calendarWrapper.append(monthHeader)
        .append(dayNames)
        .append(calendarDays);
}

function includeCalendarCss() {
    var calendarCssId = 'calendarCss';
    var alreadyExists = document.getElementById(calendarCssId);
    if (!alreadyExists) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = calendarCssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = calendarCssFilePath;
        link.media = 'all';
        head.appendChild(link);
    }
}

function includeMomentsJs() {
    var momentsJsId = 'momentsJs';
    var alreadyExists = document.getElementById(momentsJsId);
    if (!alreadyExists) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('SCRIPT');
        script.id = momentsJsId;
        script.type = 'text/javascript';
        script.src = momentsJsFilePath;
        head.appendChild(script);
    }
}


function includeCalendarEventListeners(calendarWrapper) {

    var data = calendarWrapper.data('calendar');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////// This is the code that gets and shows the days for the selected month on the calendar. /////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //get previous month or next month
    $(calendarWrapper).on("click", ".navigation", function () {
        var element = $(this);
        if (element.hasClass("navigation-forward")) {
            showNextMonth();
        }
        if (element.hasClass("navigation-back")) {
            showPreviousMonth();
        }
    });

    function showPreviousMonth() {
        if (parseInt(data.month) == 1) {
            data.month = 12;
            data.year--;
        } else {
            data.month--;
        }
        updateCalendar();
    }

    function showNextMonth() {
        if (parseInt(data.month) == 12) {
            data.month = 1;
            data.year++;
        } else {
            data.month++;
        }
        updateCalendar();
    }
    
    function updateCalendar() {
        //broke these into separate functions for Single Responsibility, however the order your call them is important
        data.inputDateWrapper = setInputDateWrapper(data.month, data.year);
        data.iteratedDate =  setIteratedDate(data.inputDateWrapper);
        data.displayWeeks =  setDisplayWeeks(data.inputDateWrapper);
        drawCalendar(calendarWrapper);
        showSelectedDays();
    }

    showSelectedDays();

    //This method iterates over selectedDates and calls showAsSelected() for each date. //Show as selected is declared in the next section of functions
    function showSelectedDays() {
        var selectedDates = data.selectedDates;
        for (var index in selectedDates) {
            var day = selectedDates[index]["day"];
            var month = selectedDates[index]["month"];
            var year = selectedDates[index]["year"];
            showAsSelected(day, month, year);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////// This is the code that actually selects and stores the selected days from the calendar. /////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var isMouseHeldDown; // This state variable is used in the $(calendar).on("mousedown") event function. 
    var toDeselect = false;

    //I use some state-based css classes to facilitate UX. The event ensures that those classes are removed. It's essentially the reset button on a state machine.
    $(calendarWrapper).mouseout(function() {
        if (isMouseHeldDown) {
            removeVisualMarkerClasses();
        }
    });

    $(document).mouseup(function() {
        isMouseHeldDown = false; //reset state variable.
        toDeselect = false;
        $(".mousedown").removeClass("mousedown");
    });

    function removeVisualMarkerClasses() {
        $(".calendar-highlighted").removeClass("calendar-highlighted");
        $(".selecting").removeClass("selecting");
        $(".deselecting").removeClass("deselecting");
        //remove the selection attribute from selected elements
        clearSelections();
    }

    //I need this variables to be globally accessible because they're used in multiple functions.
    //These attributes come from the element the user mouses down on.
    var mousedownDay;
    var mousedownMonth;
    var mousedownYear;
    //These attributes come from the element the user mouses up on.
    var mouseupDay;
    var mouseupMonth;
    var mouseupYear;

    var date;


    //we need to watch for several events from the user
    $(calendarWrapper).on("mousedown mouseup mouseover mouseout", ".calendar-day", function(event) {
        //the following events are part of the click and drag functionality
        var element;
        if (event.type == "mousedown") { //we'll need to store some values to use in the selectDatesInRange() method
            element = $(this);
            
            mousedownDay = parseInt(element.attr("day"));
            mousedownMonth = parseInt(element.attr("month"));
            mousedownYear = parseInt(element.attr("year"));

            //Set state for click and drag functionality
            element.addClass("calendar-highlighted").addClass("mousedown");
            if (element.hasClass("selected")) {
                toDeselect = true;
                element.addClass("deselecting");
            } else {
                element.addClass("selecting");
            }
            isMouseHeldDown = true;
        } else if (event.type == "mouseup") { //first, we grab some values, then it's time to select an entire range of dates
            element = $(this);

            mouseupDay = parseInt(element.attr("day"));
            mouseupMonth = parseInt(element.attr("month"));
            mouseupYear = parseInt(element.attr("year"));
            //selectDatesInRange();
            selectHighlightedElements();
            
            //remove the highlighted classes from the newly selected elements
            removeVisualMarkerClasses();

            $(calendarWrapper).trigger('change', [data.selectedDates]);
        }
        if (event.type == "mouseover" && isMouseHeldDown) { //use the state variable to detect click and drag functionality
            element = $(this);
            //Format these two dates for the comparator method
            var mousedownDate = parseInt(mousedownYear.toString() + twoDigitStringFromInt(mousedownMonth) + twoDigitStringFromInt(mousedownDay));
            var mouseoverDate = parseInt(element.attr("year").toString() + twoDigitStringFromInt(parseInt(element.attr("month"))).toString() + twoDigitStringFromInt(parseInt(element.attr("day").toString())));

            if (element.hasClass("calendar-highlighted") == 0) { // This horrible excuse for syntax means the element doesn't have the dragging over class.
                if (isCorrectOrder(mousedownDate, mouseoverDate)) {
                    addHighlightedToElements(element, "previous");
                } else {
                    addHighlightedToElements(element, "next");
                }
            }
            else { // this shouldn't ever happen because of the mouseout event below, but it's here to be thorough.
                removeVisualMarkerClasses();
            }
        }
        if (event.type == "mouseout") {
            removeVisualMarkerClasses();
        }
    });

    //DOM recursion anyone?
    function addHighlightedToElements(element, direction) {

        //we have to add this class before we return incase they had previously moused out of a calendar-day;
        //it doesn't hurt anything to call .addClass when it already has it anyway.
        element.addClass("calendar-highlighted");
        if (toDeselect) {
            element.addClass("deselecting");
        } else {
            element.addClass("selecting");
        }

        if (element.hasClass("mousedown")) {
            return;
        }

        var year = parseInt(element.attr("year"));
        var month = parseInt(element.attr("month"));
        var day = parseInt(element.attr("day"));

        if (direction == "next") {
            var lastDay = endOfMonth(month, year);
            var isEndOfMonth = (day == lastDay);
            if (isEndOfMonth) {
                if (month == 12) {
                    element = $(".calendar-day[day=1][month=1][year=" + (year + 1) + "]");
                    addHighlightedToElements(element, "next");
                } else {
                    element = $(".calendar-day[day=1][month=" + (month + 1) + "][year=" + year + "]");
                    addHighlightedToElements(element, "next");
                }
            } else {
                element = $(".calendar-day[day=" + (day + 1) + "][month=" + month + "][year=" + year + "]");
                addHighlightedToElements(element, "next");
            }
        }
        if (direction == "previous") {
            if (day == 1) {
                if (month == 1) {
                    element = $(".calendar-day[day=" + 31 + "][month=" + 12 + "][year=" + (year - 1) + "]");
                    addHighlightedToElements(element, "previous");
                } else {
                    element = $(".calendar-day[day=" + endOfMonth(month - 1, year) + "][month=" + (month - 1) + "][year=" + (year) + "]");
                    addHighlightedToElements(element, "previous");
                }
            } else {
                element = $(".calendar-day[day=" + (day - 1) + "][month=" + (month) + "][year=" + (year) + "]");
                addHighlightedToElements(element, "previous");
            }
        }
    }
    
    function selectHighlightedElements() {
        $(".calendar-highlighted").each(function() {
            var element = $(this);
            var year = parseInt(element.attr("year"));
            var month = parseInt(element.attr("month"));
            var day = parseInt(element.attr("day"));

            var deselecting = element.hasClass("deselecting");
            if (deselecting) {
                deselectDate(day, month, year);
            } else {
                selectDate(day, month, year);
            }
        });
    }

    //this will add a date to our selectedDates array and call showAsSelected()
    function selectDate(day, month, year) {
        date = { day: day, month: month, year: year };
        data.selectedDates.push(date);
        showAsSelected(day, month, year);
    }

    //this will change the markup on a selected day to visually accomodate the user's experience
    function showAsSelected(day, month, year) {
        var calendarDay = $(".calendar-day[day=" + day + "][month=" + month + "][year=" + year + "]");
        calendarDay.addClass("selected");
    }

    //this will remove a date from our selectedDates array and call stopShowingAsSelected()
    function deselectDate(day, month, year) {
        date = { day: day, month: month, year: year };
        data.selectedDates.removeJsonObject(date);
        stopShowingAsSelected(day, month, year);
    }

    //this will change the markup on a de-selected day to visually accomodate the user's experience
    function stopShowingAsSelected(day, month, year) {
        var calendarDay = $(".calendar-day[day=" + day + "][month=" + month + "][year=" + year + "]");
        calendarDay.removeClass("selected");
    }

    //this will remove the browser's selected elements
    function clearSelections() {
        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
            document.selection.empty();
        } else {
            window.getSelection().removeAllRanges();
        }
    }


}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// These are assorted functions I had to write in order to improve the code. You may ignore them. /////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//I use this in my date comparator function
function twoDigitStringFromInt(number) {
    if (number < 10 && number > -10) {
        return "0" + number;
    }
    return number;
}

//this method will tell you what the last day in a given month is
function endOfMonth(month, year) {
    var thirtyOneDayMonths = new Array(1, 3, 5, 7, 8, 10, 12);
    var thirtyDayMonths = new Array(4, 6, 9, 11);

    for (var thirtyOneDayMonth in thirtyOneDayMonths) {
        if (thirtyOneDayMonths[thirtyOneDayMonth] == month) {
            return 31;
        }
    }
    for (var thirtyDayMonth in thirtyDayMonths) {
        if (thirtyDayMonths[thirtyDayMonth] == month) {
            return 30;
        }
    }
    if (year % 400 == 0) {
        return 29;
    }
    if (year % 100 == 0) {
        return 28;
    }
    if (year % 4 == 0) {
        return 29;
    } else {
        return 28;
    }
}

//compares two dates in YYYYMMDD format
function isCorrectOrder(yyyymmdd1, yyyymmdd2) {
    return yyyymmdd1 < yyyymmdd2;
}

//this prototype allows you to delete a json object from an array of json objects.
Array.prototype.removeJsonObject = function (object) {
    var array = this;
    $.each(array, function (index, result) {
        var amountOfKeys = 0;
        var matchedKeysCount = 0;
        for (var key in result) {
            amountOfKeys++;
            if (result[key] == object[key]) {
                matchedKeysCount++;
            }
        }
        if (matchedKeysCount == amountOfKeys) {
            array.splice(index, 1);
        }
    });
};

