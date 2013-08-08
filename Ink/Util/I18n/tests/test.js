/*globals equal,test*/
Ink.requireModules( [ 'Ink.Util.I18n' ] , function ( I18n ) {
    'use strict';

    function make() {
        return new I18n(dict, 'pt_PT');
    }

    var dict = {'pt_PT': {
        'me': 'eu',
        'i have a {} for you': 'tenho um {} para ti',
        '1:, {1}, 2: {2}': '2: {2}, 1: {1}',
        'day': ['um dia', '{} dias'],
        'one day' : 'um dia' ,
        '{} days' : '{} dias'
    }};

    var _ = make().alias();

    test('basic usage', function () {
        var i18n = make();
        equal(i18n.text('me'), 'eu');
    });

    test('alias', function () {
        var i18n = make();
        var aliased = i18n.alias();
        equal(aliased('me'), 'eu');
    });

    test('lang()', function () {
        var i18n = make();
        equal(i18n.lang(), 'pt_PT');
        equal(i18n.lang('en_US'), i18n);
        equal(i18n.lang(), 'en_US');
    });

    test('append', function () {
        var i18n = make();
        i18n.append({'pt_PT': {
            'sfraggles': 'braggles'
        }});
        equal(i18n.text('sfraggles'), 'braggles');
    });

    test('_testMode', function() {
        var i18n = make();
        var _ = i18n.alias();
        i18n.testMode(true);
        equal(_('unknown'), '[unknown]');
        equal(_('me'), 'eu');

        i18n.testMode(false);
        equal(_('unknown'), 'unknown');
        equal(_('me'), 'eu');
    });

    test('replacements', function () {
        equal(_('i have a {} for you', 'presente'), 'tenho um presente para ti');
        equal(_('1:, {1}, 2: {2}', 1, 2), '2: 2, 1: 1');
    });

    test('ntext()', function() {
        var i18n = make();

        equal(i18n.ntext('animal', 'animals', 1),
            'animal');

        equal(i18n.ntext('animal', 'animals', 2),
            'animals');

        equal(i18n.ntext('day', 1), 'um dia');
        equal(i18n.ntext('day', 2), '2 dias');
        
        // Classic API
        equal(i18n.ntext('one day', '{} days', 1), 'um dia');
        equal(i18n.ntext('one day', '{} days', 2), '2 dias');

    });

    test('ordinal', function () {
        var dict = {
        	pt_PT : {
        		_ordinals: '&ordm;'
            },
            fr_FR: {
                _ordinals: {
                    'default': '<sup>e</sup>',
                    exceptions: {
                        1: '<sup>er</sup>'
                    }
                }
            },
            en_US: {
                _ordinals: {
                    'default': 'th',
                    byLastDigit: {
                        1: 'st',
                        2: 'nd',
                        3: 'rd'
                    },
                    exceptions: {
                        0: '',
                        11: 'th',
                        12: 'th',
                        13: 'th'
                    }
                }
            }
        };

        var i18n = new I18n(dict, 'fr_FR');
        equal(i18n.ordinal(1), '<sup>er</sup>');
        equal(i18n.ordinal(2), '<sup>e</sup>');
        equal(i18n.ordinal(11), '<sup>e</sup>');

        equal(i18n.lang( 'en_US' ).ordinal(1), 'st');
        equal(i18n.ordinal(2), 'nd');
        equal(i18n.ordinal(12), 'th');
        equal(i18n.ordinal(22), 'nd');
        equal(i18n.ordinal(3), 'rd');
        equal(i18n.ordinal(4), 'th');
        equal(i18n.ordinal(5), 'th');

        equal(i18n.lang( 'pt_PT' ).ordinal(1), '&ordm;'); // Returns 'º'
        equal(i18n.ordinal(4), '&ordm;'); // Returns 'º'
    });

    test('ordinal (with functions)', function () {
        var dict = {
            'en_US': {
                _ordinals: {
                    byLastDigit: function (digit, num) {return digit === 0 ? 'th' : undefined;},
                    exceptions: function (num,digit) {return num === 3 ? 'rd' : undefined;}
                }
            },
            'en_UK': {
                _ordinals: function( num , digit ) {
                	return num === 3   ? 'rd' : 
                	       digit === 0 ? 'th' :
                	                     undefined;
                }
            }
        };
        var i18n = new I18n(dict, 'en_US');
        equal(i18n.ordinal(0), 'th');
        equal(i18n.ordinal(10), 'th');
        equal(i18n.ordinal(200), 'th');
        equal(i18n.ordinal(3), 'rd');
        equal(i18n.ordinal(123), '');
        equal(i18n.ordinal(12312312), '');
        equal(i18n.lang( 'en_UK' ).ordinal(0), 'th');
        equal(i18n.ordinal(10), 'th');
        equal(i18n.ordinal(200), 'th');
        equal(i18n.ordinal(3), 'rd');
        equal(i18n.ordinal(123), '');
        equal(i18n.ordinal(12312312), '');
    });

    test('multilang', function () {
        var i18n = make();
        i18n.append({
            pt_PT: {
                yeah_text: 'pois'
            },
            en_US: {
                yeah_text: 'yeah'
            }
        });
        equal(i18n.text('yeah_text'), 'pois');
        i18n.lang( 'en_US' );
        equal(i18n.text('yeah_text'), 'yeah');
    });

    test('alias doctest', function () {
        var i18n = new I18n({
           'pt_PT': {
               'hi': 'olá',
               '{} day': '{} dia',
               '{} days': '{} dias',
               '_ordinals': {
                   'default': 'º'
               }
           }
        }, 'pt_PT');
        var _ = i18n.alias();
        equal(_('hi'), 'olá');
        equal(_('{} days', 3), '3 dias');
        equal(_.ntext('{} day', '{} days', 2), '2 dias');
        equal(_.ntext('{} day', '{} days', 1), '1 dia');
        equal(_.ordinal(3), 'º');
    });
});
