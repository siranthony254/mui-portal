import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = client ? imageUrlBuilder(client) : null

export function urlFor(source: any) {
  return builder ? builder.image(source) : null
}
