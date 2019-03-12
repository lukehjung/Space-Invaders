function Rocket(x, y, velocity) 
{
	this.x = x;
	this.y = y;
	this.velocity = velocity;
}

function Alien(x, y, type)
{
	this.x = x;
	this.y = y;
	this.type = type;
	this.movedown = false;
	this.moveright = true;
}

function Ship(x, y)
{
	this.x = x;
	this.y = y;
}

function Particle(p_x, p_y, p_z, v_x, v_y, v_z)
{
    this.pos_x = p_x;
    this.pos_y = p_y;
    this.pos_z = p_z;

    this.vel_x = v_x;
    this.vel_y = v_y;
    this.vel_z = v_z;

    this.spec = .6
	this.life = 100;
}

class Space_Invaders extends Scene_Component {
	// The scene begins by requesting the camera, shapes, and materials it will need
	constructor(context, control_box) {

		super(context, control_box);
		//this.ship_matrix = Mat4.identity().times(Mat4.translation(Vec.of(0, -10, 0)));
		this.rockets = [];
		this.lasers = [];
		this.alien_array = [];
		this.ship = [];
		this.lives = 3;
		
		this.particles = []
		this.hit_once;
		this.lastUsedParticle = 0;
		
		this.canshoot = true;
		this.shotclock = 0;

		//this.downcounter = 0;


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

		this.yellow = Color.of(1, 1, 0, 1);
		this.white = Color.of(1, 1, 1, 0);
		this.red = Color.of(1, 1, 0, 0);
		this.black = Color.of(0, 0, 0, 0);

		this.t = 0;
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
      ship_matrix.times(Mat4.translation(Vec.of(0, 0, 0))) // y translate value found here
      .times(Mat4.scale(Vec.of(.8, .9, .8)))
      .times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))), 
      this.shape_materials[1] || this.plastic);
    this.shapes.cone.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(0, .9, 0)))
      .times(Mat4.rotation(Math.PI*(3/2), Vec.of(1, 0, 0)))
      .times(Mat4.scale(Vec.of(.8, 1, 1))),
      this.shape_materials[1] || this.plastic);
    this.shapes.cylinder.draw(graphics_state, 
      ship_matrix.times(Mat4.translation(Vec.of(0, .05, 0.4)))
      .times(Mat4.scale(Vec.of(.6, .7, .6)))
      .times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))), 
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.cone.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(0, -1.3, 0)))
      .times(Mat4.rotation(Math.PI*(3/2), Vec.of(1, 0, 0)))
      .times(Mat4.scale(Vec.of(.35, 1, .55))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.ball.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(0, .3, 1)))
      .times(Mat4.scale(Vec.of(.3, .3, .3))),
      this.shape_materials[1] || this.plastic);
    this.shapes.box.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(0, -0.25, 1)))
      .times(Mat4.scale(Vec.of(.05, .38, .1))),
      this.shape_materials[1] || this.plastic);
    this.shapes.box.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(-.2, -.2, 1)))
      .times(Mat4.rotation(Math.PI/2.3, Vec.of(0, 0, 1)))
      .times(Mat4.scale(Vec.of(.04, .2, .04))),
      this.shape_materials[1] || this.plastic);
    this.shapes.box.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(.2, -.2, 1)))
      .times(Mat4.rotation(Math.PI/(-2.3), Vec.of(0, 0, 1)))
      .times(Mat4.scale(Vec.of(.04, .2, .04))),
      this.shape_materials[1] || this.plastic);
    this.shapes.ball.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(0.1, .4, 1.24)))
      .times(Mat4.scale(Vec.of(0.09, .09, .09))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.ball.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(-0.1, .4, 1.24)))
      .times(Mat4.scale(Vec.of(0.09, .09, .09))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.box.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(0.08, .24, 1.3)))
      .times(Mat4.rotation(Math.PI/0.09, Vec.of(0, 0, 1)))
      .times(Mat4.scale(Vec.of(.13, .035, .035))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.prism.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(.8, -.5, 0)))
      .times(Mat4.scale(Vec.of(.7, .9, 0.1))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
    this.shapes.prism.draw(graphics_state,
      ship_matrix.times(Mat4.translation(Vec.of(-.8, -.5, 0)))
      .times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0)))
      .times(Mat4.scale(Vec.of(.7, .9, 0.1))),
      this.shape_materials[1] || this.plastic.override({color: this.yellow}));
  	}

	// Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
	make_control_panel() {

		let move = .2;

		this.key_triggered_button("Pause Time", ["n"], ()=>{
			this.paused = !this.paused;
		}
		);

		this.key_triggered_button("Left", ["a"], ()=>{
			if(!this.paused && this.ship.length > 0)
			{
				if (this.ship[0].x > -12) {
					this.ship[0].x -= 0.25;
					//this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(-move, 0, 0)));
				}
			}
		}
		);

		this.key_triggered_button("Right", ["d"], ()=>{
			if(!this.paused && this.ship.length > 0)
			{
				if (this.ship[0].x < 12) {
					this.ship[0].x += 0.25;
					//this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(move, 0, 0)));
				}
			}

		}
		);

		this.key_triggered_button("Shoot", ['\ '], ()=>{
			if(!this.paused && this.canshoot == true && this.ship.length > 0)
			{
				this.rockets.push(new Rocket(this.ship[0].x, this.ship[0].y, .1));
				this.canshoot = false;
				this.shotclock = this.t;
			}
		}
		);

		this.key_triggered_button("Start", ['y'], ()=>{
			for(var i = 0; i < this.rockets.length; i++){
				this.rockets.splice(i--, 1)
			}

			for(var i = 0; i < this.alien_array.length; i++){
				this.alien_array.splice(i--, 1)
			}

			for(var i = 0; i < this.ship.length; i++){
				this.ship.splice(i--, 1)
			}

			for(var i = 0; i < this.lasers.length; i++){
				this.lasers.splice(i--, 1)
			}

			var alien_x = -12.5;
			var alien_y = 5;
			for(var i = 0; i < 3; i ++)
			{
				for(var j = 0; j < 7; j ++)
				{
					this.alien_array.push(new Alien(alien_x, alien_y, j % 2));
					alien_x += 3.3;
				}
				alien_x = -12.5;
				alien_y += 3;
			}

			this.lives = 3;
			this.ship.push(new Ship(0, -10));
			this.t = 0
		}
		);
	}

	make_shoot(graphics_state)
	{
		if(!this.paused)
		{
			// shoot missiles
			for(var i = 0; i < this.rockets.length; i ++)
			{
				var rocket = this.rockets[i];
				rocket.y += 5 * rocket.velocity ;

				if(rocket.y >= 13)
				{
					this.rockets.splice(i--,1);
				}
			}

			// shoot lasers
			for(var i = 0; i < this.lasers.length; i ++)
			{
				var laser = this.lasers[i];
				laser.y -= 0.5 * laser.velocity ;

				if(laser.y <= -14 )
				{
					this.lasers.splice(i--,1);
				}
			}
		}
	}

	create_boundaries(graphics_state) 
	{
		let m = Mat4.identity();
		this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(-15.5, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);

		this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(15.5, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);
	}

	create_aliens(graphics_state, alien_array) 
	{
		if(!this.paused)
		{
			for(var i = 0; i < this.alien_array.length; i ++)
			{
				var alien = this.alien_array[i];
				if(this.t % 200 == 0)
				{
					alien.movedown = true;
				}
				if(alien.movedown)
				{
					alien.y -= 1;
					alien.movedown = false;
					if(alien.moveright == true)
					{
						alien.moveright = false;
					}
					else
					{
						alien.moveright = true;
					}
				}
				else if(alien.moveright)
				{
					alien.x += 0.025;
				}
				else
				{
					alien.x -= 0.025;
				}

				// shoot lasers randomly
				var shootlaser = Math.floor(Math.random() * 2500) + 1;
				if(shootlaser == 1)
				{
					this.lasers.push(new Rocket(alien.x, alien.y, .1));
				}
			}
		}
	}

	collision(graphics_state)
	{
		for(var i = 0; i < this.lasers.length; i++)
		{
			var laser = this.lasers[i];
			if(this.ship.length > 0)
			{
				if(laser.x >= (this.ship[0].x - 1) && laser.x <= (this.ship[0].x + 1) &&
					laser.y >= (this.ship[0].y - 1.66) && laser.y <= (this.ship[0].y + 1.66)) {

					this.lasers.splice(i--, 1);
					this.lives -= 1;
					break;
				}
			}
		}

		for(var i = 0; i < this.alien_array.length; i++){
			var alien = this.alien_array[i];
			var hit = false;

			for(var j=0; j<this.rockets.length; j++){
				var rocket = this.rockets[j];

				if(alien.type)
				{
					if(rocket.x >= (alien.x - 1) && rocket.x <= (alien.x + 1) &&
						rocket.y >= (alien.y - .9) && rocket.y <= (alien.y + .9)) {

						this.rockets.splice(j--, 1);
						hit = true;
						this.hit_once = true;
						break;
					}
				}
				else
				{
					if(rocket.x >= (alien.x - .7) && rocket.x <= (alien.x + .7) &&
						rocket.y >= (alien.y - .9) && rocket.y <= (alien.y + .9)) {

						this.rockets.splice(j--, 1);
						hit = true;
						this.hit_once = true;

						//game.score += this.config.pointsPerInvader;
						break;
					}
				}
			}

			if(alien.y < -10){
				this.lives = 0;
			}
			
			if(hit) {
            	for (let j = 0; j < 25; j++) 
				{
					let randvec_x = Math.random() - 0.5;
					let randvec_y = Math.random() - 0.5;
					let randvec_z = Math.random() - 0.5;

					this.particles.push(new Particle(alien.x, alien.y, 0, randvec_x, randvec_y, randvec_z));
				}

            	this.alien_array.splice(i--, 1);

			}

			if(this.ship.length > 0)
			{
				if(alien.type)
				{
					if(this.ship[0].x >= (alien.x - 1.75) && this.ship[0].x <= (alien.x + 1.75) &&
							this.ship[0].y >= (alien.y - 2.2) && this.ship[0].y <= (alien.y + 2.2)) {
						this.lives = 0;
					}
				}
				else
				{
					if(this.ship[0].x >= (alien.x - 1.1) && this.ship[0].x <= (alien.x + 1.1) &&
							this.ship[0].y >= (alien.y - 2.2) && this.ship[0].y <= (alien.y + 2.2)) {
						this.lives = 0;
					}					
				}

			}
		}
	}

	RespawnParticle(particle)
	{
		particle.spec -= .5;
		particle.life = 100;
		particle.vel_x *= 2;
		particle.vel_y *= 2;
		particle.vel_z *= 2;

	}  

	display(graphics_state) 
	{
		// Use the lights stored in this.lights.
		graphics_state.lights = this.lights;

		// Find how much time has passed in seconds, and use that to place shapes.
		if (!this.paused)
			this.t += Math.floor(graphics_state.animation_delta_time / 10);

		if((this.t - this.shotclock) > 20){
			this.canshoot = true;
		}

		const t = this.t;
			
		this.make_shoot(graphics_state);
		
		let alien_array = this.alien_array;
			
		// Draw some demo textured shapes
		this.create_boundaries(graphics_state);
		this.create_aliens(graphics_state, alien_array);

		// draw rockets
		for(var i = 0; i < this.rockets.length; i ++)
		{
			var mat = new Mat4(this.rockets[i].x, this.rockets[i].y);
			this.shapes.ball.draw(
				graphics_state,
				mat.times(Mat4.scale(Vec.of(.3, .3, .3))), 
				this.shape_materials[3] || this.plastic);
		}

		// draw lasers
		for(var i = 0; i < this.lasers.length; i ++)
		{
			var mat = new Mat4(this.lasers[i].x, this.lasers[i].y);
			this.shapes.ball.draw(
				graphics_state,
				mat.times(Mat4.scale(Vec.of(.3, .3, .3))), 
				this.shape_materials[3] || this.plastic);
		}
		
		// draw aliens
		for(var i = 0; i < this.alien_array.length; i ++)
		{
			var mat = new Mat4(this.alien_array[i].x, this.alien_array[i].y)
			if( alien_array[i].type == 0)
			{
				this.draw_aliens1(graphics_state,mat);
			}
			else
				this.draw_aliens2(graphics_state,mat);

		}

		// check for collisions
		this.collision(graphics_state);

		if(this.ship.length > 0)
		{
			var shipmat = new Mat4(this.ship[0].x, this.ship[0].y)
			this.draw_ship(graphics_state, shipmat);
		}

		//explosion
		if(this.hit_once && !this.pause)
		{
			for(var i = 0; i < this.particles.length; i ++)
			{ 
				var p = this.particles[i];

				if(p.life < 0)
				{
					this.RespawnParticle(p);
				}

				p.life-= 20;
				if(p.life > 0)
				{
					// particle is alive, thus update
					p.pos_x += p.vel_x * 1.5;
					p.pos_y += p.vel_y * 1.5;
					p.pos_z += p.vel_z * 1.5;
				}

			}

			for(var k = 0; k < this.particles.length; k++)
			{
				var par = this.particles[k];          					
				if(par.life > 0)
				{
					var mat = new Mat4(par.pos_x, par.pos_y, par.pos_z)
					this.shapes.ball.draw(
						graphics_state,
						mat.times(Mat4.scale(Vec.of(.3, .3, .3))), 
						this.clay.override({
							specularity: par.spec, 
							diffusivity: par.spec,
							color: Color.of( 255, 2, 30, 1)
						}));
				}
				if(par.spec < 0)
				{
					this.particles.splice(k--, 1);
				}
			}
			
		}
		// gameover, remove everything from screen
		if(this.lives < 1){
			this.ship.splice(0, 1);
			 for(var i = 0; i < this.alien_array.length; i++){
			 	this.alien_array.splice(i--, 1)
			}
			for(var i = 0; i < this.rockets.length; i++){
				this.rockets.splice(i--, 1)
			}
			for(var i = 0; i < this.lasers.length; i++){
				this.lasers.splice(i--, 1)
			}
		}
	}
}

window.Space_Invaders = window.classes.Space_Invaders = Space_Invaders;
