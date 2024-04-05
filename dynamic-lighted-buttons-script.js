let buttons = document.getElementsByClassName('fancy-button');    // get the buttons HTMLCollection - an array-like list of the fancy buttons on this page
let b = [].slice.call(buttons);   // set up an array that will hold the elements
let proxies = [];   // this array will hold the proxy elements that will actually have the dynamic background color and shadow

let primaryButtonColor = '#77c';    // light blue-ish main color for the button
let hoverColor = '#33a';
let primaryHighlightColor = 'rgba(255,255,255,0.1)';    // semi-transparent white color as the highlight

// to begin, iterate through each button on the page and create a proxy element that will sit behind it
b.forEach(function(button){
  button.style.backgroundColor = 'transparent';     // set each actual button's color to transparent to show the proxy and still allow button interaction
  button.style.outline = 'none';

  // create the proxy elements
  let el = document.createElement('DIV');
  el.currentColor = primaryButtonColor;
  el.currentGlareColor = primaryHighlightColor;
  el.clicked = false;
  el.style.boxShadow = 'rgba(0,0,0,0.2) 5px 5px 5px';
  el.style.height = window.getComputedStyle(button).height;
  el.style.width = window.getComputedStyle(button).width;
  el.style.position = 'fixed';
  el.style.left = button.getBoundingClientRect().left + 'px';
  el.style.top = button.getBoundingClientRect().top + 'px';
  el.style.borderRadius = window.getComputedStyle(button).borderRadius;
  el.style.backgroundImage = defineRadialGradient(primaryHighlightColor, primaryButtonColor, 'farthest-side', '10px 10px');
  el.style.zIndex = -1000;    // since the cards are transparent, arbitrarily low z-indices are okay. would need to use a better z-index for a card with a background color
  button.proxyElement = el;   // important! save a reference to the proxy on the real button. this will be useful for handling window resizing.
  
  // set up event handling for mouse enter/leave/click
  button.addEventListener('mouseenter', function(){
    this.proxyElement.currentColor = this.proxyElement.clicked ? primaryButtonColor : hoverColor;
  });
  button.addEventListener('mouseleave', function(){
    this.proxyElement.currentColor = primaryButtonColor;
    if (!this.proxyElement.clicked) {
      this.style.backgroundColor = 'transparent';
    }
  });
  button.addEventListener('mousedown', function(){
    this.proxyElement.clicked = true;
    this.style.backgroundColor = 'rgba(0,255,0,0.4)';
    this.style.color = 'black';
  });
  button.addEventListener('mouseup', function(){
    this.style.backgroundColor = 'transparent';
    this.style.color = 'white';
    this.proxyElement.clicked = false;
  });

  document.body.appendChild(el);    // append proxy to the document body
  
  proxies.push(el);   // store the proxy element in the proxies array
});

window.addEventListener('mouseup', function(){
  b.forEach(function(button){
    button.style.backgroundColor = 'transparent';
    button.style.color = 'white';
    button.proxyElement.clicked = false;
  });
});

// update the proxies' colors and shadows on mouse move events
window.addEventListener('mousemove', function(e){
  let x = e.clientX;
  let y = e.clientY;
  document.body.style.backgroundImage = defineRadialGradient('#cea', '#cae', '1400px', x + 'px ' + y + 'px');
  proxies.forEach(function(p){
    // first, the highlight reflection. set to the extreme side if the mouse is past the button, or follow the mouse cursor if inside the button
    let r = p.getBoundingClientRect();
    let rCenterX = (r.left + r.right) / 2;
    let rCenterY = (r.top + r.bottom) / 2;
    let highlightLeft = x < r.left ? 0 : (x > r.right ? r.width : x - r.left);
    let highlightTop = y < r.top ? 0 : (y > r.bottom ? r.height : y - r.top);
    p.style.backgroundImage = defineRadialGradient(primaryHighlightColor, p.currentColor, 'farthest-side', highlightLeft + 'px ' + highlightTop + 'px');
    
    // next, the shadow. update the position relative to the mouse cursor
    let shadowXOffset = (-8 * (x - rCenterX) / rCenterX) + 'px';
    let shadowYOffset = (-8 * (y - rCenterY) / rCenterY) + 'px';
    
    // update the shadow blur radius to 5px and 0.1 alpha when the mouse is far away, or less blurred and darker when the mouse is nearby
    // there's a more physics-accurate version of this, but this is more than sufficient to achieve the desired effect
    let centerX = (r.left + r.right) / 2;
    let centerY = (r.top + r.bottom) / 2;
    let distToMouse = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    let shadowDispersion = Math.round(distToMouse / 300) + 2 + 'px';
    let shadowDepth = 0.8 - (distToMouse / 1000);
    p.style.boxShadow = 'rgba(0,0,0,' + shadowDepth + ') ' + shadowXOffset + ' ' + shadowYOffset + ' ' + shadowDispersion;
  });
});

// handle window resizing
window.addEventListener('resize', function(){
  b.forEach(function(button){
    let r = button.getBoundingClientRect();
    button.proxyElement.style.left = r.left + 'px';
    button.proxyElement.style.top = r.top + 'px';
  });
});

function defineLinearGradient(startColor, endColor, direction) {
  let str = 'linear-gradient(' + direction + ',' + startColor + ',' + endColor + ')';
  return str;
};

function defineRadialGradient(startColor, endColor, extent = 'farthest-side', origin = 'center') {
  let str = 'radial-gradient(' + extent + ' at ' + origin + ',' + startColor + ',' + endColor + ')';
  return str;
};