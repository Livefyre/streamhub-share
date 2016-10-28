'use strict';

var AriaUtil = require('streamhub-ui/util/aria');
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
    opts.insightsVerb = opts.insightsVerb || 'ShareButtonClick';

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

ShareButton.prototype._execute = function (evt) {
    if (AriaUtil.isNotAriaKeyEvent(evt)) {
        return;
    }

    // Because the pop-over menu's get nested within the share button el,
    // the insights:local event gets fired when the individual menu elements
    // get clicked, too. As a result, we need to only allow the event to
    // propogate if it is truely the element the user has clicked on.
    var self = this;
    this.$el.one('insights:local', function (evt) {
        self.$el[0] !== evt.target && evt.stopPropagation();
    });
    Button.prototype._execute.call(this, evt);
};

module.exports = ShareButton;
