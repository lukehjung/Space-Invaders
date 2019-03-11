function Rocket(x, y, velocity) 
{
	this.x = x;
	this.y = y;
	this.velocity = velocity;
}

function Alien(x, y, boom)
{
	this.x = x;
	this.y = y;
	this.boom = boom;
}
class Assignment_Two_Skeleton extends Scene_Component {
	// The scene begins by requesting the camera, shapes, and materials it will need
	constructor(context, control_box) {

		super(context, control_box);
		this.ship_matrix = Mat4.identity().times(Mat4.translation(Vec.of(0, -10, 0)));
		this.shoot_matrix = this.ship_matrix;
		this.rockets = [];
		this.shots = 0;
		this.alien_array = [];


		// First, include a secondary Scene that provides movement controls:
		//         if(!context.globals.has_controls)
		//             context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

		// Locate the camera here (inverted matrix).
		const r = context.width / context.height;
		context.globals.graphics_state.camera_transform = Mat4.translation(Vec.of(0, 0, -30));
		context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

		// At the beginning of our program, load one of each of these shape
		// definitions onto the GPU.  NOTE:  Only do this ONCE per shape
		// design.  Once you've told the GPU what the design of a cube is,
		// it would be redundant to tell it again.  You should just re-use
		// the one called "box" more than once in display() to draw
		// multiple cubes.  Don't define more than one blueprint for the
		// same thing here.
		const shapes = {
			'square': new Square(),
			'circle': new Circle(15),
			'pyramid': new Tetrahedron(false),
			'simplebox': new SimpleCube(),
			'box': new Cube(),
			'cylinder': new Cylinder(15),
			'cone': new Cone(20),
			'ball': new Subdivision_Sphere(4)
		}
		this.submit_shapes(context, shapes);
		this.shape_count = Object.keys(shapes).length;

		// Make some Material objects available to you:
		this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
			ambient: .4,
			diffusivity: .4
		});
		this.plastic = this.clay.override({
			specularity: .6
		});
		this.texture_base = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
			ambient: 1,
			diffusivity: 0.4,
			specularity: 0.3
		});

		// Load some textures for the demo shapes
		this.shape_materials = {};
		const shape_textures = {
			square: "assets/butterfly.png",
			box: "assets/even-dice-cubemap.png",
			ball: "assets/soccer_sph_s_resize.png",
			cylinder: "assets/treebark.png",
			pyramid: "assets/tetrahedron-texture2.png",
			simplebox: "assets/tetrahedron-texture2.png",
			cone: "assets/hypnosis.jpg",
			circle: "assets/hypnosis.jpg"
		};
		for (let t in shape_textures)
			this.shape_materials[t] = this.texture_base.override({
				texture: context.get_instance(shape_textures[t])
			});

		this.lights = [new Light(Vec.of(10, 10, 20, 1),Color.of(1, .4, 1, 1),100000)];

		this.t = 0;
	}

	// Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
	make_control_panel() {

		let move = 1;

		this.key_triggered_button("Pause Time", ["n"], ()=>{
			this.paused = !this.paused;
		}
		);
		this.key_triggered_button("Left", ["a"], ()=>{
			if (this.ship_matrix[0][3] > -12) {
				this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(-move, 0, 0)));
			}
		}
		);
		this.key_triggered_button("Right", ["d"], ()=>{
			if (this.ship_matrix[0][3] < 12) {
				this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(move, 0, 0)));
			}
		}
		);
		this.key_triggered_button("Shoot", ['\ '], ()=>{
			this.rockets.push(new Rocket(this.ship_matrix[0][3], this.ship_matrix[1][3], .1));
			this.shots++;
		}
		);
	}

	make_shoot(graphics_state, shoot_matrix)
	{		
		for(var i = 0; i < this.rockets.length; i ++)
		{
			var rocket = this.rockets[i];
			rocket.y += 5 * rocket.velocity ;

			if(rocket.y >= 13 )
			{
				this.rockets.splice(i--,1);
			}
		}
		 
	}

	create_boundaries(graphics_state) 
	{
		let m = Mat4.identity();
		this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(-15.5, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);

		this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(15.5, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);
	}

	create_aliens(graphics_state, alien_matrix, alien_array) 
	{
		var arr = [];
		var i = 0;
		var alien_x = -10.5;
		var alien_y = 0;
		for(var i = 0; i < 4; i ++)
		{
			for(var j = 0; j < 8; j ++)
			{
				arr.push(new Alien(alien_x, alien_y, 0));
				alien_x += 3;
			}
			alien_x = -10.5;
			alien_y += 3;
		}

		this.alien_array = arr;
		let dist = Math.ceil(30 * Math.cos(this.t)) / 10;
		let y = 0;
		y += Math.ceil(this.t / (Math.PI)) / 4;	
		
		for(var i = 0; i < this.alien_array.length; i ++)
		{
			var alien = this.alien_array[i];
			alien.y -= y;
			alien.x += dist;
		}
	}

	delete_alien(graphics_state, alien_matrix)
	{
			
	}

	display(graphics_state) 
	{
			// Use the lights stored in this.lights.
			graphics_state.lights = this.lights;

			// Find how much time has passed in seconds, and use that to place shapes.
			if (!this.paused)
				this.t += graphics_state.animation_delta_time / 1000;
			const t = this.t;
			
			const shoot_matrix = this.shoot_matrix;
			this.make_shoot(graphics_state, shoot_matrix);
			
			this.alien_matrix = Mat4.identity().times(Mat4.translation(Vec.of(-13.5, 10, 0)));
			let alien_matrix = this.alien_matrix;
			let alien_array = this.alien_array;
			
			// Draw some demo textured shapes
			this.create_boundaries(graphics_state);
			this.create_aliens(graphics_state, alien_matrix, alien_array);
			
			for(var i = 0; i < this.rockets.length; i ++)
			{
				var mat = new Mat4(this.rockets[i].x, this.rockets[i].y);
				this.shapes.ball.draw(
						graphics_state,
					mat.times(Mat4.scale(Vec.of(.4, .4, .4))), 
						this.shape_materials[3] || this.plastic);
			}


		
		
			for(var i = 0; i < this.alien_array.length; i ++)
			{
				var mat = new Mat4(this.alien_array[i].x, this.alien_array[i].y)

				this.shapes.ball.draw(
					graphics_state,
					mat.times(Mat4.scale(Vec.of(.5, .5, .5))), 
					this.shape_materials[1] || this.plastic);
			}

			this.shapes.ball.draw(graphics_state, this.ship_matrix, this.shape_materials[1] || this.plastic);
	}
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;
