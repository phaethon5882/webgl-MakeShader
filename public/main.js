const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl'); // webgl 2d 렌더링 컨텍스트 

if(!gl) {
  throw new Error('WebGL 을 지원하지 않는 브라우저 입니다.');
}

// 0. 삼각형에 쓰일 점들을 준비한다.
// Float32Array 를 쓰면, 좌표의 범위가 [-1,1] 임! 노말라이즈 되어있다~
const vertexData = new Float32Array([
  0, 1, 0,
  1, -1, 0,
  -1, -1, 0
]);

// 1. 정점들을 위한 버퍼를 만든다.
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer); 
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW); // 버퍼가 한 번 계산되고 나서 바뀌지 않을 경우엔 STATIC, 애니메이션처럼 바뀐다면 DYNAMIC_DRAW

// 2. 버텍스 쉐이더를 작성해보자. 점들에 대한 연산을 추가할 수 있다.
// cf). 자바스크립트는 사실 GPU를 쓸 수 없다. 오픈지엘을 쓰는거지~ 
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
  attribute vec3 position;            // attribute 는 버퍼에서 가져온 데이터를 의미한다.
  void main() {
    gl_Position = vec4(position, 1);  //position 뒤에 1은 점, 0이면 벡터를 의미한다.
  }
`); 
gl.compileShader(vertexShader);

// 3. 프레그먼트 쉐이더를 작성해보자
// 도형안에 존재하는 픽셀들에 색상을 제공하는 기능을하고, 아래와같이 추가적으로 프로그래밍이 가능하다.
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);// 얘의 1은 rgba의 alpha 값임. 불투명도가 1이니 원색이라는 뜻.
gl.shaderSource(fragmentShader, `
  void main() {
    gl_FragColor = vec4(0, 1, 0, .5); 
  }
`);
gl.compileShader(fragmentShader);

// 4. 버텍스 쉐이더와 프레그먼트 쉐이더를 추가한 GL프로그램을 생성한다.
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// 5. 좌표정보를 담고있는 버퍼로부터 값을 가져오는 기능을 켠다. (기본값: Disabled)
const positionLocation = gl.getAttribLocation(program, `position`); // 속성값을 가져오고
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); // offset: 버퍼의 시작부분, stride 는 다음 점을 읽는 간격, 0이면 연속으로 출력

// 6. 그래픽카드에서 실행가능한 프로그램 생성, 쉐이더 연산 결과로 2d 행렬이 만들어지는데
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3); // 거기서 0번 버텍스부터 3번 버텍스를 사용하여 삼각형을 그리겠다는 뜻