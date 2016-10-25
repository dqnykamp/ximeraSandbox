//TODO: Below this is the start of the menu framework. We will come back to this when we have a better sense of what the menu will need to accomplish.

(function (ns, $) {

var addCenterCameraButton = function(menuID){

	var button = $(menuID).append('<button onclick="findAppletInstance(this)">Center Camera</button>');

}
addCenterCameraButton('#dropdownMenu1');



//CAMERA MANIPULATION
	ns.addCenterCameraButton = function(menuID){
		var button = $(menuID).append('<button class="centerCameraButton">Center Camera</button>');
	}


//Note--Camera centering currently requires maintaining name standards applet1, applet2, applet3
ns.findAppletInstance = function(appletInstanceName){

	switch(appletInstanceName) {
	case "applet1":
		centerCamera(ns.applet1);
		break;
	case "applet2":
		centerCamera(ns.applet2);
		break;
	case "applet3":
		centerCamera(ns.applet3);
		break;
	default:
		break;
	}
}


var centerCamera = function(appletInstance){
	
	//Get original camera properties stored at the beginning of applet run
	var cameraProperties = appletInstance.getObject('cameraProperties');
	var camera = appletInstance.getObject('camera');
	
	cameraProperties.controls.reset();
	camera.fov = cameraProperties.VIEW_ANGLE;
	camera.aspect = cameraProperties.ASPECT;
	camera.near = cameraProperties.NEAR;
	camera.far = cameraProperties.FAR;
	camera.position.set(cameraProperties.position.x, cameraProperties.position.y, cameraProperties.position.z);
	camera.up = cameraProperties.up;
    camera.lookAt(cameraProperties.lookAt);	
	camera.updateProjectionMatrix();
}




//Note--Camera centering currently requires maintaining name standards applet1, applet2, applet3
var findAppletInstance = function(event){

	var appletToCenter = $(event).parents('span').attr('id');
	
	switch(appletToCenter) {
	case "applet1":
		centerCamera(applet1);
		break;
	case "applet2":
		centerCamera(applet2);
		break;
	case "applet3":
		centerCamera(applet3);
		break;
	default:
		break;
	}
}





	
	/* 	This generates a series of text input fields that model an array. Values are set to 0 by default, but can be predefined
	*	Takes a parameters object {} -- the only required param is an id string for the matrix
	*	id: This id will be attached to the matrix on the page to allow for value retrieval
	*	numRows: number of rows in the matrix, default is 3
	*	numColumns: number of columns in the matrix, default is 3
	*	defaultVal: specifies the default value for use when no matrix is provided.
					The default is 0. If set to be a string, value will be matrix positions: Aij
	*	matrix: an array of arrays representing a predefined matrix to be used, does not exist/is not used by default
	*/
	var generateMatrixField = function (params){
	
		if (params === undefined){
			params = {};
		}
		if (params.numRows === undefined){
			params.numColumns = 3;
		}
		if (params.numRows === undefined){
			params.numColumns = 3;
		}
		if (params.defaultVal === undefined) {
			params.defaultVal = 0;
		}
			
			
		//This is the jQuery object containing all necessary text fields that will be returned	
		var matrixHTML = $(document.createElement('div'));

		if (params.matrix === undefined){//If no matrix is specified, all matrix values will be 0
		
			for (var i = 1; i <= params.numRows; i++){
			
				var matrixRow = $(document.createElement('form'));
			
				for (var j = 1; j <= params.numColumns; j++){
				
					if (typeof(params.defaultVal) === 'string'){
						var matrixEntry = $(document.createElement('input')).prop('type', 'text').attr('value', 'A'+i+j);
					}
					else {
						var matrixEntry = $(document.createElement('input')).prop('type', 'text').attr('value', params.defaultVal);
					}
					matrixRow.append(matrixEntry);
				}
				
				matrixHTML.append(matrixRow);
			}		
		}
		else if (params.matrix instanceof Array){

		
			for (var i = 0; i < params.matrix[0].length; i++){
				
				var matrixRow = $(document.createElement('form'));
			
				for (var j = 0; j < params.matrix[0].length; j++){
				
					var matrixEntry = $(document.createElement('input')).prop('type', 'text').attr('value', params.matrix[i][j]);
					matrixRow.append(matrixEntry);
					
				}
				
				matrixHTML.append(matrixRow);
			}	
		}
		else {
			console.error('Invalid matrix form.');
			return;
		}
		
		return matrixHTML;
	}
	
	
	var test = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
	
	
	var matrixHTML = generateMatrixField({ id: 'dropdownMenuContainer', defaultVal: '', matrix: test});
	$('#dropdownMenu1').append(matrixHTML);
	

	
	/*
	* Returns the matrix from a specified menu, e.g. #dropdownMenu1 in the following form:
	* matrix: [[[], [], [],], [[], []], []], where each sub-array represents a matrix, and each sub-sub-array represents a row
	* if there is a single matrix, the exterior matrix-representing array will be dropped for the sake of simplicity
	* Parameters
	* id: id of the specific menu being queried, e.g. dropdownMenu1 or #dropdownMenu1
	*/
		var retrieveMatrices = function(params) {
		
			if (params.id === undefined || typeof params.id !== 'string'){
				console.error('No menu id specified');
				return;
			}
			if (params.id.charAt(0) !== '#'){
				params.id = '#' + params.id;
			}
		
			var menu = $(document).find(params.id);
			
			var matrices = [];

			
			//Iterate through every row and column of the HTML to construct the array
			menu.find('div').each(function(){//For each matrix

				var matrix = [];
			
				$(this).find('form').each(function(){//for each row
					var row = [];
				
					$(this).find('input').each(function(){//for each entry
					
						row.push(this.value);
					
					})

					matrix.push(row);

				})
				matrices.push(matrix);
			});
		
		if (matrices.length == 1){//if there was only one matrix in the control panel
			matrices = matrices[0];
		}
			return matrices;
		}
		
		var matrix = retrieveMatrices({id: '#dropdownMenu1'});

	
		/*
		* Generates parameter forms within a given dropdown menu
		* Parameters:
		* id: the id of the dropdown menu, e.g.#dropdownMenu1
		*  Any additional parameters will be incorporated as input boxes, e.g. <input type="text"></input> etc.
		*
		*/
	
		var generateParameterFields = function(params){
		
			if (params.id === undefined || typeof params.id !== 'string'){
				console.error('No dropdown id specified.');
				return;
			}
			
			var header = $(document.createElement('div')).attr('id', params.id + 'Parameters');
			var form = $(document.createElement('form'));
			header.append(form);
			
			for (var param in params){
			
			//TODO label is currently not showing
				if (param !== 'id'){
					var item = $(document.createElement('input')).prop('type', 'text').attr('value', params[param]).attr('style', 'display:block;').attr('name', params.id + param).attr('id', params.id + param);
					var label = $(document.createElement('label')).attr('for', params.id + param).html(param);
					item.append(label);
					form.append(item);
				}
			
			}
			
		$('#' + params.id).append(header);
		
		}
		
		var paramFields = generateParameterFields({id: 'dropdownMenu1', op1: "op1", op2: "op2", op3: 'op3', op4: 'op4'});
	

	
		/*
		* Returns the value parameters from a specified menu, e.g. #dropdownMenu1 in the following form:
		* paramsObj = 	{
							x:5,
							y:10, etc.
						}
		* Parameters
		* id: id of the specific menu being queried, e.g. dropdownMenu1 or #dropdownMenu1
		*/
		var retrieveParameters = function(params) {
		
			var paramsObj = {};
			
			//TODO left off here
		
		
		
		
		}
	
	

	
		/*
		*	Returns all information entered into a given form (specified by id) in the following form:
		*	menuInfo = {
		*	matrix : [[[], [], []], [[], [],], []] etc. as specified by retrieve matrices
		*	parameters: {
		*					param1: val1,
		*					param2: vale2, etc.
		*				}
		*	sliders: {
		*					slider1: val1,
		*					slider2: val2, etc.
		*				}
		*		  }
		*	Parameters:
		*	id: specifies the id of the dropdown menu
		*/
	
	
		//var retrieveAllMenuInformation = function (params){
		//
		//	if (params.id === undefined){
		//		console.error('Invalid parameter id.');
		//		return;
		//	}
		//	
		//	var menu = $('#' + params.id);
		//	
		//	var menuInfo = {};
		//	
		//	menuInfo.matrix = retrieveMatrices({id: params.id});
		//	menuInfo.parameters = //TODO left off here
		//	
		//	
		//
		//
		//}
	
	
	
	
	
	
















}(ed, $));
