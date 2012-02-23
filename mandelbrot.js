/*
 * Vanilla Mandelbrot Set renderer with canvas and javascript
 *
 * Written by Christian Stigen Larsen
 * http://csl.sublevel3.org
 *
 * Put in the public domain by the author
 * 2012-02-22
 *
 */

function plot(img, x, y, r, g, b, a)
{
  var off = x + y*img.width;
  off <<= 2;
  img.data[off+0] = r;
  img.data[off+1] = g;
  img.data[off+2] = b;
  img.data[off+3] = a;
}

var canvas = document.getElementById('canvasMandelbrot');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//canvas.width = 640; canvas.height = 480;
var ctx = canvas.getContext('2d');
var img = ctx.createImageData(canvas.width, 1);

window.onresize = function(event)
{
  canvas = document.getElementById('canvasMandelbrot');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  img = ctx.createImageData(0, 0, canvas.width, 1);
}

/*
 * Color table can be any length,
 * but should be cyclical
 */
var colors = new Array(256);
//
for ( var i=0; i<colors.length; ++i ) {
  var R = colors.length - i;
  var G = colors.length - i;
  var B = colors.length - i;
  colors[i] = new Array(3);
  colors[i][0] = R;
  colors[i][1] = G;
  colors[i][2] = B;
}

function draw()
{
  var steps = parseInt(document.getElementById('steps').value);
  var threshold = parseFloat(document.getElementById('threshold').value);
  threshold *= threshold; // optimization trick

  var x_start = -2.0;
  var x_stop = 1.0;
  var x_step = (x_stop - x_start) / (0.5 + (canvas.width-1));

  var y_start = -1.0;
  var y_stop = 1.0;
  var y_step = (y_stop - y_start) / (canvas.height - 1);

  var ploty = y_start;
  var y=0;

  var drawLine = function(Ci, off, x_start, x_step, pixels)
  {
    var Cr = x_start;
    var logBase = 1.0 / Math.log(Math.sqrt(threshold));
    var logHalf = Math.log(0.5);

    for ( var x=0; x<img.width; ++x, Cr += x_step ) {
      var Zr = 0;
      var Zi = 0;
      var Tr = 0;
      var Ti = 0;

      var i=0;
      for ( ; i<steps && (Tr+Ti)<=threshold; ++i ) {
        Zi = 2 * Zr * Zi + Ci;
        Zr = Tr - Ti + Cr;
        Tr = Zr * Zr;
        Ti = Zi * Zi;
      }

      // Instead of using RGB[i] directly, calculate smooth
      // coloring
      var v = 1+i-(logHalf + Math.log(Math.log(Tr+Ti)))*logBase;

      // then normalize for number of colors
      v = Math.floor((colors.length-1)*v/steps);

      img.data[off++] = 255-v/4;
      img.data[off++] = 255-v;
      img.data[off++] = 255-v/2;
      img.data[off++] = 255;
    }
  };

  var start = (new Date).getTime();
  var pixels = 0;

  (function animation() {
    if ( y++ < canvas.height ) {
      drawLine(ploty, 0, x_start, x_step);
      ploty  += y_step;
      pixels += img.width;
      ctx.putImageData(img, 0, y);
      setTimeout(animation);
    }

    var stop = (new Date).getTime();
    var elapsedMS = stop - start;
    document.getElementById('renderMS').innerHTML = elapsedMS;
    document.getElementById('renderSpeed').innerHTML = Math.floor(1000.0*pixels/elapsedMS);
  })();
}
