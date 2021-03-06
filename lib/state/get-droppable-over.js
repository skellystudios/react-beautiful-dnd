'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _getArea = require('./get-area');

var _getArea2 = _interopRequireDefault(_getArea);

var _getDraggablesInsideDroppable = require('./get-draggables-inside-droppable');

var _getDraggablesInsideDroppable2 = _interopRequireDefault(_getDraggablesInsideDroppable);

var _isPositionInFrame = require('./visibility/is-position-in-frame');

var _isPositionInFrame2 = _interopRequireDefault(_isPositionInFrame);

var _position = require('./position');

var _spacing = require('./spacing');

var _dimension = require('./dimension');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getRequiredGrowth = (0, _memoizeOne2.default)(function (draggable, draggables, droppable) {

  var getResult = function getResult(existingSpace) {
    var requiredSpace = draggable.page.withMargin[droppable.axis.size];

    if (requiredSpace <= existingSpace) {
      return null;
    }
    var requiredGrowth = (0, _position.patch)(droppable.axis.line, requiredSpace - existingSpace);

    return requiredGrowth;
  };

  var dimensions = (0, _getDraggablesInsideDroppable2.default)(droppable, draggables);

  if (!dimensions.length) {
    var _existingSpace = droppable.page.withMargin[droppable.axis.size];
    return getResult(_existingSpace);
  }

  var endOfDraggables = dimensions[dimensions.length - 1].page.withMargin[droppable.axis.end];
  var endOfDroppable = droppable.page.withMargin[droppable.axis.end];
  var existingSpace = endOfDroppable - endOfDraggables;

  return getResult(existingSpace);
});

var getWithGrowth = (0, _memoizeOne2.default)(function (area, growth) {
  return (0, _getArea2.default)((0, _spacing.addPosition)(area, growth));
});

var getClippedAreaWithPlaceholder = function getClippedAreaWithPlaceholder(_ref) {
  var draggable = _ref.draggable,
      draggables = _ref.draggables,
      droppable = _ref.droppable,
      previousDroppableOverId = _ref.previousDroppableOverId;

  var isHome = draggable.descriptor.droppableId === droppable.descriptor.id;
  var wasOver = Boolean(previousDroppableOverId && previousDroppableOverId === droppable.descriptor.id);
  var subject = droppable.viewport.subject;
  var frame = droppable.viewport.frame;
  var clipped = droppable.viewport.clipped;

  if (!clipped) {
    return clipped;
  }

  if (isHome || !wasOver) {
    return clipped;
  }

  var requiredGrowth = getRequiredGrowth(draggable, draggables, droppable);

  if (!requiredGrowth) {
    return clipped;
  }

  var isClippedByFrame = subject[droppable.axis.size] !== frame[droppable.axis.size];

  var subjectWithGrowth = getWithGrowth(clipped, requiredGrowth);

  if (!isClippedByFrame) {
    return subjectWithGrowth;
  }

  return (0, _dimension.clip)(frame, subjectWithGrowth);
};

exports.default = function (_ref2) {
  var target = _ref2.target,
      draggable = _ref2.draggable,
      draggables = _ref2.draggables,
      droppables = _ref2.droppables,
      previousDroppableOverId = _ref2.previousDroppableOverId;


  var maybeList = (0, _keys2.default)(droppables).map(function (id) {
    return droppables[id];
  }).filter(function (droppable) {
    return droppable.isEnabled;
  }).filter(function (droppable) {
    var withPlaceholder = getClippedAreaWithPlaceholder({
      draggable: draggable, draggables: draggables, droppable: droppable, previousDroppableOverId: previousDroppableOverId
    });

    if (!withPlaceholder) {
      return false;
    }

    return (0, _isPositionInFrame2.default)(withPlaceholder)(target);
  });

  maybeList.sort(function (a, b) {
    if (a.client.withoutMargin.width < b.client.withoutMargin.width && a.client.withoutMargin.height < b.client.withoutMargin.height) {
      return -1;
    }
    return 1;
  });

  var maybe = maybeList[0];

  return maybe ? maybe.descriptor.id : null;
};