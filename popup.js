let letsGo = document.getElementById("letsGo");

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
  statement = document.getElementById("id-c769b728-0b08-42b7-8c6c-19e1744381d6-1-msdfm_customerstatemente0dece4b-6fc8-4a8f-a065-082708572369-msdfm_customerstatement.fieldControl-text-box-text").value;
  
  appName = statement.toString().split("Microsoft.Web/sites/")[1].split(/\r?\n/)[0];
  console.log("App name: " + appName);

  timeframe = statement.toString().split("ProblemStartTime: ")[1].split(/\r?\n/)[0];
  day = timeframe.split(" ")[0].split("/");
  hours = timeframe.split(" ")[1].toString().slice(0, -3);
  issueDate = day[2] + "-" + day[0] + "-" + day[1] + "%20" + hours;
  //x hours before startTime

  startTime = getCurrentDay();
  
  var endTime = "";
  if (selection == 1) {  
    startTime = issueDate;
    endTime = getDate(startTime, 24) 
  } else if (selection == 2) {
    endTime = getDate(today, 1)
  } else if (selection == 3) {
    endTime = getDate(today, 12)
  } else if (selection == 4) {
    endTime = getDate(today, 48)
  } else if (selection == 5) {
    endTime = getDate(today, 72)
  }

  console.log("Start time: " + startTime);
  console.log("End time: " + endTime);

  caseBox = document.querySelector('[id*="headerControlsList_"]').innerHTML;
  caseNumber = caseBox.toString().split(" |")[0].split(">").pop();
  console.log("Case number: " + caseNumber);

  url1 = "https://applens.trafficmanager.net/sites/" + appName + "?startTime=" + startTime + "&endTime=" + endTime + "&caseNumber=" + caseNumber;
  url2 = "https://wawsobserver.azurewebsites.windows.net/sites/" + appName;
  console.log("URL: " + url1)
  //window.open(url1, '_blank').focus();
  //window.open(url2, '_blank').focus();

  function getDate(startTime, difference) {
    initDate = startTime.replace("%20", " ")
    var dt = new Date(initDate);
    dt.setHours( dt.getHours() - difference);
    end = dt.toLocaleString();
    endDate = end.split(", ")[0].split("/")
    endHour = end.split(", ")[1].toString().slice(0, -3); 
    parsedDate = endDate[2] + "-" + endDate[1] + "-" + endDate[0] + "%20" + endHour;
    return parsedDate;
  }

  function getCurrentDay() {
    const isoStr = new Date().toISOString();
    today = isoStr.replace("T", "%20").slice(0, -8);
    console.log("Today in UTC: " + today);
    return today;
  }

}




