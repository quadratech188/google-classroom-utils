async function move_download(download_id, dest, dest_options) {
	return await new Promise((resolve, reject) => {
		async function listen(item) {
			if (item.id != download_id) {
				return;
			}
			if (!item.hasOwnProperty('state')) {
				// Not state change
				return;
			}
			if (item.state.current !== 'complete') {
				// Not completed
				return;
			}

			browser.downloads.onChanged.removeListener(listen);

			const download_item = (await browser.downloads.search({
				id: item.id
			}))[0];

			console.log(`Move file from ${download_item.filename} to ${dest}`);

			try {
				let result = await browser.runtime.sendNativeMessage('gcu_file_mover', {
					file: download_item.filename,
					dest: dest,
					options: dest_options
				});
				if (result.type === 'success') {
					resolve();
				}
				else {
					reject(result);
				}

			} catch (err) {
				reject({
					type: 'message_error',
					message: err
				})
			}
		}
		browser.downloads.onChanged.addListener(listen);
	})
}

