const FILE_DIV_SELECTOR = 'div.luto0c';
const DOWNLOAD_EXTENSION_DIV_CLASS = 'download-extension';
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
	extension_div.classList.add(DOWNLOAD_EXTENSION_DIV_CLASS);

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

			if (node.classList.contains(DOWNLOAD_EXTENSION_DIV_CLASS)) {
				add_button_div(mutation.target);
			}
		})
	});
})

observer.observe(document.body, {
	childList: true,
	subtree: true,
})
