
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = ()=>{
	const scene = new BABYLON.Scene(engine);
	const placeholdercamera = new BABYLON.ArcRotateCamera("placeholdercamera", -Math.PI/2, Math.PI/2.5, 15, new BABYLON.Vector3(0, 0, 0));
	//placeholdercamera.attachControl(canvas, true);

	BABYLON.SceneLoader.Append("./assets/", "building.babylon", scene, (scene)=>{
		const camera = scene.getCameraByName("Camera04");
		camera.inputs.clear();
		camera.inputs.add(new BABYLON.FreeCameraVirtualJoystickInput);
		scene.activeCamera = camera;
		scene.activeCamera.attachControl(canvas, true);
		scene.activeCamera.inputs.attached.virtualJoystick
			.getLeftJoystick().setJoystickSensibility(0.02);
		scene.activeCamera.inputs.attached.virtualJoystick
			.getRightJoystick().setJoystickSensibility(0.01);

		const collider = BABYLON.MeshBuilder.CreateBox("collider", {size : 0.1}, scene);
		collider.parent = camera;


		const hitboxes = [];
		const checkpoints = [];
		hitboxes.push(createHitbox("hitbox0", 0.1, 3, 5,     0, 0.9, 12));
		hitboxes.push(createHitbox("hitbox1", 0.1, 3, 5,     1, 4.5, 12));
		hitboxes.push(createHitbox("hitbox2",   7, 3, 6,   -12,   1,  5));

		const frameRate = 60;
		const spinnyBoi = createXSpinnyBoi(frameRate);
		const shaderMaterial = createShaders();


		scene.registerAfterRender( ()=>{
			if(collider.intersectsMesh(hitboxes[0]) && hitboxes[0].state===false){
				checkpoints.push(createCheckpoint("checkpoint0", -5.7, 1.2, 11.8));
				scene.beginDirectAnimation(checkpoints[0], [spinnyBoi], 0, 2*frameRate, true);
				checkpoints[0].material = shaderMaterial;
				hitboxes[0].state = true;
			}
			if(collider.intersectsMesh(hitboxes[1]) && hitboxes[1].state===false && hitboxes[0].state===true){
				checkpoints.push(createCheckpoint("checkpoint1", -5.7,   4, 11.8));
				scene.beginDirectAnimation(checkpoints[1], [spinnyBoi], 0, 2*frameRate, true);
				checkpoints[1].material = shaderMaterial;
				hitboxes[1].state = true;
			}
			if(collider.intersectsMesh(hitboxes[2]) && hitboxes[2].state===false && hitboxes[1].state===true){
				checkpoints.push(createCheckpoint("checkpoint2",  -12, 1.2,    4.2));
				scene.beginDirectAnimation(checkpoints[2], [spinnyBoi], 0, 2*frameRate, true);
				checkpoints[2].material = shaderMaterial;
				hitboxes[2].state = true;
			}
		});
	});

	return scene;
}

/*--------------------------------------------*/
/*Functions Start*/
const createHitbox = (name, width, height, depth, x, y, z)=>{
	const hitboxMat = new BABYLON.StandardMaterial("hitboxMat");
	hitboxMat.diffuseColor = new BABYLON.Color3(0,0,0);
	hitboxMat.alpha = 0;
	const hitbox = BABYLON.MeshBuilder.CreateBox(name, {width: width, height: height, depth: depth});
	hitbox.material = hitboxMat;
	hitbox.position.x = x;
	hitbox.position.y = y;
	hitbox.position.z = z;
	hitbox.state = false;
	return hitbox;
}

const createCheckpoint = (name, x, y, z) =>{
	const torus = BABYLON.MeshBuilder.CreateTorusKnot(name, {radius : 0.27, tube : 0.13, p : 3, q : 4});
	torus.position.x = x;
	torus.position.y = y;
	torus.position.z = z;

	return torus;
}

const createXSpinnyBoi = (frameRate)=>{
	const spinnyBoi = new BABYLON.Animation("spinnyBoi", "rotation.y", frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	const keyFrames = [];
	keyFrames.push({
		frame : 0,
		value : 0,
	});
	keyFrames.push({
		frame : 2 * frameRate,
		value : 2 * Math.PI,
	});
	spinnyBoi.setKeys(keyFrames);
	return spinnyBoi;
}








const createShaders = ()=>{
	BABYLON.Effect.ShadersStore["customVertexShader"]=`
		precision highp float;

		//Attributes
		attribute vec3 position;
		attribute vec3 normal;
		attribute vec2 uv;

		//Uniforms
		uniform mat4 worldViewProjection;

		//Varying
		varying vec2 vUV;

		void main(void){
			gl_Position = worldViewProjection * vec4(position, 1.0);

			vUV = uv;
		}`;

	BABYLON.Effect.ShadersStore["customFragmentShader"]=`
		precision highp float;

		varying vec2 vUV;
		uniform sampler2D textureSampler;

		void main(void){
			gl_FragColor = texture2D(textureSampler, vUV);
		}`;


	const shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, 
		{
			vertex : "custom",
			fragment : "custom",
		},
		{
			attributes : ["position", "normal", "uv"],
			uniforms : ["world", "worldView", "worldViewProjection", "view", "projection"]
		});
	const pewdsTexture = new BABYLON.Texture("./assets2/pewds.jpg");
	shaderMaterial.setTexture("textureSampler", pewdsTexture);
	shaderMaterial.backFaceCulling = false;

	return shaderMaterial;
}


/*Functions End*/
/*--------------------------------------------*/

const scene = createScene();
engine.runRenderLoop(()=>{
	scene.render();
});
window.addEventListener("resize", ()=>{
	engine.resize();
});

