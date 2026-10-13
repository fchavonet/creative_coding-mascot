/******************************
* RESPONSIVE WARNING BEHAVIOR *
******************************/

const responsiveWarning = document.getElementById("responsive-warning");
// Enable/disable responsive warning.
const responsiveDesign = false;
// Mobile width limit.
const threshold = 768;

// Show or hide modal based on screen size.
function checkResponsiveState() {
  const small = window.innerWidth <= threshold;

  if (!responsiveDesign && small) {
    if (!responsiveWarning.open) {
      responsiveWarning.showModal();
      document.body.classList.add("overflow-hidden");
    }
  } else {
    if (responsiveWarning.open) {
      responsiveWarning.close();
      document.body.classList.remove("overflow-hidden");
    }
  }
}

// Initial check.
checkResponsiveState();

// Real-time resize detection.
window.addEventListener("resize", checkResponsiveState);


/************************
* PANDA MASCOT BEHAVIOR *
************************/

const pandaImage = document.getElementById("panda");
const pandaButton = document.getElementById("panda-button");

// Available emotes for random selection.
const emoteNames = ["confused", "happy", "shy", "sleep", "star", "surprised"];
const emoteDuration = 1500; // Display duration in milliseconds (1500 = 1.5 seconds).
let isEmoteVisible = false;
let emoteTimeout = null;

// Directions ordered clockwise, starting from the right.
const directionNames = [
  "right", "down-right", "down", "down-left", "left", "up-left", "up", "up-right"
];

const neutralRadius = 40; // Look forward within this distance, in pixels.
const sectorAngle = Math.PI / 4; // Each direction covers 45 degrees.
const angleTolerance = 0.12; // Prevent flickering between neighboring directions.
let currentDirection = "center";
let currentSector = -1;

// Preload all PNG files before they are needed.
const cachedImages = [];

for (const imageName of ["center", ...directionNames, ...emoteNames]) {
  const image = new Image();
  image.src = "assets/" + imageName + ".png";
  cachedImages.push(image);
}

// Panda mascot direction.
function showDirection(imageName) {
  if (imageName === currentDirection) {
    return;
  }

  currentDirection = imageName;

  // Keep tracking the direction while an emote is displayed.
  if (!isEmoteVisible) {
    pandaImage.src = "assets/" + imageName + ".png";
  }
}

function resetPanda() {
  currentSector = -1;
  showDirection("center");
}

function followMouse(event) {
  // Ignore touch movement; taps are handled by the button.
  if (event.pointerType === "touch") {
    return;
  }

  const pandaBounds = pandaImage.getBoundingClientRect();
  const distanceX = event.clientX - (pandaBounds.left + pandaBounds.width / 2);
  const distanceY = event.clientY - (pandaBounds.top + pandaBounds.height / 2);

  if (Math.hypot(distanceX, distanceY) < neutralRadius) {
    resetPanda();
    return;
  }

  const pointerAngle = Math.atan2(distanceY, distanceX);

  if (currentSector !== -1) {
    const angleDifference = pointerAngle - currentSector * sectorAngle;
    // Normalize the angle to stay between -PI and PI.
    const normalizedAngleDifference = Math.atan2(Math.sin(angleDifference), Math.cos(angleDifference));

    if (Math.abs(normalizedAngleDifference) < sectorAngle / 2 + angleTolerance) {
      return;
    }
  }

  currentSector = (Math.round(pointerAngle / sectorAngle) + directionNames.length) % directionNames.length;
  showDirection(directionNames[currentSector]);
}

// Show an emote temporarily, then restore the latest look direction.
function showEmote(emoteName) {
  if (!emoteNames.includes(emoteName)) {
    return;
  }

  // Replace the current emote and restart its timer.
  window.clearTimeout(emoteTimeout);
  isEmoteVisible = true;
  pandaImage.src = "assets/" + emoteName + ".png";

  emoteTimeout = window.setTimeout(function () {
    isEmoteVisible = false;
    emoteTimeout = null;
    pandaImage.src = "assets/" + currentDirection + ".png";
  }, emoteDuration);
}

// Show a randomly selected emote.
function showRandomEmote() {
  const randomIndex = Math.floor(Math.random() * emoteNames.length);
  showEmote(emoteNames[randomIndex]);
}

pandaButton.addEventListener("click", showRandomEmote);
window.addEventListener("pointermove", followMouse, { passive: true });
document.documentElement.addEventListener("pointerleave", resetPanda);
window.addEventListener("blur", resetPanda);
