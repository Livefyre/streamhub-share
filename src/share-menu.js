var $ = require('jquery');
var inherits = require('inherits');
var isMobile = require('view/util').isMobile;
var loader = require('livefyre-bootstrap/loader');
var BaseShare = require('streamhub-share/base-share');
var SocialUtil = require('streamhub-share/util/share-format');
var log = require('debug')('streamhub-share/share-menu');

'use strict'

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
 * Handle the option click event. This should trigger a write event that will
 * flag the comment.
 * @param {jQuery.Event} ev
 */
ShareMenu.prototype.handleOptionClick = function (ev) {
    var data = this.buildEventData(ev);
    var content = data.model;
    var provider = data.value;

    var shareObj = SocialUtil.contentToShare(content, provider);
    shareObj.assetServer = this.opts.assetServer;
    shareObj.provider = provider;

    // Handle mobile Facebook sharing a little differently. Use a different
    // feed URL and change the display type.
    if (isMobile() && provider === 'facebook') {
        provider = 'facebook_mobile';
        shareObj.displayType = 'touch';
    }

    var params = SocialUtil.generateParams(shareObj);
    window.open(SHARE_URLS[provider] + params, 'intent', 'height=420,width=550');
};

/** 
 * From sharer.js and previously, an annotations controller
 * @enum {string}
 */
var SHARE_URLS = {
    facebook: 'https://www.facebook.com/dialog/feed',
    facebook_mobile: 'https://m.facebook.com/dialog/feed',
    twitter: 'https://twitter.com/intent/tweet'
};


module.exports = ShareMenu;
