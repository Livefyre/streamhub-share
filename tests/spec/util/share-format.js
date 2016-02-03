var assert = require('chai').assert;
var expect = require('chai').expect;
var util = require('streamhub-share/util/share-format');

describe('util/share-format', function () {
    describe('#contentToTweet', function () {
        it('only allows 140 characters', function () {
            var data = util.contentToTweet({
                author: { displayName: 'bobdole' },
                body: 'Bacon ipsum dolor amet pancetta leberkas pork loin beef. Drumstick picanha pancetta, tongue capicola pork pork loin chuck ham bresaola pork chop filet mignon alcatra sausage rump. Shoulder turducken landjaeger, drumstick shankle meatloaf pork loin pork chop salami shank ham. Kevin short loin tri-tip ham hock, hamburger andouille landjaeger boudin drumstick shoulder corned beef bacon. Alcatra brisket turkey, pastrami spare ribs frankfurter porchetta hamburger. Short ribs ham pig pork chop pork belly swine turkey andouille cow tail ground round salami alcatra brisket. Beef ribs sirloin flank boudin frankfurter jerky strip steak',
                permalink: 'http://abc.com'
            });
            expect(data.body).to.equal('"Bacon ipsum dolor amet pancetta leberkas pork loin beef. Drumstick picanha pancetta, tongue capicola pork pork ..."- bobdole');
        });

        it('cleans the text-ifies the html so html is not shared', function () {
            var data = util.contentToTweet({
                author: { displayName: 'bobdole' },
                body: '<a href="something.com" target="_blank">Bacon ipsum dolor</a> amet pancetta',
                permalink: 'http://abc.com'
            });
            expect(data.body).to.equal('"Bacon ipsum dolor amet pancetta"- bobdole');
        });

        it('cleans spaces out of the file', function () {
            var data = util.contentToTweet({
                author: { displayName: 'bobdole' },
                body: '<a href="http://www.huffingtonpost.co.uk/news/fashion-for-all/" target="_hplink"><center><img alt="banner" src="http://i.huffpost.com/gen/3953620/thumbs/o-BANNER-570.jpg" /></center></a><br /> <br /> <br /> Life as a model is a tough one. Constantly being judged on your appearance, criticised if body size dares to change slightly and publicly shamed',
                permalink: 'http://abc.com'
            });
            expect(data.body).to.equal('"Life as a model is a tough one. Constantly being judged on your appearance, criticised if body size dares to ch..."- bobdole');
        });
    });
});
