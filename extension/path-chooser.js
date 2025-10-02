window.addEventListener('message', (event) => {
	const path_input = document.getElementById('path-input');
	const submit_button = document.getElementById('submit-button');
	const cancel_button = document.getElementById('cancel-button');

	path_input.addEventListener('keydown', (e) => {
		if (e.key == 'Enter') {
			e.preventDefault();
			submit_button.click();
		}
	})

	submit_button.addEventListener('click', () => {
		event.source.window.postMessage({
			type: 'success',
			message: path_input.value
		}, event.origin);
	})

	cancel_button.addEventListener('click', () => {
		event.source.window.postMessage({
			type: 'error',
			message: 'Cancelled'
		}, event.origin);
	})
})
