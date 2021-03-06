/**
 * @file 	wreath.js
 * Draws a wreath made of stars.
 *
 * Aaron Itzkovitz
 * Graphics - HW3
 * 10/3/17
 */
// number of stars to draw
var numOfStars = 12;
// radius of wreath
var radius = .5;
var gl, program;
function main(){

	var canvas = document.getElementById( 'gl-canvas' );
	if ( !canvas ) { alert( 'couldn\'t get canvas' ); }

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ){ alert( 'Could not set up webgl' ); }

	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	var points = initPoints();

	gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

// Function returns an array of the initial points making up one branch of star. 
function initPoints(){

	var vertices = [];

	vertices.push( vec2( 0, 2/4 ) );
	vertices.push( vec2( 0.1/4, 1/4 ) );
	vertices.push( vec2( 0.4/4, 1/4 ) );
	vertices.push( vec2( 0, 4/4 ) );
	vertices.push( vec2( -1/4, -0.3/4 ) );
	vertices.push( vec2( -0.5/4, -0.5/4 ) );

	return vertices;
}

// function called by drawStar to create 1 branch of star
function drawBranch(){

    gl.drawArrays( gl.LINE_LOOP, 0, 6);

}

// function renders one star by scaling the star down by .15 and
// and passing in a rotation angle to v-shader to rotate each branch
function drawStar(){

	for ( var i = 0; i < 5; i++ ){
		let r = 72.0 * i;
		let scale = .2;
		gl.uniform1f( gl.getUniformLocation(program, "brAngle"), r);
		gl.uniform1f( gl.getUniformLocation(program, "scl"), scale);
		drawBranch();
	}
}
function render(){
	// pass in the amount that should rotate to the v-shader
	// pass in the translation array according to angle and which star number we're on.
	gl.clear( gl.COLOR_BUFFER_BIT );
	for ( var i = 0; i < 12; i++ ){
		// get new angle
		let angle = i * 30;

		// pass in angle and translation matrix
		gl.uniform3fv(gl.getUniformLocation(program, "trans"), [ radius * Math.cos( angle * ( Math.PI/180 )), radius * Math.sin( angle * (Math.PI/180 )), 0.0 ] );
		gl.uniform1f(gl.getUniformLocation(program, "srAngle"), angle);

		// draw a star now that the shader variables have been set
		drawStar();
	}
}