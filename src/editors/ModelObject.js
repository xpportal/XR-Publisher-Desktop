import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class ModelObject extends THREE.Group {
    constructor(editor, url = null) {
        super();
        
        this.editor = editor;
        this.type = 'Model';
        this.userData = {
            type: 'model',
            properties: {
                url: url,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                positionX: 0,
                positionY: 0,
                positionZ: 0,
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0,
                animations: '',
                alt: '',
                collidable: false
            }
        };

        if (url) {
            this.loadModel(url);
        }
    }

    loadModel(url) {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            this.clear(); // Remove any existing model
            this.add(gltf.scene);
            
            // Store animations if they exist
            if (gltf.animations && gltf.animations.length > 0) {
                this.animations = gltf.animations;
                this.mixer = new THREE.AnimationMixer(gltf.scene);
            }
            
            this.userData.properties.url = url;
            this.editor.signals.objectChanged.dispatch(this);
        });
    }

    updateProperties(properties) {
        Object.assign(this.userData.properties, properties);
        
        // Update transform based on properties
        this.position.set(
            properties.positionX || this.position.x,
            properties.positionY || this.position.y,
            properties.positionZ || this.position.z
        );
        
        this.rotation.set(
            (properties.rotationX || this.rotation.x) * THREE.MathUtils.DEG2RAD,
            (properties.rotationY || this.rotation.y) * THREE.MathUtils.DEG2RAD,
            (properties.rotationZ || this.rotation.z) * THREE.MathUtils.DEG2RAD
        );
        
        this.scale.set(
            properties.scaleX || this.scale.x,
            properties.scaleY || this.scale.y,
            properties.scaleZ || this.scale.z
        );
        
        this.editor.signals.objectChanged.dispatch(this);
    }

    // Method to play animations
    playAnimation(animationName) {
        if (this.mixer && this.animations) {
            const clip = this.animations.find(a => a.name === animationName);
            if (clip) {
                this.mixer.clipAction(clip).play();
            }
        }
    }
}

export { ModelObject };