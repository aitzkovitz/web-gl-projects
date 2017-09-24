// Aaron Itzkovitz
// Project1: Fern.js
// Program to generate to versions of barnsley fern based 
// on different probability factors.

// Define min and max produced by the transformations
// so we can scale them later
var ymin = 0.0;
var ymax = 9.9983;
var xmin = -2.1820;
var xmax = 2.1820;
var setToStart = 0;

// define sets of coefficients for each probability used
var set1 = [ [ 0.0, 0.0, 0.0, 0.16, 0.0, 0.0 ], [ 0.0, 0.0, 0.0, 0.16, 0.0, 0.0 ] ];
var set2 = [ [ 0.2, -0.26, 0.23, 0.22, 0.0, 1.6 ], [ 0.2, -0.26, 0.23, 0.22, 0.0, 1.6 ] ];
var set3 = [ [-0.15, 0.28, 0.26, 0.24, 0.0, 0.44 ], [-0.15, 0.28, 0.26, 0.24, 0.0, 0.44 ] ];
var set4 = [ [ 0.75, 0.04, -0.04, 0.85, 0.0, 1.6 ], [ 0.85, 0.04, -0.04, 0.85, 0.0, 1.6 ] ];
var coefs = [];

// shades of green to use
var greens = [ 
	[ 0.5, 1.0, 0 ], 
	[ 0.2, 1.0, 0 ], 
	[ 0.2, 0.85, 0.2 ],
	[ 0, 1.0, 0 ], 
	[ 0.15, 0.56, .15 ], 
	[ 0, 0.5, 0 ],
	[ 0, 100, 0 ], 
	[ 0.45, 0.46, 0.3 ]
];

// will run on body load
function main (){

	// get the canvas
	var canvas = document.getElementById( 'web-gl-canvas' );

	// set up webgl context
	gl = WebGLUtils.setupWebGL( canvas );
	if (!gl) { alert( 'webgl is not set up' ); return; }

	// set clear color
	 gl.clearColor( 0.5, 0.0, 0.0, 1.0 );

	// create program from shaders
	var program = initShaders( gl, 'vertex-shader', 'fragment-shader' );
	if (!program) { alert( 'program is not set up' ); return; }

	gl.useProgram( program );

	// start out with (0,0)
	vertices = [ vec2( 0.0, 0.0 ) ];
	// generate fern based off 1st set
	generatePoints(1);

	// create buffer, bind, write buffer full of data
	var buffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );							// using actual vertex data rather than indices
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	var position = gl.getAttribLocation( program, 'vPosition' );		// get the location of position attribute var
	gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0, 0 );		// associate the buffer we made with location
	gl.enableVertexAttribArray( position );								// enable the assignment of buffer data to an attribute variable

	u_FragColor = gl.getUniformLocation(program, "u_FragColor");		// get the location of color attribute
	gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0 );	

	render();

	// add event listener after initial draw
	document.getElementById( 'canvasHolder' ).addEventListener( 'click', function( e ){
		// start with (0,0) and generate new points based on other set
		vertices = [ vec2( 0.0, 0.0 ) ];
		generatePoints(setToStart);
		
		// make a new buffer and add new points to it
		var buffer1 = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, buffer1 );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

		// associate buffer with location variable
		gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( position );

		render();

		// switch to the other set
		setToStart = !setToStart;
	});

	// add event lister for c key to change color
	window.onkeydown = function( event ){
		// get key from code
		var key = String.fromCharCode( event.keyCode );
		if ( key == 'C' || key == 'c' ){
			var newColor = greens[ Math.floor( Math.random() * 7 ) ];
			// set uniform variable with new color values
			gl.uniform4f(u_FragColor, newColor[0], newColor[1], newColor[2], 1.0 );
			render();
		}
	}
}

// function to generate fern points
function generatePoints( set ){
	var xy = vertices[0];
	for ( var i = 0; i < 50000; i++ ){
		generateCoefs( set );
		xy = generateXY( xy );
		vertices.push( scalePoints( xy ) );
	}
}

// generate points based on coefs and transformations
function generateXY( prevVec2 ){
	var newX, newY;
	prevX = prevVec2[0];
	prevY = prevVec2[1];
	newX = ( coefs[0] * prevX ) + ( coefs[1] * prevY ) + coefs[4];
	newY = ( coefs[2] * prevX ) + ( coefs[3] * prevY ) + coefs[5];
	return vec2( newX, newY );
}
	

// function to generate random set
function generateCoefs( set ){
	// generate set based on barnsley probability factor
	var randomNum = Math.random() * 100;
	if( set == 1 ){
		if ( randomNum < 10 ){
			coefs = set1[0];
		} else if ( randomNum > 9 && randomNum < 18 ){
			coefs = set2[0];
		} else if ( randomNum > 17 && randomNum < 26 ){
			coefs = set3[0];
		} else {
			coefs = set4[0];
		}
	} else {
		if ( randomNum <= 1 ){
			coefs = set1[1];
		} else if ( randomNum > 0 && randomNum < 8 ){
			coefs = set2[1];
		} else if ( randomNum > 7 && randomNum < 15 ){
			coefs = set3[1];
		} else {
			coefs = set4[1];
		}
	}
}

// return scaled point by multiplying unscaled value by reciprical of scale factor
function scalePoints( vecToScale ){
	var scaledX = ( 1 / (xmax - xmin) ) * vecToScale[0];
	var scaledY = ( 1 / (ymax - ymin) ) * vecToScale[1];
	return vec2( scaledX, scaledY );
}

// render shapes
function render(  ){
	gl.clear( gl.CLEAR_BUFFER_BIT );
	gl.drawArrays( gl.POINTS, 0, 50000 );

}