const FILE_DIV_SELECTOR = 'div.luto0c';
const DOWNLOAD_EXTENSION_DIV_CLASS = 'download-extension';

function add_button_div(div) {
	var button_div = document.createElement('div');

	var direct_download_btn = document.createElement('button');
	direct_download_btn.textContent = "Direct Download"
	button_div.appendChild(direct_download_btn);

	var folder_download_btn = document.createElement('button');
	folder_download_btn.textContent = "Download to Folder"
	button_div.appendChild(folder_download_btn);

	div.appendChild(button_div);
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
