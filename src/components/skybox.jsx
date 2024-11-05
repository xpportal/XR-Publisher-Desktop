import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame,  } from '@react-three/fiber';
import { BackSide, Color, ShaderMaterial } from 'three';
import { Sphere } from '@react-three/drei';

const vertexShader = `
uniform float u_intensity;
uniform float u_time;
uniform float u_gradientCenter;
varying vec3 vColor;

void main() {
    vec3 pos = position;
    pos.y += u_intensity * sin(pos.y * 10.0 + u_time);
    
    // Calculate the relative height of the vertex (-1 at the bottom, 1 at the top)
    float relativeHeight = pos.y / 50.0; // Assuming the sphere has a radius of 50 units
    
    // Calculate the color based on the relative height and gradient center
    float mixValue = smoothstep(u_gradientCenter - 0.5, u_gradientCenter + 0.5, relativeHeight);
    vColor = mix(vec3(0.0), vec3(1.0), mixValue);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

const fragmentShader = `
uniform vec3 u_color1;
uniform vec3 u_color2;
varying vec3 vColor;

void main() {
    // Mix the colors based on the interpolated color from the vertex shader
    vec3 color = mix(u_color1, u_color2, vColor);
    
    gl_FragColor = vec4(color, 1.0);
}`;

const Skybox = ({ colors, gradientCenter }) => {
	const materialRef = useRef();
	const [skyboxColor, setSkyboxColor] = useState([colors[0], colors[1]]);
	const [chosenGradientCenter, setChosenGradientCenter] = useState(gradientCenter);
	const frameCount = useRef(0)

	useEffect(() => {
		// Update the skybox color using the colors prop
		setSkyboxColor(colors);
		setChosenGradientCenter(gradientCenter);
		// Make sure to include colors as a dependency
	  }, [colors, gradientCenter]);
	  
	  useFrame(({ clock }) => {
		frameCount.current += 1
		if (frameCount.current % 1000 !== 0) return
		frameCount.current = 0
		if (!materialRef.current) return
		materialRef.current.uniforms.u_time = {
		  value: clock.getElapsedTime(),
		}
	  })

	  const uniforms = useMemo(
		() => ({
			u_intensity: { value: 0.1 },
			u_time: { value: 0 },
			u_color1: { value: new Color(colors[0]).convertLinearToSRGB() },
			u_color2: { value: new Color(colors[1]).convertLinearToSRGB() },
			u_gradientCenter: { value: gradientCenter ? gradientCenter : 0.5 },
		}),
		[]
	  )
	
	
	useEffect(() => {
		if (materialRef.current) {
			materialRef.current.uniforms.u_color1.value.set(new Color(colors[0]).convertLinearToSRGB());
			materialRef.current.uniforms.u_gradientCenter.value = gradientCenter;
			materialRef.current.uniforms.u_color2.value.set(new Color(colors[1]).convertLinearToSRGB());
			// materialRef.current.uniformsNeedUpdate = true; // Force uniform update
		}
	}, [skyboxColor, chosenGradientCenter]);

	return (
	<Sphere args={[50, 50, 50]}>
		<shaderMaterial
			ref={materialRef}
			side={BackSide}
			uniforms={uniforms}
			vertexShader={vertexShader}
			fragmentShader={fragmentShader}
			needsUpdate
		/>
	</Sphere>
	);
};

export default Skybox;  