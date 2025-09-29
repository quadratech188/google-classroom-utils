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
