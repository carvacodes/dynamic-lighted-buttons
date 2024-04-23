let primaryButtonColor = '#226';    // light blue-ish main color for the button
let hoverColor = '#55c';
let primaryHighlightColor = 'rgba(225,225,255,0.5)';    // semi-transparent white color as the highlight
let lightColor = '#cea';
let bgColor = '';
let activeColor = 'rgba(0,255,0,0.4)';
let b = [];

window.addEventListener('load', () => {
  bgColor = window.getComputedStyle(document.body).backgroundColor;

  let buttons = document.getElementsByClassName('fancy-button');    // get the buttons HTMLCollection - an array-like list of the fancy buttons on this page
  b = [].slice.call(buttons);   // set up an array that will hold the elements

  // iterate through each button on the page and set relevant values for a default light source positioning
  b.forEach(function(button){
    let buttonStyle = window.getComputedStyle(button);

    button.currentColor = primaryButtonColor;
    button.currentGlareColor = primaryHighlightColor;
    button.activeColor = activeColor;
    button.clicked = false;  
    button.style.boxShadow = 'rgba(0,0,0,0.4) 5px 5px 5px';
    button.style.backgroundImage = defineRadialGradient(primaryHighlightColor, primaryButtonColor, 'farthest-side', '10px 10px');

    // set up event handling for mouse enter/leave/click
    button.addEventListener('mouseenter', function(){
      this.currentColor = this.clicked ? primaryButtonColor : hoverColor;
    });

    button.addEventListener('mouseleave', function(){
      this.currentColor = primaryButtonColor;
      if (!this.clicked) {
        this.style.backgroundColor = 'transparent';
      }
    });
  });

    ////////////////////////////////////
   //        Event Listeners         //
  ////////////////////////////////////
  window.addEventListener('mousedown', handleMouseDownLikeEvents);
  window.addEventListener('touchstart', handleMouseDownLikeEvents);

  window.addEventListener('mouseup', handleMouseUpLikeEvents);
  window.addEventListener('touchend', handleMouseUpLikeEvents);

  window.addEventListener('mousemove', handleMoveEvents);
  window.addEventListener('touchmove', handleMoveEvents, {passive: false});
  
  window.addEventListener('resize', handleResize);
});

  ////////////////////////////////////
 //         Event Handlers         //
////////////////////////////////////

// swap the button colors when clicked or tapped
function handleMouseDownLikeEvents(e) {
  if (e.target.classList.contains('fancy-button')) {
    e.target.clicked = true;
    e.target.style.backgroundImage = 'unset';
    e.target.style.backgroundColor = e.target.activeColor;
    e.target.style.color = 'black';
  }
}

function handleMouseUpLikeEvents(e) {
  b.forEach(function(button){
    button.style.backgroundColor = 'transparent';
    button.style.color = 'white';
    button.clicked = false;
  });

  if (e.target.classList.contains('fancy-button')) {
    e.target.style.color = 'white';
    e.target.clicked = false;
    setButtonGradient(e.target, e);
  }
}

// update the buttons' colors and shadows on mouse move events
function handleMoveEvents(e) {
  if (e.changedTouches) {
    e.preventDefault();
    e = e.touches[0];
  }
  setBackgroundGradient(e);
  b.forEach((p) => setButtonGradient(p, e));
}

// handle window resizing
function handleResize() {
  document.body.style.height = '100vh';
}
  
  ////////////////////////////////////
 //           Functions            //
////////////////////////////////////

function setBackgroundGradient(mousemoveEvent) {
  let x = mousemoveEvent.clientX;
  let y = mousemoveEvent.clientY;
  document.body.style.backgroundImage = defineRadialGradient(lightColor, bgColor, '500px', x + 'px ' + y + 'px');
}

function setButtonGradient(button, mousemoveEvent) {
  if (button.clicked) { return; }
  let x = mousemoveEvent.clientX;
  let y = mousemoveEvent.clientY;
  
  // first, the highlight reflection. set to the extreme side if the mouse is past the button, or follow the mouse cursor if inside the button
  let r = button.getBoundingClientRect();
  let rCenterX = (r.left + r.right) / 2;
  let rCenterY = (r.top + r.bottom) / 2;
  let highlightLeft = x < r.left ? 0 : (x > r.right ? r.width : x - r.left);
  let highlightTop = y < r.top ? 0 : (y > r.bottom ? r.height : y - r.top);
  button.style.backgroundImage = defineRadialGradient(primaryHighlightColor, button.currentColor, 'farthest-side', highlightLeft + 'px ' + highlightTop + 'px');
  
  // next, the shadow. update the position relative to the mouse cursor
  let shadowXOffset = (-0.015 * (x - rCenterX)) + 'px';
  let shadowYOffset = (-0.015 * (y - rCenterY)) + 'px';

  // update the shadow blur radius when the mouse is far away: less blurred and darker when the mouse is nearby
  let centerX = (r.left + r.right) / 2;
  let centerY = (r.top + r.bottom) / 2;
  let distToMouse = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  let shadowDispersion = Math.abs(distToMouse / 200) + 'px';
  let shadowDepth = Math.abs(0.85 - (distToMouse / 3000));
  button.style.boxShadow = shadowXOffset + ' ' + shadowYOffset + ' ' + shadowDispersion + ' ' + shadowDispersion + ' rgba(0,0,0,' + shadowDepth + ')';

}

function defineLinearGradient(startColor, endColor, direction) {
  let str = 'linear-gradient(' + direction + ',' + startColor + ',' + endColor + ')';
  return str;
};

function defineRadialGradient(startColor, endColor, extent = 'farthest-side', origin = 'center') {
  let str = 'radial-gradient(' + extent + ' at ' + origin + ',' + startColor + ',' + endColor + ')';
  return str;
};

function getTrimmedComputedStyle(element, style) {
  let el = element;
  let compStyle = window.getComputedStyle(el)[style];
  let trimmedStyle = compStyle.match(/^\d*/)[0];
  return Number(trimmedStyle);
}