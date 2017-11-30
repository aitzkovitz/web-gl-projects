// Aaron Itzkovitz
// Graphics Project 3
// 10/26/17

var modelViewMatrix=mat4(); // identity
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var modelViewStack=[];

// save locations of stars so we can re render them
var starLocations = [];
var numOfStars = 20;

// original ghost position
var ghostTranslate = translate(16*Math.random()-8,Math.random()*8,0);
var rotationAngle = 0;

// flag for whether to animate
var shooting = false;
// arrow distance from source
var distance = 0;

// hold the points and colors
var points=[];
var colors=[];

var cmtStack=[];

function main() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    GeneratePoints();

    modelViewMatrix = mat4();
    projectionMatrix = ortho(-8, 8, -8, 8, -1, 1);

    initWebGL();

 	// attach event listeners
 	attachListeners();

    render();
}

function initWebGL() {
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc= gl.getUniformLocation(program, "projectionMatrix");
}

function scale4(a, b, c) {
   	var result = mat4();
   	result[0][0] = a;
   	result[1][1] = b;
   	result[2][2] = c;
   	return result;
}

// generates points for each object in the rendering
function GeneratePoints() {
    	
    	GeneratePlanet();
    	GenerateGhost();
    	GenerateBackground();
    	
    	GenerateStars();

    	GenerateMountains();
    	GenerateRing();
    	GenerateBowArrow();

    	GenerateStarLocations();
}

function GenerateStarLocations(){
	for (var i = 0; i < numOfStars; i++){
		starLocations.push(vec2(16*Math.random()-8, 8*Math.random()));
	}
}

// generate sky and ground using varying color
function GenerateBackground(){

	// ground
	points.push(vec2( -8.0, -8.0 )); // dark green
	colors.push(vec4( 0.21, 0.26, 0.144, 1 ));
	points.push(vec2( 8.0, -8.0 ));	// dark green
	colors.push(vec4( 0.21, 0.26, 0.144, 1 ));
	points.push(vec2( 8.0, 0 )); // light green
	colors.push(vec4( 0.097, 0.835, 0.136, 1 ));
	points.push(vec2( -8.0, 0 )); // light green
	colors.push(vec4( 0.097, 0.835, 0.136, 1 ));

	// sky
	points.push(vec2( -8.0, 0 ));
	colors.push(vec4( 0.121, 0.824, 0.8, 1 )); //light blue
	points.push(vec2( 8.0, 0 ));
	colors.push(vec4( 0.121, 0.824, 0.8, 1 )); //light blue
	points.push(vec2( 8.0, 8.0 ));
	colors.push(vec4( 0.164, 0.246, .277, 1 )); // dark blue
	points.push(vec2( -8.0, 8.0 ));
	colors.push(vec4( 0.164, 0.246, .277, 1 )); // dark blue

}

// generate star using 6 points
function GenerateStars(){
	points.push( vec2(-0.5, -0.35) );
	colors.push(vec4(1, 1, 1, 1));
	points.push( vec2(0.5, -0.35 ));
	colors.push(vec4(1, 1, 1, 1));
	points.push( vec2(0, 0.75));
	colors.push(vec4(1, 1, 1, 1));
	points.push( vec2(-0.5, 0.35 ));
	colors.push(vec4(1, 1, 1, 1));
	points.push( vec2(0.5, 0.35 ));
	colors.push(vec4(1, 1, 1, 1));
	points.push( vec2(0, -0.75 ));
	colors.push(vec4(1, 1, 1, 1));
}

// randomly generate mountains with random shades
function GenerateMountains(){
	
	for (var i = 0; i < 9; i++){
		var blx = (Math.random()*12)-6;
		var bly = (i > 9/2) ? -3 : -1;		// so foreground mountain cover background mountains
		var brx = blx + (Math.random()*3.5)+0.5;
		var bry = bly;
		var tx = (brx - blx)*Math.random()+blx;
		var ty = bly + (Math.random()*4)+2;

		points.push( vec2(blx, bly) );
		colors.push( vec4( ((Math.random()*110) + 72)/256.0, ((Math.random()*110) + 72)/256.0, ((Math.random()*110) + 72)/256.0, 1) );
		points.push( vec2(brx, bry) );
		colors.push( vec4( ((Math.random()*110) + 72)/256.0, ((Math.random()*110) + 72)/256.0, ((Math.random()*110) + 72)/256.0, 1) );
		points.push( vec2(tx, ty) );
		colors.push( vec4( ((Math.random()*110) + 72)/256.0, ((Math.random()*110) + 72)/256.0, ((Math.random()*110) + 72)/256.0, 1) );
	}
}

// create planet points
function GeneratePlanet() {
	var Radius=1.0;
	var numPoints = 80;
	
	// TRIANGLE_FAN : for solid circle
	for( var i=0; i<numPoints; i++ ) {
		var Angle = i * (2.0*Math.PI/numPoints); 
		var X = Math.cos( Angle )*Radius; 
		var Y = Math.sin( Angle )*Radius; 
		colors.push(vec4(0.7, 0.7, 0, 1)); 
		points.push(vec2(X, Y));

		// use 360 instead of 2.0*PI if // you use d_cos and d_sin
	}
}

// create points for a ring
function GenerateRing(){
	var radius = 3.5;
	var inc = 100;
	var angle = 2*Math.PI/inc;
	var color1 = Math.random();
	var color2 = Math.random();
	var color3 = Math.random();
	for (var i = 0; i < inc; i++ ){
		points.push( vec2( radius * Math.cos( i * angle), .35 * radius * Math.sin( i * angle) ) );
		colors.push( vec4( color1, color2, color3, 1 ) );
	}
}

// create points for a bow and arrow
function GenerateBowArrow(){

	//bow
	var radius = .75;
	var inc = 100;
	var angle = 2*Math.PI/inc;
	for (var i = 0; i < inc/2; i++ ){
		points.push( vec2( radius * Math.cos( i * angle), .55 * radius * Math.sin( i * angle) ) );
		colors.push( vec4( 1, 0, 0, 0 ) );
	}

	// right vertical side
	points.push( vec2( radius, 0) );
	colors.push( vec4( 0, 1, 0, 0 ) );
	points.push( vec2( radius, -0.5) );
	colors.push( vec4( 0, 1, 0, 0 ) );
	points.push( vec2( radius + 0.5, -0.5) );
	colors.push( vec4( 0, 1, 0, 0 ) );

	// left vertical side
	points.push( vec2( -radius, 0) );
	colors.push( vec4( 0, 1, 0, 0 ) );
	points.push( vec2( -radius, -0.5) );
	colors.push( vec4( 0, 1, 0, 0 ) );
	points.push( vec2( -radius -0.5, -0.5) );
	colors.push( vec4( 0, 1, 0, 0 ) );

	points.push( vec2( radius, -0.5) );
	colors.push( vec4( 1, 1, 1, 0 ) );
	points.push( vec2( 0, -1) );
	colors.push( vec4( 1, 1, 1, 0 ) );
	points.push( vec2( -radius, -0.5) );
	colors.push( vec4( 1, 1, 1, 0 ) );

	// arrow
	// draw point
	points.push( vec2( -.2, 0) );
	colors.push( vec4( 1, 1, 0, 0 ) );
	points.push( vec2( 0, .5) );
	colors.push( vec4( 1, 1, 0, 0 ) );
	points.push( vec2( .2, 0) );
	colors.push( vec4( 1, 1, 0, 0 ) );


	// long part
	points.push( vec2( 0, .5) );
	colors.push( vec4( 0, 0, 1, 0 ) );
	points.push( vec2( 0, -1) );
	colors.push( vec4( 0, 0, 1, 0 ) );

	// double point at bottom
	points.push( vec2( -.2, -1.5) );
	colors.push( vec4( 1, 1, 0, 0 ) );
	points.push( vec2( 0, -1) );
	colors.push( vec4( 1, 1, 0, 0 ) );
	points.push( vec2( .2, -1.5) );
	colors.push( vec4( 1, 1, 0, 0 ) );

	points.push( vec2( -.2, -1.7) );
	colors.push( vec4( 1, 0, 0, 0 ) );
	points.push( vec2( 0, -1.2) );
	colors.push( vec4( 1, 0, 0, 0 ) );
	points.push( vec2( .2, -1.7) );
	colors.push( vec4( 1, 0, 0, 0 ) );
}

// generate points for ghost
function GenerateGhost() {
	// begin body  (87 points)
	points.push(vec2(3, 0));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(3.1, 1));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(3.5, 2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(4, 3.6));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(4, 4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(4.1, 3.3));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(4.5, 3));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(5.5, 3));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(6,3.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(6.5, 4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(6.7, 4.2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(6.8, 2.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(7, 2.4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(7.5, 2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(8, 2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(8.5, 1.7));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(9, 1.2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10, 0.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10, -2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10.4, -2.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10.5, -3.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10.7, -1.7));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(11, -1.4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(11.2, -1.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(12, -2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(12.5, -2.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(13, -3));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(13, -2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(12.8, -0.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(12, 0));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(12.5, 0.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(11, 1));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10.8, 1.4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10.2, 2.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(10, 4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(9.8, 7.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(7.5, 9.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(6, 11));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(3, 12));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(.5, 15));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(0, 17));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-1.8, 17.4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-4, 16.6));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-5, 14));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-6, 10.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-9, 10));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-10.5, 8.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-12, 7.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-12.5, 4.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-13, 3));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-13.5, -1));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-13, -2.3));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-12, 0));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-11.5, 1.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-11.5, -2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-10.5, 0));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-10, 2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-8.5, 4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-8, 4.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-8.5, 7));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-8, 5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-6.5, 4.2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-4.5, 6.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-4, 4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-5.2, 2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-5, 0));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-5.5, -2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-6, -5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-7, -8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-8, -10));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-9, -12.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-10, -14.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-10.5, -15.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-11, -17.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-5, -14));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-4, -11));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-5, -12.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-3, -12.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2, -11.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(0, -11.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(1, -12));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(3, -12));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(3.5, -7));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(3, -4));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(4, -3.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(4.5, -2.5));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(3, 0));
	colors.push(vec4(1, 1, 1, 1));
	// end body

	// begin mouth (6 points)
	points.push(vec2(-1, 6));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-0.5, 7));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-0.2, 8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-1, 8.6));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2, 7));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-1.5, 5.8));
	colors.push(vec4(1, 1, 1, 1));
	// end mouth

	// begin nose (5 points)
	points.push(vec2(-1.8, 9.2));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-1, 9.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-1.1, 10.6));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-1.6, 10.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-1.9, 10));
	colors.push(vec4(1, 1, 1, 1));

	// begin left eye, translate (2.6, 0.2, 0) to draw the right eye
	// outer eye, draw line loop (9 points)
	points.push(vec2(-2.9, 10.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.2, 11));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2, 12));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2, 12.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.2, 13));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.5, 13));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.9, 12));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-3, 11));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.9, 10.5));
	colors.push(vec4(1, 1, 1, 1));

	// eye ball, draw triangle_fan (7 points)
	points.push(vec2(-2.5, 11.4));  // middle point
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.9, 10.8));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.2, 11));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2, 12));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.9, 12));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-3, 11));
	colors.push(vec4(1, 1, 1, 1));
	points.push(vec2(-2.9, 10.5));
	colors.push(vec4(1, 1, 1, 1));
	// end left eye
}

function attachListeners(){
	window.onkeydown = function(e){
		let code = e.keycode;
		if (e.key == 's' || e.key == 'S'){
			ghostTranslate = translate(16*Math.random()-8,Math.random()*8,0); 
			render();
		}
		if (e.key == 'l' || e.key == 'L'){
			rotationAngle += 5;
			render();
		}
		if (e.key == 'r' || e.key == 'R'){
			rotationAngle -= 5;
			render();
		}
		if (e.key == 'f' || e.key == 'F'){
			shooting = true;
			render();
		}
	}
}


function DrawGhost() {
	modelViewMatrix = mat4();
	modelViewMatrix = mult(modelViewMatrix, ghostTranslate);	
    modelViewMatrix = mult(modelViewMatrix, scale4(1/15, 1/15, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.LINE_LOOP, 80, 87); // body
    gl.drawArrays( gl.LINE_LOOP, 167, 6);  // mouth
    gl.drawArrays( gl.LINE_LOOP, 173, 5);  // nose

    gl.drawArrays( gl.LINE_LOOP, 178, 9);  // left eye
    gl.drawArrays( gl.TRIANGLE_FAN, 187, 7);  // left eye ball

    modelViewMatrix = mult(modelViewMatrix, translate(2.6, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.LINE_STRIP, 178, 9);  // right eye
    gl.drawArrays( gl.TRIANGLE_FAN, 187, 7);  // right eye ball
}

function DrawFullPlanet() {
	modelViewMatrix = mat4();
	modelViewMatrix = mult(modelViewMatrix, translate(-6, 5, 0));
	modelViewMatrix = mult(modelViewMatrix, scale4(.65, .65*1.618, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        // draw planet circle
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 80);
}

function DrawBackground(){
	gl.drawArrays( gl.TRIANGLE_FAN, 194, 4);
	gl.drawArrays( gl.TRIANGLE_FAN, 198, 4);

}

function DrawStars(){
	
	for (var i = 0; i < numOfStars; i++){

		modelViewMatrix = mat4();
		modelViewMatrix = mult(modelViewMatrix, translate( starLocations[i][0], starLocations[i][1], 0));
		modelViewMatrix = mult(modelViewMatrix, scale4( .17, .17, .17) );
	    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

		gl.drawArrays( gl.TRIANGLE_STRIP, 202, 3);
		gl.drawArrays( gl.TRIANGLE_STRIP, 205, 3);
	}

}

function DrawMountains(){
	modelViewMatrix = mat4();
	//modelViewMatrix = mult(modelViewMatrix, translate(2, 1, 0));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	for (var i = 0; i < 9; i++){
		gl.drawArrays( gl.TRIANGLE_STRIP, 208+i*3, 3);		
	}
	
}

function DrawRings1(){
	var modelViewMatrix=mat4();
	modelViewMatrix = mult(modelViewMatrix, translate(-6, 5, 0));
	modelViewMatrix = mult(modelViewMatrix, scale4(.3, .3*1.618, 1));
	modelViewMatrix = mult(modelViewMatrix, rotate(40, 0, 0, 1));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.drawArrays(gl.LINE_STRIP, 235, 52);	// draw first 50

	// repeat for second ring
	modelViewMatrix = mult(modelViewMatrix, scale4(1.2,1.2,1));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.drawArrays(gl.LINE_STRIP, 235, 52);	// draw first 50

}

function DrawRings2(){
	var modelViewMatrix=mat4();
	modelViewMatrix = mult(modelViewMatrix, translate(-6, 5, 0));
	modelViewMatrix = mult(modelViewMatrix, scale4(.3, .3*1.618, 1));
	modelViewMatrix = mult(modelViewMatrix, rotate(40, 0, 0, 1));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.drawArrays(gl.LINE_STRIP, 285, 50);	// draw last 50

	// repeat for second ring
	modelViewMatrix = mult(modelViewMatrix, scale4(1.2,1.2,1));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.drawArrays(gl.LINE_STRIP, 285, 50);	// draw first 50

}

// render each part of the bow
function DrawBow(){
	
	// bow top
	gl.drawArrays(gl.LINE_STRIP, 335, 50);
	// bow right
	gl.drawArrays(gl.LINE_STRIP, 385, 2);
	gl.drawArrays(gl.LINE_STRIP, 386, 2);
	// bow left
	gl.drawArrays(gl.LINE_STRIP, 388, 2);
	gl.drawArrays(gl.LINE_STRIP, 389, 2);
	// bow bottom
	gl.drawArrays(gl.LINE_STRIP, 391, 3);
}

// render each part of the arrow
function DrawArrow(){
	gl.drawArrays(gl.LINE_STRIP, 394, 3);
	gl.drawArrays(gl.LINE_STRIP, 397, 2);
	gl.drawArrays(gl.LINE_STRIP, 399, 3);
	gl.drawArrays(gl.LINE_STRIP, 402, 3);
}

// render all objects, transform the ghost and bow/arrow
function render() {
	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

	// draw ground and sky first
	DrawBackground();

	// draw stars and mountains... next
	DrawStars();
	DrawMountains();

	// then, draw planet, add rings too
	DrawRings1();
	DrawFullPlanet();
	DrawRings2();

	// then, draw ghost
	DrawGhost();

	// add other things, like bow, arrow, spider, flower, tree ...
	if(shooting){
		modelViewMatrix = mat4();
		modelViewMatrix = mult(modelViewMatrix, translate(0, -5, 0));
		modelViewMatrix = mult(modelViewMatrix, rotate(rotationAngle, 0, 0, 1));
		modelViewMatrix = mult(modelViewMatrix, translate(0, distance, 0));
		modelViewMatrix = mult(modelViewMatrix, scale4(.75, .75, 1));
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
		DrawArrow();
		distance += .2;

	} else {
		modelViewMatrix = mat4();
		modelViewMatrix = mult(modelViewMatrix, translate(0, -5, 0));
		modelViewMatrix = mult(modelViewMatrix, rotate(rotationAngle, 0, 0, 1));
		modelViewMatrix = mult(modelViewMatrix, scale4(.75, .75, 1));
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
		DrawArrow();
	}

	modelViewMatrix = mat4();
	modelViewMatrix = mult(modelViewMatrix, translate(0, -5, 0));
	modelViewMatrix = mult(modelViewMatrix, rotate(rotationAngle, 0, 0, 1));
	modelViewMatrix = mult(modelViewMatrix, scale4(.75, .75, 1));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	DrawBow();

	modelViewMatrix = mat4();

	if (distance > 18){
		shooting = false;	
		gl.clear( gl.COLOR_BUFFER_BIT );
		gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

		// draw ground and sky first
		DrawBackground();

		// draw stars and mountains... next
		DrawStars();
		DrawMountains();

		// then, draw planet, add rings too
		DrawRings1();
		DrawFullPlanet();
		DrawRings2();

		modelViewMatrix = mat4();
		modelViewMatrix = mult(modelViewMatrix, translate(0, -5, 0));
		modelViewMatrix = mult(modelViewMatrix, rotate(rotationAngle, 0, 0, 1));
		modelViewMatrix = mult(modelViewMatrix, scale4(.75, .75, 1));
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
		DrawBow();
		DrawArrow();
	}
	if (shooting){
		setTimeout(function(){requestAnimationFrame(render)}, 10 );
	}

	


}