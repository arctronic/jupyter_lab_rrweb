import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
// import { showDialog, Dialog } from '@jupyterlab/apputils';
// import { Widget } from '@lumino/widgets';
import 'rrweb-player/dist/style.css';
import rrwebPlayer from 'rrweb-player';

/**
 * Initialization data for the jupyter_recorder extension.
 */

import * as rrweb from 'rrweb';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyter_recorder:plugin',
  description: 'Record session using rrweb and show replay in modal',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyter_recorder is activated!');

    let events: rrweb.ReplayerEvents[] = [];
    let recorder: any;

    function addIgnoreClassToJupyterLabElements() {
      // Example: Ignore all cells except the currently focused one
      // This is just an example; you'll need to adjust selectors based on your target
      const focusedCell = document.querySelector(
        '.jp-Notebook .jp-mod-focused'
      );
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
        emit: (event: any) => {
          events.push(event);
        }
      });
    }

    function stopRecording() {
      console.log('Recording stopped');
      if (recorder) {
        recorder(); // Call the stop function directly
        recorder = null;
      }
      // Show replay modal after stopping recording
      showReplayWithControls(events);
    }

    function showReplayWithControls(events: any[]) {
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

    // function showReplayModal() {
    //   if (events.length === 0) {
    //     console.log('No recorded events');
    //     return;
    //   }
    //   console.log('Replaying session');

    //   // Create a div element to hold the replayer with specific styling
    //   const div = document.createElement('div');
    //   div.style.width = '100vw';
    //   div.style.height = '100vh';
    //   div.style.position = 'fixed';
    //   div.style.top = '0';
    //   div.style.left = '0';
    //   div.style.margin = '0';
    //   div.style.padding = '0'; // Ensure no padding
    //   div.style.backgroundColor = '#fff';
    //   div.style.zIndex = '1000'; // Ensure it's on top
    //   div.style.display = 'flex'; // Use flex to center the child
    //   div.style.justifyContent = 'center'; // Center horizontally
    //   div.style.alignItems = 'center'; // Center vertically

    //   // Initialize the replayer
    //   const replayer = new rrweb.Replayer(events, {
    //     root: div // Target the div as the root for the replay
    //   });
    //   // Directly adjust the replayer wrapper if necessary
    //   replayer.wrapper.style.maxWidth = '100%';
    //   replayer.wrapper.style.maxHeight = '100%';
    //   replayer.wrapper.style.width = 'auto'; // Adjust based on your needs
    //   replayer.wrapper.style.height = 'auto'; // Adjust based on your needs

    //   div.appendChild(replayer.wrapper);

    //   document.body.appendChild(div);

    //   // Optional: Request fullscreen
    //   if (div.requestFullscreen) {
    //     div.requestFullscreen().catch(err => {
    //       console.error(
    //         `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
    //       );
    //     });
    //   }

    //   replayer.play();

    //   // Adjust this to use JupyterLab's dialog if you're integrating with JupyterLab
    //   console.log('running the modified code');
    //   // Assuming showDialog is a function you have that creates a modal dialog
    //   showDialog({
    //     title: 'Replay Session',
    //     body: new Widget({ node: div }),
    //     buttons: [Dialog.okButton({ label: 'Close' })]
    //   });
    // }

    // function showReplayModal() {
    //   if (events.length === 0) {
    //     console.log('No recorded events');
    //     return;
    //   }
    //   console.log('Replaying session');
    //   // const records = JSON.stringify({ events });
    //   // localStorage.setItem('records', records);
    //   // Create a div element to hold the replayer with specific styling
    //   const div = document.createElement('div');
    //   div.style.width = '100vw'; // Adjust width as needed
    //   div.style.height = '100vh'; // Adjust height as needed
    //   div.style.position = 'relative'; // Ensure it's positioned correctly within the modal

    //   // Initialize the replayer with the events and target the newly created div
    //   const replayer = new rrweb.Replayer(events, {
    //     root: div // Target the div as the root for the replay
    //   });
    //   div.appendChild(replayer.wrapper);

    //   // Start the replay
    //   replayer.play();

    //   // Show replay modal with the div as its body
    //   console.log('running the modified code');
    //   showDialog({
    //     title: 'Replay Session',
    //     body: new Widget({ node: div }),
    //     buttons: [Dialog.okButton({ label: 'Close' })]
    //   });
    // }

    // Command to start recording
    app.commands.addCommand('jupyter_recorder:start', {
      label: 'Start Recording',
      execute: () => {
        if (!recorder) {
          startRecording();
        } else {
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
        } else {
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
