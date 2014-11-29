/**
 * Suaip
 * Library for adding swipe cards to your app
 * Copyright (c) 2014 José Miguel Molina <hi@mvader.me>
 * Licensed under the MIT license
 *
 * Based on: JavaScript Swipe Cards (https://github.com/apeatling/javascript-swipe-cards)
 */

var Suaip = (function (Hammer, window) {
    'use strict';

    /**
     * @constant The speed cards will animate to completion with a fast drag
     * @type {number}
     */
    var ANIMATION_SPEED_FAST = 200;

    /**
     * @constant The speed cards will animate to completion with a slow drag
     * @type {number}
     */
    var ANIMATION_SPEED_SLOW = 300;

    /**
     * @constant The boundary to determine a fast or slow drag 0 (slow) to 3+ (very fast)
     * @type {number}
     */
    var DRAG_VELOCITY_BOUNDARY = 2;

    /**
     * Hold the hammer.js object
     * @type {object}
     */
    var h = {};

    /**
     * The before, active, and after card DOM elements
     * @type {object}
     */
    var cardElements = {};

    /**
     * The current drag direction from user input
     * @type {string}
     */
    var direction = false;

    /**
     * Easy shortener for handling adding and removing body classes.
     */
    var bodyClass;

    /**
     * Accumulated distance
     * @type {Number}
     */
    var distanceDelta = 0;

    /**
     * Angular scope
     * @type {Object}
     */
    var $scope;

    var draggingDown = false;

    /**
     * Initialize swipe and cards
     */
    var init = function (options) {
        if (!(options && options.after && options.active && options.scope)) {
            throw "Invalid config";
        }

        bodyClass = document.body.classList;

        $scope = options.scope;
        $scope.$apply(function () {
            $scope.nextLevel = _nextLevel;
            $scope.prevLevel = _prevLevel;
        });

        options.active.classList.add('active');
        options.after.classList.add('after');

        if (options.left) {
            options.left.classList.add('left');
        }

        if (options.right) {
            options.right.classList.add('right');
        }

        _setCardElements(options.active, options.after, options.left, options.right);
        _bindTouchEvents();
    };

    /**
     * Initialize the hammer.js class, and bind drag events.
     */
    var _bindTouchEvents = function () {
        h = new Hammer(cardElements.active, {
            preventDefault: false
        });

        if ($scope.level !== 0) h.on('dragdown', _dragDown);
        h.on('dragend', _dragEnd);

        if (cardElements.left && $scope.canGoNext()) {
            h.on('dragleft', _dragLeft);
        }

        if (cardElements.right && $scope.canGoPrev()) {
            h.on('dragright', _dragRight);
        }

        // While drag events are active, make sure touch events are accessible.
        for (var card in cardElements) {
            cardElements[card].removeEventListener('touchstart', _disableTouch );
        }
    };

    /**
     * Unbind hammer.js drag events.
     */
    var _unbindTouchEvents = function () {
        if ($scope.level !== 0) h.off('dragdown', _dragDown);
        h.off('dragend', _dragEnd);

        if (cardElements.left && $scope.canGoNext()) {
            h.off('dragleft', _dragLeft);
        }

        if (cardElements.right && $scope.canGoPrev()) {
            h.off('dragright', _dragRight);
        }

        // While drag events are not active, block all touch events to stop scrolling.
        for (var card in cardElements) {
            cardElements[card].addEventListener('touchstart', _disableTouch, false );
        }
    };

    /**
     * Select the card elements from the DOM and store them in cardElements for easy access or set
     * the given elements.
     * @param {HTMLElement|undefined} active Active card
     * @param {HTMLElement|undefined} after After card
     * @param {HTMLElement|undefined} left Left card
     * @paran {HTMLElement|undefined} right Right card
     */
    var _setCardElements = function (active, after, left, right, before) {
        cardElements.active = active ? active : document.getElementsByClassName('active')[0];

        if ($scope.level === 1) {
            cardElements.after = document.getElementsByClassName('before')[0];
        } else {
            cardElements.after = after ? after : document.getElementsByClassName('after')[0];
        }

        cardElements.left = left ? left : document.getElementsByClassName('left')[0];
        cardElements.right = right ? right : document.getElementsByClassName('right')[0];
    };

    /**
     * On the dragup event, transform the active and after card elements to move
     * with the drag.
     * @param {Event} e Drag event
     */
    var _dragUp = function (e) {
        var opacity = Math.round(((-(distanceDelta - e.gesture.distance)) / window.innerHeight) * 100);

        translateElement(cardElements.active, 0, distanceDelta - e.gesture.distance, 0);
        translateElement(cardElements.after, 0, window.innerHeight - (-(distanceDelta - e.gesture.distance)), 0);
        //cardElements.after.getElementsByTagName('p')[0].style.color = 'rgba(0, 0, 0, 0.' + opacity + ')';
    };

    var _dragLeft = function (e) {
        if (draggingDown) return;
        translateElement(cardElements.active, -e.gesture.distance, distanceDelta, 0);
        var opacity = Math.round((e.gesture.distance / cardElements.active.scrollWidth) * 100);

        translateElement(cardElements.right, cardElements.active.scrollWidth - e.gesture.distance, 0, 0);
        //cardElements.right.getElementsByTagName('p')[0].style.color = 'rgba(0, 0, 0, 0.' + opacity + ')';
    };

    var _dragRight = function (e) {
        if (draggingDown) return;
        translateElement(cardElements.active, e.gesture.distance, distanceDelta, 0);
        var opacity = Math.round((e.gesture.distance / cardElements.active.scrollWidth) * 100);

        translateElement(cardElements.left, -(cardElements.active.scrollWidth - e.gesture.distance), 0, 0);
        //cardElements.left.getElementsByTagName('p')[0].style.color = 'rgba(0, 0, 0, 0.' + opacity + ')';
    };

    /**
     * On the dragdown event, transform the active and before card elements
     * to move with the drag.
     * @param {Event} e Drag event
     */
    var _dragDown = function (e) {
        var opacity = Math.round(((distanceDelta + e.gesture.distance) / window.innerHeight) * 100);

        translateElement(cardElements.active, 0, distanceDelta + e.gesture.distance, 0);
        translateElement(cardElements.after, 0, -(window.innerHeight - (e.gesture.distance + distanceDelta)), 0);
        //cardElements.after.getElementsByTagName('p')[0].style.color = 'rgba(0, 0, 0, 0.' + opacity + ')';
        draggingDown = true;
    };

    /**
     * Go to the next section level
     */
    var _nextLevel = function () {
        _unbindTouchEvents();
        _addAnimations(ANIMATION_SPEED_FAST);
        direction = 'up';
        _completeUpTransition();
    };

    var _prevLevel = function () {
        _unbindTouchEvents();
        _addAnimations(ANIMATION_SPEED_SLOW);
        direction = 'down';
        _completeDownTransition({
            gesture: {
                distance: window.innerHeight
            },
            manual: true
        });
    };

    /**
     * On the dragend event, determine if the drag animation should slide
     * the next card in, or restore the active card.
     * @param {Event} e Drag event
     */
    var _dragEnd = function (e) {
        direction = e.gesture.direction;

        // Disable hammer and any touch events until animation is complete.
        _unbindTouchEvents();

        var animationSpeed = (e.gesture.velocityY > DRAG_VELOCITY_BOUNDARY)
            ? ANIMATION_SPEED_SLOW
            : ANIMATION_SPEED_FAST;
        _addAnimations(animationSpeed);

        draggingDown = false;

        // Finish the transition after swipe.
        if ('down' === direction && $scope.level === 1) {
            if (e.manual) {
                _removeAnimations();
                _bindTouchEvents();
            } else {
                _completeDownTransition(e);
            }
        } else if ('left' === direction && $scope.canGoNext()) {
            _completeLeftTransition(e);
        } else if ('right' === direction && $scope.canGoPrev()) {
            _completeRightTransition(e);
        } else {
            _removeAnimations();
            _bindTouchEvents();
        }
    };

    /**
     * Change the active card class if the transition was a success.
     */
    var _shiftActiveCard = function (e) {
        cardElements.active.classList.remove('animate');

        ['animate', 'dragup-reset', 'drag-complete', 'dragup-complete',
        'dragdown-reset', 'dragdown-complete', 'dragleft-complete',
        'dragright-complete'].forEach(function (c) {
            bodyClass.remove(c);
        });

        for (var card in cardElements) {
            cardElements[card].style.transition = '';
            cardElements[card].style.transform = cardElements[card].style.webkitTransform = '';
            cardElements[card].style.opacity = '';
        }

        if (direction === 'up') {
            $scope.enterRead();
        }

        cardElements.active.removeEventListener('transitionend', _shiftActiveCard, false);

        // If the transition to a new card was successful then shift cards
        if (cardElements.active.classList.contains('drag-complete')) {
            _setCardClasses();
        }

        // Reselect card elements and their new classes.
        _setCardElements();
        _bindTouchEvents();
    };

    /**
     * Set the classes on each card, depending on the completed drag direction.
     */
    var _setCardClasses = function () {
        var activeCardClass = cardElements.active.classList;
        var afterCardClass = cardElements.after.classList;
        var leftCardClass = cardElements.left.classList;
        var rightCardClass = cardElements.right.classList;

        activeCardClass.remove('active');
        activeCardClass.remove('drag-complete');

        if ('up' === direction) {
            var cls = document.getElementById('top').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('before');

            cls = document.getElementById('left').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('left');

            cls = document.getElementById('right').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('right');

            cls = document.getElementById('read').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('active');

            $scope.$apply(function () {
                $scope.activeCard = 1;
            });
        } else if ('down' === direction) {
            var cls = document.getElementById('top').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('active');

            cls = document.getElementById('left').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('left');

            cls = document.getElementById('right').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('right');

            cls = document.getElementById('read').classList;
            cls.remove('active');
            cls.remove('left');
            cls.remove('right');
            cls.remove('before');
            cls.remove('after');
            cls.add('after');

            $scope.$apply(function () {
                $scope.activeCard = 1;
            });
        } else if ('left' === direction) {
            rightCardClass.remove('right');
            rightCardClass.add('active');

            activeCardClass.add('left');

            leftCardClass.remove('left');
            leftCardClass.add('right');
        } else {
            leftCardClass.remove('left');
            leftCardClass.add('active');

            activeCardClass.add('right');

            rightCardClass.remove('right');
            rightCardClass.add('left');
        }
    };

    /**
     * Add animations to the card elements
     * @param {Number} animationSpeed Animation speed
     */
    var _addAnimations = function (animationSpeed) {
        cardElements.active.classList.add('animate');
        for (var card in cardElements) {
            cardElements[card].style.transition = 'all ' + animationSpeed + 'ms ease';
        }
    };

    /**
     * Removes all animations from the cards after 400ms,
     * waiting for the animation to end.
     */
    var _removeAnimations = function () {
        window.setTimeout(function () {
            cardElements.active.classList.remove('animate');

            for (var card in cardElements) {
                cardElements[card].style.transition = '';
            }
        }, 400);
    };

    /**
     * Translates an element to another 3d position
     * @param  {HTMLElement} elem Element to translate
     * @param  {Number}      x    X axis position
     * @param  {Number}      y    Y axis position
     * @param  {Number}      z    Z axis position
     */
    var translateElement = function (elem, x, y, z) {
        var translation = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)';
        elem.style.transform = elem.style.webkitTransform = translation;
    };

    /**
     * Manage the movemenet of the card when the up gesture has ended
     */
    var _completeUpTransition = function () {
        $scope.level = 1;

        distanceDelta = 0;
        bodyClass.add('dragup-complete');
        cardElements.active.classList.add('drag-complete');
        cardElements.active.addEventListener('transitionend', _shiftActiveCard, false);
    };

    /**
     * Manage the movemenet of the card when the down gesture has ended
     * @param {Event} e Gesture event
     */
    var _completeDownTransition = function(e) {
        // Increment distance delta
        distanceDelta += e.gesture.distance;

        // If the distance of the top of the card is less than 1/3 of its size
        // the card will not be discarded
        if (distanceDelta < (window.innerHeight / 6 * 2)) {
            // If distance delta is greater than zero we have to translate the position
            // of the card to the top
            if (distanceDelta > 0) {
                distanceDelta = 0;
                translateElement(cardElements.active, 0, 0, 0);
            }

            // Bind touch events again and remove the animations.
            // Not removing the animations will cause a lot of lag when scrolling.
            _bindTouchEvents();
            _removeAnimations();
        } else {
            // Discard card and show the next one
            if (!$scope.$$phase) {
                $scope.$apply(function () {
                    $scope.level = 0;
                    $scope.back();
                });
            } else {
                $scope.level = 0;
                $scope.back();
            }

            distanceDelta = 0;
            bodyClass.add('dragdown-complete');
            cardElements.active.classList.add('drag-complete');
            cardElements.active.addEventListener('transitionend', _shiftActiveCard, false);
        }
    };

    /**
     * Manage the movemenet of the card when the left gesture has ended
     * @param {Event} e Gesture event
     */
    var _completeLeftTransition = function (e) {
        if (e.gesture.distance < window.innerWidth / 3) {
            translateElement(cardElements.active, 0, distanceDelta, 0);

            // Bind touch events again and remove the animations.
            // Not removing the animations will cause a lot of lag when scrolling.
            _bindTouchEvents();
            _removeAnimations();
        } else {
            $scope.sectionIndex[$scope.level]++;
            $scope.next();

            bodyClass.add('dragleft-complete');
            cardElements.active.classList.add('drag-complete');
            cardElements.active.addEventListener('transitionend', _shiftActiveCard, false);
        }
    };

    /**
     * Manage the movemenet of the card when the right gesture has ended
     * @param {Event} e Gesture event
     */
    var _completeRightTransition = function (e) {
        if (e.gesture.distance < window.innerWidth / 3) {
            translateElement(cardElements.active, 0, distanceDelta, 0);

            // Bind touch events again and remove the animations.
            // Not removing the animations will cause a lot of lag when scrolling.
            _bindTouchEvents();
            _removeAnimations();
        } else {
            $scope.sectionIndex[$scope.level]--;
            $scope.prev();

            bodyClass.add('dragright-complete');
            cardElements.active.classList.add('drag-complete');
            cardElements.active.addEventListener('transitionend', _shiftActiveCard, false);
        }
    };

    /**
     * Prevent default actions for an event
     * @param {Event} e Drag event
     */
    var _disableTouch = function (e) {
        e.preventDefault();
    };

    return {
        init: init
    };

})(Hammer, window);