exercise 1

glGenbuffers() 	Generates buffer ID
glBindbuffer() Binds/selects active buffer
glBufferData()	Copies data to buffer

exercise 2


"glBindBuffer( GL_ARRAY_BUFFER, colorBuffer );
glVertexAttribPointer(1, 3, GL_FLOAT, false/*normalized*/, 0/*stride*/, 0/*offset*/ );
glEnableVertexAttribArray(1);"


2

"glBindBuffer( GL_ARRAY_BUFFER, positionBuffer );
glVertexAttribPointer(0, 3, GL_FLOAT, false/*normalized*/, 0/*stride*/, 0/*offset*/ );
glEnableVertexAttribArray(0);"

1

exercise 3

The vertex shader (simple.vert) outputs a color (outColor), which is passed to the fragment shader. How is the color output from the vertex shader linked to the color input of the fragment shader? (pick one of the following three alternatives)
	using the glBindFragDataLocation() call
X	by name (i.e. both times the variable is named 'outColor')
	by pure luck. Sacrificing cute animals in the name of the Red Book may help. 

exercise 4

 							Vertex Shader 	Fragment Shader
A single time per frame 						
Once for each vertex (here: 9 times) 				X		
Approximately once for each drawn pixel in the image				X



exercise 5

GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);

glCompileShader() a,b

 	

glShaderSource() 1,2

 	

glShaderSource() 3,4

 	

glLinkProgram() c
