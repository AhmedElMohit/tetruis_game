const overLay=document.querySelector('.overLay');
const restartBtn=document.getElementById('restartBtn');
let GAME_SPEED = 15;
const GAME_SIZE = 28;
let colors = ['tomato', 'yellow', 'blue', 'purple', 'red', 'green']
let lastRender = 0;
const gameBoard = document.querySelector('.game-field')
let segments = [];
let layedSegments = [];
let currentObjectPositions = [];
let layedSegmentsPositions = []
function buildObject() {
    segments = [];
    const color = colors[getRandomNum() - 1]
    const piecesCount = getRandomNum()
    for (let i = 0; i < piecesCount; i++) {
        const segment = document.createElement('div');
        segment.setAttribute('class', 'segment');
        segment.style.backgroundColor = color;
        segments.push(segment)
        gameBoard.appendChild(segment)
    }
    //set segments positions;
    const shape = getShape(piecesCount)
    currentObjectPositions = []
    segments.forEach((segment, index) => {
        const position = shape[index]
        segment.style.gridColumnStart = position.x;
        segment.style.gridRowStart = position.y;
        currentObjectPositions.push({ x: position.x, y: position.y })
        layedSegments.push(segment)
    })
}
buildObject()
window.addEventListener('keyup', changeDirection)
function main(currentTime) {
    requestAnimationFrame(main)
    const secondsSinceLastRender = (currentTime - lastRender) / 1000;
    if (secondsSinceLastRender < 1 / GAME_SPEED) return
    lastRender = currentTime;
    update()
    draw()
    if(progressMade()){
         currentObjectPositions=[]
         buildObject()
    }
   
}
requestAnimationFrame(main);

function update() {
    //move the object down;
    const journeyFinished = objectsFriction() || objectArrival();
    if (journeyFinished ) {
        currentObjectPositions.forEach(position => {
            layedSegmentsPositions.push(position)
            
        })
        if(loseGame(currentObjectPositions)){
            //when loosing the game
            overLay.classList.add('showOverLay')
            GAME_SPEED=0
        }
       buildObject()
    } else {
        currentObjectPositions.forEach(position => position.y += 1)
    }
    //clearing the bottom line of segments when it is nearly full (26/28segment);
   progressMade()
}
function draw() {
    for (let i = 0; i < segments.length; i++) {
        segments[i].style.gridColumnStart = currentObjectPositions[i].x;
        segments[i].style.gridRowStart = currentObjectPositions[i].y;
    }
   
}

function objectArrival() {
    return currentObjectPositions.some(segmentPosition => {
        return segmentPosition.y === GAME_SIZE 
    })
}
function objectsFriction() {
    return currentObjectPositions.some(position => {
        return layedSegmentsPositions.some(layedSegmentPosition => {
            return isAttached(position, layedSegmentPosition)
        })
    })
}
function isAttached(position1, position2) {
    return position1.x === position2.x && position1.y + 1 === position2.y
}
function nearlyAttached() {
    return currentObjectPositions.some(position => {
        return layedSegmentsPositions.some(layedSegmentPosition => {
            return isNear(position, layedSegmentPosition)
        })
    })
}
function isNear(position1, position2) {
    return position1.x === position2.x && position1.y + 2 === position2.y || position1.y === position2.y && position1.x - 1 === position2.x || position1.y === position2.y && position1.x + 1 === position2.x || position1.y + 1 === position2.y && position1.x - 1 === position2.x || position1.y + 1 === position2.y && position1.x + 1 === position2.x
}
function checkForRightRunOut(boolean) {
    return currentObjectPositions.some(objectPosition => {
        return isOutOfGame(objectPosition, { rightSide: boolean })
    })
}
function isOutOfGame(objectPosition, { rightSide }) {
    if (rightSide) return objectPosition.x >= GAME_SIZE
    return objectPosition.x <= 1
}
function getShape(number) {
    let shapePositions;
    let randomX;
    switch (number) {
        case 1:
            randomX = getRandomPosition(1)
            shapePositions = [{ x: randomX, y: 1 }]
            break
        case 2:
            randomX = getRandomPosition(2)
            shapePositions = [{ x: randomX, y: 1 }, { x: randomX + 1, y: 1 }]
            break
        case 3:
            randomX = getRandomPosition(2)
            shapePositions = [{ x: randomX, y: 1 }, { x: randomX, y: 2 }, { x: randomX + 1, y: 2 }]
            break
        case 4:
            randomX = getRandomPosition(2)
            shapePositions = [{ x: randomX, y: 1 }, { x: randomX + 1, y: 1 }, { x: randomX, y: 2 }, { x: randomX + 1, y: 2 }]
            break
        case 5:
            randomX = getRandomPosition(3)
            shapePositions = [{ x: randomX, y: 2 }, { x: randomX + 1, y: 2 }, { x: randomX + 2, y: 2 }, { x: randomX + 1, y: 1 }, { x: randomX + 1, y: 3 }]
            break
        case 6:
            randomX = getRandomPosition(5)
            shapePositions = [{ x: randomX, y: 1 }, { x: randomX + 1, y: 1 }, { x: randomX + 2, y: 1 }, { x: randomX + 2, y: 2 }, { x: randomX + 3, y: 2 }, { x: randomX + 4, y: 2 }]
            break

    }
    return shapePositions
}
function getRandomNum() {
    return Math.floor(Math.random() * 6 + 1)
}
function getRandomPosition(objectWidth) {
    return Math.floor(Math.random() * (GAME_SIZE - objectWidth) + 1);
}
function changeDirection(e) {
    switch (e.key) {
        case 'ArrowRight':
            if (nearlyAttached() || objectsFriction()) break
            if (checkForRightRunOut(true)) break
            currentObjectPositions.forEach(position => position.x += 1);
            break
        case 'ArrowLeft':
            if (nearlyAttached() || objectsFriction()) break
            if (checkForRightRunOut(false)) break
            currentObjectPositions.forEach(position => position.x -= 1)
            break
    }
}

//when the player makes some progress;

function progressMade(){
    const bottomPieces=getBottomPieces()
    if(bottomPieces.length>=GAME_SIZE-4){
        //CLEAN BOTTOM PIECES
        cleanBottomPieces(bottomPieces)
        //SCROLL PIECES DOWN
        scrollPieces()
return true
    }
return false
}
function getBottomPieces(){
    const bottomPieces=layedSegments.filter(segment=>parseFloat(segment.style.gridRowStart)===GAME_SIZE)
    return bottomPieces
}
function cleanBottomPieces(bottomPieces){
    layedSegmentsPositions=[]
    bottomPieces.forEach(piece=>{
        const xPosition=parseFloat(piece.style.gridColumnStart);
        const yPosition=parseFloat(piece.style.gridRowStart);
        piece.style.display='none';
        layedSegments=layedSegments.filter(segment=>segment!=piece);
       
    })   
}
function scrollPieces(){
    layedSegmentsPositions=[]
    layedSegments.forEach(segment=>{
        const xPosition=parseFloat(segment.style.gridColumnStart);
        const yPosition=parseFloat(segment.style.gridRowStart);
        segment.style.gridRowStart=yPosition+1
        layedSegmentsPositions.push({x:xPosition,y:yPosition+1})
        
    })
 

}


function loseGame(positions){
    return positions.some(position=>position.y<=5)
}
restartBtn.addEventListener('click',()=>{
    overLay.classList.remove('showOverLay')
    location.reload()

})