import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resonance API Documentation',
      version: '1.0.0',
      description: `
        Welcome to the Resonance API documentation. This API provides access to music artist analytics
        across various platforms, starting with Spotify integration.
        
        ## Authentication
        All endpoints require a valid API key passed in the Authorization header.
        
        ## Rate Limiting
        Requests are limited to 100 per 15 minutes per IP address.
        
        ## Error Handling
        The API uses conventional HTTP response codes to indicate the success or failure of requests.
      `
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Artist: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Spotify artist ID',
              example: '0TnOYISbd1XYRBk9myaseg'
            },
            name: {
              type: 'string',
              description: 'Artist name',
              example: 'Pitbull'
            },
            genres: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of genres associated with the artist',
              example: ['dance pop', 'latin']
            },
            popularity: {
              type: 'integer',
              description: 'Popularity score from 0-100',
              example: 82
            },
            followers: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Total number of followers',
                  example: 1500000
                }
              }
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const specs = swaggerJsdoc(options);