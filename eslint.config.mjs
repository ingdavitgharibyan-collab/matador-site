import next from 'eslint-config-next'

const config = [...next, { ignores: ['.next/**', 'src/payload-types.ts', 'src/app/(payload)/**', '.claude/**'] }]
export default config
