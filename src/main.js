import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import * as dat from 'lil-gui'
import { normalMap } from 'three/tsl'
import { RepeatWrapping } from 'three/webgpu'


//Scene
const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

//Camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
scene.add(camera)
camera.position.set(3, 4, 14)

//Texture Loader
const textureLoader = new THREE.TextureLoader()

//Terrain Textures
// const aoTexture = textureLoader.load("/textures/terrain/ao.jpg")
const diffuseTexture = textureLoader.load("/textures/terrain/diffuse.jpg")
const heightTexture = textureLoader.load("/textures/terrain/height.jpg")
const normalTexture = textureLoader.load("/textures/terrain/normal.jpg")
const roughnessTexture = textureLoader.load("/textures/terrain/roughness.jpg")

//Grass Textures
const grassColorTexture = textureLoader.load("./textures/grass/color.jpg")

//Door Textures
const doorColorTexture = textureLoader.load("./textures/door/color.jpg")
const doorAlphaTexture = textureLoader.load("./textures/door/alpha.jpg")


//House
const house = new THREE.Group()
scene.add(house)

//Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({})
)
walls.position.y = 1.25
house.add(walls)

//Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial()
)
roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI / 4
house.add(roof)

//Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 30, 30),
    new THREE.MeshStandardMaterial({
        color: '#aa7b7b',
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture
    })
)
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

//Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)


house.add(bush1, bush2, bush3, bush4)

//Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })

const gravePos = []
for (let i = 0; i < 20; i++) {

    let x, z
    let isTooClose

    do {
        const angel = Math.random() * Math.PI * 2
        const radius = 3.5 + Math.random() * 6
        x = Math.sin(angel) * radius
        z = Math.cos(angel) * radius

        isTooClose = false

        for(let q = 0 ; q<gravePos.length;q++){
            const pos = gravePos[q]
            const dx = pos.x - x
            const dz = pos.z - z
            const distance = Math.sqrt(dx*dx+dz*dz)
            if(distance < 0.5){
                isTooClose = true
                break
            }
        }
    } while (isTooClose)

    gravePos.push({x,z})

    const grave = new THREE.Mesh(
        graveGeometry, graveMaterial
    )
    grave.position.set(x, 0.3, z)
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    graves.add(grave)

}

//Fog
const fog = new THREE.Fog(0x1e2529, 7, 48)
scene.fog = fog

//Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        displacementMap: heightTexture,
        displacementScale: 0.1,
        normalMap: normalTexture,
        roughnessMap: roughnessTexture
    })
)

const floorTextures = [
    heightTexture,
    diffuseTexture,
    normalTexture,
    roughnessTexture
]

floorTextures.forEach(tex =>{
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4,4)
})

scene.add(floor)
floor.rotation.x = -(Math.PI * 0.5)

//Light
const directionalLight = new THREE.DirectionalLight({color: 'blue'})
directionalLight.position.set(3, 2, -8)

const ambientLight = new THREE.AmbientLight({color: 0x4b82b9})
ambientLight.intensity = 0.3

const doorLight = new THREE.PointLight(0xfabc90,0.5)
doorLight.position.x = 0
doorLight.position.y = 2 + 0.1
doorLight.position.z = 2 + 0.5

scene.add(doorLight, directionalLight, ambientLight)

//Light Helper
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 3)
scene.add(directionalLightHelper)

//Renderer
const canvas = document.querySelector('.canvas')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight)

//Orbit Controls
const controls = new OrbitControls(camera, canvas)

//Animate
const animate = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(animate)
}

animate()

//Event Listener
window.addEventListener('resize', () => {
    //Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()

    //Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
})

//Debug UI
const gui = new dat.GUI()

const fogFolder = gui.addFolder('Fog')

fogFolder
    .addColor(fog,'color')

fogFolder
    .add(fog, 'near')
    .min(0)
    .max(10)
    .step(0.001)

fogFolder
    .add(fog, 'far')
    .min(0)
    .max(50)
    .step(0.001)

