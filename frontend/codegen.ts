import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:8000/graphql',
  documents: 'src/**/*.{ts,tsx}',
  // documents: ['src/**/*.tsx'],
  ignoreNoDocuments: true, // for better experience with the watcher
  // watch: true,
  allowPartialOutputs: true, // Allow generation even with errors
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Mixed: 'any',
        },
        defaultScalarType: 'unknown',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        useTypeImports: true,
        enumsAsTypes: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
        },
      },
    },
  },
};
export default config;
