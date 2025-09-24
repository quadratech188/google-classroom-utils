function get_classroom_name() {
	const url = window.location.href
	const re = /https:\/\/classroom\.google\.com\/u\/\d+\/c\/([^\/]+)/
	const match = url.match(re);
	if (match === null) {
		throw `Failed to parse current url: ${url}`;
	}
	return match[1];
}

async function get_dest_folder() {
	
	const storage_data = await browser.storage.sync.get('classroom_map');
	const classroom_map = storage_data['classroom_map'] || {};

	const classroom_name = get_classroom_name();
	if (classroom_name in classroom_map) {
		return classroom_map[classroom_name];
	}

	let floating = document.createElement('iframe');
	floating.setAttribute('src', browser.runtime.getURL('path-chooser.html'))
	floating.setAttribute('id', 'gcu-path-chooser-bg')
	document.body.appendChild(floating);

	let inner_document = await new Promise((resolve) => {
		floating.addEventListener('load', () => {
			resolve(floating.contentDocument);
		});
	})

	let path_input = inner_document.getElementById('path-input');
	let submit_button = inner_document.getElementById('submit-button');
	let cancel_button = inner_document.getElementById('cancel-button');

	path_input.focus();

	return new Promise(async (resolve, reject) => {
		path_input.addEventListener('keydown', (e) => {
			if (e.key == 'Enter') {
				e.preventDefault();
				submit_button.click();
			}
		});

		cancel_button.addEventListener('click', () => {
			floating.remove();
			reject(new Error('Cancelled Dialog'))
		})

		submit_button.addEventListener('click', async () => {
			const path = path_input.value.trim();

			const storage_data = await browser.storage.sync.get('classroom_map');
			let classroom_map = storage_data['classroom_map'] || {};
			classroom_map[classroom_name] = path;
			storage_data['classroom_map'] = classroom_map;
			await browser.storage.sync.set(storage_data);

			floating.remove();
			resolve(path);
		});
	});
}

function direct_download(file_url) {
	browser.runtime.sendMessage({
		type: 'direct_download',
		url: file_url
	});
}

async function folder_download(file_url) {
	try {
		const folder = await get_dest_folder();
		browser.runtime.sendMessage({
			type: 'folder_download',
			url: file_url,
			dest_folder: folder
		});
	}
	catch (e) {
		console.log(`Not saving because of: ${e}`)
	}
}
