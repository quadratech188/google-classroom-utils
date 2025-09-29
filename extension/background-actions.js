browser.runtime.onMessage.addListener((message) => {
	direct_download(message);
})

browser.runtime.onConnect.addListener((port) => {
	port.onMessage.addListener((message) => {
		move = folder_download(message.url, message.dest_folder);
		move.then((s) => {
			port.postMessage({
				type: 'success',
				message: s
			});
		}, (e) => {
			port.postMessage({
				type: 'error',
				message: e
			});
		});
	})
})

function direct_download(file_url) {
	return new Promise(async (resolve, reject) => {
		console.log(`Creating tab for ${file_url}`)
		const download_tab = await browser.tabs.create({
			active: false,
			url: file_url
		});

		async function listen(download) {
			if (download.url != file_url) {
				return;
			}
			browser.downloads.onCreated.removeListener(listen);
			browser.tabs.remove(download_tab.id);
			resolve();
		}
		browser.downloads.onCreated.addListener(listen);
	});
}

function folder_download(file_url, dest_folder) {
	return new Promise(async (resolve, reject) => {
		console.log(`Creating tab for ${file_url}`)
		const download_tab = await browser.tabs.create({
			active: false,
			url: file_url
		});

		async function listen(download) {
			if (download.url != file_url) {
				return;
			}

			browser.downloads.onCreated.removeListener(listen);
			browser.tabs.remove(download_tab.id);

			const path = download.filename.split('/');
			const filename = path[path.length - 1];
			let move = move_download(download.id, `${dest_folder}/${filename}`, {
				already_exists: 'delete_and_throw'
			});
			move.then((s) => {
				resolve(s);
			}, (e) => {
				reject(e);
			});
		}
		browser.downloads.onCreated.addListener(listen);
	});
}
