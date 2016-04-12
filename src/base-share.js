/**
 * @fileOverview Flag menu view. This provides all of the flagging options to
 * the user so that they can flag a piece of content.
 */

var $ = require('jquery');
var BaseMenu = require('streamhub-ui/menu');
var inherits = require('inherits');
var loader = require('livefyre-bootstrap/loader');
var loaderTemplate = require('hgn!streamhub-ui/templates/loader');
var mobileShareTemplate = require('hgn!streamhub-share/templates/mobile');
var shareTemplate = require('hgn!streamhub-share/templates/share');
var util = require('view/util');

/**
 * Flag menu.
 * @constructor
 * @extends {BaseMenu}
 * @param {Object} opts Config options.
 */
function ShareMenu(opts) {
    BaseMenu.call(this, opts);

    /**
     * Whether the client is mobile or not.
     * @type {boolean}
     */
    this.isMobile = util.isMobile();

    /** @override */
    this.postEvent = 'write.post_share';

    if (this.isMobile) {
        this.elClass += ' ' + ShareMenu.CLASSES.MOBILE;
    }
}
inherits(ShareMenu, BaseMenu);

/** @enum {string} */
ShareMenu.CLASSES = {
    CANCEL: 'lf-share-cancel',
    FOOTER: 'lf-menu-foot',
    LINK: 'lf-link',
    MOBILE: 'lf-share-mobile',
    PERMALINK: 'lf-share-permalink',
    SHARE: 'lf-share'
};

/** @override */
ShareMenu.prototype.elClass = [
    BaseMenu.CLASSES.MENU,
    ShareMenu.CLASSES.SHARE
].join(' ');

/** @override */
ShareMenu.prototype.events = (function() {
    var CLASSES = ShareMenu.CLASSES;
    var events = {};
    var eventType = this.isMobile ? 'tap' : 'click';
    events[eventType + ' .' + CLASSES.PERMALINK] = '_handleTextareaClick';
    events[eventType + ' .' + CLASSES.CANCEL] = 'hide';
    return events;
})();
$.extend(ShareMenu.prototype.events, BaseMenu.prototype.events);

/**
 * Fetches permalink data.
 * @private
 */
ShareMenu.prototype._fetchPermalink = function () {
    if (this._model.permalink) {
        this._renderContent();
        return;
    }

    this.$el.trigger('comment.get_permalink', {
        callback: $.proxy(this._handleFetchSuccess, this),
        messageId: this._model.id
    });
};

/**
 * Successfully fetched the permalink. Show the menu.
 * @param {?string} err
 * @param {?string} permalink
 * @private
 */
ShareMenu.prototype._handleFetchSuccess = function (err, permalink) {
    this._model.permalink = permalink;
    this._renderContent();
};

/**
 * Handle the textarea click. Select the contents of the textarea.
 * @private
 */
ShareMenu.prototype._handleTextareaClick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.$textarea.select();
    this.$textarea[0].setSelectionRange(0, 9999);
    this.$textarea.trigger('insights:local', {
        type: 'ShareURL',
        content: {
            type: 'Link'
        }
    });
};

/**
 * Render in full.
 */
ShareMenu.prototype._renderContent = function () {
    var frag = this._buildMenuLinks();
    var template = this.isMobile ? mobileShareTemplate : shareTemplate;
    var $shareBody = $(template({permalink: this._model.permalink}));
    this.$textarea = $shareBody.children().first();
    frag.appendChild($shareBody[0]);
    this.$('.' + BaseMenu.CLASSES.BODY).html('').append(frag);

    this.delegateEvents();
};

/** @override */
ShareMenu.prototype.getLinkConfig = function () {
    return [
        {
            cls: 'fycon-source-twitter',
            key: 'twitter',
            str: 'Twitter'
        }, {
            cls: 'fycon-source-facebook',
            key: 'facebook',
            str: 'Facebook'
        }
    ];
};

/** @override */
ShareMenu.prototype.getTemplateContext = function () {
    var data = BaseMenu.prototype.getTemplateContext.call(this);
    data.strings.title = 'Share';
    return data;
};

ShareMenu.prototype.hide = function (ev) {
    this.detach();
    this.destroy();
};

/**
 * Initialize the share menu. This fetches the permalink.
 */
ShareMenu.prototype.initialize = function () {
    this._fetchPermalink();
};

/** @override */
ShareMenu.prototype.loadMenuLinks = function () {};

/**
 * Initial render (w/ content obscured by loader)
 * @override
 */
ShareMenu.prototype.render = function () {
    BaseMenu.prototype.render.call(this);

    var $container = $(loaderTemplate());
    this.$('.' + BaseMenu.CLASSES.BODY).append($container);
    loader.decorate($container, 60);
};

module.exports = ShareMenu;
