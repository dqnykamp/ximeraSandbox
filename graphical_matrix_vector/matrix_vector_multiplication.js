define(['jsxgraph', 'db', 'numeric'], function(JXG, db, numeric) {
    "use strict";

    var target=this;
    
    target.width(400);
    target.height(400);

    JXG.Options.board.showCopyright=false;
    JXG.Options.axis.ticks.majorHeight = 20

    var a11=1, a12=3, a21=1, a22=1;

    var eigs=[];
    var real_evals=false;
    var evect1=[], evect2=[];
    var re_lambda, im_lambda, lambda1, lambda2;
    var found_evect1=false, found_evect2=false;
    var xevecs = [];
    var n_vectors=2;
    var xvar="v";
    var Avar="A";
    var n_round = 5;

    /*
    var Axtexts=[];
    var AxtextIds=[];
    for(var i=0; i<n_vectors; i++) {
	Axtexts.push("");
	AxtextIds.push(document.getElementById("Ax" + (i+1) + "calc"));
    }
    */
    
    function calculate_eigs() {
	eigs=numeric.eig([[a11, a12],[a21,a22]]);

	if(typeof eigs.lambda.y === "undefined") {
	    real_evals=true;
	    lambda1=eigs.lambda.x[0];
	    lambda2=eigs.lambda.x[1];
	    evect1=[eigs.E.x[0][0], eigs.E.x[1][0]];
	    evect2=[eigs.E.x[0][1], eigs.E.x[1][1]];
	    console.log("eigenvalues: " + lambda1 + ", " + lambda2);
	}
	else { 
	    real_evals=false;
	    re_lambda=eigs.lambda.x[0];
	    im_lambda=Math.abs(eigs.lambda.y[0]);
	    console.log("eigenvalues: " + re_lambda + " +- " + im_lambda + "i");
	}
    }

    var snapThreshold = Math.cos(0.1);
    var board = JXG.JSXGraph.initBoard($(target).attr('id'),
				       {boundingbox: [-4, 4, 4, -4],
					axis: true});

    var xs_orig=[];  // coordinates of original position of points
    var xs=[]; // coordinates of points after possible snapping to eigenvectors
    
    var xpts=[];
    var xvecs=[];
    var Axpts=[];
    var Axvecs=[];
    var colors = ["red", "blue", "green", "cyan"];

    for(var i=0; i<n_vectors; i++) {
	// create vector x[i] and transformed vector Ax[i]
	var color = colors[i % colors.length];

	var x=[Math.cos(i), Math.sin(i)];
	xs_orig.push(x);
	xs.push(x);
	
	var xmag = Math.sqrt(x[0]*x[0]+x[1]*x[1]);
	var xpt=board.create('point', x,
			     {color: color, name: "X"+i,
			      withLabel: false});
	xpts.push(xpt);
	
	var xvec = board.create('line', [[0,0],xpt],
				{straightFirst: false, straightLast: false,
				 lastArrow: true, fixed: true,
				 strokeColor: color, strokeWidth: 4,
				 highlightStrokeColor: color,
				});
	xvecs.push(xvec);

	var Axpt = (function () {
	    // Use closure so that Axpt can be defined
	    // with the value of the variable xpt in this pass of the loop
	    var pt = xpt;
	    return board.create('point',
				[function() {return a11*pt.X()+a12*pt.Y();},
				 function() {return a21*pt.X()+a22*pt.Y();}],
				{visible: false,});

	})();

	Axpts.push(Axpt);

	var Axvec = board.create('line', [[0,0],Axpt],
				 {straightFirst: false, straightLast: false,
				  lastArrow: true,
				  strokeColor: color, strokeWidth:2,
				  highlightStrokeColor: color,
				  dash: 1,
				 });
	Axvecs.push(Axvec);
	
	xevecs.push(0);
    }


    // initialize db.xs_orig array if doesn't exist
    //if(db.xs_orig === undefined) {
    //  db.xs_orig = xs_orig;
    //}
    

    
    function update_vector_position(i) {
	
	// xs_orig[i] contains the original position of point
	// copy to xs[i],
	// check to see if xs[i] is close to an eigenvector
	// if close, snap xs[i] to the eigenvector
	// move the actually point xpts[i] on graph to position of xs[i]

	xs[i] = xs_orig[i];
	var xmag = Math.sqrt(xs[i][0]*xs[i][0]+xs[i][1]*xs[i][1]);
	xevecs[i]=0;
	
	if(real_evals) {
	    var proj = xs[i][0]*evect1[0]+xs[i][1]*evect1[1];
	    
	    if(Math.abs(proj)/xmag > snapThreshold) {
		xevecs[i]=1;
		xs[i][0] = evect1[0]*proj;
		xs[i][1] = evect1[1]*proj;
	    }
	    else {
		proj = xs[i][0]*evect2[0]+xs[i][1]*evect2[1];
		if(Math.abs(proj)/xmag > snapThreshold) {
		    xevecs[i]=2;
		    xs[i][0] = evect2[0]*proj;
		    xs[i][1] = evect2[1]*proj;
		}
	    }
	}
	xpts[i].coords.usrCoords=[1, xs[i][0], xs[i][1]];
	xpts[i].coords.usr2screen();

	xpts[i].update();
	Axpts[i].update();

	check_found_evects()
	//update_Axtext(i);

    }

    function check_found_evects() {

	found_evect1=false;
	found_evect2=false;


	for(var i=0; i<n_vectors; i++) {
	    if(xevecs[i]==1) {
		found_evect1=true;
	    }
	    else if(xevecs[i]==2) {
		found_evect2=true;
	    }
	}
    }


    /*
    for(var i=0; i<n_vectors; i++ ) {
	xpts[i].on('drag', function() {
	    db.xs_orig[i] = [xpts[i].X(), xpts[i].Y()];
	});
    }
    */
    for(var i=0; i<n_vectors; i++ ) {
	xpts[i].on('drag', update_db(i));
    }
    function update_db(i) {
	return function () {
	    console.log("update " + i);

	    if(!db.xs_orig) {
		db.xs_orig=[]
		for(var j=0; j<n_vectors; j++) {
		    db.xs_orig.push = [xpts[j].X(), xpts[j].Y()];
		}
	    }
	    else {
		console.log("before: " + db.xs_orig[i][0] + "," + db.xs_orig[i][1]);		db.xs_orig[i] = [xpts[i].X(), xpts[i].Y()];
	    }
	    console.log("after: " + db.xs_orig[i][0] + "," + db.xs_orig[i][1]);
	}
    }
       
    calculate_eigs();


    // callback if any variables from database are modified
    db( function(event) {
	if(db.xs_orig) {
	    for(var i=0; i<n_vectors; i++ ) {
		console.log(xs_orig[i][0] + ", " + xs_orig[i][1] + ", " + db.xs_orig[i][0] + ", " + db.xs_orig[i][1]);
		if(xs_orig[i] != db.xs_orig[i]) {
		    xs_orig[i] = db.xs_orig[i];
		    update_vector_position(i);
		}
	    }
	    board.update();
	}
    });


    function update_Axtext(i) {
	var x1str=Math.round10(xs[i][0],n_round);
	var x2str=Math.round10(xs[i][1],n_round);
	var a11str=Math.round10(a11,n_round), a12str=Math.round10(a12,n_round);
	var a21str=Math.round10(a21,n_round), a22str=Math.round10(a22,n_round);
	
	var Axtext="\\begin{align*}" + Avar + "\\vec{" + xvar + "}_" + (i+1) + "&=";
	Axtext += "\\begin{bmatrix}" + a11str + "&" + a12str + "\\\\"
	    + a21str + "&" + a22str +
	    "\\end{bmatrix}";
	Axtext += "\\begin{bmatrix}" + x1str + "\\\\" + x2str + "\\end{bmatrix}\\\\";
	Axtext += "&=\\begin{bmatrix}("+a11str+")("+x1str+")+("
	    +a12str+")("+x2str+")\\\\";
	Axtext += "("+a21str+")("+x1str+")+("+a22str+")("+x2str+")\\end{bmatrix}\\\\";
	Axtext += "&= \\begin{bmatrix}"
	    + Math.round10(a11*xs[i][0]+a12*xs[i][1],n_round) + "\\\\"
	    + Math.round10(a21*xs[i][0]+a22*xs[i][1],n_round) + "\\end{bmatrix}";
	Axtext += "\\end{align*}";
	Axtexts[i] = Axtext;
	AxtextIds[i].innerHTML = Axtext;
    }

});
