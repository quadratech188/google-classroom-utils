async function get_dest_folder() {
	const classroom_id = get_classroom_id(window.location.href);
	const key = `classroom_map:${classroom_id}`;

	const storage_data = await browser.storage.local.get(key);

	if (key in storage_data) {
		return storage_data[key];
	}
	let floating = document.createElement('iframe');
	const floating_src = browser.runtime.getURL('path-chooser.html')
	floating.setAttribute('src', floating_src);
	floating.setAttribute('id', 'gcu-path-chooser-bg');
	document.body.appendChild(floating);

	await new Promise(resolve => {
		floating.addEventListener("load", resolve, { once: true });
	});

	floating.contentWindow.postMessage({}, floating_src);

	return new Promise((resolve, reject) => {
		// We can't just use options = {once = true} because
		// classroom also throws other random events
		function listen(event) {
			if (event.source !== floating.contentWindow) {
				return;
			}

			window.removeEventListener('message', listen);

			if (event.data.type === 'success') {
				resolve(event.data.message);
			}
			else {
				reject(event.data.message);
			}
		}
		window.addEventListener('message', listen);
	}).then(async (path) => {
		storage_data[key] = path;
		await browser.storage.local.set(storage_data);
	}).finally(async () => {
		floating.remove();
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

async function folder_download(file_url, filename) {
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
		if (m.type === 'error') {
			handle_error(m.message);
		}
	});
	port.postMessage({
		url: file_url,
		dest: folder + '/' + filename
	});
}
