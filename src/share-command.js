'use strict'

var $ = require('jquery');
var Command = require('streamhub-ui/command');
var log = require('debug')('streamhub-share/share-command');
var inherits = require('inherits');
var Popover = require('streamhub-ui/popover');
var ShareMenu = require('streamhub-share/share-menu');

var ShareCommand = function(opts) {
    this._opts = opts = opts || {};

    Command.call(this, this._defaultFn, opts);

    this._popoverActive = false;

    if (opts.content) {
        this.setContent(opts.content);
    }
    if (opts.positionEl) {
        this.setPositionElement(opts.positionEl);
    }
};
inherits(ShareCommand, Command);

ShareCommand.prototype._defaultFn = function () {
    var self = this;
    //Get the permalink
    if (this._content.permalink) {
        showShare();
        return;
    }

    this._content.collection.getPermalink(this._opts, function (err, data) {
        if (err) {
            log('There was an error retrieving the permalink for this content.', err, this._content);
            return
        }
        self._content.permalink = data;
        showShare();
    });


    function showShare() {
        if (self._popoverActive) {
            return;
        }
        var share = new ShareMenu({
            model: self._content
        });
        share.render();
        var popover = new Popover({
            maxWidth: 160,
            parentEl: self._positionView.el
        });
        popover.$el.addClass('lf-share-popover');
        popover._position = Popover.POSITIONS.BOTTOM;
        popover.events
        popover.render();
        popover.setContentNode(share.el);

        share.initialize();
        popover.resizeAndReposition(self._positionView.el);

        // Position popover arrow
        var arrowEl = popover.$el.find('.'+Popover.CLASSES.ARROW);
        var translateX = arrowEl.offset().left - self._positionView.$el.offset().left - (self._positionView.$el.outerWidth()/2) ;
        var arrowLeft = parseInt(arrowEl.css('left'), 10);
        arrowEl.css('left', (arrowLeft-translateX)+'px');

        //Timeout the listener attachment so that it doesn't pick-up the button click
        setTimeout(function () {
            $('body').one('click', $.proxy(hideShare, self));
        }, 100);

        function hideShare(ev) {
            share.detach();
            share.destroy();
            popover.destroy();
            popover = share = null;
            self._popoverActive = false;
        }

        self._popoverActive = true;
    }
};

ShareCommand.prototype.setContent = function (content) {
    this._content = content;
    this._emitChangeCanExecute();
};

ShareCommand.prototype.setPositionView = function (el) {
    this._positionView = el;
};

ShareCommand.prototype.canExecute = function () {
    if (this._content && this._content.collection) {
        return Command.prototype.canExecute.call(this);
    }
    return false;
};

module.exports = ShareCommand;
