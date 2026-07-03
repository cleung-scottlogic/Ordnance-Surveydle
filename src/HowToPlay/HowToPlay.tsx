import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import './HowToPlay.css';

function HowToPlay({ open, onClose }: { open: boolean; onClose?: () => void }) {
  return (
    <Dialog className="how-to-play" open={open} onClose={onClose}>
      <button className="how-to-play-close" aria-label="close" onClick={onClose}>
        &times;
      </button>
      <DialogTitle className="title">How to Play</DialogTitle>
      <div className="how-to-play-content">
        <p>
          The top map uses data from Ordnance Survey maps dating from 1888 - 1913. The map changes
          will zooming in and out to use different map scales. You have 5 guesses to find the
          location.
        </p>
        <p>
          Find the location on the historical map and click on the bottom map to make your guess.
        </p>
        <p>
          The closer your guess is to the actual location, the more points you will score. If you
          find the exact location, you will score 1000 points and the game will end.
        </p>
      </div>
    </Dialog>
  );
}

export default HowToPlay;
