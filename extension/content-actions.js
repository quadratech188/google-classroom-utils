async function get_dest_folder() {

	const classroom_id = get_classroom_name(window.location.href);
	const key = `classroom_map:${classroom_id}`;

	const storage_data = await browser.storage.local.get(key);

	if (key in storage_data) {
		return storage_data[key];
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

			storage_data[key] = path;
			await browser.storage.local.set(storage_data);

			floating.remove();
			resolve(path);
		});
	});
}

function direct_download(file_url) {
	browser.runtime.sendMessage(file_url);
}

function handle_error(error) {
	console.log(error);

	let type = 'error';
	let ui_message;
	if (error.type == 'messaging') {
		ui_message = 'Failed to communicate with Native Messaging Host. Is it installed properly?';
	}
	else {
		// TODO: Come up with friendlier errors
		ui_message = error.message;

		if (error.error_type === 'dest_exists') {
			type = 'warning';
		}
	}
	show_toast(type, ui_message, 3000);
}

function show_toast(type, message, duration) {
	const container = document.getElementById('gcu-toast-container');

	let toast = document.createElement('div');
	toast.className = 'gcu-toast';
	toast.textContent = message;
	toast.classList.add(type);
	toast.classList.add('show');
	
	container.appendChild(toast);

	// Remove after duration
	setTimeout(() => {
		setTimeout(() => {
			toast.classList.remove('show');
		}, 400);
		container.removeChild(toast);
	}, duration);
}

async function folder_download(file_url) {
	let folder;
	try {
		folder = await get_dest_folder();
	}
	catch (e) {
		console.log(`Not saving because of: ${e}`)
		return;
	}

	let port = browser.runtime.connect({
		name: 'folder_download'
	});
	port.onMessage.addListener((m) => {
		console.log(m);
		if (m.type === 'error') {
			handle_error(m.message);
		}
	});
	port.postMessage({
		url: file_url,
		dest_folder: folder
	})
}
