'use strict';

var I18n = Ink.Util.I18n;

function make() {
    return new I18n(dict, 'pt_PT');
}

var dict = {'pt_PT': {
    'me': 'eu',
    'i have a {%s} for you': 'tenho um {%s} para ti',
    '1:, {%s:1}, 2: {%s:2}': '2: {%s:2}, 1: {%s:1}'
}};

var _ = make().alias();

test('basic usage', function () {
    var i18n = make();
    equal(i18n.text('me'), 'eu');
});

test('when the dictionary has translation keys in root', function () {
    var i18n = new I18n({
        'translation': 'traducao'
    }, 'pt_PT', 'translation strings in root');
    equal(i18n.text('translation'), 'traducao');
});

test('alias', function () {
    var i18n = make();
    var aliased = i18n.alias();
    equal(aliased('me'), 'eu');
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
    equal(_('i have a {%s} for you', 'present'), 'tenho um present para ti');
    equal(_('1:, {%s:1}, 2: {%s:2}', 1, 2), '2: 2, 1: 1');
});

test('ntext()', function() {
    var i18n = make();

    equal(i18n.ntext('animal', 'animals', 1),
        'animal');

    equal(i18n.ntext('animal', 'animals', 2),
        'animals');
    
    var args = ['', 'st', 'nd', 'rd', 'th'];
    equal(i18n.ntext(args, 1), 'st', '1st');
    equal(i18n.ntext(args, 2), 'nd', '2nd');
    equal(i18n.ntext(args, 3), 'rd', '3rd');
    equal(i18n.ntext(args, 4), 'th', '4th');
    equal(i18n.ntext(args, 5), 'th', '5th');
});

