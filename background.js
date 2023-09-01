chrome.runtime.onInstalled.addListener(() => {});

const getDOMCaseNumber = () => {
  let caseNumber;
  try {
    caseNumber = document
      .querySelector('[id*="headerControlsList_"]')
      .innerText.split(" |")[0];

    if (!caseNumber) {
      throw new Error("Could not find case number. Opening prompt");
    }

    if (caseNumber.length > 18)
      caseNumber = caseNumber.slice(0, caseNumber.length - 3);
  } catch (error) {
    console.error(error);
    caseNumber = window.prompt(
      "Looks like you are not in DFM page. Please Enter Case Number: "
    );
  }

  return caseNumber;
};

const getCaseNumber = (tab) => {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: getDOMCaseNumber,
      },
      ([{ result: name }]) => (name ? resolve(name) : reject(name))
    );
  });
};

function getCurrentTime() {
  const isoStr = new Date().toISOString();
  return isoStr;
}

function getDate(startTime, difference, isMin = false) {
  let initDate = startTime;
  const dt = new Date(initDate);
  if (isMin) {
    dt.setMinutes(dt.getMinutes() - difference);
  } else {
    dt.setHours(dt.getHours() - difference);
  }

  return dt.toISOString();
}

const openApplens = async (appName, time, tab) => {
  const caseNumber = await getCaseNumber(tab);
  const endTime = getDate(getCurrentTime(), 16, true);
  const startTime = getDate(endTime, time);
  const appLens = `https://applens.trafficmanager.net/sites/${appName}?startTime=${startTime}&endTime=${endTime}&caseNumber=${caseNumber}`;
  createTab(appLens, appName, caseNumber);
  //chrome.tabs.create({ url: appLens })
};

const openObserver = (appName) => {
  const observer = `https://wawsobserver.azurewebsites.windows.net/sites/${appName}`;
  //chrome.tabs.create({ url: observer })
  createTab(observer, appName);
};

const openASC = async (tab, selectedText) => {
  const caseNumber = await getCaseNumber(tab);

  const asc = `https://azuresupportcenter.msftcloudes.com/solutionexplorer?SourceId=OneSupport&srId=${caseNumber}`;
  //await chrome.tabs.create({ url: asc });
  createTab(asc, selectedText);
};

const browseApp = (name) => {
  //chrome.tabs.create({ url: `https://${name}.azurewebsites.net/` })
  createTab(`https://${name}.azurewebsites.net/`, name);
};

const copyNote = () => {};

const createTab = async (url, appName, caseNumber = undefined) => {
  if (!appName && !caseNumber) {
    return chrome.tabs.create({ url });
  }

  const tab = await chrome.tabs.create({ url });
  const { grouping, groupingCaseNumber } = await chrome.storage.sync.get([
    "grouping",
    "groupingCaseNumber",
  ]);

  if (!grouping) {
    return;
  }

  let title = appName;

  if (groupingCaseNumber && caseNumber) title = caseNumber;

  const groups = await chrome.tabGroups.query({ title });

  if (groups.length > 0) {
    const groupId = groups[0].id;
    return await chrome.tabs.group({
      tabIds: tab.id,
      groupId,
    });
  }

  const groupId = await chrome.tabs.group({
    tabIds: tab.id,
  });
  const randomTabColor =
    TAB_COLORS[Math.floor(Math.random() * TAB_COLORS.length)];
  await chrome.tabGroups.update(groupId, {
    title,
    color: randomTabColor,
  });
};

const TAB_COLORS = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
  "orange",
];

let groups = [
  {
    title: "Last 1 hour",
    id: "Last_1_hour",
    contexts: ["selection"],
  },
  {
    title: "Last 12 hours",
    id: "Last_12_hours",
    contexts: ["selection"],
  },
  {
    title: "Last 24 hours",
    id: "Last_24_hours",
    contexts: ["selection"],
  },
  {
    title: "Last 3 days",
    id: "Last_72_days",
    contexts: ["selection"],
  },
  {
    title: "Browse App",
    id: "Browse_App",
    contexts: ["selection"],
  },
  {
    title: "Open Observer",
    id: "observer",
    contexts: ["selection"],
  },
  {
    title: "Open ASC",
    id: "asc",
    contexts: ["all"],
  },
];

chrome.contextMenus.removeAll(function () {
  chrome.contextMenus.create({
    id: "app_lens",
    title: "Open in App Lens",
    contexts: ["all"],
  });

  groups.forEach((item) => {
    chrome.contextMenus.create({
      parentId: "app_lens",
      ...item,
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (data, tab) => {
  if (data.menuItemId === "Browse_App" && !!data.selectionText) {
    return browseApp(data.selectionText);
  }

  if (data.menuItemId === "observer" && !!data.selectionText) {
    return openObserver(data.selectionText);
  }

  if (data.menuItemId === "asc") {
    return openASC(tab, data.selectionText);
  }

  openApplens(data.selectionText, parseInt(data.menuItemId.split("_")[1]), tab);
});
