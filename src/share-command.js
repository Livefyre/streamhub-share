'use strict'

var $ = require('jquery');
var Command = require('streamhub-ui/command');
var log = require('debug')('streamhub-share/share-command');
var inherits = require('inherits');
var Popover = require('streamhub-ui/popover');
var ShareMenu = require('streamhub-share/share-menu');
var util = require('view/util');

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

    function findRoot() {
        return $(self._positionView.el).parents('[data-lf-package]')[0];
    }

    function showShare() {
        if (self._popoverActive) {
            return;
        }
        var share = new ShareMenu({
            model: self._content
        });
        share.render();

        var isMobile = util.isMobile();
        var rootEl = self._positionView.el;

        // If mobile, find the root element to attach the modal to.
        if (isMobile) {
            rootEl = findRoot();
            // If it is unable to find the root element, set isMobile to false
            // so that it will look OK. The buttons will still work because
            // the tap events will still be used.
            if (!rootEl) {
                rootEl = self._positionView.el;
                isMobile = false;
            }
        }

        var popover = new Popover({
            isMobile: isMobile,
            maxWidth: 160,
            parentEl: rootEl
        });
        popover.$el.addClass('lf-share-popover');
        popover._position = Popover.POSITIONS.BOTTOM;
        popover.events
        popover.render();
        popover.setContentNode(share.el);

        share.initialize();
        popover.resizeAndReposition(self._positionView.el);

        //Timeout the listener attachment so that it doesn't pick-up the button click
        setTimeout(function () {
            document.body.addEventListener('keyup', hideShare);
            document.body.addEventListener('click', hideShare);
        }, 100);

        function hideShare(ev) {
            // ignore cleanup if not enter or space
            if (ev.type === 'keyup' && !(ev.which === 13 || ev.which === 32)) {
                return;
            }
            // enter is sometimes reaching this as a click... fixing that
            if (ev.type === 'click' && ev.target.className === 'hub-btn hub-btn-link hub-content-share') {
                return;
            }
            share.detach();
            share.destroy();
            popover.destroy();
            popover = share = null;
            self._popoverActive = false;
            document.body.removeEventListener('click', hideShare);
            document.body.removeEventListener('keyup', hideShare);
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
