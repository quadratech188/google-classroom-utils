browser.runtime.onMessage.addListener((message) => {
	switch(message.type) {
		case 'direct_download':
			direct_download(message.url);
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
	browser.tabs.hide(download_tab.id);

	await browser.storage.local.set({
		[file_url]: {
			type: 'direct_download',
			tab_id: download_tab.id
		}
	});
}

browser.downloads.onCreated.addListener(async (item) => {
	// Clunky!
	const tab_id = await browser.storage.local.get(item.url);
	const message = tab_id[item.url];

	switch(message.type) {
		case 'direct_download':
			browser.tabs.remove(tab_id)
	}
})
