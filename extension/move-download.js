async function move_download(download_id, dest, options) {
	const item = await listen_once(browser.downloads.onChanged, (item) => {
		return item.id === download_id
			&& item.hasOwnProperty('state')
			&& item.state.current == 'complete';});

	const download_item = (await browser.downloads.search({
		id: item.id
	}))[0];

	return browser.runtime.sendNativeMessage('gcu_file_mover', {
		file: download_item.filename,
		dest: dest,
		options: options
	}).then((result) => {
		if (result.type === 'success') {
			return;
		}
		else {
			console.log(result);
			throw result;
		}
	}, (e) => {
		throw {
			error_type: 'messaging',
			message: e
		};
	});
}
