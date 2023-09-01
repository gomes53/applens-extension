let letsGo = document.getElementById("letsGo");
let browseApp = document.getElementById("browseApp");
let copyNote = document.getElementById("copyNote");
let groupingCheck = document.getElementById("grouping");
let groupingCaseNumberCheck = document.getElementById("groupingCaseNumber");

copyNote.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  copyNote.style.background = "green"

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setNote
  });
});

browseApp.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: goToSite
  });
});

document.addEventListener("DOMContentLoaded", async function () {
  const { grouping, groupingCaseNumber } = await chrome.storage.sync.get([
    "grouping",
    "groupingCaseNumber",
  ]);
  groupingCheck.checked = grouping;
  groupingCaseNumberCheck.disabled = !grouping;
  groupingCaseNumberCheck.checked = groupingCaseNumber;
});

groupingCheck.addEventListener("change", async () => {
  const isChecked = groupingCheck.checked
  chrome.storage.sync.set({ grouping: isChecked });
  groupingCaseNumberCheck.disabled = !isChecked;
  
});

groupingCaseNumberCheck.addEventListener("change", async () => {
  const isChecked = groupingCaseNumberCheck.checked;
  chrome.storage.sync.set({ groupingCaseNumber: isChecked });
});


letsGo.addEventListener("click", async () => {

  var selectedTime = 1;

  if(document.getElementById('t1').checked) { 
    selectedTime = 1;
  } 
  else if(document.getElementById('t2').checked) {
    selectedTime = 2;
  } 
  else if(document.getElementById('t3').checked) { 
    selectedTime = 3;
  } 
  else if(document.getElementById('t4').checked) { 
    selectedTime = 4;
  }
  else if(document.getElementById('t5').checked) { 
    selectedTime = 5;
  }

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getInfoFromDFM,
    args: [selectedTime]
  });
});


function getInfoFromDFM(selection) {
  var appName = ""
  var statement = ""
  try {
    statement = document.getElementById("id-c769b728-0b08-42b7-8c6c-19e1744381d6-1-msdfm_customerstatemente0dece4b-6fc8-4a8f-a065-082708572369-msdfm_customerstatement.fieldControl-text-box-text").value;
    appName = statement.toString().split("Microsoft.Web/sites/")[1].split(/\r?\n/)[0];
    console.log("App name: " + appName);
  } catch (error) {
    console.log(error)
    alert("Can't find the app name in the case as part of Microsoft.Web/sites - please open AppLens manually")
    return
  }

  timeframe = statement.toString().split("ProblemStartTime: ")[1].split(/\r?\n/)[0];
  day = timeframe.split(" ")[0].split("/");
  hours = timeframe.split(" ")[1].toString().slice(0, -3);
  issueDate = day[2] + "-" + day[0] + "-" + day[1] + "%20" + hours;
  //x hours before startTime
  endTime = getCurrentTime();
  endTime = addSmallInitialBreak(endTime);
  
  if (selection == 1) {  
    endTime = issueDate;
    startTime = getDate(endTime, 24) 
  } else if (selection == 2) {
    startTime = getDate(today, 1)
  } else if (selection == 3) {
    startTime = getDate(today, 12)
  } else if (selection == 4) {
    startTime = getDate(today, 24)
  } else if (selection == 5) {
    startTime = getDate(today, 72)
  }

  console.log("Start time: " + startTime);
  console.log("End time: " + endTime);

  caseBox = document.querySelector('[id*="headerControlsList_"]').innerHTML;
  caseNumber = caseBox.toString().split(" |")[0].split(">").pop();
  console.log("Case number: " + caseNumber);

  url1 = "https://applens.trafficmanager.net/sites/" + appName + "?startTime=" + startTime + "&endTime=" + endTime + "&caseNumber=" + caseNumber;
  url2 = "https://wawsobserver.azurewebsites.windows.net/sites/" + appName;
  console.log("URL: " + url1)
  window.open(url1, '_blank').focus();
  window.open(url2, '_blank').focus();

  function getDate(startTime, difference) {
    initDate = startTime.replace("%20", " ")
    var dt = new Date(initDate);
    dt.setHours( dt.getHours() - difference);
    end = dt.toLocaleString("en-GB");
    endDate = end.split(", ")[0].split("/")
    endHour = end.split(", ")[1].toString().slice(0, -3); 
    parsedDate = endDate[2] + "-" + endDate[1] + "-" + endDate[0] + "%20" + endHour;
    return parsedDate;
  }

  function getCurrentTime() {
    const isoStr = new Date().toISOString();
    today = isoStr.replace("T", "%20").slice(0, -8);
    console.log("Today in UTC: " + today);
    return today;
  }

  function addSmallInitialBreak(startTime) {
    initDate = startTime.replace("%20", " ")
    var dt = new Date(initDate);
    dt.setMinutes( dt.getMinutes() - 16);
    end = dt.toLocaleString("en-GB");
    endDate = end.split(", ")[0].split("/")
    endHour = end.split(", ")[1].toString().slice(0, -3); 
    parsedDate = endDate[2] + "-" + endDate[1] + "-" + endDate[0] + "%20" + endHour;
    return parsedDate;
  }

  return false
}

function goToSite() {
  statement = document.getElementById("id-c769b728-0b08-42b7-8c6c-19e1744381d6-1-msdfm_customerstatemente0dece4b-6fc8-4a8f-a065-082708572369-msdfm_customerstatement.fieldControl-text-box-text").value;
  appName = statement.toString().split("Microsoft.Web/sites/")[1].split(/\r?\n/)[0];
  url = "https://" + appName + ".azurewebsites.net";
  window.open(url, '_blank').focus();
}

function setNote(){
  var div = document.createElement('div');
  div.innerHTML = `
  <div id=note style="display:none; font-family:Calibri">
    <b><u>General Information</u></b>
    <ul>
      <li><b>App name: </b><span id="app_name"> N/A </span></li>
      <li><b>Applens: </b><a id="applens" href="https://applens.trafficmanager.net/sites">General Information</a></li>
      <li><b>Issue date/time (UTC): </b><span id="date"> N/A </span></li>
      <li><b>Location: </b><span id="location"> N/A </span></li>
    </ul>
    <b>_____________________________________________</b>
  </div>`;
  document.body.appendChild(div)

  
  var appName = ""
  var statement = ""
  var timeframe = ""
  var location = ""
  var applens = ""
  try {
    statement = document.getElementById("id-c769b728-0b08-42b7-8c6c-19e1744381d6-1-msdfm_customerstatemente0dece4b-6fc8-4a8f-a065-082708572369-msdfm_customerstatement.fieldControl-text-box-text").value;
    appName = statement.toString().split("Microsoft.Web/sites/")[1].split(/\r?\n/)[0];
    timeframe = statement.toString().split("ProblemStartTime: ")[1].split(/\r?\n/)[0];
    location = statement.toString().split("Location: ")[1].split(/\r?\n/)[0];

    caseBox = document.querySelector('[id*="headerControlsList_"]').innerHTML;
    caseNumber = caseBox.toString().split(" |")[0].split(">").pop();
    day = timeframe.split(" ")[0].split("/");
    hours = timeframe.split(" ")[1].toString().slice(0, -3);
    issueDate = day[2] + "-" + day[0] + "-" + day[1] + "%20" + hours;
    endTime = getCurrentTime();
    endTime = addSmallInitialBreak(endTime);
    startTime = getDate(endTime, 24) 
    applens = "https://applens.trafficmanager.net/sites/" + appName + "?startTime=" + startTime + "&endTime=" + endTime + "&caseNumber=" + caseNumber;

    document.getElementById('app_name').innerHTML = appName;
    document.getElementById('applens').href = applens;
    document.getElementById('date').innerHTML = timeframe;
    document.getElementById('location').innerHTML = location;

    function getDate(startTime, difference) {
      initDate = startTime.replace("%20", " ")
      var dt = new Date(initDate);
      dt.setHours( dt.getHours() - difference);
      end = dt.toLocaleString("en-GB");
      endDate = end.split(", ")[0].split("/")
      endHour = end.split(", ")[1].toString().slice(0, -3); 
      parsedDate = endDate[2] + "-" + endDate[1] + "-" + endDate[0] + "%20" + endHour;
      return parsedDate;
    }
    
    function getCurrentTime() {
      const isoStr = new Date().toISOString();
      today = isoStr.replace("T", "%20").slice(0, -8);
      console.log("Today in UTC: " + today);
      return today;
    }

    function addSmallInitialBreak(startTime) {
      initDate = startTime.replace("%20", " ")
      var dt = new Date(initDate);
      dt.setMinutes( dt.getMinutes() - 16);
      end = dt.toLocaleString("en-GB");
      endDate = end.split(", ")[0].split("/")
      endHour = end.split(", ")[1].toString().slice(0, -3); 
      parsedDate = endDate[2] + "-" + endDate[1] + "-" + endDate[0] + "%20" + endHour;
      return parsedDate;
    }

  } catch (error) {
    console.log(error)
    alert("Can't find the app name in the case as part of Microsoft.Web/sites - default note was copied")
  }
  
  str = document.getElementById('note')
  
  console.log(str)

  str.style.display = "inline"
  
  var range = document.createRange()
  range.selectNode(str)
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range)
  document.execCommand('copy')
  
  str.style.display = "none"
  
}