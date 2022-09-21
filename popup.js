let letsGo = document.getElementById("letsGo");


letsGo.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getInfoFromDFM,
  });
});

function getInfoFromDFM() {
  statement = document.getElementById("id-c769b728-0b08-42b7-8c6c-19e1744381d6-1-msdfm_customerstatemente0dece4b-6fc8-4a8f-a065-082708572369-msdfm_customerstatement.fieldControl-text-box-text").value;
  
  appName = statement.toString().split("Microsoft.Web/sites/")[1].split(/\r?\n/)[0];
  console.log(appName);

  timeframe = statement.toString().split("ProblemStartTime: ")[1].split(/\r?\n/)[0];
  day = timeframe.split(" ")[0].split("/");
  hours = timeframe.split(" ")[1].toString().slice(0, -3);
  startTime = day[2] + "-" + day[0] + "-" + day[1] + "%20" + hours;
  endTime = 
  console.log(startTime)

  caseBox = document.querySelector('[id*="headerControlsList_"]').innerHTML;
  caseNumber = caseBox.toString().split(" |")[0].split(">").pop();
  console.log(caseNumber);


  //https://applens.trafficmanager.net/sites/APPNAME?startTime=2022-09-20%2022:11&endTime=2022-09-21%2021:55&caseNumber=CASENUMBER
  url = "https://applens.trafficmanager.net/sites/" + appName + "?startTime=" + startTime + "&endTime=" + startTime + "&caseNumber=" + caseNumber;
  console.log(url)
  window.open(url, '_blank').focus();
}
