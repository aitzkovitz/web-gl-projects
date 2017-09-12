// Aaron Itzkovitz
// HW 1: twoSquares.js
function main() {
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { 
    	console.log( "WebGL isn't available" ); 
    }

    // Four Vertices
    var vertices = [
        vec2(-0.5, 0.0),
        vec2(-0.5, 0.5),
        vec2(0.0, 0.5),
        vec2(0.0, 0.0),
        vec2(0.0, 0.0),
        vec2(0.0, -0.5),
        vec2(0.5, -0.5),
        vec2(0.5, 0.0)
    ];

    //  Configure WebGL
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load buffer data into GPU
    var buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // get position of color variable 
	u_FragColor = gl.getUniformLocation( program, "u_FragColor");

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0 );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0 );
    gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );
}
