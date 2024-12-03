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
This API requires Spotify OAuth credentials:
- client_id: Your Spotify application client ID
- client_secret: Your Spotify application client secret
- redirect_url: Your application's redirect URL

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
        SpotifyImage: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Image URL'
            },
            height: {
              type: 'integer',
              description: 'Image height',
              nullable: true
            },
            width: {
              type: 'integer',
              description: 'Image width',
              nullable: true
            }
          }
        },
        ArtistStats: {
          type: 'object',
          properties: {
            popularity: {
              type: 'integer',
              description: 'Artist popularity score (0-100)',
              example: 82
            },
            followers: {
              type: 'integer',
              description: 'Number of Spotify followers',
              example: 1500000
            },
            genres: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of associated genres',
              example: ['rock', 'classic rock']
            },
            name: {
              type: 'string',
              description: 'Artist name',
              example: 'The Beatles'
            },
            images: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SpotifyImage'
              }
            },
            spotifyUrl: {
              type: 'string',
              description: 'Spotify artist page URL'
            },
            id: {
              type: 'string',
              description: 'Spotify artist ID'
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of when the stats were fetched'
            }
          }
        }
      },
      securitySchemes: {
        SpotifyOAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://accounts.spotify.com/authorize',
              tokenUrl: 'https://accounts.spotify.com/api/token',
              scopes: {
                'user-read-private': 'Read private user data',
                'user-read-email': 'Read user email'
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
        },
        RateLimitExceeded: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Rate limit exceeded. Try again later.' }
                }
              }
            }
          }
        },
        UnauthorizedError: {
          description: 'Authentication failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Invalid or missing API key' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        SpotifyOAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const specs = swaggerJsdoc(options);