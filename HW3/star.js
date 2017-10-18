/**
 * @file 	star.js
 * Animates one star moving across screen.
 *
 * Aaron Itzkovitz
 * Graphics - HW3
 * 10/3/17
 */
var gl, program, stepNum, translate;
var stepSize = .02;
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
    

    stepNum = 0;
    translate = [-1,-1,0];

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
	// for each branch, scale .15 and rotate 72 degrees
	for ( var i = 0; i < 5; i++ ){
		let r = 72.0 * i;
		let scale = 0.15;
		gl.uniform1f( gl.getUniformLocation(program, "brAngle"), r );
		gl.uniform1f( gl.getUniformLocation(program, "scl"), scale );
		drawBranch();
	}
}

// main function to render animation
function render(){
	// clear canvas before each frame
	gl.clear( gl.COLOR_BUFFER_BIT );

	// keep track of step so we know when to stop
	stepNum++;

	// if we haven't reached top right, keep going
	if ( stepNum < 100 ){ 
		// get previous value of translate
	    var x = translate[0];
	    var y = translate[1];

	    // increment previous value of increment because we need to translate farther
	    x += stepSize;
	    y += stepSize;

	    // save current translate matrix in global so we can use it next iteration
	    translate[0] = x;
	    translate[1] = y;

	// if we're over 100 steps but less than 200, move down	    
	} else if ( stepNum < 200 ){

		// get previous value of translate
		var x = translate[0];
	    var y = translate[1];

	    // decrement value of y translation, dont change x value
	    y -= stepSize;

	    // save current translate matrix in global so we can use it next iteration
	    translate[0] = x;
	    translate[1] = y;
	} else { return; } // return when finished 

	// pass in that translation matrix set in the above conditional
    gl.uniform3fv( gl.getUniformLocation( program, "trans"), [ x, y, 0 ]);
    // draw the star now that shader variables are set
    drawStar();
    
    // slow the animation down so we can see it
    setTimeout(function(){requestAnimationFrame(render);}, 30);
}