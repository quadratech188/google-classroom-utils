const FILE_DIV_SELECTOR = 'div.luto0c';

function get_classroom_name() {
	const url = window.location.href
	const re = /https:\/\/classroom\.google\.com\/u\/\d+\/c\/([^\/]+)/
	const match = url.match(re);
	if (match === null) {
		throw `Failed to parse current url: ${url}`;
	}
	return match[1];
}

function add_button_div(div) {
	const url = div.querySelector('a').href;

	const re = /https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/view\?usp=classroom_web&authuser=(\d+)/;
	const match = url.match(re);
	if (match === null) {
		// Probably just not a google drive link, but I don't really care
		console.warn(`Failed to parse link: ${url}`);
		return;
	}
	const file_id = match[1];
	const authuser = match[2];

	// https://sites.google.com/site/gdocs2direct/
	const download_url = `https://drive.usercontent.google.com/download?id=${file_id}&export=download&authuser=${authuser}`

	let extension_div = document.createElement('div');
	extension_div.classList.add('gcu-download-extension');

	let direct_download_btn = document.createElement('button');
	direct_download_btn.textContent = "Direct Download"
	direct_download_btn.addEventListener('click', () => {
		direct_download(download_url);
	})
	extension_div.appendChild(direct_download_btn);

	let folder_download_btn = document.createElement('button');
	folder_download_btn.textContent = "Download to Folder"
	folder_download_btn.addEventListener('click', () => {
		folder_download(download_url);
	})
	extension_div.appendChild(folder_download_btn);

	div.appendChild(extension_div);
}

const observer = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		mutation.addedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;

			if (node.matches(FILE_DIV_SELECTOR)) {
				add_button_div(node);
			}
		})
		mutation.removedNodes.forEach(node => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;

			if (node.classList.contains('gcu-download-extension')) {
				add_button_div(mutation.target);
			}
		})
	});
})

observer.observe(document.body, {
	childList: true,
	subtree: true,
})

let toast_div = document.createElement('div')
toast_div.id = 'gcu-toast-container';
document.body.appendChild(toast_div);
