window.Star = window.classes.Star = class Star extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast(
            [-0.3,0.3,0.3],[0,1,0],[0.3,0.3,0.3],
            [0.3,0.3,0.3],[0,1,0],[0.3,0.3,-0.3],
            [0.3,0.3,-0.3],[0,1,0],[-0.3,0.3,-0.3],
            [-0.3,0.3,-0.3],[0,1,0],[-0.3,0.3,0.3],

            [0.3,0.3,0.3],[1,0,0],[0.3,-0.3,0.3],
            [0.3,-0.3,0.3],[1,0,0],[0.3,-0.3,-0.3],
            [0.3,-0.3,-0.3],[1,0,0],[0.3,0.3,-0.3],
            [0.3,0.3,-0.3],[1,0,0],[0.3,0.3,0.3],

            [-0.3,-0.3,0.3],[0,-1,0],[0.3,-0.3,0.3],
            [0.3,-0.3,0.3],[0,-1,0],[0.3,-0.3,-0.3],
            [0.3,-0.3,-0.3],[0,-1,0],[-0.3,-0.3,-0.3],
            [-0.3,-0.3,-0.3],[0,-1,0],[-0.3,-0.3,0.3],

            [-0.3,0.3,0.3],[-1,0,0],[-0.3,-0.3,0.3],
            [-0.3,-0.3,0.3],[-1,0,0],[-0.3,-0.3,-0.3],
            [-0.3,-0.3,-0.3],[-1,0,0],[-0.3,0.3,-0.3],
            [-0.3,0.3,-0.3],[-1,0,0],[-0.3,0.3,0.3],

            [-0.3,0.3,0.3],[0,0,1],[0.3,0.3,0.3],
            [0.3,0.3,0.3],[0,0,1],[0.3,-0.3,0.3],
            [0.3,-0.3,0.3],[0,0,1],[-0.3,-0.3,0.3],
            [-0.3,-0.3,0.3],[0,0,1],[-0.3,0.3,0.3],

            [-0.3,0.3,-0.3],[0,0,-1],[0.3,0.3,-0.3],
            [0.3,0.3,-0.3],[0,0,-1],[0.3,-0.3,-0.3],
            [0.3,-0.3,-0.3],[0,0,-1],[-0.3,-0.3,-0.3],
            [-0.3,-0.3,-0.3],[0,0,-1],[-0.3,0.3,-0.3]));


        for(var i = 0; i < 24; i++){
            let a = this.positions[i*3],
                b = this.positions[i*3+1],
                c = this.positions[i*3+2];

            //let normal = b.minus(a).cross(c.minus(a)).normalized();
            let normal = Vec.of(1,1,1)

            this.normals.push(normal);
            this.normals.push(normal);
            this.normals.push(normal);

            let x = Math.random()/2;
            let y = Math.random()/2;
            
            this.texture_coords.push(Vec.of(x,y));
            this.texture_coords.push(Vec.of(x,y+0.1));
            this.texture_coords.push(Vec.of(x+0.1,y));

        }


        this.indices.push(
            0,1,2,
            3,4,5,
            6,7,8,
            9,10,11,
            12,13,14,
            15,16,17,
            18,19,20,
            21,22,23,
            24,25,26,
            27,28,29,
            30,31,32,
            33,34,35,
            36,37,38,
            39,40,41,
            42,43,44,
            45,46,47,
            48,49,50,
            51,52,53,
            54,55,56,
            57,58,59,
            60,61,62,
            63,64,65,
            66,67,68,
            69,70,71);
    }
}

window.TriangularPrism = window.classes.TriangularPrism = class TriangularPrism extends Shape {
    constructor() { 
        // Name the values we'll define per each vertex.
        super("positions", "normals", "texture_coords");
        
        this.positions.push(...Vec.cast(
            [0, 0,  1], [ 0, 1,  1], [1, 0,  1],
            [0, 0, -1], [ 0, 1, -1], [1, 0, -1],
            [0, 0,  1], [ 0, 0, -1], [1, 0, -1], [1, 0, 1],
            [0, 0,  1], [ 0, 0, -1], [0, 1, -1], [0, 1, 1],
            [1, 0,  1], [ 1, 0, -1], [0, 1, -1], [0, 1, 1]));

        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        const r2 = Math.sqrt(2);
        this.normals.push(...Vec.cast(
            [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1],
            [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1],
            [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0],
            [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], [-1,  0,  0],
            [r2, r2,  0], [r2, r2,  0], [r2, r2,  0], [r2, r2,  0]));

        // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
        // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
        // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push(
            0, 1, 2,
            3, 4, 5,
            6, 7, 8, 6, 8, 9,
            10, 11, 12, 10, 13, 12,
            14, 15, 16, 14, 17, 16);
    }
}

window.Missile = window.classes.Missile = class Missile extends Shape {
    constructor(max_subdivisions) {
        super("positions", "normals", "texture_coords");

        // Start from the following equilateral tetrahedron:
        this.positions.push(...Vec.cast([0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]));

        // Begin recursion.
        this.subdivideTriangle(0, 1, 2, max_subdivisions);
        this.subdivideTriangle(3, 2, 1, max_subdivisions);
        this.subdivideTriangle(1, 0, 3, max_subdivisions);
        this.subdivideTriangle(0, 2, 3, max_subdivisions);

        for (let p of this.positions) {
            this.normals.push(p.copy());
            this.texture_coords.push(Vec.of(
                0.5 + Math.atan2(p[2], p[0]) / (2 * Math.PI),
                0.5 - Math.asin(p[1]) / Math.PI));
        }

        // Fix the UV seam by duplicating vertices with offset UV
        let tex = this.texture_coords;
        for (let i = 0; i < this.indices.length; i += 3) {
            const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
            if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
                && [a, b, c].some(x => tex[x][0] < 0.5))
            {
                for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
                    if (tex[q[0]][0] < 0.5) {
                        this.indices[q[1]] = this.positions.length;
                        this.positions.push(this.positions[q[0]].copy());
                        this.normals.push(this.normals[q[0]].copy());
                        tex.push(tex[q[0]].plus(Vec.of(1, 0)));
                    }
                }
            }
        }
    }

    subdivideTriangle(a, b, c, count) {
        if (count <= 0) {
            this.indices.push(a, b, c);
            return;
        }

//         midpoints, unitvector from a to b
        let ab_vert = this.positions[a].mix(this.positions[b], .5).minus(Vec.of(0,0,.2)).normalized(),
            ac_vert = this.positions[a].mix(this.positions[c], .5).minus(Vec.of(0,0,.2)).normalized(),
            bc_vert = this.positions[b].mix(this.positions[c], .5).minus(Vec.of(0,0,.2)).normalized();

        // indices of new points
        let ab = this.positions.push(ab_vert) - 1,
            ac = this.positions.push(ac_vert) - 1,
            bc = this.positions.push(bc_vert) - 1;

        this.subdivideTriangle( a, ab, ac, count - 1);
        this.subdivideTriangle(ab,  b, bc, count - 1);
        this.subdivideTriangle(ac, bc,  c, count - 1);
        this.subdivideTriangle(ab, bc, ac, count - 1);
    }
}

window.Torus = window.classes.Torus = class Torus extends Shape {
    constructor(rows, columns) {
        super("positions", "normals", "texture_coords");
        const circle_points = Array(rows).fill(Vec.of(.75, 0, 0)).map((p,i,a)=>Mat4.translation([-1, 0, 0]).times(Mat4.rotation(i / (a.length - 1) * 2 * Math.PI, Vec.of(0, -1, 0))).times(p.to4(1)).to3());
        Surface_Of_Revolution.insert_transformed_copy_into(this, [rows, columns, circle_points]);
    }
}

window.Grid_Patch = window.classes.Grid_Patch = class Grid_Patch extends Shape {
    constructor(width, height, next_row_function, next_column_function, texture_coord_range=[[0, width], [0, height]]) {
        super("positions", "normals", "texture_coords");
        let points = [];
        for (let left = 0; left <= width; left++) {
            points.push(new Array(height + 1));
            points[left][0] = next_row_function(left / width, points[left - 1] && points[left - 1][0]);
        }
        for (let left = 0; left <= width; left++)
            for (let k = 0; k <= height; k++) {
                if (k > 0)
                    points[left][k] = next_column_function(k / height, points[left][k - 1], left / width);
                this.positions.push(points[left][k]);
                const a1 = k / height
                  , a2 = left / width
                  , x_range = texture_coord_range[0]
                  , y_range = texture_coord_range[1];
                this.texture_coords.push(Vec.of((a1) * x_range[1] + (1 - a1) * x_range[0], (a2) * y_range[1] + (1 - a2) * y_range[0]));
            }
        for (let left = 0; left <= width; left++)
            for (let k = 0; k <= height; k++) {
                let nowPos = points[left][k]
                  , nextTo = new Array(4)
                  , normal = Vec.of(0, 0, 0);
                for (let[y,dir] of [[-1, 0], [0, 1], [1, 0], [0, -1]].entries())
                    nextTo[y] = points[left + dir[1]] && points[left + dir[1]][k + dir[0]];
                for (let y = 0; y < 4; y++)
                    if (nextTo[y] && nextTo[(y + 1) % 4])
                        normal = normal.plus(nextTo[y].minus(nowPos).cross(nextTo[(y + 1) % 4].minus(nowPos)));
                normal.normalize();
                if (normal.every(x=>x == x) && normal.norm() > .01)
                    this.normals.push(Vec.from(normal));
                else
                    this.normals.push(Vec.of(0, 0, 1));
            }
        for (var x = 0; x < width; x++)
            for (var y = 0; y < 2 * height; y++)
                for (var z = 0; z < 3; z++)
                    this.indices.push(x * (height + 1) + height * ((y + (z % 2)) % 2) + (~~((z % 3) / 2) ? (~~(y / 2) + 2 * (y % 2)) : (~~(y / 2) + 1)));
    }
    static sample_array(array, ratio) {
        const frac = ratio * (array.length - 1)
          , alpha = frac - Math.floor(frac);
        return array[Math.floor(frac)].mix(array[Math.ceil(frac)], alpha);
    }
}

window.Surface_Of_Revolution = window.classes.Surface_Of_Revolution = class Surface_Of_Revolution extends Grid_Patch {
    constructor(rows, columns, points, texture_coord_range, total_curvature_angle=2 * Math.PI) {
        const row_operation = i=>Grid_Patch.sample_array(points, i)
          , column_operation = (j,p)=>Mat4.rotation(total_curvature_angle / columns, Vec.of(0, 0, 1)).times(p.to4(1)).to3();
        super(rows, columns, row_operation, column_operation, texture_coord_range);
    }
}


window.Square = window.classes.Square = class Square extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");
        this.positions.push(     ...Vec.cast([-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0] ));
        this.normals.push(       ...Vec.cast([ 0,  0, 1], [0,  0, 1], [ 0, 0, 1], [0, 0, 1] ));
        this.texture_coords.push(...Vec.cast([ 0, 0],     [1, 0],     [ 0, 1],    [1, 1]   ));
        this.indices.push(0, 1, 2, 1, 3, 2);
    }
}

window.Circle = window.classes.Circle = class Circle extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([0, 0, 0], [1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1], [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0.5, 0.5], [1, 0.5]));

        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 0]));
            this.normals.push(...Vec.cast(  [0,    0,    1]));
            this.texture_coords.push(...Vec.cast([(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                0, id - 1, id);
        }
    }
}

window.Cube = window.classes.Cube = class Cube extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast(
            [-1,  1, -1], [-1, -1, -1], [ 1,  1, -1], [ 1, -1, -1],
            [-1, -1,  1], [ 1, -1,  1], [-1,  1,  1], [ 1,  1,  1],
            [-1,  1,  1], [ 1,  1,  1], [-1,  1, -1], [ 1,  1, -1],
            [-1, -1, -1], [ 1, -1, -1], [-1, -1,  1], [ 1, -1,  1],
            [-1, -1, -1], [-1, -1,  1], [-1,  1, -1], [-1,  1,  1],
            [ 1, -1, -1], [ 1, -1,  1], [ 1,  1, -1], [ 1,  1,  1] 
        ));

        this.texture_coords.push(...Vec.cast(
            [0,    2/3], [0.25, 2/3], [0,    1/3], [0.25, 1/3],
            [0.5,  2/3], [0.5,  1/3], [0.75, 2/3], [0.75, 1/3],
            [0.75, 2/3], [0.75, 1/3], [1,    2/3], [1,    1/3],
            [0.25, 2/3], [0.25, 1/3], [0.5,  2/3], [0.5,  1/3],
            [0.25, 2/3], [0.5,  2/3], [0.25, 1  ], [0.5,  1  ],
            [0.25, 1/3], [0.5,  1/3], [0.25, 0  ], [0.5,  0  ]
        )); 

        this.normals.push(...Vec.cast(
            ...Array(4).fill([ 0,  0, -1]),
            ...Array(4).fill([ 0,  0,  1]),
            ...Array(4).fill([ 0,  1,  0]),
            ...Array(4).fill([ 0, -1,  0]),
            ...Array(4).fill([-1,  0,  0]),
            ...Array(4).fill([ 1,  0,  0])
        ));

        this.indices.push(
            0, 2, 1, 1, 2, 3,
            4, 5, 6, 5, 7, 6,
            8, 9, 10, 9, 11, 10,    
            12, 13, 14, 13, 15, 14,
            16, 19, 18, 16, 17, 19,
            20, 22, 21, 21, 22, 23
        );
    }
}


window.SimpleCube = window.classes.SimpleCube = class SimpleCube extends Shape {
    constructor() {
      super( "positions", "normals", "texture_coords" );
      for( var i = 0; i < 3; i++ )                    
        for( var j = 0; j < 2; j++ ) {
          var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0, Vec.of(1, 0, 0) )
                         .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ), Vec.of( 0, 1, 0 ) ) )
                         .times( Mat4.translation([ 0, 0, 1 ]) );
          Square.insert_transformed_copy_into( this, [], square_transform );
      }
    }
}

window.Tetrahedron = window.classes.Tetrahedron = class Tetrahedron extends Shape {
    constructor(using_flat_shading) {
        super("positions", "normals", "texture_coords");
        const s3 = Math.sqrt(3) / 4,
            v1 = Vec.of(Math.sqrt(8/9), -1/3, 0),
            v2 = Vec.of(-Math.sqrt(2/9), -1/3, Math.sqrt(2/3)),
            v3 = Vec.of(-Math.sqrt(2/9), -1/3, -Math.sqrt(2/3)),
            v4 = Vec.of(0, 1, 0);

        this.positions.push(...Vec.cast(
            v1, v2, v3,
            v1, v3, v4,
            v1, v2, v4,
            v2, v3, v4));

        this.normals.push(...Vec.cast(
            ...Array(3).fill(v1.plus(v2).plus(v3).normalized()),
            ...Array(3).fill(v1.plus(v3).plus(v4).normalized()),
            ...Array(3).fill(v1.plus(v2).plus(v4).normalized()),
            ...Array(3).fill(v2.plus(v3).plus(v4).normalized())));

        this.texture_coords.push(...Vec.cast(
            [0.25, s3], [0.75, s3], [0.5, 0], 
            [0.25, s3], [0.5,  0 ], [0,   0],
            [0.25, s3], [0.75, s3], [0.5, 2 * s3], 
            [0.75, s3], [0.5,  0 ], [1,   0]));

        this.indices.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
    }
}

window.Cylinder = window.classes.Cylinder = class Cylinder extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 1], [1, 0, -1]));
        this.normals.push(...Vec.cast(  [1, 0, 0], [1, 0,  0]));
        this.texture_coords.push(...Vec.cast([0, 1], [0, 0]));

        for (let i = 0; i < sections; ++i) {
            const ratio = (i + 1) / sections,
                angle = 2 * Math.PI * ratio,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = 2 * i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 1], [v[0], v[1], -1]));
            this.normals.push(...Vec.cast(  [v[0], v[1], 0], [v[0], v[1],  0]));
            this.texture_coords.push(...Vec.cast([ratio, 1], [ratio, 0]));
            this.indices.push(
                id, id - 1, id + 1,
                id, id - 1, id - 2);
        }
    }
}



window.Cone = window.classes.Cone = class Cone extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([1, 0.5]));

        let t = Vec.of(0, 0, 1);
        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle), 0),
                id = 2 * i + 1;

            this.positions.push(...Vec.cast(t, v));
            this.normals.push(...Vec.cast(
                v.mix(this.positions[id - 1], 0.5).plus(t).normalized(),
                v.plus(t).normalized()));
            this.texture_coords.push(...Vec.cast([0.5, 0.5], [(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                id - 1, id, id + 1);
        }
    }
}

// This Shape defines a Sphere surface, with nice (mostly) uniform triangles.  A subdivision surface
// (see) Wikipedia article on those) is initially simple, then builds itself into a more and more 
// detailed shape of the same layout.  Each act of subdivision makes it a better approximation of 
// some desired mathematical surface by projecting each new point onto that surface's known 
// implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
// face, connect the midpoints of each edge together to make more faces.  Repeat recursively until 
// the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
// unit sphere) and group them into triangles by following the predictable pattern of the recursion.
window.Subdivision_Sphere = window.classes.Subdivision_Sphere = class Subdivision_Sphere extends Shape {
    constructor(max_subdivisions) {
        super("positions", "normals", "texture_coords");

        // Start from the following equilateral tetrahedron:
        this.positions.push(...Vec.cast([0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]));

        // Begin recursion.
        this.subdivideTriangle(0, 1, 2, max_subdivisions);
        this.subdivideTriangle(3, 2, 1, max_subdivisions);
        this.subdivideTriangle(1, 0, 3, max_subdivisions);
        this.subdivideTriangle(0, 2, 3, max_subdivisions);

        for (let p of this.positions) {
            this.normals.push(p.copy());
            this.texture_coords.push(Vec.of(
                0.5 + Math.atan2(p[2], p[0]) / (2 * Math.PI),
                0.5 - Math.asin(p[1]) / Math.PI));
        }

        // Fix the UV seam by duplicating vertices with offset UV
        let tex = this.texture_coords;
        for (let i = 0; i < this.indices.length; i += 3) {
            const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
            if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
                && [a, b, c].some(x => tex[x][0] < 0.5))
            {
                for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
                    if (tex[q[0]][0] < 0.5) {
                        this.indices[q[1]] = this.positions.length;
                        this.positions.push(this.positions[q[0]].copy());
                        this.normals.push(this.normals[q[0]].copy());
                        tex.push(tex[q[0]].plus(Vec.of(1, 0)));
                    }
                }
            }
        }
    }

    subdivideTriangle(a, b, c, count) {
        if (count <= 0) {
            this.indices.push(a, b, c);
            return;
        }

        let ab_vert = this.positions[a].mix(this.positions[b], 0.5).normalized(),
            ac_vert = this.positions[a].mix(this.positions[c], 0.5).normalized(),
            bc_vert = this.positions[b].mix(this.positions[c], 0.5).normalized();

        let ab = this.positions.push(ab_vert) - 1,
            ac = this.positions.push(ac_vert) - 1,
            bc = this.positions.push(bc_vert) - 1;

        this.subdivideTriangle( a, ab, ac, count - 1);
        this.subdivideTriangle(ab,  b, bc, count - 1);
        this.subdivideTriangle(ac, bc,  c, count - 1);
        this.subdivideTriangle(ab, bc, ac, count - 1);
    }
}