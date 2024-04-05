let buttons = document.getElementsByClassName('fancy-button');    // get the buttons HTMLCollection - an array-like list of the fancy buttons on this page
let b = [].slice.call(buttons);   // set up an array that will hold the elements
let proxies = [];   // this array will hold the proxy elements that will actually have the dynamic background color and shadow

let primaryButtonColor = '#77c';    // light blue-ish main color for the button
let hoverColor = '#33a';
let primaryHighlightColor = 'rgba(255,255,255,0.1)';    // semi-transparent white color as the highlight
let activeColor = 'rgba(0,255,0,0.4)';

// to begin, iterate through each button on the page and create a proxy element that will sit behind it
b.forEach(function(button){
  button.style.backgroundColor = 'transparent';     // set each actual button's color to transparent to show the proxy and still allow button interaction
  button.style.outline = 'none';
  let buttonStyle = window.getComputedStyle(button);

  // create the proxy elements
  let el = document.createElement('DIV');
  el.currentColor = primaryButtonColor;
  el.currentGlareColor = primaryHighlightColor;
  el.activeColor = activeColor;
  el.clicked = false;  
  el.style.boxShadow = 'rgba(0,0,0,0.4) 5px 5px 5px';
  el.style.height = getTrimmedComputedStyle(button, 'height') + 'px';
  el.style.width = getTrimmedComputedStyle(button, 'width') + getTrimmedComputedStyle(button, 'paddingLeft') + getTrimmedComputedStyle(button, 'paddingRight') + 'px';
  el.style.position = 'relative';
  el.style.left = 0;
  el.style.top = getTrimmedComputedStyle(button, 'marginTop') * -1 + 'px';
  el.style.borderRadius = buttonStyle.borderRadius;
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
    this.proxyElement.style.backgroundImage = 'unset';
    this.proxyElement.style.backgroundColor = this.proxyElement.activeColor;
    this.style.color = 'black';
  });
  button.addEventListener('mouseup', function(e){
    this.style.backgroundColor = 'transparent';
    this.style.color = 'white';
    this.proxyElement.clicked = false;
    setButtonGradient(this.proxyElement, e);
  });

  button.appendChild(el);    // append proxy to the document body
  
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
  setBackgroundGradient(e);
  proxies.forEach((p) => setButtonGradient(p, e));
});

// handle window resizing
window.addEventListener('resize', function(){
  document.body.style.height = '100vh';
  document.body.style.width = '100vw';
});

function setBackgroundGradient(mousemoveEvent) {
  let x = mousemoveEvent.clientX;
  let y = mousemoveEvent.clientY;
  document.body.style.backgroundImage = defineRadialGradient('#cea', '#cae', '1400px', x + 'px ' + y + 'px');
}

function setButtonGradient(proxy, mousemoveEvent) {
  if (proxy.clicked) { return; }
  let x = mousemoveEvent.clientX;
  let y = mousemoveEvent.clientY;
  
  // first, the highlight reflection. set to the extreme side if the mouse is past the button, or follow the mouse cursor if inside the button
  let r = proxy.getBoundingClientRect();
  let rCenterX = (r.left + r.right) / 2;
  let rCenterY = (r.top + r.bottom) / 2;
  let highlightLeft = x < r.left ? 0 : (x > r.right ? r.width : x - r.left);
  let highlightTop = y < r.top ? 0 : (y > r.bottom ? r.height : y - r.top);
  proxy.style.backgroundImage = defineRadialGradient(primaryHighlightColor, proxy.currentColor, 'farthest-side', highlightLeft + 'px ' + highlightTop + 'px');
  
  // next, the shadow. update the position relative to the mouse cursor
  let shadowXOffset = (-0.015 * (x - rCenterX)) + 'px';
  let shadowYOffset = (-0.015 * (y - rCenterY)) + 'px';

  console.log(rCenterX, rCenterY, shadowXOffset, shadowYOffset, x, y)
  
  // update the shadow blur radius when the mouse is far away: less blurred and darker when the mouse is nearby
  let centerX = (r.left + r.right) / 2;
  let centerY = (r.top + r.bottom) / 2;
  let distToMouse = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  let shadowDispersion = Math.abs(distToMouse / 200) + 'px';
  let shadowDepth = Math.abs(0.85 - (distToMouse / 3000));
  proxy.style.boxShadow = shadowXOffset + ' ' + shadowYOffset + ' ' + shadowDispersion + ' ' + shadowDispersion + ' rgba(0,0,0,' + shadowDepth + ')';

  // console.log(distToMouse, shadowXOffset, shadowYOffset, shadowDepth, shadowDispersion)
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