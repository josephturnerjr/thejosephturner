function createWorld() {
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-1000, -1000);
	worldAABB.maxVertex.Set(1000, 1000);
	var gravity = new b2Vec2(0, 300);
	var doSleep = true;
	var world = new b2World(worldAABB, gravity, doSleep);
	createGround(world);
    createSteps(world);
	createBox(world, 0, 125, 10, 250);
	createBox(world, 500, 125, 10, 250);
	return world;
}

function createGround(world) {
    var ground = createBox(world, -500, 340, 1000, 50, true);
    ground.GetShapeList().m_restitution = 0.2;
    return ground;
}

function createSteps(world){
    createBox(world, 25, 200, 25, 100);
    createBox(world, 75, 200, 25, 100);
    createBox(world, 125, 225, 25, 75);
    createBox(world, 175, 250, 25, 50);
    createBox(world, 225, 275, 25, 25);
}

function createBox(world, x, y, width, height, fixed) {
	if (typeof(fixed) == 'undefined') fixed = true;
	var boxSd = new b2BoxDef();
    boxSd.allowSleep = true;
	if (!fixed) boxSd.density = 1.0;
	boxSd.extents.Set(width, height);
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	return world.CreateBody(boxBd)
}
top = {};
var createBall = function(world, x, y, rad, fixed) {
	var ballSd = new b2CircleDef();
    ballSd.allowSleep = true;
	if (!fixed) ballSd.density = 1.0;
	ballSd.radius = rad || 10;
	ballSd.restitution = 0.9;
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
};
var createPoly = function(world, x, y, points, fixed) {
	var polySd = new b2PolyDef();
	if (!fixed) polySd.density = 1.0;
	polySd.vertexCount = points.length;
	for (var i = 0; i < points.length; i++) {
		polySd.vertices[i].Set(points[i][0], points[i][1]);
	}
	var polyBd = new b2BodyDef();
	polyBd.AddShape(polySd);
	polyBd.position.Set(x,y);
	return world.CreateBody(polyBd)
};
top.initWorld = function(world) {
    top.createBody(world, 50, 30, 0.2);
};
top.createBody = function(world, x, y, scale) {
	var torso= createBox(world, x, y, scale * 20, scale * 30, false);
    torso.SetLinearVelocity(new b2Vec2(Math.random() * 500.0, Math.random() * 1000.0 - 500.0))
	var head = createBall(world, x, y - scale * 60, scale * 25, false);
	var larm1 = createBox(world, x - scale * 50, y - scale * 30, scale * 20, scale * 7, false);
	var larm2 = createBox(world, x - scale * 100, y - scale * 30, scale * 20, scale * 7, false);
	var rarm1 = createBox(world, x + scale * 50, y - scale * 30, scale * 20, scale * 7, false);
	var rarm2 = createBox(world, x + scale * 100, y - scale * 30, scale * 20, scale * 7, false);
	var rleg1 = createBox(world, x - scale * 15, y + scale * 60, scale * 10, scale * 22, false);
	var rleg2 = createBox(world, x - scale * 15, y + scale * 106, scale * 10, scale * 18, false);
	var lleg1 = createBox(world, x + scale * 15, y + scale * 60, scale * 10, scale * 22, false);
	var lleg2 = createBox(world, x + scale * 15, y + scale * 106, scale * 10, scale * 18, false);

	var jointDef = new b2RevoluteJointDef();
	jointDef.collideConnected = true;

	jointDef.body2 = head;
	jointDef.body1 = torso;
	var t = head.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y + scale * 25;
	jointDef.anchorPoint.x = t.x;
	world.CreateJoint(jointDef);

	jointDef.body2 = larm1;
	jointDef.body1 = larm2;
	var t = larm1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y;
	jointDef.anchorPoint.x = t.x-scale * 25;
	world.CreateJoint(jointDef);

	jointDef.body2 = rarm1;
	jointDef.body1 = rarm2;
	var t = rarm1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y;
	jointDef.anchorPoint.x = t.x+scale * 25;
	world.CreateJoint(jointDef);

	jointDef.body2 = rleg1;
	jointDef.body1 = torso;
	var t = rleg1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y-scale * 27;
	jointDef.anchorPoint.x = t.x;
	world.CreateJoint(jointDef);

	jointDef.body2 = lleg1;
	jointDef.body1 = torso;
	var t = lleg1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y-scale * 27;
	jointDef.anchorPoint.x = t.x;
	world.CreateJoint(jointDef);

	jointDef.body2 = rleg1;
	jointDef.body1 = rleg2;
	var t = rleg1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y+scale * 27;
	jointDef.anchorPoint.x = t.x;
	world.CreateJoint(jointDef);

	jointDef.body2 = lleg1;
	jointDef.body1 = lleg2;
	var t = lleg1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y+scale * 27;
	jointDef.anchorPoint.x = t.x;
	world.CreateJoint(jointDef);

	jointDef.body2 = rarm1;
	jointDef.body1 = torso;
	var t = rarm1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y;
	jointDef.anchorPoint.x = t.x-scale * 25;
	world.CreateJoint(jointDef);

	jointDef.body2 = larm1;
	jointDef.body1 = torso;
	var t = larm1.GetCenterPosition();
	jointDef.anchorPoint = new b2Vec2();
	jointDef.anchorPoint.y = t.y;
	jointDef.anchorPoint.x = t.x+scale * 25;
	world.CreateJoint(jointDef);
};


