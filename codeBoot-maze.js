
var iota = function(n){ 
    return Array.from(Array(n).keys());
};

var contient = function(tab,x){
    return tab.includes(x);
};

var ajouter = function(tab,x){
    
    var newTab = Array.from(tab);
    
    if (!contient(newTab, x))
        newTab.push(x);
    
    return newTab;
};

var retirer = function(tab,x){

    return tab.filter(function(value){return value != x; });
};

var voisins = function(x, y, nx, ny){
    var cells = [];
	var currentCell = coordToCell(x,y,nx);
    if(y>0)
        cells.push(currentCell-nx);
    if(y<ny-1)
        cells.push(currentCell+nx);
        
    if(x>0)
        cells.push(currentCell-1);
    if(x<nx-1)
        cells.push(currentCell+1);

    return cells;
};

var cellToCoord = function(cell, nx){
	return [cell%nx, Math.floor(cell/nx)];
};

var coordToCell = function(x, y, nx){
	return y*nx + x;
};

var wallNumber = function(x,y,nx,cote){
    var cell = coordToCell(x, y, nx);
    const directions = { "N": 0, "E": y+1, "O": y, "S": nx };
    
    return coordToCell(x, y, nx) + directions[cote];
};

var randomElement = function(elements){
    return elements[Math.floor(Math.random() * elements.length)];
};


var getWallBetween = function(cell1, cell2, nx){
    const directionsTowardsSmallestCell = ["N", "O"];
    
	var coord1 = cellToCoord(cell1, nx);
	var coord2 = cellToCoord(cell2, nx);
	
    var axisIndex = coord1[0] == coord2[0] ? 0 : 1;
    var biggestCell = Math.max(cell1, cell2);
    var biggestCellCoord = cellToCoord(biggestCell, nx);
    
    return [axisIndex, wallNumber(biggestCellCoord[0], biggestCellCoord[1], nx, directionsTowardsSmallestCell[axisIndex])];
};


var generateWalls = function(nx, ny){
    
    var walls = [iota(nx*(ny+1)), iota(ny*(nx+1))];
    
    var initialCell = Math.floor((Math.random() *nx*ny ));
    var initialCoords = cellToCoord(initialCell, nx);
    
    var allCells = iota(nx*ny);
    var cave = [initialCell];
    var front = voisins(initialCoords[0], initialCoords[1], nx, ny);

    while(front.length != 0){

    	var chosenCell = randomElement(front);
        front = retirer(front, chosenCell);
        var chosenCellCoords = cellToCoord(chosenCell, nx);
        var frontChosenCell = voisins(chosenCellCoords[0], chosenCellCoords[1], nx, ny);
        
        const caveChosenCell = randomElement(frontChosenCell.filter( function(cell){ return contient(cave, cell);} ));
        
        //Garder ceux qui ne sont pas dans la cave
        frontChosenCell = frontChosenCell.filter( function(cell){ return !contient(cave, cell);});
        frontChosenCell.forEach( function(cell){ front = ajouter(front, cell); });

    	cave = ajouter(cave, chosenCell);
        
        //Ajouter mur
        var newWall = getWallBetween(chosenCell, caveChosenCell, nx);

        walls[newWall[0]] = retirer(walls[newWall[0]], newWall[1]);
    	  
    };
    
    walls[0] = retirer(walls[0], 0);
    walls[0] = retirer(walls[0], nx* (ny+1) - 1);
    
   return walls;
};

const BASE_X_RES= 1600;
var drawMaze = function(walls, nx, ny, pas, solution){
    SCALE_FACTOR = BASE_X_RES/(nx*pas);

	var translationX = 20;	    
    var translationY = 20;

    var id = 'maze' + (solution ? 'Sol': '');
    var svg = `<svg id="${id}" 
                    width="${2*translationX + nx*SCALE_FACTOR*pas}" height="${2*translationY + ny*SCALE_FACTOR*pas}" > `;

    walls[1].forEach(function(wall){
        svg += `<line  x1="${translationX + wall%(nx+1)*pas*SCALE_FACTOR}" y1="${translationY + SCALE_FACTOR*Math.floor(wall/(nx+1))*pas}" 
                       x2="${translationX + wall%(nx+1)*pas*SCALE_FACTOR}" y2="${translationY + SCALE_FACTOR*Math.floor(wall/(nx+1))*pas + SCALE_FACTOR*pas}"
                       style="stroke:rgb(0,0,0);stroke-width:2" />`
    });
    
    walls[0].forEach(function(wall){
        svg += `<line  x1="${translationX + wall%(nx)*pas*SCALE_FACTOR}" y1="${translationY + SCALE_FACTOR*Math.floor(wall/nx)*(pas)}" 
                       x2="${translationX + wall%(nx)*pas*SCALE_FACTOR + SCALE_FACTOR*pas}" y2="${translationY + SCALE_FACTOR*Math.floor(wall/nx)*(pas)}"
                       style="stroke:rgb(0,0,0);stroke-width:2" />`

    });

    if(solution) {              
        for(var i = 0;i < solution.length - 1; ++i){
            var currentPos = solution[i];
            var nextPos = solution[i+1];

            svg += `<line  x1="${pas*SCALE_FACTOR/2 + translationX + currentPos[0]*pas*SCALE_FACTOR}" y1="${pas*SCALE_FACTOR/2 + translationY + currentPos[1]*pas*SCALE_FACTOR}" 
                        x2="${pas*SCALE_FACTOR/2 + translationX + nextPos[0]*pas*SCALE_FACTOR}" y2="${pas*SCALE_FACTOR/2 + translationY + nextPos[1]*pas*SCALE_FACTOR}"
                        style="stroke:rgb(255,0,0);stroke-width:2" />`
        }
    }

    svg += "</svg>";
    document.getElementById(id + "Div").innerHTML += svg;

};

var laby = function(nx, ny, pas){
    var walls = generateWalls(nx, ny);
    drawMaze(walls, nx, ny, pas);
};

var getPossibleDirections = function(pos, walls, oldDirection, nx, ny) {
    var neighbours = voisins(pos[0], pos[1], nx, ny);
    var previousCell = coordToCell(pos[0] - oldDirection[0], pos[1] - oldDirection[1], nx);
    var currentCell = coordToCell(pos[0], pos[1], nx);
    
    // On ne veut pas revenir en arriere
    neighbours = retirer(neighbours, previousCell);
    var possibleDirections = [];
    neighbours.forEach(function(cell){
    	var wallBetween = getWallBetween(cell, currentCell, nx);

    	var cellCoord = cellToCoord(cell, nx);
        if (!contient(walls[wallBetween[0]], wallBetween[1])){
        	possibleDirections.push([cellCoord[0] - pos[0], cellCoord[1] - pos[1]]);
        }
    });
    return possibleDirections;
};

var stepFoward = function(pos, direction) {
	return [pos[0] + Number(direction[0]), pos[1] + Number(direction[1])];
};

var isTheEnd = function(pos, nx, ny) {
	return (pos[0] == nx-1 && pos[1] == ny-1);
};
var quickestPath = function(pos, walls, direction, nx, ny){
	var possibleDirections = getPossibleDirections(pos, walls, direction, nx, ny);
  
    	
    if (isTheEnd(pos, nx, ny))
        return [pos];
        
    for(var i = 0;i < possibleDirections.length; ++i){
        var newDirection = possibleDirections[i];
        var foundPath = quickestPath(stepFoward(pos, newDirection), walls, newDirection, nx, ny);
        if (foundPath) {
        	foundPath.push(pos);
        	return foundPath;
        }
    }
  	return false;
};

var calculateAngle = function(pos, nextPos){
    var direction = [nextPos[0] - pos[0], nextPos[1] - pos[1]];
    if (direction[0] == 1) 
        return 90;
    if (direction[0] == -1) 
        return 270;
    if (direction[1] == 1) 
        return 180;
    return 0;
};

var labySol = function(nx, ny, pas) {
	var walls = generateWalls(nx, ny);
    
    var path = quickestPath([0,0], walls, [0, 1], nx, ny);
    path.push([0, -1]);
    path.reverse();
    path.push([nx - 1, ny ]);
    path.reverse();

    drawMaze(walls, nx, ny, pas);
    drawMaze(walls, nx, ny, pas, path);

};

function resize() {
    document.getElementById("maze").remove();
    document.getElementById("mazeSol").remove();

    var width = Number(document.getElementById("Width").value);
    var height = Number(document.getElementById("Height").value);
    labySol(width, height, 10);

}

labySol(24, 12, 10);