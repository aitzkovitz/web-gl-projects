// Aaron Itzkovitz
// HW 2
// CSCI 4250
// 9/19/2017
// This program recursively draws a 2D Sierpinski Gasket and shifts each vertex depending on how
// far it is from the center.

var canvas, gl;
var points = [];
var NumTimesToSubdivide = 5;
var angle = Math.PI / 2;

// main function called on body load
function main()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { console.log( "WebGL isn't available" ); return; }
        
    //  Initialize with three smaller points so whole thing fits on canvas when rotated
    var vertices = [
        vec2( -0.7, -0.7 ),
        vec2(  0, 0.7 ),
        vec2(  0.7, -0.7 ) 
   	];

   	// recursively divide with NumTimesToSubdivide layers
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
    

    // for each vertex added, get the xy coords and created a new vec2 containing shifted
    // coordinates based on formula
    for( var i = 0; i < points.length; i++ ){
		var x = points[i][0];
		var y = points[i][1];
		var d = Math.sqrt( x * x + y * y );

		points[i] = vec2( x * Math.cos( d * angle ) - .2 - y * Math.sin( d * angle ), 
						  x * Math.sin( d * angle ) + .2 + y * Math.cos( d * angle ));

	}

    //  Configure WebGL
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // load shaders into the program
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

// push the current triangles vertices on to the points array
function triangle( a, b, c ) {
    points.push( a, b, c );
}

// recursively divide the triangles
function divideTriangle( a, b, c, count) {

    // check for end of recursion
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );

        // add an extra division whose vertices are each midpoint 
        // of the outer triangle
        divideTriangle( ab, bc, ac, count );
    }
}

// render that shape
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}