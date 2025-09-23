function get_classroom_name() {
	const url = window.location.href
	const re = /https:\/\/classroom\.google\.com\/u\/\d+\/c\/([^\/]+)/
	const match = url.match(re);
	if (match === null) {
		throw `Failed to parse current url: ${url}`;
	}
	return match[1];
}

async function get_download_path() {
	// TODO: Create UI
	
	const storage_data = await browser.storage.sync.get('classroom_map');
	const classroom_map = storage_data['classroom_map'] || {};

	const classroom_name = get_classroom_name();
	if (classroom_name in classroom_map) {
		return classroom_map[classroom_name];
	}
	return '';
}

function direct_download(file_url) {
	browser.runtime.sendMessage({
		type: 'direct_download',
		url: file_url
	});
}

async function folder_download(file_url) {
	browser.runtime.sendMessage({
		type: 'folder_download',
		url: file_url,
		dest: await get_download_path()
	});
}
