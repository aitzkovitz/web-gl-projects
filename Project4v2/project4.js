// Damon Hughes & Aaron Itzkovitz
// CSCI 4250 Graphics
// Project 4 Part 2


var canvas;
var gl;

var zoomFactor = .8;
var translateFactorX = 0.2;
var translateFactorY = 0.2;

var numTimesToSubdivide = 5;
 
var pointsArray = [];
var normalsArray = [];

var zval = 2;
var radius = 10;
var zoom = 150;
var lr = 120;
var ud = 30;

var textures = [];
var texCoordsArray = [];
var animate=false;
var max=.25-.05;
var step=max /5;
var min=(.05);
var y = min;
var dir='up';

var vertices3 = [];
var eye = [.1, .8, .9 ];

//////////////// keep count of points in pointsArray /////////////////////
var cubeCount = 72;
var sphereCount = 0; // starts at 0
var cylinderPtsCount = 0;
//var circlePtsCount = 0;

// starting vertices for a quad
// order is square points, then cylinder points, then circle points
// above vars keep track of where these are
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var audio = new Audio('sounds.wav');
var sound =false;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];
var vertices2 = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  -0.25, 1.0 ),
    vec4( 0.5,  0.5,  -0.25, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var basketPoints = [
	[.027, .328, 0.0],
	[.032, .380, 0.0],
	[.043, .410, 0.0],
	[.058, .425, 0.0],
	[.066, .433, 0.0],
	[.069, .447, 0.0],
	[.093, .465, 0.0],
	[.107, .488, 0.0],
	[.106, .512, 0.0],
	[.115, .526, 0.0],
	[0, .525, 0.0]
];

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(.2, 1, 1, 0 );

// light properties
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4(.8, 0.8, 0.8, 1.0 );
var lightSpecular = vec4( .8, .8, .8, 1.0 );

// material properties
var materialAmbient = vec4( .2, .2, .2, 1.0 );
var materialDiffuse = vec4( 0.0, 0.5, 1, 1.0);
var materialSpecular = vec4( 1, 1, 1, 1.0 );

var materialShininess = 50.0;

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var mvMatrixStack=[];

window.onload = function init() 
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

   
    // generate the points/normals
    colorCube();
    colorBarrier();
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    
    // add cylinder points to vertices array
    addCylinderPoints(.01,.4);
    // add quads to pointsArray using those verticies
    colorCylinder();    

    SurfaceRevPoints();
    
    // pass data onto GPU
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
  
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );


    createNewTexture('wood.png');
    createNewTexture('newBackboard.jpg');
    createNewTexture('crowd2.jpg');
    createNewTexture('Rubber.png');

    window.onkeydown = function(event)
    {
        switch(event.keyCode)
        {
            case 37:
                lr += 2;
                break;
            case 38:
                if (ud < 81)
                    ud += 2;
                break;
            case 39:
                lr -= 2;
                break;
            case 40:
                if (ud > 9)
                    ud -= 2;
                break;
			case 65:
				if(sound)
					audio.pause();
				else{
					audio.play();}
				sound=!sound;
				animate=!animate;
				break;
			case 66:
				lr = 180;
				ud = 5;
				if(sound)
					audio.pause();
				else{
					audio.play();}
				sound=!sound;
				animate=!animate;
				break;
		}
    };

    render();
}

 function lighting(){
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
}
 

// basic functions for drawing prims
function DrawSolidSphere(radius)
{
	lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(1, .65, 0, 1);
    materialDiffuse = vec4(1, .05, 0, 1);
    materialSpecular = vec4(1, .05, 0, 1);
    materialShininess = 200;
    lighting();
	mvMatrixStack.push(modelViewMatrix);
	s = scale4(radius, radius, radius);   // scale to the given radius
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	
 	// draw unit radius sphere
    for( var i = 0; i < sphereCount; i+=3){
        gl.drawArrays( gl.TRIANGLES, cubeCount + i, 3 );
	}
	modelViewMatrix = mvMatrixStack.pop();
}

function DrawSolidCube(length)
{
	mvMatrixStack.push(modelViewMatrix);
	s = scale4(length, length, length );   // scale to the given width/height/depth 
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, 36);

	modelViewMatrix = mvMatrixStack.pop();
}

// draw a wall or side using a cube prim
function DrawSide(thickness)
{
	var s, t, r;

	mvMatrixStack.push(modelViewMatrix);
	t = translate(0, 0, 0);
	s = scale4(1.0, thickness, 1.0);
    modelViewMatrix = mult(mult(modelViewMatrix, t), s);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	DrawSolidCube(1);
	modelViewMatrix = mvMatrixStack.pop();
}

function drawGround()
{
	
    lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(.9, .72, .4, 1);
    materialDiffuse = vec4(.9, .72, .4, 1);
    materialSpecular = vec4(.9, .72, .4, 1);
    materialShininess = 6;
    lighting();

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    mvMatrixStack.push(modelViewMatrix);
    r = rotate(0.0, 1.0, 0.0, 0.0);
	s = scale4(2,1,1);
	t = translate(0,0,0);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
    modelViewMatrix = mult(mult(modelViewMatrix, t), s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    DrawSide(.01);
    modelViewMatrix = mvMatrixStack.pop();
    //gl.drawArrays(gl.TRIANGLES, 0, 36);
    
}
// draw the base of hoop using cube prim
function drawBase(){

	mvMatrixStack.push(modelViewMatrix);
	//r = rotate(0, 1, 0, 0.0);
	s = scale4(.35,.35,.35);
	t = translate(-.75,0,0);
    modelViewMatrix = mult(mult(modelViewMatrix, t), s);
	DrawSide(0.1); 
	modelViewMatrix = mvMatrixStack.pop();

}

// draw the pole
function drawPole(){

	mvMatrixStack.push(modelViewMatrix);
	r = rotate(-90, 1.0, 0.0, 0.0);
	s = scale4(2,2,2);
	t = translate( -.75, 0, 0);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, sphereCount + cubeCount, 594);
	modelViewMatrix = mvMatrixStack.pop();	

}

function drawRim(){
	mvMatrixStack.push(modelViewMatrix);
	s = scale4(.6,.6,.6);
	t = translate(-.85,.45,0);
	r = rotate(.1, 0, 1, 0);
	modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, sphereCount + cubeCount + cylinderPtsCount-100, 6*11*24 );
	modelViewMatrix = mvMatrixStack.pop();
}

// draw the backboard using cube prim
function drawBackBoard(){
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);
	mvMatrixStack.push(modelViewMatrix);
	r = rotate(90.0, 0.0, 0.0, 1.0);
	s = scale4(.3,.3,.3);
	t = translate(-.775,.8,0);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
	DrawSide(0.03); 
	modelViewMatrix = mvMatrixStack.pop();
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

}

// draw basketballs
function drawBalls(){
	lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.7, 0.0, 0.0, 1);
    lightSpecular = vec4(0.4, 0.4, 0.4, 1);
    materialAmbient = vec4(1, 1, 0, 1);
    materialDiffuse = vec4(0, 0, 1, 1);
    materialSpecular = vec4(1, 1, 1, 1);
    materialShininess = 200;
    lighting(); 

	gl.uniform1i(gl.getUniformLocation(program, "texture"), 3);
	mvMatrixStack.push(modelViewMatrix);
	t = translate(0,.125,0);
    modelViewMatrix = mult(modelViewMatrix, t);
	DrawSolidSphere(.1);
	modelViewMatrix = mvMatrixStack.pop();
	
	mvMatrixStack.push(modelViewMatrix);
	t = translate(.15,.125,.15);
    modelViewMatrix = mult(modelViewMatrix, t);
	DrawSolidSphere(.1);
	modelViewMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(modelViewMatrix);
	t = translate(.15,.125,-.15);
    modelViewMatrix = mult(modelViewMatrix, t);
	DrawSolidSphere(.1);
	modelViewMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(modelViewMatrix);
	t = translate(-.15,.125,.15);
    modelViewMatrix = mult(modelViewMatrix, t);
	DrawSolidSphere(.1);
	modelViewMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(modelViewMatrix);
	t = translate(-.15,.125,-.15);
    modelViewMatrix = mult(modelViewMatrix, t);
	DrawSolidSphere(.1);
	modelViewMatrix = mvMatrixStack.pop();
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

}

// draw crate holding basketballs
function drawCrate(){
	// wall # 1
	lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(1, 0, 0, 1);
    materialDiffuse = vec4(1, 0, 0, 1);
    materialSpecular = vec4(1, 0, 0, 1);
    materialShininess = 200;
    lighting(); 
	
	mvMatrixStack.push(modelViewMatrix);
	r = rotate(0.0, 0.0, 0.0, 1.0);
	s = scale4(1,1,1);
	t = translate(0,0,0);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
	DrawSide(0.02); 
	modelViewMatrix = mvMatrixStack.pop();
	
	mvMatrixStack.push(modelViewMatrix);
	r = rotate(90, 0.0, 0.0, 1.0);
	s = scale4(.5,1,1);
	t = translate(.5,.25,0);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
	DrawSide(0.02); 
	modelViewMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(modelViewMatrix);
	r = rotate(90, 0.0, 0.0, 1.0);
	s = scale4(.5,1,1);
	t = translate(-.5,.25,0);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
	DrawSide(0.02); 
	modelViewMatrix = mvMatrixStack.pop();

		mvMatrixStack.push(modelViewMatrix);
	r = rotate(90, 0.0, 1.0, 0.0);
	r = mult(r, rotate(90, 0.0, 0.0, 1.0));
	s = scale4(.5,1,1);
	t = translate(0,.25,.5);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
	DrawSide(0.02); 
	modelViewMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(modelViewMatrix);
	r = rotate(90, 0.0, 1.0, 0.0);
	r = mult(r, rotate(90, 0.0, 0.0, 1.0));
	s = scale4(.5,1,1);
	t = translate(0,.25,-.5);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
	DrawSide(0.02); 
	modelViewMatrix = mvMatrixStack.pop();

	// draw balls in crate


}

// draw the whole hoop
function drawHoop(){
 lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(.3, .1, .3, 1);
    materialDiffuse = vec4(.3, .1, .3, 1);
    materialSpecular = vec4(.3, .1, .3, 1);
    materialShininess = 200;
    lighting();
	// base will be a prism
	drawBase();

	// pole will be a cylindrical mesh
	drawPole();
	lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(1, 1, 1, 1);
    materialDiffuse = vec4(1, 1, 1, 1);
    materialSpecular = vec4(0, 1, 0, 1);
    materialShininess = 200;
    lighting();

	// backboard will also be a prism
	drawBackBoard();

	drawPole();
	lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(1, 1, 1, 1);
    materialDiffuse = vec4(1, 1, 1, 1);
    materialSpecular = vec4(1, 1, 1, 1);
    materialShininess = 200;
    lighting();
	// function to draw hoop (torus with surface of revolution)
	drawRim();

}

function drawBarriers(){
	lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.4, 0.4, 0.4, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(0, 0, 0, 1);
    materialDiffuse = vec4(1, 1, 1, 1);
    materialSpecular = vec4(1, 1, 1, 1);
    materialShininess = 200;
    lighting();

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 2);
	mvMatrixStack.push(modelViewMatrix);
	r = rotate(0, 1.0, 0.0, 0.0);
	s = scale4(3,.5,.35);
	t = translate( 0, .25, -.75);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 36, 36);
	modelViewMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(modelViewMatrix);
	r = rotate(180, 0.0, 1.0, 0.0);
	s = scale4(3,.5,.35);
	t = translate( 0, .25, .75);
    modelViewMatrix = mult(mult(mult(modelViewMatrix, t), r), s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays( gl.TRIANGLES, 36, 36);
	modelViewMatrix = mvMatrixStack.pop();
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function render()
{
	var s, t;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

	var projectionMatrix = ortho(-1, 1, -1, 1, -10, 20);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

   	// set up view and projection
   	var eye = vec3(
        radius * Math.cos(ud/180 * Math.PI) * Math.cos(lr/180 * Math.PI),
        radius * Math.sin(ud/180 * Math.PI),
        radius * Math.cos(ud/180 * Math.PI) * Math.sin(lr/180 * Math.PI)
    );
    //[-1,4,10]
    modelViewMatrix = lookAt(eye, [0, 0, 0], [0, 1, 0]);
 	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

	////// draw three main objects
	// set texture 0
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
	drawGround();	

	// draw barrier
	drawBarriers();
	// draw animate ball
	mvMatrixStack.push(modelViewMatrix);
	animation();
	modelViewMatrix=mvMatrixStack.pop();
	// draw crate
	mvMatrixStack.push(modelViewMatrix);
	s = scale4(.25,.25,.25);
	t = translate(-1,0,-.375);
    modelViewMatrix = mult(mult(modelViewMatrix, t), s);
	drawCrate();
	modelViewMatrix = mvMatrixStack.pop();

	mvMatrixStack.push(modelViewMatrix);
	s = scale4(.25,.25,.25);
	t = translate(-1,0,-.375);
    modelViewMatrix = mult(mult(modelViewMatrix, t), s);
	drawBalls();
	modelViewMatrix = mvMatrixStack.pop();
	
	// draw hoop
	mvMatrixStack.push(modelViewMatrix);
	t = translate(2.55,0,0);
    modelViewMatrix = mult(modelViewMatrix, t);
	drawHoop();
	modelViewMatrix = mvMatrixStack.pop();
	mvMatrixStack.push(modelViewMatrix);
	drawCamera();
	modelViewMatrix = mvMatrixStack.pop();
	requestAnimationFrame(render);
}
function drawCamera(){ 
  lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(0, 0, 0, 1);
    materialDiffuse = vec4(0, 0, 0, 1);
    materialSpecular = vec4(0, 0, 0, 1);
    materialShininess = 6;
    lighting();
	modelViewMatrix=mult(modelViewMatrix,translate(-2,0,0));
	mvMatrixStack.push(modelViewMatrix);
	t = translate(0,0.25,0)
	modelViewMatrix=mult(modelViewMatrix,t);
 	DrawSolidCube(.1);
 
	modelViewMatrix=mvMatrixStack.pop();
	mvMatrixStack.push(modelViewMatrix);
	lightAmbient = vec4(0.4, 0.4, 0.4, 1);
    lightDiffuse = vec4(0.2, 0.2, 0.2, 1);
    lightSpecular = vec4(0.2, 0.2, 0.2, 1);
    materialAmbient = vec4(1, 1, 0, 1);
    materialDiffuse = vec4(1, 1, 0, 1);
    materialSpecular = vec4(1, 1, 0, 1);
    materialShininess = 6;
    lighting();
 
 	t = translate(.05,0.25,0)
	modelViewMatrix=mult(modelViewMatrix,t);
 	DrawSolidCube(.025);
  	modelViewMatrix=mvMatrixStack.pop();
 	mvMatrixStack.push(modelViewMatrix);
 	t = translate(0,.005,0);
  	s = scale4(1,50,1);
  	modelViewMatrix=mult(mult(modelViewMatrix,t),s);
	DrawSolidCube(.01);
	modelViewMatrix=mvMatrixStack.pop();
}

//////////// util functions /////////////
function triangle(a, b, c) 
{
     normalsArray.push(vec3(a[0], a[1], a[2]));
     normalsArray.push(vec3(b[0], b[1], b[2]));
     normalsArray.push(vec3(c[0], c[1], c[2]));
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     texCoordsArray.push(texCoord[0]);
     texCoordsArray.push(texCoord[1]);
     texCoordsArray.push(texCoord[2]);

     sphereCount += 3;
}

function divideTriangle(a, b, c, count) 
{
    if ( count > 0 ) 
    {
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) 
{
	divideTriangle(a, b, c, n);
	divideTriangle(d, c, b, n);
	divideTriangle(a, d, b, n);
	divideTriangle(a, c, d, n);
}

// pass in indices of vertex array
function quad(a, b, c, d) 
{
 	var t1 = subtract(vertices[b], vertices[a]);
 	var t2 = subtract(vertices[c], vertices[b]);
 	var normal = cross(t1, t2);
 	var normal = vec3(normal);
 	normal = normalize(normal);

 	pointsArray.push(vertices[a]);
 	normalsArray.push(normal);
 	texCoordsArray.push(texCoord[0]);

 	pointsArray.push(vertices[b]);
 	normalsArray.push(normal);
 	texCoordsArray.push(texCoord[1]);

 	pointsArray.push(vertices[c]);
 	normalsArray.push(normal);
	texCoordsArray.push(texCoord[2]);

 	pointsArray.push(vertices[a]);
 	normalsArray.push(normal);
 	texCoordsArray.push(texCoord[0]);

 	pointsArray.push(vertices[c]);
 	normalsArray.push(normal);
 	texCoordsArray.push(texCoord[2]);

 	pointsArray.push(vertices[d]);
 	normalsArray.push(normal);
 	texCoordsArray.push(texCoord[3]);
}

function quad2(a, b, c, d, flag) 
{
 	var t1 = subtract(vertices2[b], vertices2[a]);
 	var t2 = subtract(vertices2[c], vertices2[b]);
 	var normal = cross(t1, t2);
 	var normal = vec3(normal);
 	normal = normalize(normal);
 	if (flag){
 	 	pointsArray.push(vertices2[a]);
	 	normalsArray.push(normal);
	 	texCoordsArray.push(texCoord[0]);
	 	pointsArray.push(vertices2[b]);
	 	normalsArray.push(normal);
	 	texCoordsArray.push(texCoord[1]);
	 	pointsArray.push(vertices2[c]);
	 	normalsArray.push(normal);
	 	texCoordsArray.push(texCoord[2]);
	 	pointsArray.push(vertices2[a]);
	 	normalsArray.push(normal);
	 	texCoordsArray.push(texCoord[0]);
	 	pointsArray.push(vertices2[c]);
	 	normalsArray.push(normal);
	 	texCoordsArray.push(texCoord[2]);
	 	pointsArray.push(vertices2[d]);
	 	normalsArray.push(normal);
	 	texCoordsArray.push(texCoord[3]);
 	} else {
 		pointsArray.push(vertices2[a]);
	 	normalsArray.push(normal);
	 	pointsArray.push(vertices2[b]);
	 	normalsArray.push(normal);
	 	pointsArray.push(vertices2[c]);
	 	normalsArray.push(normal);
	 	pointsArray.push(vertices2[a]);
	 	normalsArray.push(normal);
	 	pointsArray.push(vertices2[c]);
	 	normalsArray.push(normal);
	 	pointsArray.push(vertices2[d]);
	 	normalsArray.push(normal);

 	}

}

function quad3(a, b, c, d) {

    var indices=[a, b, c, d];
    var normal = Newell(indices);

     // triangle a-b-c
    pointsArray.push(vertices3[a]); 
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices3[b]); 
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(vertices3[c]); 
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);

     // triangle a-c-d
    pointsArray.push(vertices3[a]);
    normalsArray.push(normal); 
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices3[c]); 
    normalsArray.push(normal); 
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices3[d]); 
    normalsArray.push(normal);    
    texCoordsArray.push(texCoord[3]);
}

function colorCube()
{
	quad( 1, 0, 3, 2 );
	quad( 2, 3, 7, 6 );
	quad( 3, 0, 4, 7 );
	quad( 6, 5, 1, 2 );
	quad( 4, 5, 6, 7 );
	quad( 5, 4, 0, 1 );
}

function colorBarrier()
{
	quad2( 1, 0, 3, 2, 1 );
	quad2( 2, 3, 7, 6, 1 );
	quad2( 3, 0, 4, 7, 1 );
	quad2( 6, 5, 1, 2, 1 );
	quad2( 4, 5, 6, 7, 1 );
	quad2( 5, 4, 0, 1, 1 );
}
function animation(){
	t = translate(-1,.05,0);
	modelViewMatrix = mult(modelViewMatrix,t);
	if ( animate ){
		if( y < min ){ dir = 'up';
			max = Math.random()/2;
		}
		if ( y > max ) dir = 'down';
		if ( ( y <= max) && ( dir == 'up' ) ) y += step;
		if ( ( y >= min) && ( dir == 'down' ) ) y -= step;
		modelViewMatrix = mult( modelViewMatrix, translate( 0, y, 0 ) );
	}
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 3);
	DrawSolidSphere(.05);
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// add cylinder points to vertices array
function addCylinderPoints(radius, height){
	
	var resolution = 100;
	var angle = 2*Math.PI/resolution;
	for (var i = 0; i < resolution; i += 2 ){
		vertices.push(vec4( radius * Math.cos( angle * i ), radius * Math.sin( angle * i), 0.0, 1.0 ));
		vertices.push(vec4( radius * Math.cos( angle * i ), radius * Math.sin( angle * i), height, 1.0 ));
		vertices.push(vec4( radius * Math.cos( angle * (i+1)), radius * Math.sin( angle * ( i+1 )), 0.0, 1.0 ));
		vertices.push(vec4( radius * Math.cos( angle * (i+1)), radius * Math.sin( angle * ( i+1 )), height, 1.0 ));
		cylinderPtsCount += 4;
	}
}

function SurfaceRevPoints()
{
	//Setup initial points matrix
	for (var i = 0; i < 11; i++){
		vertices3.push(vec4(basketPoints[i][0], basketPoints[i][1], basketPoints[i][2], 1));
	}

	var r;
    var t = Math.PI/12;

    // sweep the original curve another "angle" degree
	for (var j = 0; j < 24; j++){
		var angle = (j+1)*t; 
		// for each sweeping step, generate 25 new points corresponding to the original points
		for(var i = 0; i < 12; i++){	
		    r = vertices3[i][0];
            vertices3.push(vec4( r * Math.cos(angle), vertices3[i][1], -r * Math.sin(angle), 1));
		}
	}

	var N = 11; 
	// quad strips are formed slice by slice (not layer by layer)
	for (var i=0; i<24; i++) {// slices{
	   	for (var j=0; j<12; j++){  // layers{
			quad3(i*N+j, (i+1)*N+j, (i+1)*N+(j+1), i*N+(j+1)); 
	   	}
	}    
}

// 
function colorCylinder(){
	for (var i = 8; i < 206; i+=2){
		quad(i, i+2, i+3, i+1 );
		cylinderPtsCount += 6;
	}
}

function scale4(a, b, c) {
   	var result = mat4();
   	result[0][0] = a;
   	result[1][1] = b;
   	result[2][2] = c;
   	return result;
}

function Newell(indices){

   	var L = indices.length;
   	var x = 0, y = 0, z = 0;
   	var index, nextIndex;

   	for (var i = 0; i < L; i++ ){
        
        index=indices[i];
        nextIndex = indices[ (i+1) % L ];
       
        x += (vertices3[index][1] - vertices3[nextIndex][1])*
             (vertices3[index][2] + vertices3[nextIndex][2]);
        y += (vertices3[index][2] - vertices3[nextIndex][2])*
             (vertices3[index][0] + vertices3[nextIndex][0]);
        z += (vertices3[index][0] - vertices3[nextIndex][0])*
             (vertices3[index][1] + vertices3[nextIndex][1]);
   	}

   	return (normalize(vec3(x, y, z)));
}

function createNewTexture(picName)
{
    var i = textures.length;
    textures[i] = gl.createTexture();
    textures[i].image = new Image();
    textures[i].image.src = picName;
    textures[i].image.onload = function() { loadNewTexture(i); }
}
function loadNewTexture(index)
{
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, textures[index]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, textures[index].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}