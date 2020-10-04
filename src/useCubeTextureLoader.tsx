import { CubeTextureLoader, CubeTexture } from 'three'
import { useLoader } from 'react-three-fiber'

type Options = {
  path: string
}

export function useCubeTextureLoader(files: string[], { path }: Options): CubeTexture {
  // @ts-ignore
  const [cubeTexture] = useLoader(
    // @ts-ignore
    CubeTextureLoader,
    [files],
    (loader: CubeTextureLoader) => loader.setPath(path)
  )
  return cubeTexture
}

useCubeTextureLoader.preload = (files: string[], { path }: Options) =>
  useLoader.preload(
    // @ts-ignore
    CubeTextureLoader,
    [files],
    (loader: CubeTextureLoader) => loader.setPath(path)
  )
