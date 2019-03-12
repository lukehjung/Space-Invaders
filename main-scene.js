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
		this.start_screen = true;

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
			'ball': new Subdivision_Sphere(4),
			'prism': new TriangularPrism()
		}
		this.submit_shapes(context, shapes);
		this.shape_count = Object.keys(shapes).length;

		this.materials = {
			start: context.get_instance(Fake_Bump_Map).material(Color.of(0, 0, 0, 0), {
                ambient: .8,
                diffusivity: .5,
                specularity: .5,
                texture: context.get_instance("assets/start.png", false)
            })
		}

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

		this.yellow = Color.of(1, 1, 0, 1);
		this.white = Color.of(1, 1, 1, 0);
		this.red = Color.of(1, 1, 0, 0);
		this.black = Color.of(0, 0, 0, 0);

		for (let t in shape_textures)
			this.shape_materials[t] = this.texture_base.override({
				texture: context.get_instance(shape_textures[t])
			});

		this.lights = [new Light(Vec.of(10, 10, 20, 1),Color.of(1, .4, 1, 1),100000)];

		this.t = 0;
	}

	trigger_animation(graphics_state) {
        var new_matrix = Mat4.look_at(Vec.of(0, -28, 8), Vec.of(0, 0, 0), Vec.of(0, 10, 0));
        new_matrix = new_matrix.map((x,i)=>Vec.from(graphics_state.camera_transform[i]).mix(x, .05));
        graphics_state.camera_transform = new_matrix;
        this.animation_t += 0.01;
        if (this.animation_t >= 1)
            this.beginning_animation = false;
    }
		
	draw_aliens2(graphics_state, alien_matrix)
  	{
		this.shapes.ball.draw(graphics_state, alien_matrix.times(Mat4.scale(Vec.of(.5, .5, .5))), this.shape_materials[1] || this.plastic);
		this.shapes.prism.draw(graphics_state, 
		  alien_matrix.times(Mat4.translation(Vec.of(0.8, 0.3, 0)))
		  .times(Mat4.scale(Vec.of(.5, .5, .1)))
		  .times(Mat4.rotation(Math.PI/0.9, Vec.of(0, 0, 1))),
		  this.shape_materials[1] || this.plastic.override({color: this.yellow}));
		this.shapes.prism.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(-.9, 0.3, 0)))
		  .times(Mat4.scale(Vec.of(.5, .5, .1)))
		  .times(Mat4.rotation(Math.PI/0.71, Vec.of(0, 0, 1))),
		  this.shape_materials[1] || this.plastic.override({color: this.yellow}));
		this.shapes.ball.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(-.15, 0.07, 0.3)))
		  .times(Mat4.scale(Vec.of(.2, .2, .2))),
		  this.shape_materials[1] || this.plastic.override({color: this.yellow}));
		this.shapes.ball.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(.2, 0.07, 0.3)))
		  .times(Mat4.scale(Vec.of(.2, .2, .2))),
		  this.shape_materials[1] || this.plastic.override({color: this.yellow}));
		this.shapes.ball.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(0, -0.2, 0.34)))
		  .times(Mat4.scale(Vec.of(0.32, 0.12, 0.12))),
		  this.shape_materials[1] || this.plastic.override({color: this.yellow}));
  	}

  draw_aliens1(graphics_state, alien_matrix)
  {
		this.shapes.ball.draw(graphics_state, alien_matrix.times(Mat4.scale(Vec.of(.25, .25, .25))), this.shape_materials[1] || this.plastic.override({color: this.yellow}));
		this.shapes.cone.draw(graphics_state, 
		  alien_matrix.times(Mat4.translation(Vec.of(0, -0.2, 0)))
		  .times(Mat4.scale(Vec.of(0.11, 0.4, 0.11)))
		  .times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))),
		  this.shape_materials[1] || this.plastic);
		this.shapes.ball.draw(graphics_state, 
		  alien_matrix.times(Mat4.translation(Vec.of(0, 0.55, 0)))
		  .times(Mat4.scale(Vec.of(.175, .35, .175))),
		  this.shape_materials[1] || this.plastic);
		this.shapes.box.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(.09, 0.9, 0)))
		  .times(Mat4.scale(Vec.of(.04, .3, .04))),
		  this.shape_materials[1] || this.plastic.override({color: this.yellow}));
		this.shapes.box.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(-.09, 0.9, 0)))
		  .times(Mat4.scale(Vec.of(.04, .3, .04))),
		  this.shape_materials[1] || this.plastic.override({color: this.yellow}));
		this.shapes.ball.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(.3, .45, 0)))
		  .times(Mat4.scale(Vec.of(.3, .13, .09))),
		  //.times(Mat4.rotation(Math.PI/4, Vec.of(1, 0, 0))),
		  this.shape_materials[1] || this.plastic);
		this.shapes.ball.draw(graphics_state,
		  alien_matrix.times(Mat4.translation(Vec.of(-.3, .45, 0)))
		  .times(Mat4.scale(Vec.of(.3, .13, .09))),
		  //.times(Mat4.rotation(Math.PI/4, Vec.of(1, 0, 0))),
		  this.shape_materials[1] || this.plastic);
		this.shapes.ball.draw(graphics_state, 
		  alien_matrix.times(Mat4.translation(Vec.of(.1, -0.15, 0.4)))
		  .times(Mat4.scale(Vec.of(.08, .08, .08))),
		  this.shape_materials[1] || this.plastic);
		this.shapes.ball.draw(graphics_state, 
		  alien_matrix.times(Mat4.translation(Vec.of(-.1, -0.15, 0.4)))
		  .times(Mat4.scale(Vec.of(.08, .08, .08))),
      this.shape_materials[1] || this.plastic);
  }

	draw_ship(graphics_state, ship_matrix)
  	{
    this.shapes.cylinder.draw(graphics_state, 
      this.ship_matrix.times(Mat4.translation(Vec.of(0, 0, 0))) // y translate value found here
      .times(Mat4.scale(Vec.of(.8, .9, .8)))
      .times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))), 
      this.shape_materials[1] || this.plastic);
    this.shapes.cone.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(0, .9, 0)))
      .times(Mat4.rotation(Math.PI*(3/2), Vec.of(1, 0, 0)))
      .times(Mat4.scale(Vec.of(.8, 1, 1))),
      this.shape_materials[1] || this.plastic);
    this.shapes.cylinder.draw(graphics_state, 
      this.ship_matrix.times(Mat4.translation(Vec.of(0, .05, 0.4)))
      .times(Mat4.scale(Vec.of(.6, .7, .6)))
      .times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))), 
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.cone.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(0, -1.3, 0)))
      .times(Mat4.rotation(Math.PI*(3/2), Vec.of(1, 0, 0)))
      .times(Mat4.scale(Vec.of(.35, 1, .55))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.ball.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(0, .3, 1)))
      .times(Mat4.scale(Vec.of(.3, .3, .3))),
      this.shape_materials[1] || this.plastic);
    this.shapes.box.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(0, -0.25, 1)))
      .times(Mat4.scale(Vec.of(.05, .38, .1))),
      this.shape_materials[1] || this.plastic);
    this.shapes.box.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(-.2, -.2, 1)))
      .times(Mat4.rotation(Math.PI/2.3, Vec.of(0, 0, 1)))
      .times(Mat4.scale(Vec.of(.04, .2, .04))),
      this.shape_materials[1] || this.plastic);
    this.shapes.box.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(.2, -.2, 1)))
      .times(Mat4.rotation(Math.PI/(-2.3), Vec.of(0, 0, 1)))
      .times(Mat4.scale(Vec.of(.04, .2, .04))),
      this.shape_materials[1] || this.plastic);
    this.shapes.ball.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(0.1, .4, 1.24)))
      .times(Mat4.scale(Vec.of(0.09, .09, .09))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.ball.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(-0.1, .4, 1.24)))
      .times(Mat4.scale(Vec.of(0.09, .09, .09))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.box.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(0.08, .24, 1.3)))
      .times(Mat4.rotation(Math.PI/0.09, Vec.of(0, 0, 1)))
      .times(Mat4.scale(Vec.of(.13, .035, .035))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.prism.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(.8, -.5, 0)))
      .times(Mat4.scale(Vec.of(.7, .9, 0.1))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.prism.draw(graphics_state,
      this.ship_matrix.times(Mat4.translation(Vec.of(-.8, -.5, 0)))
      .times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0)))
      .times(Mat4.scale(Vec.of(.7, .9, 0.1))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
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
		this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(-16, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);

		this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(16, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);
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

			if (this.beginning_animation) {
				this.sign_Matrix = Mat4.identity().times(Mat4.scale([10, 10, 10])).times(Mat4.translation([0, 0, 100]));
				let sign_Matrix = this.sign_Matrix.times(Mat4.rotation(Math.PI / 36, Vec.of(1, 0, 0))).times(Mat4.scale([3 / 2, 3 / 2, 3 / 2]));
				this.shapes.plane.draw(graphics_state, sign_Matrix, this.materials.start);
				if (this.begin_animation) {
                	this.trigger_animation(graphics_state)
				}
			}
			
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

				if( i % 2 ==0)
				{
					this.draw_aliens1(graphics_state,mat);
				}
				else
					this.draw_aliens2(graphics_state,mat);

			}

			this.draw_ship(graphics_state, this.ship_matrix);
	}
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;
