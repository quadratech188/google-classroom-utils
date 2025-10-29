# What is this?
A browser extension that adds 2 buttons for each file on Google Classroom:
- `Direct Download`: saves you:
    - Ctrl-Clicking the file to open it in a new tab.
    - Clicking the download button on said new tab.

- `Download to Folder`: 
    - If it's the first time downloading from a Classroom, it will prompt for the save location (directory).
    - Otherwise, it will automatically download the file and move it to the preconfigured location.

You can also click the extension icon on a Classroom page to edit the save location.

# Installation

Download the browser extension:
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/67ff9ed92e104417bfbf
- Chromium: https://chromewebstore.google.com/detail/aefgjalmanehongmhmpjddhilpaagffm

To move files on your computer, this extension requires a Native Messaging Host: A program on your computer that communicates with the browser extension.

- Get the correct executable for your OS from [Releases](https://github.com/quadratech188/google-classroom-utils/releases).

- Move it to a directory where it won't be accidentally deleted.

> [!NOTE]
> The automatic installation is currently only supported on Linux. On Windows the daemon will output the manifest.json file, which you will have to install manually.

- Run `$EXE_NAME install $BROWSER`, where:
    - `$EXE_NAME` is the filename of the executable you downloaded
    - `$BROWSER` is:
        - Firefox: `firefox`
        - Chrome: `chromium:google-chrome`
        - Chromium: `chromium:chromium`
        - Edge: `chromium:microsoft-edge`
        - Other Chromium-based browsers: `chromium:`(What the browser calls itself for its config directory)

- Restart your browser

The last 2 steps can be repeated for multiple browsers.
