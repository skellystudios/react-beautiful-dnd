'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lift = exports.dropAnimationFinished = exports.cancel = exports.drop = exports.completeDrop = exports.prepare = exports.clean = exports.crossAxisMoveBackward = exports.crossAxisMoveForward = exports.moveForward = exports.moveBackward = exports.moveByWindowScroll = exports.move = exports.updateDroppableDimensionIsEnabled = exports.updateDroppableDimensionScroll = exports.publishDroppableDimensions = exports.publishDraggableDimensions = exports.completeLift = exports.requestDimensions = undefined;

var _noImpact = require('./no-impact');

var _noImpact2 = _interopRequireDefault(_noImpact);

var _getNewHomeClientCenter = require('./get-new-home-client-center');

var _getNewHomeClientCenter2 = _interopRequireDefault(_getNewHomeClientCenter);

var _position = require('./position');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var origin = { x: 0, y: 0 };

var getScrollDiff = function getScrollDiff(_ref) {
  var initial = _ref.initial,
      current = _ref.current,
      droppable = _ref.droppable;

  var windowScrollDiff = (0, _position.subtract)(initial.windowScroll, current.windowScroll);

  var droppableScrollDiff = droppable ? droppable.viewport.frameScroll.diff.displacement : origin;

  return (0, _position.add)(windowScrollDiff, droppableScrollDiff);
};

var requestDimensions = exports.requestDimensions = function requestDimensions(id) {
  return {
    type: 'REQUEST_DIMENSIONS',
    payload: id
  };
};

var completeLift = exports.completeLift = function completeLift(id, client, windowScroll, isScrollAllowed) {
  return {
    type: 'COMPLETE_LIFT',
    payload: {
      id: id,
      client: client,
      windowScroll: windowScroll,
      isScrollAllowed: isScrollAllowed
    }
  };
};

var publishDraggableDimensions = exports.publishDraggableDimensions = function publishDraggableDimensions(dimensions) {
  return {
    type: 'PUBLISH_DRAGGABLE_DIMENSIONS',
    payload: dimensions
  };
};

var publishDroppableDimensions = exports.publishDroppableDimensions = function publishDroppableDimensions(dimensions) {
  return {
    type: 'PUBLISH_DROPPABLE_DIMENSIONS',
    payload: dimensions
  };
};

var updateDroppableDimensionScroll = exports.updateDroppableDimensionScroll = function updateDroppableDimensionScroll(id, offset) {
  return {
    type: 'UPDATE_DROPPABLE_DIMENSION_SCROLL',
    payload: {
      id: id,
      offset: offset
    }
  };
};

var updateDroppableDimensionIsEnabled = exports.updateDroppableDimensionIsEnabled = function updateDroppableDimensionIsEnabled(id, isEnabled) {
  return {
    type: 'UPDATE_DROPPABLE_DIMENSION_IS_ENABLED',
    payload: {
      id: id,
      isEnabled: isEnabled
    }
  };
};

var move = exports.move = function move(id, client, windowScroll) {
  return {
    type: 'MOVE',
    payload: {
      id: id,
      client: client,
      windowScroll: windowScroll
    }
  };
};

var moveByWindowScroll = exports.moveByWindowScroll = function moveByWindowScroll(id, windowScroll) {
  return {
    type: 'MOVE_BY_WINDOW_SCROLL',
    payload: {
      id: id,
      windowScroll: windowScroll
    }
  };
};

var moveBackward = exports.moveBackward = function moveBackward(id) {
  return {
    type: 'MOVE_BACKWARD',
    payload: id
  };
};

var moveForward = exports.moveForward = function moveForward(id) {
  return {
    type: 'MOVE_FORWARD',
    payload: id
  };
};

var crossAxisMoveForward = exports.crossAxisMoveForward = function crossAxisMoveForward(id) {
  return {
    type: 'CROSS_AXIS_MOVE_FORWARD',
    payload: id
  };
};

var crossAxisMoveBackward = exports.crossAxisMoveBackward = function crossAxisMoveBackward(id) {
  return {
    type: 'CROSS_AXIS_MOVE_BACKWARD',
    payload: id
  };
};

var clean = exports.clean = function clean() {
  return {
    type: 'CLEAN',
    payload: null
  };
};

var prepare = exports.prepare = function prepare() {
  return {
    type: 'PREPARE',
    payload: null
  };
};

var animateDrop = function animateDrop(_ref2) {
  var trigger = _ref2.trigger,
      newHomeOffset = _ref2.newHomeOffset,
      impact = _ref2.impact,
      result = _ref2.result;
  return {
    type: 'DROP_ANIMATE',
    payload: {
      trigger: trigger,
      newHomeOffset: newHomeOffset,
      impact: impact,
      result: result
    }
  };
};

var completeDrop = exports.completeDrop = function completeDrop(result) {
  return {
    type: 'DROP_COMPLETE',
    payload: result
  };
};

var drop = exports.drop = function drop() {
  return function (dispatch, getState) {
    var state = getState();

    if (state.phase === 'PREPARING' || state.phase === 'COLLECTING_INITIAL_DIMENSIONS') {
      dispatch(clean());
      return;
    }

    if (state.phase !== 'DRAGGING') {
      console.error('not able to drop in phase: \'' + state.phase + '\'');
      dispatch(clean());
      return;
    }

    if (!state.drag) {
      console.error('not able to drop when there is invalid drag state', state);
      dispatch(clean());
      return;
    }

    var _state$drag = state.drag,
        impact = _state$drag.impact,
        initial = _state$drag.initial,
        current = _state$drag.current;

    var descriptor = initial.descriptor;
    var draggable = state.dimension.draggable[initial.descriptor.id];
    var home = state.dimension.droppable[draggable.descriptor.droppableId];
    var destination = impact.destination ? state.dimension.droppable[impact.destination.droppableId] : null;

    var source = {
      droppableId: descriptor.droppableId,
      index: descriptor.index
    };

    var result = {
      draggableId: descriptor.id,
      type: home.descriptor.type,
      source: source,
      destination: impact.destination
    };

    var newCenter = (0, _getNewHomeClientCenter2.default)({
      movement: impact.movement,
      draggable: draggable,
      draggables: state.dimension.draggable,
      destination: destination
    });

    var clientOffset = (0, _position.subtract)(newCenter, draggable.client.withMargin.center);
    var scrollDiff = getScrollDiff({
      initial: initial,
      current: current,
      droppable: destination || home
    });
    var newHomeOffset = (0, _position.add)(clientOffset, scrollDiff);

    var isAnimationRequired = !(0, _position.isEqual)(current.client.offset, newHomeOffset);

    if (!isAnimationRequired) {
      dispatch(completeDrop(result));
      return;
    }

    dispatch(animateDrop({
      trigger: 'DROP',
      newHomeOffset: newHomeOffset,
      impact: impact,
      result: result
    }));
  };
};

var cancel = exports.cancel = function cancel() {
  return function (dispatch, getState) {
    var state = getState();

    if (state.phase !== 'DRAGGING') {
      dispatch(clean());
      return;
    }

    if (!state.drag) {
      console.error('invalid drag state', state);
      dispatch(clean());
      return;
    }

    var _state$drag2 = state.drag,
        initial = _state$drag2.initial,
        current = _state$drag2.current;

    var descriptor = initial.descriptor;
    var home = state.dimension.droppable[descriptor.droppableId];

    var source = {
      index: descriptor.index,
      droppableId: descriptor.droppableId
    };

    var result = {
      draggableId: descriptor.id,
      type: home.descriptor.type,
      source: source,

      destination: null
    };

    var isAnimationRequired = !(0, _position.isEqual)(current.client.offset, origin);

    if (!isAnimationRequired) {
      dispatch(completeDrop(result));
      return;
    }

    var scrollDiff = getScrollDiff({ initial: initial, current: current, droppable: home });

    dispatch(animateDrop({
      trigger: 'CANCEL',
      newHomeOffset: scrollDiff,
      impact: _noImpact2.default,
      result: result
    }));
  };
};

var dropAnimationFinished = exports.dropAnimationFinished = function dropAnimationFinished() {
  return function (dispatch, getState) {
    var state = getState();

    if (state.phase !== 'DROP_ANIMATING') {
      console.error('cannot end drop that is no longer animating', state);
      dispatch(clean());
      return;
    }

    if (!state.drop || !state.drop.pending) {
      console.error('cannot end drop that has no pending state', state);
      dispatch(clean());
      return;
    }

    dispatch(completeDrop(state.drop.pending.result));
  };
};

var lift = exports.lift = function lift(id, client, windowScroll, isScrollAllowed) {
  return function (dispatch, getState) {
    var initial = getState();

    if (initial.phase === 'DROP_ANIMATING') {
      if (!initial.drop || !initial.drop.pending) {
        console.error('cannot flush drop animation if there is no pending');
        dispatch(clean());
      } else {
        dispatch(completeDrop(initial.drop.pending.result));
      }
    }

    dispatch(prepare());

    setTimeout(function () {
      var state = getState();

      if (state.phase !== 'PREPARING') {
        return;
      }

      dispatch(requestDimensions(id));

      setTimeout(function () {
        var newState = getState();

        if (newState.phase !== 'COLLECTING_INITIAL_DIMENSIONS') {
          return;
        }

        dispatch(completeLift(id, client, windowScroll, isScrollAllowed));
      });
    });
  };
};