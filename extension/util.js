async function listen_once(event, cond) {
	return new Promise((resolve) => {
		function listen(item) {
			if (!cond(item)) {
				return;
			}

			event.removeListener(listen);
			resolve(item);
		}
		event.addListener(listen);
	})
}

function get_classroom_id(url) {
	const re = /https:\/\/classroom\.google\.com(\/u\/\d+)?\/c\/([^\/]+)/
	const match = url.match(re);
	if (match === null) {
		throw `Failed to parse current url: ${url}`;
	}
	return match[1];
}
