var browseraction = {};
var calendars = {};
var events = {};
var calendarList = {};
var clipboard = [];
var holidayName = ["신정","설날","설날 연휴","삼일절","어린이날","석가탄신일","현충일","광복절","추석","추석 연휴","개천절","한글날","크리스마스"];
// Get the input field
var input = document.getElementById("myInput");
browseraction.QUICK_ADD_API_URL_= 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/quickAdd';
browseraction.CALENDAR_LIST_API_URL_ = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
browseraction.CALENDAR_EVENT_LIST_API_URL_ = 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events';
browseraction.CALENDAR_HOLIDAY_EVENT_LIST_API_URL_ = 'https://www.googleapis.com/calendar/v3/calendars/ko.south_korea#holiday@group.v.calendar.google.com/events';


//칼렌더 인증 및 리스트 불러오기
browseraction.getCalList = function() {
    if (typeof(Storage) !== "undefined") {  
        var dropDown = $('#quick-add-calendar-list');   

        calendarList = JSON.parse(localStorage.getItem("lunchCheckCalendarList"));
        var selectedCalrendarIndex = localStorage.getItem("selectedCalrendarIndex");
        console.log(calendarList);

        //처음 로컬 리스트가 있는지 확인하고 해당 리스트 호출
        if(calendarList != null){
            for (var i = 0; i < calendarList.length+1; i++) {

                if(i!=0){
                    calendars[i-1] = calendarList[i-1];
                    
                    if(calendars[i-1].accessRole === "owner"){                                  
                        dropDown.append($('<option>', {
                            value: calendars[i-1].id,
                            text: calendars[i-1].summary
                        }));                    
                    }           
                }
                else{
                    dropDown.empty();
                    dropDown.append($('<option>', {
                        value: 1,
                        text: '전체'
                    }));
                }           
            }
            if(selectedCalrendarIndex != null)
                dropDown.prop('selectedIndex', selectedCalrendarIndex);
        }
    } 
    else {
            console.log("Sorry, your browser does not support Web Storage...");
    }
    //구글 칼렌더 리스트 호출
    chrome.identity.getAuthToken({'interactive': true}, function (authToken) {
        $.ajax(browseraction.CALENDAR_LIST_API_URL_, {
            headers: {
                'Authorization': 'Bearer ' + authToken
            },
            success: function(data) {          
                var dropDown = $('#quick-add-calendar-list');   
                
                if(JSON.stringify(calendarList)!= JSON.stringify(data.items)){
                    localStorage.clear();
                    localStorage.setItem("lunchCheckCalendarList", JSON.stringify(data.items));
                    console.log("calendar was saved in localstorage");
                    
                    console.log(JSON.parse(localStorage.getItem("lunchCheckCalendarList")));
                    
                    for (var i = 0; i < data.items.length+1; i++) {
                        if(i!=0){
                            calendars[i-1] = data.items[i-1];
                            if(calendars[i-1].accessRole === "owner"){                                  
                                dropDown.append($('<option>', {
                                    value: calendars[i-1].id,
                                    text: calendars[i-1].summary
                                }));              
                            }           
                        }
                        else{
                            dropDown.empty();
                            dropDown.append($('<option>', {
                                value: 1,
                                text: '전체'
                            }));
                        }   
                        
                    }
                    dropDown.prop('selectedIndex', 1);                        
                    console.log(dropDown);
                }

            }
        });
    });    
}



browseraction.createQuickAddEvent_ = function(text,calendarId) {
    var eventListUrl = browseraction.CALENDAR_EVENT_LIST_API_URL_.replace('{calendarId}', encodeURIComponent(calendarId));
    var holidayListUrl = browseraction.CALENDAR_EVENT_LIST_API_URL_.replace('{calendarId}', encodeURIComponent("ko.south_korea#holiday@group.v.calendar.google.com"));
    var today = new Date();
    var monthArray = text.split('-');    
    var curYear = today.getFullYear();
    var curMonth = today.getMonth()+1;
    var curDay = today.getDate(); 
    var checkStartDay = new Date();
    var checkEndDay = new Date();
    var monthVar = 0;
    clipboard =[];

	//선택된 칼렌더 인덱스 로컬 저장
    localStorage.setItem("selectedCalrendarIndex", $('#quick-add-calendar-list')[0].selectedIndex);

	if(monthArray.length == 1)
		monthArray[1] = monthArray[0];
	
    //휴일을 제외한 날짜를 먼저 각 월별로 변수에 저장 9월 1,2,3,6,7...
    for(var i = Number(monthArray[0]); ((Number(monthArray[0])+monthVar-2)%12+1) != Number(monthArray[1]); i++) {

        checkStartDay = new Date(curYear,monthArray[0]-1,1);

        if(Number(monthArray[0]) <= Number(monthArray[1]))
            checkEndDay = new Date(curYear,monthArray[1],1);	
        else
            checkEndDay = new Date(curYear+1,monthArray[1],1);

        console.log(checkEndDay);
        clipboard[((Number(monthArray[0])+monthVar-1)%12+1)] = ((Number(monthArray[0])+monthVar-1)%12+1)+'월 ';

        if ( curMonth <= ((Number(monthArray[0])+monthVar-1)%12+1) ) {
            for(var j = 0; j < getLastDayOfMonth(curYear,((Number(monthArray[0])+i-1)%12+1)) ; j++) {            
                var checkDay = new Date(curYear,((Number(monthArray[0])+monthVar-1)%12+1)-1,j+1);

                if(checkDay.getDay() == 0 || checkDay.getDay() == 6)
                    continue;
                else
                    if(curMonth == (Number(monthArray[0])+monthVar-1)%12+1 && Number(curDay) > j+1)
                        continue;
                else
                    clipboard[((Number(monthArray[0])+monthVar-1)%12+1)] += j+1+', ';
                }
            clipboard[((Number(monthArray[0])+monthVar-1)%12+1)] += '\n';
        }
        else{
            for(var j = 0; j < getLastDayOfMonth(curYear+1,((Number(monthArray[0])+monthVar-1)%12+1)) ; j++) {            
                var checkDay = new Date(curYear+1,((Number(monthArray[0])+monthVar-1)%12+1)-1,j+1);

            if(checkDay.getDay() == 0 || checkDay.getDay() == 6)
                continue;
            else
                clipboard[((Number(monthArray[0])+monthVar-1)%12+1)] += j+1+', ';
        }
            clipboard[((Number(monthArray[0])+monthVar-1)%12+1)] += '\n';
        }
        monthVar++;
    }
    console.log(clipboard);

    if(calendarId == 1){        
        for (var j = Object.keys(calendars).length - 1; j >= 0; j--) {        
            if(calendars[j].accessRole === "owner")
                checkLunchEvent_(text,calendars[j].id,checkStartDay,checkEndDay,j);
        }
    }
    else
        checkLunchEvent_(text,calendarId,checkStartDay,checkEndDay, 0);
    //공휴일 삭제 처리
}


//주말을 제외하고 저장된 날짜에 구글칼렌더의 이벤트와 비교후 삭제하는 부분
checkLunchEvent_ = function(text,calendarId,checkStartDay,checkEndDay,lastCheck) {
    var eventListUrl = browseraction.CALENDAR_EVENT_LIST_API_URL_.replace('{calendarId}', encodeURIComponent(calendarId));
    var monthArray = text.split('-');

    //개인일정 삭제 처리
    chrome.identity.getAuthToken({'interactive': false}, function (authToken){
        //칼렌더에서 이벤트 받아 오는 부분
      $.ajax(eventListUrl, {
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        data: {
            "singleEvents" : "True",
            "orderBy" : "startTime",
            "timeMin" : checkStartDay.toISOString(),
            "timeMax" : checkEndDay.toISOString()
        },
        success: function(data) { 
            var eventList = {};
            for (var k = 0; k < data.items.length; k++) {
                eventList = data.items[k];
                if(eventList.start.dateTime){
                    var checkStart = new Date(eventList.start.dateTime);
                    var checkEnd = new Date(eventList.end.dateTime);                            
                }
                else{
                    var checkStart = new Date(eventList.start.date);
                    var checkEnd = new Date(eventList.end.date);
                }

                console.log(data);

                if(eventList.summary == undefined || eventList.summary.indexOf("생일") != -1)
                    continue;

                var lunchTime = new Date(checkStart.getFullYear(),checkStart.getMonth(),checkStart.getDate(),'12');
                var afterLunchTime = new Date(checkStart.getFullYear(),checkStart.getMonth(),checkStart.getDate(),'13');
                var beforeLunchTime = new Date(checkStart.getFullYear(),checkEnd.getMonth(),checkEnd.getDate(),'11','30');
                var checkMonthValue = checkStart.getMonth()+1;
                var checkMonthIdx = checkStart.getMonth()+1;

                if(clipboard[checkMonthIdx] == undefined)
                    continue;

                //일자가 아닌 시간이 이벤트일 경우
                if(eventList.start.dateTime){
                    if(checkStart.getDay()==checkEnd.getDay()){ //이벤트가 하루이고
                        if( checkStart.getDay() != 0 && checkStart.getDay() != 6 )//주말이 아니고
                            if( checkStart<=lunchTime && checkEnd>=lunchTime ){    // 12시가 포함되었을 경우
                                clipboard[checkMonthIdx]=clipboard[checkMonthIdx].replace(' '+checkStart.getDate()+', ',' '); //삭제 처리
                                console.log(clipboard[checkMonthIdx]);
                            }
                    }
                    else{										
                        for (var i = 0; i < days_between(checkStart,checkEnd)+1; i++) { //여러 일로 지정된 이벤트의 사이의 날짜 제거					

                        checkMonthIdx = checkStart.addDays(i).getMonth()+1;
                        console.log(checkStart.addDays(i).getDay());

                        if( checkStart.addDays(i).getDay() == 0 || checkStart.addDays(i).getDay() == 6 ) //주말인 이벤트는 제외
                           continue;

                       if(checkStart<afterLunchTime && checkStart.addDays(i).getDate()== checkStart.getDate()){
                            clipboard[checkMonthIdx]=clipboard[checkMonthIdx].replace(' '+checkStart.addDays(i).getDate()+', ',' ');
                        }
                        else
                            if(checkEnd>beforeLunchTime && checkStart.addDays(i).getDate() == checkEnd.getDate()){
                                clipboard[checkMonthIdx]=clipboard[checkMonthIdx].replace(' '+checkStart.addDays(i).getDate()+', ',' ');
                            }
                            else
                                if(checkStart.addDays(i).getDate()>checkStart.getDate() && checkStart.addDays(i).getDate()<checkEnd.getDate()){
                                    clipboard[checkMonthIdx]=clipboard[checkMonthIdx].replace(' '+checkStart.addDays(i).getDate()+', ',' ');
                                }

                            console.log(clipboard[checkMonthIdx]);
                        }
                    }

                }
                else{ //시간이 지정되지 않고 일자만 있을경우 전체 일자을 제거함
                    for (var i = 0; i < days_between(checkStart,checkEnd)+1; i++) {	

                     if( checkStart.addDays(i).getDay() == 0 || checkStart.addDays(i).getDay() == 6 )
                       continue;

                   checkMonthIdx = checkStart.addDays(i).getMonth()+1;
                   clipboard[checkMonthIdx]=clipboard[checkMonthIdx].replace(' '+checkStart.addDays(i).getDate()+', ',' ');

               }
           }
       }

        //여러 칼렌더 중 마지막 칼렌더일 경우 공휴일 제거로 넘김
       if(lastCheck==0)
           checkHolidayEvent_(text,checkStartDay,checkEndDay);

   }

});
});
}

//공휴일 삭제
checkHolidayEvent_ = function(text,checkStartDay,checkEndDay) {
    var holidayListUrl = browseraction.CALENDAR_EVENT_LIST_API_URL_.replace('{calendarId}', encodeURIComponent("ko.south_korea#holiday@group.v.calendar.google.com"));
    var monthArray = text.split('-');
    var sendClipboard = [];
    var monthVar=0;

    if(monthArray.length == 1)
      monthArray[1] = monthArray[0];

    //개인일정 삭제 처리
    chrome.identity.getAuthToken({'interactive': false}, function (authToken){

      $.ajax(holidayListUrl, {
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        data: {
            "singleEvents" : "True",
            "orderBy" : "startTime",
            "timeMin" : checkStartDay.toISOString(),
            "timeMax" : checkEndDay.toISOString()
        },
        success: function(data) { 
            var eventList = {};
            for (var k = 0; k < data.items.length; k++) {
                var eventList = data.items[k];
                var checkStart = new Date(eventList.start.date);
                var checkEnd = new Date(eventList.end.date);
                            //var lunchTime = new Date(checkStart.getFullYear(),checkStart.getMonth(),checkStart.getDate(),'12');
                            var checkMonthValue = checkStart.getMonth()+1;
                            var checkMonthIdx = checkStart.getMonth()+1;

                            if(clipboard[checkMonthIdx] === undefined)
                                continue;
                            
                            //상단의 공휴일이 아니거나 대체가 포함이 된 안된 경우는 제외, 예) 국군의 날
                            if( holidayName.indexOf(eventList.summary) != -1 || eventList.summary.indexOf("대체") != -1 )                         
                                if( checkStart.getDay() != 0 && checkStart.getDay() != 6 ){ //주말 제외
                                    clipboard[checkMonthIdx]=clipboard[checkMonthIdx].replace(' '+checkStart.getDate()+', ',' ');                                  
                                }
                            }
                            //전체 클립보드로 복사하기 위해 하나의 변수로 복사
                            for(var i = Number(monthArray[0]); ((Number(monthArray[0])+monthVar-2)%12+1) != Number(monthArray[1]); monthVar++) {
                               sendClipboard += clipboard[((Number(monthArray[0])+monthVar-1)%12+1)];
                           }

						//클립보드로 복사
						copyToClipboard(sendClipboard);
						console.log(sendClipboard);
                        alert("클립보드로 복사가 완료 되었습니다. Ctrl+Q 눌러 내부망으로 전달하세요\n"+sendClipboard);
                    }                      
                });
  });
		//copyToClipboard(clipboard.toString());

}

function copyToClipboard(val) {
      var t = document.createElement("textarea");
      document.body.appendChild(t);
      t.value = val;
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
}

browseraction.getCalList();

$('#quick-add-button').on('click', function() {
    console.log($('#quick-add-event-title').val().toString());
    console.log($('#quick-add-calendar-list').val());

    if($('#quick-add-event-title').val().toString() === '' ){
        alert("원하는 달을 입력해주십시요");
        return;
    }

    var monthArray = $('#quick-add-event-title').val().toString().split('-');

    if(monthArray[1] === undefined)
        monthArray[1] = monthArray[0];

    console.log(( Number(monthArray[0]) < 1 || Number(monthArray[0]) > 12 ) || ( Number(monthArray[1]) < 1 || Number(monthArray[1]) > 12 ));           

    if( ( Number(monthArray[0]) < 1 || Number(monthArray[0]) > 12 ) || ( Number(monthArray[0]) < 1 || Number(monthArray[0]) > 12 ) ){
        alert("입력값을 확인해주세요")
        return;
    }

    tempAlert("잠시만 기다려 주십시요", 3000);

    browseraction.createQuickAddEvent_($('#quick-add-event-title').val().toString(), $('#quick-add-calendar-list').val());
    $('#quick-add-event-title').val('');

        //var dialog = $(foo).dialog('open');
        //setTimeout(function() { alert('잠시만 기다려 주십시요'); }, 3000);
});

$("#quick-add-event-title").on('keypress',function(e) {
    var key = e.keyCode;

    // If the user has pressed enter
    if (key == 13) {
        if($('#quick-add-event-title').val().toString() === '' ){
            alert("원하는 달을 입력해주십시요");
            return false;
        }
        else{
            tempAlert("잠시만 기다려 주십시요", 1000);
            browseraction.createQuickAddEvent_($('#quick-add-event-title').val().toString(), $('#quick-add-calendar-list').val());
            $('#quick-add-event-title').val('');            
            return false;
        }        
    }
    else 
        if(key != 45 && (key < 48 || key > 57)){
            alert("숫자와 '-'만 입력이 가능합니다");
            return false;
        }
        else
            return true;
});


  function getLastDayOfMonth(Year,Month){
    var LastDay = new Date(Year,Month,0);
    
    return LastDay.getDate();
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
//	console.log("date"+
return date;
}

function days_between(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}

function tempAlert(msg,duration)
{
    var el = document.createElement("div");
    el.setAttribute("style","position:absolute;top:40%;left:20%;background-color:#92a8d1");
    el.innerHTML = msg;
    setTimeout(function(){
        el.parentNode.removeChild(el);
    },duration);
    document.body.appendChild(el);
}



