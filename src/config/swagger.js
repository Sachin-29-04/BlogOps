const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BlogOps API',
    version: '1.0.0',
    description: 'RESTful API for blog posts and comments with JWT authentication and Prometheus observability.',
  },
  servers: [
    {
      url: '/',
      description: 'Current host server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /login',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: {
          200: { description: 'API server is running normally' },
        },
      },
    },
    '/metrics': {
      get: {
        summary: 'Prometheus metrics',
        tags: ['System'],
        responses: {
          200: { description: 'Prometheus scrapable metrics output' },
        },
      },
    },
    '/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string', example: 'john_doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered' },
          400: { description: 'Missing fields or user already exists' },
        },
      },
    },
    '/login': {
      post: {
        summary: 'Authenticate user and return JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful, returns JWT Bearer token' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/posts': {
      get: {
        summary: 'Get all blog posts (Public)',
        tags: ['Posts'],
        responses: {
          200: { description: 'List of all posts with author details' },
        },
      },
      post: {
        summary: 'Create a new blog post (Authenticated)',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', example: 'My First Post' },
                  content: { type: 'string', example: 'Here is some content...' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Post created successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/posts/{id}': {
      get: {
        summary: 'Get single blog post by ID (Public)',
        tags: ['Posts'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Post details' },
          404: { description: 'Post not found' },
        },
      },
      put: {
        summary: 'Update blog post (Author only)',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Post updated successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: You are not the author' },
          404: { description: 'Post not found' },
        },
      },
      delete: {
        summary: 'Delete blog post (Author only)',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Post deleted successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: You are not the author' },
          404: { description: 'Post not found' },
        },
      },
    },
    '/comments': {
      get: {
        summary: 'Get comments filtered by post_id (Public)',
        tags: ['Comments'],
        parameters: [
          {
            name: 'post_id',
            in: 'query',
            required: true,
            schema: { type: 'integer' },
            description: 'Target blog post ID',
          },
        ],
        responses: {
          200: { description: 'List of comments for specified post' },
          400: { description: 'Missing post_id query parameter' },
        },
      },
      post: {
        summary: 'Create a comment on a post (Authenticated)',
        tags: ['Comments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['post_id', 'content'],
                properties: {
                  post_id: { type: 'integer', example: 1 },
                  content: { type: 'string', example: 'Great article!' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Comment created successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/comments/{id}': {
      get: {
        summary: 'Get single comment by ID (Public)',
        tags: ['Comments'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Comment details' },
          404: { description: 'Comment not found' },
        },
      },
      put: {
        summary: 'Update comment (Author only)',
        tags: ['Comments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Updated comment text' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Comment updated successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: You are not the author' },
          404: { description: 'Comment not found' },
        },
      },
      delete: {
        summary: 'Delete comment (Author only)',
        tags: ['Comments'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Comment deleted successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: You are not the author' },
          404: { description: 'Comment not found' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
