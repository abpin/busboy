exports.parseParams = function(str) {
  var res = [], inval = false, inquote = false, escaping = false, p = 0,
      tmp = '';

  for (var i = 0; i < str.length; ++i) {
    if (str[i] === '\\' && inquote) {
      if (escaping)
        escaping = false;
      else {
        escaping = true;
        continue;
      }
    } else if (str[i] === '"') {
      if (!escaping) {
        if (inquote) {
          inquote = false;
          inval = false;
        } else
          inquote = true;
        continue;
      } else
        escaping = false;
    } else {
      escaping = false;
      if (!inval && str[i] === '=') {
        inval = true;
        res[p] = [tmp, undefined];
        tmp = '';
        continue;
      } else if (!inquote && str[i] === ';') {
        inval = false;
        if (res[p] === undefined)
          res[p] = tmp;
        else
          res[p][1] = tmp;
        tmp = '';
        ++p;
        continue;
      } else if (!inquote && (str[i] === ' ' || str[i] === '\t'))
        continue;
    }
    tmp += str[i];
  }
  if (tmp.length) {
    if (res[p] === undefined)
      res[p] = tmp;
    else
      res[p][1] = tmp;
  }

  return res;
};

exports.Decoder = Decoder;
var HEX = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
], RE_PLUS = /\+/g;
function Decoder() {
  this.buffer = undefined;
}
Decoder.prototype.write = function(str) {
  var res = '';
  var i = 0, p = 0, len = str.length;
  for (; i < len; ++i) {
    if (this.buffer !== undefined) {
      if (!HEX[str.charCodeAt(i)]) {
        res += '%' + this.buffer;
        this.buffer = undefined;
        --i; // retry character
      } else {
        this.buffer += str[i];
        ++p;
        if (this.buffer.length === 2) {
          res += String.fromCharCode(parseInt(this.buffer, 16));
          this.buffer = undefined;
        }
      }
    } else if (str[i] === '%') {
      if (i > p) {
        res += str.substring(p, i);
        p = i;
      }
      this.buffer = '';
      ++p;
    }
  }
  if (p < len && this.buffer === undefined)
    res += str.substring(p);
  return res.replace(RE_PLUS, ' ');
};
Decoder.prototype.reset = function() {
  this.buffer = undefined;
};
