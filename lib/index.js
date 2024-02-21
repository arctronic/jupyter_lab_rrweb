// import { showDialog, Dialog } from '@jupyterlab/apputils';
// import { Widget } from '@lumino/widgets';
import 'rrweb-player/dist/style.css';
import rrwebPlayer from 'rrweb-player';
/**
 * Initialization data for the jupyter_recorder extension.
 */
import * as rrweb from 'rrweb';
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
            recorder = rrweb.record({
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
            new rrwebPlayer({
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
export default plugin;
//# sourceMappingURL=index.js.map