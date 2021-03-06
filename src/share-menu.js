var $ = require('jquery');
var AriaUtil = require('streamhub-ui/util/aria');
var inherits = require('inherits');
var loader = require('livefyre-bootstrap/loader');
var BaseShare = require('streamhub-share/base-share');
var SocialUtil = require('streamhub-share/util/share-format');
var log = require('debug')('streamhub-share/share-menu');

'use strict'

// CONSTANTS
var INSIGHTS_VERBS = {
    facebook: 'ShareFacebook',
    twitter: 'ShareTwitter'
};

/**
 * Flag menu.
 * @constructor
 * @extends {BaseShare}
 * @param {Object} opts Config options.
 */
function ShareMenu(opts) {
    BaseShare.call(this, opts);

    this.topNavEnabled = false;
}
inherits(ShareMenu, BaseShare);

ShareMenu.prototype.render = function () {
    BaseShare.prototype.render.call(this);
    loader.decorate($('.lf-loader-container')[0], 162);
};

/**
 * Fetches permalink data.
 * @private
 */
ShareMenu.prototype._fetchPermalink = function () {
    if (this._model.permalink) {
        this._renderContent();
        return;
    }

    var self = this;
    this._model.collection.getPermalink({content: this._model}, function (err, data) {
        if (err) {
            log('There was an error retrieving the permalink for this content.', err, this._content);
            return
        }
        self._handleFetchSuccess(err, data);
    });
};

/**
 * @extend
 */
ShareMenu.prototype.buildEventData = function (ev) {
    var data = BaseShare.prototype.buildEventData.call(this, ev);
    data.insightsVerb = INSIGHTS_VERBS[data.value];
    return data;
};

/**
 * Handle the option click event. This should trigger a write event that will
 * flag the comment.
 * @param {jQuery.Event} ev
 */
ShareMenu.prototype.handleOptionClick = function (ev) {
    if (AriaUtil.isNonAriaKeyEvent(ev)) {
        return;
    }

    var data = this.buildEventData(ev);

    /** From sharer.js and previously, an annotations controller */
    var baseUrl = SHARE_URLS[data.value];
    var specs = [
        'height=',
        420,
        ',width=',
        550
    ].join('');

    // Support the case where this event bubbles from someone clicking share on
    // a comment or from the selected text popover.
    var content = data.model;
    var shareObj = SocialUtil.contentToShare(content, data.value);
    shareObj.assetServer = this.opts.assetServer;
    shareObj.provider = data.value;

    var params = SocialUtil.generateParams(shareObj);
    window.open(baseUrl + params, 'intent', specs);
    $(ev.target).trigger('insights:local', {type: data.insightsVerb});
};

/**
 * From sharer.js and previously, an annotations controller
 * @enum {string}
 */
var SHARE_URLS = {
    facebook: 'https://www.facebook.com/dialog/feed',
    twitter: 'https://twitter.com/intent/tweet'
};

module.exports = ShareMenu;
