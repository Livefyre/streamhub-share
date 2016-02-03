/**
 * @fileOverview Tweet utilities that convert different data combinations to
 * 140 character tweets.
 */

var $ = require('jquery');

/** @const {string} */
var FACEBOOK_APP_ID = '595267417193679';
var LIVEFYRE_CDN = '//cdn.livefyre.com';

/** @type {Object} */
var ShareFormat = {};

/**
 * Clean html off of a string of content.
 * @param {string} str The string to clean.
 * @param {boolean} useLineBreaks Whether to use line breaks for replacements.
 * @return {string} The cleaned string.
 */
function cleanHtml(str, useLineBreaks) {
    var cleaned = str.slice(0);
    // Always want the string to be html, so do this just in case.
    if (!cleaned.match(/^<p/)) {
        cleaned = '<p>' + cleaned + '</p>';
    }
    // Converts the newlines into a separator for now so that it's not lost when
    // the text version of the html string is retrieved.
    cleaned = cleaned.replace('</p><p>', '||||');
    // Get the text version of the html string.
    cleaned = $(cleaned).text();
    // Replace the separator with either a newline or a space.
    cleaned = cleaned.replace('||||', !!useLineBreaks ? '\n' : ' ');
    return $.trim(cleaned);
}

/**
 * Adapt content to share to specific providers.
 * @param {Object|Comment} data The data to adapt. Keeping a similar object
 *    structure to the Comment model so that either can be used.
 * @param {string} provider The provider type being shared to.
 * @return {Object}
 */
ShareFormat.contentToShare = function(data, provider) {
    var fn = ShareFormat.contentToTweet;
    if (provider === 'facebook') {
        fn = ShareFormat.contentToFacebookMessage;
    }
    return fn(data);
};

/**
 * Adapt content to share to Facebook.
 * @param {Object|Comment} data The data to adapt.
 * @return {Object}
 */
ShareFormat.contentToFacebookMessage = function(data) {
    return {
        body: null,
        url: data.permalink
    };
};

/**
 * Adapt content to share to Twitter.
 * @param {Object|Comment} data The data to adapt.
 * @return {Object}
 */
ShareFormat.contentToTweet = function(data) {
    var body = cleanHtml(data.body);
    var username = data.author.displayName;
    username = username ? '- ' + username : '';
    var permalink = data.permalink;
    var urlLength = permalink.length + 1; // +1 for the space in front of it.

    // Tweets are always 140 characters.
    var remaining = 140 - urlLength - username.length;

    if (remaining < body.length + 2) {
        body = body.substring(0, remaining - 5) + '...';
    }

    var finalBody = (140 - permalink.length - body.length - 2 - username.length < 0) ? '' :  '"' + body + '"' + username;

    return {
        body: finalBody,
        url: permalink
    };
};

/**
 * Generate provider specific params.
 * @param {Object} params All necessary params.
 * @return {string} Url formatted params.
 */
ShareFormat.generateParams = function(params) {
    if (params.provider === 'facebook') {
        return generateFacebookParams(params);
    }
    return generateTwitterParams(params);
};

/**
 * Generate Facebook specific params.
 * @param {Object} params All necessary params.
 * @return {string} Url formatted params.
 */
function generateFacebookParams(params) {
    var caption = 'Livefyre on "{title}"';
    var uri = [
        window.location.protocol,
        params.assetServer || LIVEFYRE_CDN,
        '/libs/share/facebook-uri.html'
    ].join('');
    caption = encodeURIComponent(caption.replace('{title}', document.title));
    return ['?app_id=', FACEBOOK_APP_ID,
            '&caption=', caption,
            '&display=popup',
            '&link=', encodeURIComponent(params.url),
            '&redirect_uri=', encodeURIComponent(uri)].join('');
}

/**
 * Generate Twitter specific params.
 * @param {Object} params All necessary params.
 * @return {string} Url formatted params.
 */
function generateTwitterParams(params) {
    return ['?text=', encodeURIComponent(params.body),
            '&url=', encodeURIComponent(params.url)].join('');
}

module.exports = ShareFormat;
