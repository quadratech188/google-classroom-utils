function get_classroom_name() {
	const url = window.location.href
	const re = /https:\/\/classroom\.google\.com\/u\/\d+\/c\/([^\/]+)/
	const match = url.match(re);
	if (match === null) {
		throw `Failed to parse current url: ${url}`;
	}
	return match[1];
}

function direct_download(file_url) {
	browser.runtime.sendMessage({
		type: 'direct_download',
		url: file_url
	})
}

function folder_download(file_url) {
	let classroom_name = get_classroom_name();

	let classroom_map = browser.storage.sync.get('classroom_map');

	if (classroom_name in classroom_map) {
		console.log(`Downloading to ${classroom_map[classroom_name]}`);
	}
	else {
		console.log("Unimplemented");
	}
}
