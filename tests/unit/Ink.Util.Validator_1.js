
var val = Ink.Util.Validator_1;

var nbsp = '\u00a0';
var tsu = '\u30C4'; // japanese Tsu character (ツ)
var ellipsis = '\u2026'; // ellipsis character (…)
var ccedil = '\u00E7'; // C with a cedilla (ç)

function invalid (a, msg) {
    equal(a, false, msg || 'should be invalid!');
}
function valid (a, msg) {
    equal(a, true, msg || 'should be valid!');
}

module('checkCharacterGroups');
var grps = val.checkCharacterGroups;
test('numbers', function () {
    valid   (grps('1', {numbers: true}));
    invalid (grps('a', {numbers: true}));
});
test('ascii', function () {
    valid   (grps('asd', {asciiAlpha: true}));
    invalid (grps('asd1', {asciiAlpha: true}));
    invalid (grps('asd' + ccedil, {asciiAlpha: true}));
    valid   (grps(' ', {whitespace: true}));
    valid   (grps(' ', {whitespace: true}));
});
test('latin1', function () {
    valid   (grps('asd' + ccedil, {latin1Alpha: true}));
    invalid (grps('asd' + tsu, {latin1Alpha: true}));
    invalid (grps('asd' + ellipsis, {latin1Alpha: true, latin1Punctuation: true}));
    invalid (grps('asd' + nbsp, {latin1Alpha: true, latin1Punctuation: true}));
});
test('unicode', function () {
    valid   (grps('asd', {unicodeAlpha: true}));
    valid   (grps('asd' + tsu + ccedil, {unicodeAlpha: true}));
    invalid (grps(ellipsis, {unicodeAlpha: true}));
    valid   (grps(ellipsis, {unicodePunctuation: true}));
});
test('whitespace', function () {
    valid   (grps(' ', {space: true}));
    invalid (grps('\n', {singleLineWhitespace: true}));
    valid   (grps('\n', {newline: true}));
    valid   (grps(' \t\n', {whitespace: true}));
});
test('undefined values', function () {
    invalid (grps(undefined));
});

module('checker functions');
test('unicode', function () {
    valid   (val.unicode('FábioSan' + tsu /* <- Awesome guy*/));
    valid   (val.unicode('Fábio San' + tsu, {whitespace: true}));
    invalid (val.unicode(' '));
    invalid (val.unicode(ellipsis));
});
test('latin1', function () {
    valid   (val.latin1('Fábio'));
    invalid (val.latin1('Fábio Santos'));
    valid   (val.latin1('Fábio Santos', {whitespace: true}));
    invalid (val.latin1('FábioSan' + tsu));
    valid   (val.latin1(ccedil));
});
test('ascii', function () {
    valid   (val.ascii('Fabio'));
    invalid (val.ascii(ccedil));
});
