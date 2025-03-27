// Get values from chrome.storage.local for given keys
export function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

// Set values in chrome.storage.local
export function setStorage(obj) {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, resolve);
  });
}

// Initialize default settings and an empty blacklist
export async function setDefaultSettings() {
  const settings = {
    tolerance: 50,
    badge: "empty",
  };
  const blackList = [];
  await setStorage({ settings, blackList });
}

// Retrieve both settings and blacklist from storage
export async function getSettingsAndBlacklist() {
  const { settings, blackList = [] } = await getStorage(["settings", "blackList"]);
  return { settings, blackList };
}

// Add a user-platform pair to the blacklist, if it doesn't already exist
export async function addToBlacklist(username, platform) {
  const { blackList = [] } = await getStorage(["blackList"]);

  const exists = blackList.some(([u, p]) => u === username && p === platform);
  if (!exists) {
    blackList.push([username, platform]);
    await setStorage({ blackList });
    console.log(`Added ${username} (${platform}) to blacklist`);
  } else {
    console.log(`${username} (${platform}) is already blacklisted`);;
  }
}

// Remove a specific user-platform pair from the blacklist
export async function removeFromBlacklist(username, platform) {
  const { blackList = [] } = await getStorage(["blackList"]);

  const updatedList = blackList.filter(([u, p]) => !(u === username && p === platform));

  await setStorage({ blackList: updatedList });
  console.log(`Removed ${username} (${platform}) from blacklist`);
}

// Update settings values (tolerance and/or badge)
export async function updateSettings({ tolerance, badge }) {
  const { settings = {} } = await getStorage(["settings"]);

  const updatedSettings = {
    ...settings,
    ...(tolerance !== undefined && { tolerance }),
    ...(badge !== undefined && { badge }),
  };

  await setStorage({ settings: updatedSettings });
  console.log("Settings updated:", updatedSettings);
}

// Clear the entire blacklist
export async function clearBlacklist() {
  await setStorage({ blackList: [] });
  console.log("Blacklist cleared successfully.");
}

// Add multiple user-platform pairs to the blacklist, avoiding duplicates
export async function addMultipleToBlacklist(users) {
  const { blackList = [] } = await getStorage(["blackList"]);
  let addedCount = 0;

  users.forEach(([username, platform]) => {
    const exists = blackList.some(([u, p]) => u === username && p === platform);
    if (!exists) {
      blackList.push([username, platform]);
      addedCount++;
    }
  });

  await setStorage({ blackList });
  console.log(`Added ${addedCount} users to blacklist.`);
}

export async function importSettingsFromSerializer(serializerData) {
  const { tolerance, badge, blocklist } = serializerData;

  const blackList = blocklist.map(profile => [profile.username, profile.social]);

  await setStorage({
    settings: { tolerance, badge },
    blackList
  });

  console.log("Settings imported from the API and stored in the cache:");
  console.log("tolerance:", tolerance);
  console.log("badge:", badge);
  console.log("blackList:", blackList);
}

export async function areSettingsEqual(serializerData) {
  const { settings, blackList } = await getSettingsAndBlacklist();

  if (!settings) return false;

  if (
    settings.tolerance !== serializerData.tolerance ||
    settings.badge !== serializerData.badge
  ) {
    return false;
  }

  const serializedBlocklist = serializerData.blocklist.map(({ username, social }) => [username, social]);

  const sortList = (list) =>
    list
      .map(([u, p]) => `${u.toLowerCase()}|${p.toLowerCase()}`)
      .sort()
      .join(',');

  return sortList(serializedBlocklist) === sortList(blackList);
}