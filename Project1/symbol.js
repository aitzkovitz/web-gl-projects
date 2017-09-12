// Aaron Itzkovitz
// HW 1: Symbol.js
// main will run on body load
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


	// make two buffer arrays
	var vertices = [];
	getCircleVertices( 150, 1, vertices );
	getStarVertices( vertices );


	// create buffer, bind, write buffer full of data for circle and star
	var buffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );		// using actual vertex data rather than indices
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	// get the location of position attribute var
	var position = gl.getAttribLocation( program, 'vPosition' );
	// associate the buffer we made with location
	gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0, 0 );
	// enable the assignment of buffer data to an attribute variable
	gl.enableVertexAttribArray( position );

	render();
}
// function to fill vertices array buffer
function getCircleVertices( resolution, radius, vertices, offset = 0 ){
	var increment = ( Math.PI * 2 )/resolution;
	for ( var i = 0; i < resolution + 1; i++ ){
		vertices.push( vec2( radius * Math.cos( (increment * i) + offset), radius * Math.sin( (increment * i) + offset ) ) );
	}
}
//
function getStarVertices( vertices ){
	var innerVertices = [];
	var outerVertices = [];
	// vertices on inner circle
	getCircleVertices( 6, .5, innerVertices );
	
	getCircleVertices( 6, 1, outerVertices, Math.PI/6 );
	
	for (var i = 0; i < 7; i++ ){
		vertices.push( innerVertices[i] );
		vertices.push( outerVertices[i] );
	}
	console.log(vertices);
}

// render shapes
function render(  ){
	gl.clear( gl.CLEAR_BUFFER_BIT );
	gl.drawArrays( gl.LINE_LOOP, 0, 150 );
	
	gl.drawArrays( gl.LINE_LOOP, 151, 13 );

}