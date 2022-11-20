import * as React from 'react'
import { Environment } from './Environment'
import { ContactShadowsProps, ContactShadows } from './ContactShadows'
import { Center } from './Center'
import { AccumulativeShadowsProps, AccumulativeShadows, RandomizedLight } from './AccumulativeShadows'
import { useBounds, Bounds } from './Bounds'
import { PresetsType } from '../helpers/environment-assets'

const presets = {
  rembrandt: {
    main: [1, 2, 1],
    fill: [-2, -0.5, -2],
  },
  portrait: {
    main: [-1, 2, 0.5],
    fill: [-1, 0.5, -1.5],
  },
  upfront: {
    main: [0, 2, 1],
    fill: [-1, 0.5, -1.5],
  },
  soft: {
    main: [-2, 4, 4],
    fill: [-1, 0.5, -1.5],
  },
}

type StageShadows = Partial<AccumulativeShadowsProps> &
  Partial<ContactShadowsProps> & {
    type: 'contact' | 'accumulative'
    /** Shadow plane offset, default: 0 */
    offset?: number
    /** Shadow bias, default: -0.0001 */
    bias?: number
    /** Shadow map size, default: 1024 */
    size?: number
  }

type StageProps = JSX.IntrinsicElements['group'] & {
  /** Lighting setup, default: "rembrandt" */
  preset?: 'rembrandt' | 'portrait' | 'upfront' | 'soft'
  /** Controls the ground shadows, default: "contact" */
  shadows?: boolean | 'contact' | 'accumulative' | StageShadows
  /** Optionally wraps and thereby centers the models using <Bounds>, can also be a margin, default: true */
  adjustCamera?: boolean | number
  /** The default environment, default: "city" */
  environment?: PresetsType | null
  /** The lighting intensity, default: 0.5 */
  intensity?: number
}

function Refit({ radius, adjustCamera }) {
  const api = useBounds()
  React.useEffect(() => {
    if (adjustCamera) api.refresh().clip().fit()
  }, [radius, adjustCamera])
  return null
}

export function Stage({
  children,
  adjustCamera = true,
  intensity = 0.5,
  shadows = 'contact',
  environment = 'city',
  preset = 'rembrandt',
  ...props
}: StageProps) {
  const config = presets[preset]
  const [{ radius, height }, set] = React.useState({ radius: 0, width: 0, height: 0, depth: 0 })
  const shadowBias = (shadows as StageShadows)?.bias ?? -0.0001
  const shadowSize = (shadows as StageShadows)?.size ?? 1024
  const shadowOffset = (shadows as StageShadows)?.offset ?? 0
  const contactShadow = shadows === 'contact' || (shadows as StageShadows)?.type === 'contact'
  const accumulativeShadow = shadows === 'accumulative' || (shadows as StageShadows)?.type === 'accumulative'
  const shadowSpread = { ...(typeof shadows === 'object' ? shadows : {}) }
  return (
    <>
      <ambientLight intensity={intensity / 3} />
      <spotLight
        penumbra={1}
        position={[config.main[0] * radius, config.main[1] * radius, config.main[2] * radius]}
        intensity={intensity * 2}
        castShadow={!!shadows}
        shadow-bias={shadowBias}
        shadow-mapSize={shadowSize}
      />
      <pointLight
        position={[config.fill[0] * radius, config.fill[1] * radius, config.fill[2] * radius]}
        intensity={intensity}
      />
      <Bounds fit={!!adjustCamera} clip={!!adjustCamera} margin={Number(adjustCamera)} observe {...props}>
        <Refit radius={radius} adjustCamera={adjustCamera} />
        <Center
          position={[0, shadowOffset / 2, 0]}
          onCentered={({ width, height, depth, boundingSphere, ...data }) =>
            set({ radius: boundingSphere.radius, width, height, depth })
          }
        >
          {children}
        </Center>
      </Bounds>
      <group position={[0, -height / 2 - shadowOffset / 2, 0]}>
        {contactShadow && (
          <ContactShadows scale={radius * 4} far={radius} blur={2} {...(shadowSpread as ContactShadowsProps)} />
        )}
        {accumulativeShadow && (
          <AccumulativeShadows
            temporal
            frames={100}
            alphaTest={0.9}
            toneMapped={true}
            scale={radius * 4}
            {...(shadowSpread as AccumulativeShadowsProps)}
          >
            <RandomizedLight
              amount={8}
              radius={radius}
              ambient={0.5}
              intensity={1}
              position={[config.main[0] * radius, config.main[1] * radius, config.main[2] * radius]}
              size={radius * 4}
              bias={-shadowBias}
              mapSize={shadowSize}
            />
          </AccumulativeShadows>
        )}
      </group>
      {environment && <Environment preset={environment} />}
    </>
  )
}
