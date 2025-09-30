(async () => {
	const path_input = document.getElementById('path-input');
	const submit_button = document.getElementById('submit-button');
	const cancel_button = document.getElementById('cancel-button');

	// Jank?
	const tab = (await browser.tabs.query({
		active: true,
		currentWindow: true
	}))[0];

	const key = `classroom_map:${get_classroom_id(tab.url)}`;

	let storage_data = await browser.storage.local.get(key);

	if (storage_data.hasOwnProperty(key)) {
		path_input.value = storage_data[key];
	}
	path_input.focus();

	path_input.addEventListener('keydown', (e) => {
		if (e.key == 'Enter') {
			e.preventDefault();
			submit_button.click();
		}
	});

	submit_button.addEventListener('click', async () => {
		const path = path_input.value.trim();

		storage_data[key] = path;
		await browser.storage.local.set(storage_data);
		window.close();
	})
})();
