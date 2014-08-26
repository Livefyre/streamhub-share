'use strict';

var Button = require('streamhub-ui/button');
var inherits = require('inherits');
var ShareCommand = require('streamhub-share/share-command');

/**
 * 
 * [opts] {Object=}
 * [opts.command] {Command=} Command in place of the default.
 * [opts.content] {Content=} Content to share. Can be set later.
 */
var ShareButton = function (opts) {
    opts = opts || {};
    opts.className = opts.className || 'content-share';
    opts.label = opts.label || 'Share';

    var cmd = opts.command;
    if (!cmd) {
        cmd = new ShareCommand(opts); 
    }

    Button.call(this, cmd, opts);
    this.$el.addClass('fycon-action-share');
    cmd.setPositionView(this);
}
inherits(ShareButton, Button);

ShareButton.prototype.elClassPrefix = 'lf';

ShareButton.prototype.elTag = 'button';

ShareButton.prototype.template = function () {
    return this._label;
};

ShareButton.prototype.setContent = function (content) {
    this._command.setContent && this._command.setContent(content);
};

module.exports = ShareButton;
