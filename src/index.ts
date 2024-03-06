import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

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
    let saveIntervalId: number | null = null; // Holds the reference to the setInterval
    const saveInterval = 10000;

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
    let allEvents: any[] = []; // Holds all events for the entire session
    let eventsForUpload: any[] = [];

    function saveAndSendEvents() {
      if (eventsForUpload.length === 0) {
        console.log('No events to save or send');
        return;
      }

      // Copy the events to send
      const eventsToSend = [...eventsForUpload];
      // Reset the eventsForUpload array to start fresh for the next upload
      eventsForUpload = [];

      // Convert events to JSON for upload
      const jsonEvents = JSON.stringify(eventsToSend);

      console.log('Sending events:', jsonEvents);
      // Logic to save the JSON to a file or send it to a server
      fetch('http://127.0.0.1:5000/shihab@email.com/alpha-141', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: jsonEvents
      })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error:', error));
    }

    function startRecording() {
      addIgnoreClassToJupyterLabElements();

      allEvents = []; // Reset allEvents array to start fresh
      eventsForUpload = []; // Also reset the eventsForUpload

      recorder = rrweb.record({
        emit: event => {
          // Add the event to both the allEvents and eventsForUpload arrays
          allEvents.push(event);
          eventsForUpload.push(event);
        }
      });

      // Setup periodic saving and sending of events
      if (saveIntervalId !== null) {
        clearInterval(saveIntervalId);
      }
      saveIntervalId = setInterval(saveAndSendEvents, saveInterval);
      stopRecording();
      startRecording();
    }

    function stopRecording() {
      console.log('Recording stopped');
      if (recorder) {
        recorder.stop();
        recorder = null;
      }
      if (saveIntervalId !== null) {
        clearInterval(saveIntervalId);
        saveIntervalId = null;
      }
      // Save and send any remaining events
      saveAndSendEvents();
      // Show replay modal after stopping recording
      // showReplayWithControls(allEvents);
    }

    app.restored.then(() => {
      startRecording();
      console.log(
        'Recording started triggered upon starting the jupyterlab app'
      );
    });

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
        } else {
          console.log('Already recording');
        }
      }
    });

    // Command to stop recording
    app.commands.addCommand('jupyter_recorder:stop', {
      label: 'Stop Recording',
      execute: () => {
        if (allEvents) {
          showReplayWithControls(allEvents);
        } else {
          console.log('Not recording to show');
        }
      }
    });

    app.commands.addCommand('jupyter_recorder:stop', {
      label: 'Play Recording',
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
