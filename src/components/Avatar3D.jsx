import React, { Suspense, useMemo, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import * as SkeletonUtilsModule from 'three/examples/jsm/utils/SkeletonUtils'
// compatibility: some bundlers export SkeletonUtils as named, default, or on the namespace
const SkeletonUtils = SkeletonUtilsModule?.SkeletonUtils || SkeletonUtilsModule?.default || SkeletonUtilsModule
import ErrorBoundary from './ErrorBoundary'

// Cache para evitar recarregar modelos
const modelCache = new Map()

const preloadModel = (path) => {
  if (!modelCache.has(path)) {
    try {
      useGLTF.preload(path)
      modelCache.set(path, true)
    } catch (e) {
      console.warn('Erro ao precarregar:', path)
    }
  }
}

// Small Avatar Preview Component
function AvatarPreview({ gender, bodyType, skinColor, faceOption, hairId }) {
  const basePath = gender === 'female' ? '/models/female' : '/models/male'
  const bodyPrefix = gender === 'female' ? 'GBody' : 'MBody'
  const facePrefix = gender === 'female' ? 'GFace' : 'MFace'
  const hairPrefix = gender === 'female' ? 'GHair' : 'MHair'

  const bodyIndex = bodyType === 'body2' ? 1 : (bodyType === 'body3' ? 2 : 0)
  const faceIndex = bodyIndex

  // Caminhos dos modelos
  const bodyPath = `${basePath}/${bodyPrefix}_${bodyIndex}.glb`
  const facePath = `${basePath}/${facePrefix}_${faceIndex}.glb`
  
  // Precarregar modelos para evitar conflitos
  useEffect(() => {
    preloadModel(bodyPath)
    preloadModel(facePath)
  }, [bodyPath, facePath])

  // Load all models - estas ficarão em cache e não conflitarão
  const body = useGLTF(bodyPath)
  const face = useGLTF(facePath)

  const getHairPath = (id) => {
    const hairFolder = gender === 'female' ? 'Hair(FEMALE)' : 'hair(MALE)'
    let path = ''
    if (id >= 1 && id <= 3) path = `${basePath}/${hairPrefix}_${id - 1}.glb`
    else if (id === 4) path = `${basePath}/${hairFolder}/Cultural/Cultural_0.glb`
    else if (id === 5) path = `${basePath}/${hairFolder}/Cultural/Cultural_1.glb`
    else if (id === 6) path = `${basePath}/${hairFolder}/Cultural/Cultural_2.glb`
    else if (id === 7) path = `${basePath}/${hairFolder}/Cultural/Cultural_3.glb`
    else if (id === 8) path = `${basePath}/${hairFolder}/Cacheado/Cacheado_0.glb`
    else if (id === 9) path = `${basePath}/${hairFolder}/Cacheado/Cacheado_1.glb`
    else if (id === 10) path = `${basePath}/${hairFolder}/Crespo/Crespo_0.glb`
    else if (id === 11) path = `${basePath}/${hairFolder}/Crespo/Crespo_1.glb`
    else if (id === 12) path = `${basePath}/${hairFolder}/Liso/Liso_0.glb`
    else if (id === 13) path = `${basePath}/${hairFolder}/Cultural/Cultural_4.glb`
    else if (id === 14) path = `${basePath}/${hairFolder}/Ondulado/Ondulado_0.glb`
    else if (id === 15) path = `${basePath}/${hairFolder}/Ondulado/Ondulado_1.glb`
    else if (id === 16) path = `${basePath}/${hairFolder}/Ondulado/Ondulado_2.glb`
    else path = `${basePath}/${hairPrefix}_0.glb`
    
    // Precarregar cabelo
    preloadModel(path)
    return path
  }

  const hairPath = getHairPath(hairId)
  const hair = useGLTF(hairPath)

  // Create per-instance clones of the loaded scenes so each Avatar can render independently
  const bodyClone = useMemo(() => {
    if (!body?.scene) return null
    try {
      return SkeletonUtils.clone(body.scene)
    } catch (e) {
      // Fallback to shallow clone if SkeletonUtils not available
      return body.scene.clone(true)
    }
  }, [body])

  const faceClone = useMemo(() => {
    if (!face?.scene) return null
    try {
      return SkeletonUtils.clone(face.scene)
    } catch (e) {
      return face.scene.clone(true)
    }
  }, [face])

  const hairClone = useMemo(() => {
    if (!hair?.scene) return null
    try {
      return SkeletonUtils.clone(hair.scene)
    } catch (e) {
      return hair.scene.clone(true)
    }
  }, [hair])

  const skinMap = {
    skin1: `${basePath}/TEXTURES/PRETO/CORPO_PRETO/PRETO.png`,
    skin2: `${basePath}/TEXTURES/PARDO/CORPO_PARDO/PARDO.png`,
    skin3: `${basePath}/TEXTURES/INDIGENA/CORPO_INDIGENA/INDIGENA.png`,
    skin4: `${basePath}/TEXTURES/AMARELO/CORPO_AMARELO/AMARELO.png`,
    skin5: `${basePath}/TEXTURES/BRANCO/CORPO_BRANCO/BRANCO.png`
  }

  // Map face option to face texture name
  const faceTypeToTextureName = {
    face1: 'PRETO',
    face2: 'PARDO',
    face3: 'INDIGENA',
    face4: 'AMARELO',
    face5: 'BRANCO'
  }

  // Map skin color to suffix ID
  const skinTypeToTextureId = {
    'PRETO': '_0',
    'AMARELO': '_1',
    'BRANCO': '_2',
    'PARDO': '_3',
    'INDIGENA': '_4'
  }

  // Map skin ID to folder name
  const skinIdToFolderName = {
    skin1: 'PRETO',
    skin2: 'PARDO',
    skin3: 'INDIGENA',
    skin4: 'AMARELO',
    skin5: 'BRANCO'
  }

  // Get the correct face texture path based on face option + skin color
  const getFaceTexturePath = (selectedFaceOption, selectedSkinColor) => {
    const selectedSkinFolder = skinIdToFolderName[selectedSkinColor]
    const faceTextureName = faceTypeToTextureName[selectedFaceOption]
    const textureSuffix = skinTypeToTextureId[selectedSkinFolder]
    return `${basePath}/TEXTURES/${selectedSkinFolder}/ROSTO/${faceTextureName}${textureSuffix}.png`
  }

  const bodyTextureUrl = skinMap[skinColor] || skinMap.skin1
  const faceTextureUrl = getFaceTexturePath(faceOption, skinColor)

  // Load body texture
  const bodyTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(bodyTextureUrl)
    tex.flipY = false
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [bodyTextureUrl])

  // Load face texture
  const faceTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    try {
      const tex = loader.load(faceTextureUrl)
      tex.flipY = false
      tex.colorSpace = THREE.SRGBColorSpace
      return tex
    } catch (e) {
      console.warn('Face texture not found at', faceTextureUrl)
      return null
    }
  }, [faceTextureUrl, faceOption])

  // Apply texture to the cloned body scene whenever it loads or changes
  useEffect(() => {
    if (!bodyClone || !bodyTexture) return

    bodyClone.traverse((node) => {
      if (!node.isMesh) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]

      materials.forEach(mat => {
        if (!mat) return

        // Clone the material instance per mesh in the clone so it doesn't share state
        const clonedMat = mat.clone()
        clonedMat.map = bodyTexture
        clonedMat.transparent = false
        clonedMat.opacity = 1.0
        clonedMat.alphaTest = 0
        clonedMat.depthWrite = true
        clonedMat.depthTest = true
        clonedMat.side = THREE.FrontSide
        clonedMat.roughness = mat.roughness || 0.8
        clonedMat.metalness = mat.metalness || 0.0
        clonedMat.envMapIntensity = mat.envMapIntensity || 0.8
        clonedMat.blending = THREE.NoBlending
        clonedMat.premultipliedAlpha = false

        node.material = clonedMat
        node.material.needsUpdate = true
      })
    })
  }, [bodyClone, bodyTexture])

  // Apply texture to the cloned face scene whenever it loads or changes
  useEffect(() => {
    if (!faceClone || !faceTexture) return

    faceClone.traverse((node) => {
      if (!node.isMesh) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      materials.forEach((mat) => {
        if (!mat) return

        const clonedMat = mat.clone()
        clonedMat.map = faceTexture
        clonedMat.needsUpdate = true
        node.material = clonedMat
      })
    })
  }, [faceClone, faceTexture])

  return (
    <>
  {bodyClone && <primitive object={bodyClone} />}
  {faceClone && <primitive object={faceClone} />}
  {hairClone && <primitive object={hairClone} />}
    </>
  )
}

// Componente para controlar a câmera com zoom
function CameraController({ cameraDistance }) {
  const { camera } = useThree()

  useEffect(() => {
    // Ajustar os clipping planes para permitir zoom bem próximo
    camera.near = 0.001  // Permite ver objetos muito perto
    camera.far = 1000    // Mantém objetos distantes visíveis
    
    camera.position.z = cameraDistance
    camera.updateProjectionMatrix()
  }, [camera, cameraDistance])

  return null
}

// Avatar3D component: renders a small 3D avatar in a Canvas
export default function Avatar3D({ gender, bodyType, skinColor, faceOption, hairId, size = 48, bgGradient = 'linear-gradient(135deg, #FFD700 0%, #FF9800 50%, #FF8C00 100%)' }) {
  // Gerar chave única para cada instância do Avatar
  const avatarKey = `${gender}-${bodyType}-${skinColor}-${faceOption}-${hairId}`
  
  // Different presets for male and female models
  const modelPresets = gender === 'female' ? {
    position: [0, -0.169, 0],      // Ajustado para centralizar o rosto na tela
    rotation: [-0.23, 5.59, 0],
    scale: [1, 1, 1],
    cameraDistance: 0.0030   // Valor positivo: mais próximo (zoom in). Diminua para mais zoom no rosto
  } : {
    position: [0, -0.169, 0],      // Ajustado para centralizar o rosto na tela - MALE
    rotation: [-0.23, 5.85, 0],
    scale: [1, 1, 1],
    cameraDistance: 0.0008  // Valor positivo: mais próximo (zoom in). Diminua para mais zoom no rosto
  }

  return (
    <div style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '50%', 
      overflow: 'hidden', 
      flexShrink: 0,
      background: bgGradient
    }}>
      <ErrorBoundary>
        <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#6b7280', fontSize: '10px' }}>⏳</span></div>}>
          <Canvas
            key={avatarKey}
            style={{ width: '100%', height: '100%' }}
            gl={{ 
              antialias: true, 
              preserveDrawingBuffer: false,
              alpha: true,
              powerPreference: 'high-performance'
            }}
            onCreated={(state) => {
              try {
                state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
                // Limpar contexto anterior
                state.gl.clearColor(0, 0, 0, 0)
              } catch (e) {
                console.warn('Erro ao criar Canvas:', e)
              }
            }}
          >
            <CameraController cameraDistance={modelPresets.cameraDistance} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <group position={modelPresets.position} rotation={modelPresets.rotation} scale={modelPresets.scale}>
              <AvatarPreview
                gender={gender}
                bodyType={bodyType}
                skinColor={skinColor}
                faceOption={faceOption}
                hairId={hairId}
              />
            </group>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
