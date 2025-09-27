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

async function move_file(file, dest_folder) {
	console.log(`Connecting to Native Messaging Host to move ${file} to ${dest_folder}...`)
	try {
		const response = await browser.runtime.sendNativeMessage('gcu_file_mover', {
			file: file,
			dest_folder: dest_folder
		});

		console.log(response);
		// TODO: Parse response
	} catch (err) {
		console.log(`Failed to send message: ${err}`);
		throw new Error(`Failed to send message: ${err}`);
	}
}

browser.downloads.onCreated.addListener(async (item) => {
	// Clunky!
	const download_table = await browser.storage.local.get(item.url);
	if (download_table === undefined) {
		return;
	}
	const download_info = download_table[item.url];

	switch(download_info.type) {
		case 'direct_download':
			browser.tabs.remove(download_info.tab_id);
			break;
		case 'folder_download':
			browser.tabs.remove(download_info.tab_id);
			await move_file(item.filename, download_info.dest_folder);
	}
})
