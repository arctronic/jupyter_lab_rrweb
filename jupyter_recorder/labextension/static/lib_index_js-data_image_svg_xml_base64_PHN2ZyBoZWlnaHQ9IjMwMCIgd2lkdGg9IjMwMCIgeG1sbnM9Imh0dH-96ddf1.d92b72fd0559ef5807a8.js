"use strict";
(self["webpackChunkjupyter_recorder"] = self["webpackChunkjupyter_recorder"] || []).push([["lib_index_js-data_image_svg_xml_base64_PHN2ZyBoZWlnaHQ9IjMwMCIgd2lkdGg9IjMwMCIgeG1sbnM9Imh0dH-96ddf1"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var rrweb_player_dist_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! rrweb-player/dist/style.css */ "./node_modules/rrweb-player/dist/style.css");
/* harmony import */ var rrweb_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rrweb-player */ "webpack/sharing/consume/default/rrweb-player/rrweb-player");
/* harmony import */ var rrweb_player__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(rrweb_player__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rrweb__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rrweb */ "webpack/sharing/consume/default/rrweb/rrweb");
/* harmony import */ var rrweb__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(rrweb__WEBPACK_IMPORTED_MODULE_2__);
// import { showDialog, Dialog } from '@jupyterlab/apputils';
// import { Widget } from '@lumino/widgets';


/**
 * Initialization data for the jupyter_recorder extension.
 */

const plugin = {
    id: 'jupyter_recorder:plugin',
    description: 'Record session using rrweb and show replay in modal',
    autoStart: true,
    activate: (app) => {
        console.log('JupyterLab extension jupyter_recorder is activated!');
        let events = [];
        let recorder;
        function addIgnoreClassToJupyterLabElements() {
            // Example: Ignore all cells except the currently focused one
            // This is just an example; you'll need to adjust selectors based on your target
            const focusedCell = document.querySelector('.jp-Notebook .jp-mod-focused');
            document.querySelectorAll('.jp-Notebook .jp-Cell').forEach(cell => {
                if (cell !== focusedCell) {
                    cell.classList.add('rr-ignore');
                }
            });
            // You might also want to ignore other parts of the JupyterLab interface
            document
                .querySelectorAll('.jp-SideBar, .jp-Toolbar, .jp-Menu')
                .forEach(el => {
                el.classList.add('rr-ignore');
            });
            // Ensure dynamically added elements are also ignored by observing DOM changes
            // You might need a MutationObserver to dynamically add 'rr-ignore' to new elements
        }
        function startRecording() {
            addIgnoreClassToJupyterLabElements();
            console.log('Recording started');
            events = [];
            recorder = rrweb__WEBPACK_IMPORTED_MODULE_2__.record({
                emit: (event) => {
                    events.push(event);
                }
            });
        }
        app.restored.then(() => {
            startRecording();
            console.log('Recording started triggered upon starting the jupyterlab app');
        });
        function stopRecording() {
            console.log('Recording stopped');
            if (recorder) {
                recorder(); // Call the stop function directly
                recorder = null;
            }
            // Show replay modal after stopping recording
            showReplayWithControls(events);
        }
        function showReplayWithControls(events) {
            // Ensure the events type matches your data structure
            if (events.length === 0) {
                console.log('No recorded events');
                return;
            }
            console.log('Replaying session with rrweb-player controls');
            // Ensure the rrweb-player styles are included
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href =
                'https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css';
            document.head.appendChild(styleLink);
            // Create a container for the rrweb-player if it doesn't already exist
            let playerContainer = document.getElementById('replay-container');
            if (!playerContainer) {
                playerContainer = document.createElement('div');
                playerContainer.id = 'replay-container';
                document.body.appendChild(playerContainer);
            }
            // Initialize rrweb-player
            new (rrweb_player__WEBPACK_IMPORTED_MODULE_1___default())({
                target: playerContainer,
                props: {
                    events: events
                    // Optional: configure width, height, and other rrweb-player options
                }
            });
            // Adding custom control bar on top of the rrweb-player
            const controlBar = document.createElement('div');
            controlBar.style.position = 'fixed'; // Changed to 'fixed' to ensure it's placed relative to the viewport
            controlBar.style.top = '0';
            controlBar.style.left = '0';
            controlBar.style.width = '100%';
            controlBar.style.display = 'flex';
            controlBar.style.justifyContent = 'flex-end';
            controlBar.style.padding = '10px';
            controlBar.style.backgroundColor = 'rgba(0,0,0,0.5)';
            controlBar.style.color = 'white';
            controlBar.style.zIndex = '10001'; // Ensure the control bar is above the player
            // Append the control bar to the body first to ensure it's on top
            document.body.appendChild(controlBar);
            // Cancel button to close the player and control bar
            const cancelButton = document.createElement('button');
            cancelButton.innerText = 'Cancel';
            cancelButton.onclick = function () {
                // Remove the player container
                if (playerContainer) {
                    playerContainer.remove();
                }
                // Also remove the control bar
                if (controlBar) {
                    controlBar.remove();
                }
            };
            // Download button to download the events JSON
            const downloadButton = document.createElement('button');
            downloadButton.innerText = 'Download Events';
            downloadButton.onclick = function () {
                const blob = new Blob([JSON.stringify(events)], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'events.json';
                a.click();
                URL.revokeObjectURL(url);
            };
            // Append buttons to the control bar
            controlBar.appendChild(cancelButton);
            controlBar.appendChild(downloadButton);
        }
        // Command to start recording
        app.commands.addCommand('jupyter_recorder:start', {
            label: 'Start Recording',
            execute: () => {
                if (!recorder) {
                    startRecording();
                }
                else {
                    console.log('Already recording');
                }
            }
        });
        // Command to stop recording
        app.commands.addCommand('jupyter_recorder:stop', {
            label: 'Stop Recording',
            execute: () => {
                if (recorder) {
                    stopRecording();
                }
                else {
                    console.log('Not recording');
                }
            }
        });
        // Add command palette options for recording
        app.contextMenu.addItem({
            command: 'jupyter_recorder:start',
            selector: '.jp-Notebook'
        });
        app.contextMenu.addItem({
            command: 'jupyter_recorder:stop',
            selector: '.jp-Notebook'
        });
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ }),

/***/ "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMwMCIgd2lkdGg9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkYXRhLW5hbWU9IkxheWVyIDEiIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZD0iTTQ4LjcxIDQyLjkxTDM0LjA4IDI4LjI5IDQ0LjMzIDE4YTEgMSAwIDAwLS4zMy0xLjYxTDIuMzUgMS4wNmExIDEgMCAwMC0xLjI5IDEuMjlMMTYuMzkgNDRhMSAxIDAgMDAxLjY1LjM2bDEwLjI1LTEwLjI4IDE0LjYyIDE0LjYzYTEgMSAwIDAwMS40MSAwbDQuMzgtNC4zOGExIDEgMCAwMC4wMS0xLjQyem0tNS4wOSAzLjY3TDI5IDMyYTEgMSAwIDAwLTEuNDEgMGwtOS44NSA5Ljg1TDMuNjkgMy42OWwzOC4xMiAxNEwzMiAyNy41OEExIDEgMCAwMDMyIDI5bDE0LjU5IDE0LjYyeiIvPjwvc3ZnPg==":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMwMCIgd2lkdGg9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkYXRhLW5hbWU9IkxheWVyIDEiIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZD0iTTQ4LjcxIDQyLjkxTDM0LjA4IDI4LjI5IDQ0LjMzIDE4YTEgMSAwIDAwLS4zMy0xLjYxTDIuMzUgMS4wNmExIDEgMCAwMC0xLjI5IDEuMjlMMTYuMzkgNDRhMSAxIDAgMDAxLjY1LjM2bDEwLjI1LTEwLjI4IDE0LjYyIDE0LjYzYTEgMSAwIDAwMS40MSAwbDQuMzgtNC4zOGExIDEgMCAwMC4wMS0xLjQyem0tNS4wOSAzLjY3TDI5IDMyYTEgMSAwIDAwLTEuNDEgMGwtOS44NSA5Ljg1TDMuNjkgMy42OWwzOC4xMiAxNEwzMiAyNy41OEExIDEgMCAwMDMyIDI5bDE0LjU5IDE0LjYyeiIvPjwvc3ZnPg== ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMwMCIgd2lkdGg9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkYXRhLW5hbWU9IkxheWVyIDEiIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZD0iTTQ4LjcxIDQyLjkxTDM0LjA4IDI4LjI5IDQ0LjMzIDE4YTEgMSAwIDAwLS4zMy0xLjYxTDIuMzUgMS4wNmExIDEgMCAwMC0xLjI5IDEuMjlMMTYuMzkgNDRhMSAxIDAgMDAxLjY1LjM2bDEwLjI1LTEwLjI4IDE0LjYyIDE0LjYzYTEgMSAwIDAwMS40MSAwbDQuMzgtNC4zOGExIDEgMCAwMC4wMS0xLjQyem0tNS4wOSAzLjY3TDI5IDMyYTEgMSAwIDAwLTEuNDEgMGwtOS44NSA5Ljg1TDMuNjkgMy42OWwzOC4xMiAxNEwzMiAyNy41OEExIDEgMCAwMDMyIDI5bDE0LjU5IDE0LjYyeiIvPjwvc3ZnPg==";

/***/ })

}]);
//# sourceMappingURL=lib_index_js-data_image_svg_xml_base64_PHN2ZyBoZWlnaHQ9IjMwMCIgd2lkdGg9IjMwMCIgeG1sbnM9Imh0dH-96ddf1.d92b72fd0559ef5807a8.js.map