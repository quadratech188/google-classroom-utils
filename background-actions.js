browser.runtime.onMessage.addListener((message) => {
	switch(message.type) {
		case 'direct_download':
			direct_download(message.url);
			break;
		case 'folder_download':
			folder_download(message.url, message.dest_folder);
			break;
	}
})

async function direct_download(file_url) {
	console.log(`Creating tab for ${file_url}`)

	const download_tab = await browser.tabs.create({
		active: false,
		url: file_url
	});

	// TODO: Make this optional
	// browser.tabs.hide(download_tab.id);

	await browser.storage.local.set({
		[file_url]: {
			type: 'direct_download',
			tab_id: download_tab.id
		}
	});
}

async function folder_download(file_url, dest_folder) {
	console.log(`Creating tab for ${file_url}`)

	const download_tab = await browser.tabs.create({
		active: false,
		url: file_url
	});

	// TODO: Make this optional
	// browser.tabs.hide(download_tab.id);

	await browser.storage.local.set({
		[file_url]: {
			type: 'folder_download',
			tab_id: download_tab.id,
			dest_folder: dest_folder
		}
	});
}

browser.downloads.onCreated.addListener(async (item) => {
	// Clunky!
	const download_table = await browser.storage.local.get(item.url);
	if (download_table === undefined) {
		return;
	}
	const download_info = download_table[item.url];

	console.log(`Received message: ${download_info}`);

	switch(download_info.type) {
		case 'direct_download':
			browser.tabs.remove(download_info.tab_id);
			break;
		case 'folder_download':
			browser.tabs.remove(download_info.tab_id);
			// TODO: Send message to daemon
			console.log(`Move to folder: ${download_info.dest_folder}`)
	}
})
