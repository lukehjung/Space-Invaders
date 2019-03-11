class Assignment_Two_Skeleton extends Scene_Component {
  // The scene begins by requesting the camera, shapes, and materials it will need
  constructor(context, control_box) {

    super(context, control_box);
    this.ship_matrix = Mat4.identity().times(Mat4.translation(Vec.of(0, -10, 0)));
    this.shoot_matrix = this.ship_matrix;

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

    this.key_triggered_button("Up", ["w"], ()=>{
      if (this.ship_matrix[1][3] < -3) {
        this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(0, move, 0)));
        console.log(this.ship_matrix);
      }
    }
    );
    this.key_triggered_button("Left", ["a"], ()=>{
      if (this.ship_matrix[0][3] > -12) {
        this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(-move, 0, 0)));
      }
    }
    );
    this.key_triggered_button("Down", ["s"], ()=>{
      if (this.ship_matrix[1][3] > -11) {
        this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(0, -move, 0)));
      }
    }
    );
    this.key_triggered_button("Right", ["d"], ()=>{
      if (this.ship_matrix[0][3] < 12) {
        this.ship_matrix = this.ship_matrix.times(Mat4.translation(Vec.of(move, 0, 0)));
      }
    }
    );
    this.key_triggered_button("Shoot", ["f"], ()=>{
      this.shoot = !this.shoot;
    }
    );
  }

  make_shoot(graphics_state) {//        while(this.shoot_matrix[1][3] < 25)
  }

  create_boundaries(graphics_state) {
    let m = Mat4.identity();
    this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(-15.5, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);

    this.shapes.square.draw(graphics_state, m.times(Mat4.translation(Vec.of(15.5, 0, 0))).times(Mat4.scale(Vec.of(1, 50, 1))), this.shape_materials[1] || this.plastic);
  }

  create_aliens(graphics_state, alien_matrix) {

    let dist = Math.ceil(30 * Math.cos(this.t)) / 10;
    alien_matrix = alien_matrix.times(Mat4.translation(Vec.of(dist, 0, 0)));   
    
    let y = 0;
    y += Math.ceil(this.t / (Math.PI))/2;
    console.log(y);
    alien_matrix = alien_matrix.times(Mat4.translation(Vec.of(0, -y, 0)));

    var j; var i;

    for (i = 0; i < 4; i++) {
      for (j = 0; j < 8; j++) {
        alien_matrix = alien_matrix.times(Mat4.translation(Vec.of(3, 0, 0)));

        this.shapes.ball.draw(
          graphics_state, 
          alien_matrix.times(Mat4.scale(Vec.of(.5, .5, .5))), 
          this.shape_materials[1] || this.plastic);

      }
      alien_matrix = alien_matrix.times(Mat4.translation(Vec.of(-24, -3, 0)));
    }
  }

  display(graphics_state) {
    // Use the lights stored in this.lights.
    graphics_state.lights = this.lights;

    // Find how much time has passed in seconds, and use that to place shapes.
    if (!this.paused)
      this.t += graphics_state.animation_delta_time / 1000;
    const t = this.t;

    if (this.shoot) {
      this.shoot_matrix = this.ship_matrix;
      this.shoot_matrix = this.shoot_matrix.times(Mat4.translation(Vec.of(0, 25 * this.t % 25, 0)));
    }
    
    this.alien_matrix = Mat4.identity().times(Mat4.translation(Vec.of(-13.5, 10, 0)));
    let alien_matrix = this.alien_matrix;
    
    // Draw some demo textured shapes
    this.create_boundaries(graphics_state);
    this.create_aliens(graphics_state, alien_matrix)

    this.shapes.ball.draw(graphics_state, this.ship_matrix, this.shape_materials[1] || this.plastic);
    this.shapes.ball.draw(graphics_state, this.shoot_matrix.times(Mat4.scale(Vec.of(.5, .5, .5))), this.shape_materials[1] || this.plastic);
  }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;
