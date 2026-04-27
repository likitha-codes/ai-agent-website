import React, { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";

function AvatarModel({ isThinking }) {
  const group = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load("/model.vrm", (gltf) => {
      const vrm = gltf.userData.vrm;
      if (!vrm) return;
      VRMUtils.removeUnnecessaryJoints(gltf.scene);
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      if (group.current) {
        group.current.add(vrm.scene);
        vrm.scene.rotation.y = Math.PI;
        vrm.scene.scale.set(1.9, 1.9, 1.9);
        vrm.scene.position.set(0, -2.3, 0);
        for (let i = 0; i < 20; i++) vrm.update(1 / 60);
        group.current.userData.vrm = vrm;
        initialized.current = true;
      }
    }, undefined, (err) => console.error(err));
  }, []);

  useFrame((state, delta) => {
    const vrm = group.current?.userData?.vrm;
    if (!vrm || !vrm.humanoid || !initialized.current) return;
    const t = state.clock.getElapsedTime();

    const applyRelaxedArms = () => {
      const bones = {
        leftUpperArm: vrm.humanoid.getNormalizedBoneNode("leftUpperArm"),
        rightUpperArm: vrm.humanoid.getNormalizedBoneNode("rightUpperArm"),
        leftLowerArm: vrm.humanoid.getNormalizedBoneNode("leftLowerArm"),
        rightLowerArm: vrm.humanoid.getNormalizedBoneNode("rightLowerArm"),
        leftHand: vrm.humanoid.getNormalizedBoneNode("leftHand"),
        rightHand: vrm.humanoid.getNormalizedBoneNode("rightHand"),
      };
      if (!bones.leftUpperArm) return;

      if (isThinking) {
        // Thinking pose — hand at chin
        bones.rightUpperArm.rotation.set(3.11, -3.14, -2.59);
        bones.rightLowerArm.rotation.set(-3.14, 0.76, -2.14);
        bones.rightHand.rotation.set(0.4, 0.3, -0.3);
        // Left arm relaxed
        bones.leftUpperArm.rotation.set(0.35, 0.25, 0.95);
        bones.leftLowerArm.rotation.set(-0.10, 0.00, -0.10);
        bones.leftHand.rotation.set(0.20, -0.18, 0.30);
      } else {
        // Normal relaxed pose
        bones.leftUpperArm.rotation.set(0.35, 0.25, 0.95);
        bones.rightUpperArm.rotation.set(0.35, -0.25, -0.95);
        bones.leftLowerArm.rotation.set(-0.10, 0.00, -0.10);
        bones.rightLowerArm.rotation.set(-0.10, 0.00, 0.10);
        bones.leftHand.rotation.set(0.20, -0.18, 0.30);
        bones.rightHand.rotation.set(0.20, 0.18, -0.30);
      }
    };

    const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
    const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");
    if (leftShoulder) leftShoulder.rotation.set(0.02, 0.00, 0.12);
    if (rightShoulder) rightShoulder.rotation.set(0.02, 0.00, -0.12);

    const head = vrm.humanoid.getNormalizedBoneNode("head");
    if (head) {
      if (isThinking) {
        head.rotation.y = Math.sin(t * 1.2) * 0.15;
        head.rotation.x = -0.2 + Math.sin(t * 0.8) * 0.05;
      } else {
        head.rotation.y = mouse.current.x * 0.6;
        head.rotation.x = mouse.current.y * 0.35;
      }
    }

    const breathSpeed = isThinking ? 2.5 : 1.5;
    const breathAmount = isThinking ? 0.05 : 0.03;
    vrm.scene.position.y = -2.3 + Math.sin(t * breathSpeed) * breathAmount;
    vrm.scene.rotation.y = Math.PI + Math.sin(t * 0.5) * 0.05;

    const blinkSpeed = isThinking ? 5 : 3;
    const blinkVal = Math.sin(t * blinkSpeed) > 0.6 ? 1 : 0;
    vrm.expressionManager?.setValue("blink", blinkVal);

    if (isThinking) {
      vrm.expressionManager?.setValue("surprised", 0.3);
    } else {
      vrm.expressionManager?.setValue("surprised", 0.0);
      vrm.expressionManager?.setValue("neutral", 1.0);
    }

    vrm.update(delta);
    applyRelaxedArms();
  });

  return <group ref={group} />;
}

export default function Avatar({ isThinking }) {
  return (
    <div className="w-full h-full flex items-end justify-center">
      <Canvas camera={{ position: [0, 1.0, 5.0], fov: 50 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 6]} intensity={1.6} />
        <AvatarModel isThinking={isThinking} />
        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
    </div>
  );
}