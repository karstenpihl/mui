/**
 * MUI CSS/JS ripple module
 * @module ripple
 */

'use strict';


var jqLite = require('./lib/jqLite'),
    util = require('./lib/util'),
    animationHelpers = require('./lib/animationHelpers'),
    btnClass = 'mui-btn',
    btnFABClass = 'mui-btn--fab',
    rippleClass = 'mui-ripple-effect',
    supportsTouch = 'ontouchstart' in document.documentElement,
    mouseDownEvents = (supportsTouch) ? 'touchstart' : 'mousedown',
    mouseUpEvents = (supportsTouch) ? 'touchend' : 'mouseup mouseleave',
    animationDuration = 600;


/**
 * Add ripple effects to button element.
 * @param {Element} buttonEl - The button element.
 */
function initialize(buttonEl) {
  // check flag
  if (buttonEl._muiRipple === true) return;
  else buttonEl._muiRipple = true;

  // exit if element is INPUT (doesn't support absolute positioned children)
  if (buttonEl.tagName === 'INPUT') return;

  // add ripple container
  var el = document.createElement('span');
  el.className = 'mui-btn__ripple-container';
  el.innerHTML = '<span class="mui-ripple"></span>';
  buttonEl.appendChild(el);

  // attach event handler
  jqLite.on(buttonEl, mouseDownEvents, mouseDownHandler);
}


/**
 * MouseDown Event handler.
 * @param {Event} ev - The DOM event
 */
function mouseDownHandler(ev) {
  // only left clicks
  if (ev.type === 'mousedown' && ev.button !== 0) return;

  var buttonEl = this;

  // exit if button is disabled
  if (buttonEl.disabled === true) return;

  // add mouseup event to button once
  if (!buttonEl.muiMouseUp) {
    jqLite.on(buttonEl, mouseUpEvents, mouseUpHandler);
    buttonEl.muiMouseUp = true;
  }

  // get ripple element
  var rippleEl = buttonEl.querySelector('.mui-ripple');
  jqLite.addClass(rippleEl, 'mui--is-visible');

  // animate in
  util.requestAnimationFrame(function() {
    var t1 = 'translate(-50%, -50%) translate(7px, 30px) scale(0.0001, 0.0001)';
    jqLite.css(rippleEl, {
      'webkitTransform': t1,
      'msTransform': t1,
      'transform': t1,
      'width': '194.58995463159548px',
      'height': '194.58995463159548px'
    });

    // start animation
    jqLite.removeClass(rippleEl, 'mui--is-animating');


    // end animation
    util.requestAnimationFrame(function() {
      var t2 = 'translate(-50%, -50%) translate(7px, 30px)';
      jqLite.css(rippleEl, {
        'webkitTransform': t2,
        'msTransform': t2,
        'transform': t2
      });

      jqLite.addClass(rippleEl, 'mui--is-animating');
    });
  });
}


/**
 * MouseUp event handler.
 * @param {Event} ev - The DOM event
 */
function mouseUpHandler(ev) {
  var children = this.children,
      i = children.length,
      rippleEls = [],
      el;

  // animate out ripples
  while (i--) {
    el = children[i];
    if (jqLite.hasClass(el, rippleClass)) {
      jqLite.addClass(el, 'mui--animate-out');
      rippleEls.push(el);
    }
  }

  // remove ripples after animation
  if (rippleEls.length) {
    setTimeout(function() {
      var i = rippleEls.length,
          el,
          parentNode;

      // remove elements
      while (i--) {
        el = rippleEls[i];
        parentNode = el.parentNode;
        if (parentNode) parentNode.removeChild(el);
      }
    }, animationDuration);
  }
}


/**
 * Create ripple element  
 * @param {Element} - buttonEl - The button element.
 */
function createRippleEl(ev, buttonEl) {
  // get (x, y) position of click
  var offset = jqLite.offset(buttonEl),
      clickEv = (ev.type === 'touchstart') ? ev.touches[0] : ev,
      xPos = clickEv.pageX - offset.left,
      yPos = clickEv.pageY - offset.top,
      diameter,
      radius,
      rippleEl;

  // calculate diameter
  diameter = Math.sqrt(offset.width * offset.width + 
                       offset.height * offset.height) * 2;

  // create element
  rippleEl = document.createElement('div'),
  rippleEl.className = rippleClass;

  radius = diameter / 2;

  jqLite.css(rippleEl, {
    height: diameter + 'px',
    width: diameter + 'px',
    top: yPos - radius + 'px',
    left: xPos - radius + 'px'
  });

  return rippleEl;
}


/** Define module API */
module.exports = {
  /** Initialize module listeners */
  initListeners: function() {
    // markup elements available when method is called
    var elList = document.getElementsByClassName(btnClass),
        i = elList.length;
    while (i--) initialize(elList[i]);

    // listen for new elements
    animationHelpers.onAnimationStart('mui-btn-inserted', function(ev) {
      initialize(ev.target);
    });
  }
};
