import * as THREE from "three"
import { CSG } from "three-csg-ts"

// https://hofk.de/main/discourse.threejs/2021/MotionAlongCurve/MotionAlongCurve.html
// import {Flow} from "three/examples/jsm/modifiers/CurveModifier"

const palette = {
    cor1: 0x264653,
    cor2: 0x2a9d8f,
    cor3: 0xe9c46a,
    cor4: 0xf4a261,
    cor5: 0xe76f51,
    cor6: 0x0d90429
}

const c1 = document.getElementById("c1")
const c2 = document.getElementById("c2")
const c3 = document.getElementById("c3")

THREE.Object3D.DefaultUp.set(0,0,1)

const renderer1 = new THREE.WebGLRenderer({antialias:true})
renderer1.setSize(300, 200)
renderer1.setClearColor(palette.cor1, 1)
c1.appendChild(renderer1.domElement)
const renderer2 = new THREE.WebGLRenderer({antialias:true})
renderer2.setSize(300, 200)
renderer2.setClearColor(palette.cor1, 1)
c2.appendChild(renderer2.domElement)
const renderer3 = new THREE.WebGLRenderer({antialias:true})
renderer3.setSize(300, 200)
renderer3.setClearColor(palette.cor1, 1)
c3.appendChild(renderer3.domElement)

const scene1 = new THREE.Scene()

const frustumSize = 60

const camera1 = new THREE.OrthographicCamera(-frustumSize, frustumSize, frustumSize/3*2, -frustumSize/3*2)
camera1.position.set(-100,-100,100)
camera1.lookAt(30, 15, -5)
const camera2 = new THREE.OrthographicCamera(-frustumSize, frustumSize, frustumSize/3*2, -frustumSize/3*2)
camera2.position.set(30,15,frustumSize)
camera2.lookAt(30, 15, 0)
camera2.rotateZ(-Math.PI/2)
const camera3 = new THREE.OrthographicCamera(-frustumSize, frustumSize, frustumSize/2, -frustumSize/2)
camera3.position.set(30,-15,0)
camera3.lookAt(30, 15, 0)
// camera3.rotateZ(-Math.PI/2)
// camera3.rotateX(Math.PI/2)


const block = new THREE.Mesh(new THREE.BoxGeometry(60,30,10), new THREE.MeshStandardMaterial({color:palette.cor5, transparent:true, opacity:.5}))
const edges = new THREE.LineSegments(new THREE.EdgesGeometry(block.geometry), new THREE.LineBasicMaterial({color: palette.cor2}))
// block.add(edges)
scene1.add(block)
block.position.set(30, 15, -5)

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene1.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
scene1.add(directionalLight)
directionalLight.position.set(0,-15,60)
const dLHelper = new THREE.DirectionalLightHelper(directionalLight)
// scene1.add(dLHelper)

const axesHelper = new THREE.AxesHelper(20)
// scene1.add(axesHelper)

const correctionTool = new THREE.Vector3(0,0,15)
const tool = new THREE.Mesh(new THREE.CylinderGeometry(6,6,30,24), new THREE.MeshStandardMaterial({color: palette.cor6}))
const edges2 = new THREE.LineSegments(new THREE.EdgesGeometry(tool.geometry), new THREE.LineBasicMaterial({color: 0x000000}))
// tool.add(edges2)
tool.rotateX(Math.PI/2)
tool.position.set(...correctionTool)
// tool.position.set(30,15,0)
scene1.add(tool)


//https://github.com/samalexander/three-csg-ts
// Make sure the .matrix of each mesh is current
// block.updateMatrix();
// tool.updateMatrix();
// const result = CSG.subtract(block,tool)
// scene1.remove(block)
// scene1.add(result)



// https://observablehq.com/@rveciana/three-js-object-moving-object-along-path
const linePath = new THREE.LineCurve3(new THREE.Vector3(-10,0,-3), new THREE.Vector3(60,0,-3))
const linePoints = linePath.getPoints(20)
const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)
const lineMaterial = new THREE.LineBasicMaterial({color: "black"})
const meshLine = new THREE.Line(lineGeometry, lineMaterial)
scene1.add(meshLine)
const arcPath = new THREE.ArcCurve(60,5,5,-Math.PI/2,0,false)
const arcPoints = arcPath.getPoints(20)
const arcPointsZ = arcPoints.map((point)=>new THREE.Vector3(...point,-3))
// console.log(arcPointsZ)
const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPointsZ)
const arcMaterial = new THREE.LineBasicMaterial({color: "black"})
const meshArc = new THREE.Line(arcGeometry, arcMaterial)
scene1.add(meshArc)

//
function move(point){
    tool.position.set(...point)
    console.log("move: ", point)
    renderer1.render(scene1, camera1)
    renderer2.render(scene1, camera2)
    renderer3.render(scene1, camera3)
    console.log("move: ", point)
}


// const clock = new THREE.Clock(false)
// clock.start()


// const moveTime = .2
// // let currentCoord = new THREE.Vector3(0,0,0)
// let currentPoint = 0

// function animate(){
//     requestAnimationFrame(animate)
//     // console.log(clock.getElapsedTime())
//     if (clock.getElapsedTime() >= moveTime){
//         if (currentPoint <= linePoints.length){
//             console.log(currentPoint);
//             console.log(linePoints[currentPoint]);
//             move(linePoints[currentPoint].add(correctionTool))

//             currentPoint += 1
//         }
//         clock.start()
//     }
// }

// animate()

const clock = new THREE.Clock(false)
clock.start()
let arrPoints = linePoints
let arrPointsCorrection = arrPoints.map((p) => p.add(correctionTool))
let currentTool = tool
let currentPoint = 0
let feed = .2
let currentBlock = block

function move(){
    scene1.remove(block)
    if (currentPoint <= arrPoints.length-1){
        console.log("currPoint", currentPoint, " pointsLen:",arrPoints.length);
        if (clock.getElapsedTime() >= feed){
            currentTool.position.set(...arrPointsCorrection[currentPoint])
            
            // currentBlock.updateMatrix();
            // tool.updateMatrix();
            // scene1.remove(block)
            scene1.remove(currentBlock)
            currentBlock = CSG.subtract(currentBlock, tool)
            scene1.add(currentBlock)


            console.log(clock.getElapsedTime());
            currentPoint += 1
            clock.start()
            renderer1.render(scene1, camera1)
            renderer2.render(scene1, camera2)
            renderer3.render(scene1, camera3)
        }
        requestAnimationFrame(move)
    }
}

function usinate(){
    currentPoint = 0
    move()
}

renderer1.render(scene1, camera1)
renderer2.render(scene1, camera2)
renderer3.render(scene1, camera3)


const button = document.getElementById("button")
button.addEventListener("click", usinate)