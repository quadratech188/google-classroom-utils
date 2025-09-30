browser.runtime.onMessage.addListener((message) => {
	direct_download(message);
})

browser.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener(async (message) => {
		await folder_download(message.url, message.dest_folder).then((_) => {
			port.postMessage({
				type: 'success'
			});
		}, (e) => {
			port.postMessage({
				type: 'error',
				message: e
			});
		});
	})
})

async function direct_download(file_url) {
	let download_tab = await browser.tabs.create({
		active: false,
		url: file_url
	});

	await listen_once(browser.downloads.onCreated, (download) => {
		return download.url === file_url;
	});

	await browser.tabs.remove(download_tab.id);
}

async function folder_download(file_url, dest_folder) {
	let download_tab = await browser.tabs.create({
		active: false,
		url: file_url
	});

	const download = await listen_once(browser.downloads.onCreated, (download) => {
		return download.url === file_url;
	});

	await browser.tabs.remove(download_tab.id);

	const path = download.filename.split('/');
	const filename = path[path.length - 1];

	return move_download(download.id, dest_folder + '/' + filename, {
		create_dest_folder: false,
		replace_dest: false,
		delete_on_error: true
	});
}
