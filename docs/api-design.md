# API Design Specification

## Overview

This document defines the RESTful API design for the multi-sided marketplace platform, optimized for mobile consumption with consistent patterns, security, and performance.

## API Design Principles

### 1. Mobile-First Optimization
- Minimal data transfer for list views
- Paginated responses with configurable limits
- Compressed JSON responses
- Optimized image URLs with multiple sizes
- Offline-friendly design patterns

### 2. Consistent Response Format
```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "errors": null
}
```

### 3. Error Handling
```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid email format",
      "field": "email"
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "buyer|seller|admin",
  "permissions": ["read:products", "write:orders"],
  "iat": 1642248600,
  "exp": 1642249500
}
```

### Authorization Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-API-Version: v1
X-Platform: ios|android
```

## Core API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "buyer",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "buyer",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

#### POST /api/v1/auth/login
Authenticate user and return tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

#### POST /api/v1/auth/logout
Invalidate user tokens.

### User Management Endpoints

#### GET /api/v1/users/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "avatar": "https://cdn.example.com/avatars/123.jpg",
    "isVerified": true,
    "rating": 4.8,
    "totalOrders": 25,
    "memberSince": "2024-01-15T10:30:00Z",
    "preferences": {
      "notifications": true,
      "newsletter": false
    }
  }
}
```

#### PUT /api/v1/users/profile
Update user profile information.

#### POST /api/v1/users/avatar
Upload user avatar image.

### Product Management Endpoints

#### GET /api/v1/products
List products with filtering and pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Text search in title/description
- `sellerId` - Filter by seller
- `sortBy` - Sort field (price, rating, date)
- `sortOrder` - asc|desc

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 456,
        "title": "Premium Wireless Headphones",
        "description": "High-quality wireless headphones...",
        "price": 199.99,
        "currency": "USD",
        "images": [
          {
            "url": "https://cdn.example.com/products/456/main.jpg",
            "thumbnail": "https://cdn.example.com/products/456/thumb.jpg"
          }
        ],
        "category": {
          "id": 12,
          "name": "Electronics"
        },
        "seller": {
          "id": 789,
          "name": "TechStore Pro",
          "rating": 4.9,
          "isVerified": true
        },
        "rating": 4.7,
        "reviewCount": 156,
        "inStock": true,
        "inventoryCount": 25,
        "createdAt": "2024-01-10T15:20:00Z"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### GET /api/v1/products/:id
Get detailed product information.

#### POST /api/v1/products
Create new product (sellers only).

**Request:**
```json
{
  "title": "Premium Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation...",
  "price": 199.99,
  "currency": "USD",
  "categoryId": 12,
  "inventoryCount": 50,
  "images": [
    "base64_encoded_image_1",
    "base64_encoded_image_2"
  ],
  "specifications": {
    "brand": "AudioTech",
    "model": "AT-WH100",
    "warranty": "2 years"
  },
  "shippingInfo": {
    "weight": 0.5,
    "dimensions": "20x15x8",
    "freeShipping": true
  }
}
```

#### PUT /api/v1/products/:id
Update product (seller/admin only).

#### DELETE /api/v1/products/:id
Delete product (seller/admin only).

### Order Management Endpoints

#### GET /api/v1/orders
List user orders with status filtering.

**Query Parameters:**
- `status` - pending|confirmed|shipped|delivered|cancelled
- `page`, `limit` - Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 789,
        "orderNumber": "ORD-2024-001234",
        "status": "shipped",
        "totalAmount": 249.98,
        "currency": "USD",
        "items": [
          {
            "id": 101,
            "productId": 456,
            "title": "Premium Wireless Headphones",
            "quantity": 1,
            "price": 199.99,
            "image": "https://cdn.example.com/products/456/thumb.jpg"
          }
        ],
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "US"
        },
        "tracking": {
          "carrier": "FedEx",
          "trackingNumber": "1234567890",
          "estimatedDelivery": "2024-01-20T18:00:00Z"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-16T14:20:00Z"
      }
    ]
  }
}
```

#### GET /api/v1/orders/:id
Get detailed order information.

#### POST /api/v1/orders
Create new order from cart.

**Request:**
```json
{
  "items": [
    {
      "productId": 456,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentMethodId": "pm_1234567890"
}
```

#### PUT /api/v1/orders/:id/status
Update order status (sellers/admin only).

### Cart Management Endpoints

#### GET /api/v1/cart
Get current user's cart.

#### POST /api/v1/cart/items
Add item to cart.

#### PUT /api/v1/cart/items/:id
Update cart item quantity.

#### DELETE /api/v1/cart/items/:id
Remove item from cart.

### Payment Endpoints

#### POST /api/v1/payments/intent
Create payment intent for order.

**Request:**
```json
{
  "orderId": 789,
  "paymentMethodId": "pm_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_xyz",
    "amount": 24998,
    "currency": "usd"
  }
}
```

#### POST /api/v1/payments/confirm
Confirm payment completion.

### Review System Endpoints

#### GET /api/v1/products/:id/reviews
Get product reviews with pagination.

#### POST /api/v1/reviews
Create new review.

**Request:**
```json
{
  "productId": 456,
  "orderId": 789,
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Great quality headphones, highly recommended.",
  "images": ["base64_encoded_image"]
}
```

#### PUT /api/v1/reviews/:id
Update review (author only).

#### DELETE /api/v1/reviews/:id
Delete review (author/admin only).

### Messaging Endpoints

#### GET /api/v1/conversations
List user conversations.

#### GET /api/v1/conversations/:id/messages
Get conversation messages.

#### POST /api/v1/conversations/:id/messages
Send new message.

**Request:**
```json
{
  "content": "Hello, I have a question about this product.",
  "type": "text",
  "attachments": []
}
```

### Search Endpoints

#### GET /api/v1/search/products
Advanced product search.

**Query Parameters:**
- `q` - Search query
- `category` - Category filter
- `priceRange` - Price range filter
- `location` - Location-based search
- `sortBy` - Relevance, price, rating, date

#### GET /api/v1/search/suggestions
Get search suggestions for autocomplete.

### Admin Endpoints

#### GET /api/v1/admin/users
List all users (admin only).

#### PUT /api/v1/admin/users/:id/status
Update user status (admin only).

#### GET /api/v1/admin/analytics
Get platform analytics (admin only).

## Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642249500
```

### Rate Limits by Endpoint Type
- **Authentication**: 5 requests per minute
- **Search**: 100 requests per minute
- **Product Listing**: 200 requests per minute
- **Order Operations**: 50 requests per minute
- **File Uploads**: 10 requests per minute

## Caching Strategy

### Cache Headers
```http
Cache-Control: public, max-age=300
ETag: "abc123def456"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

### Cacheable Endpoints
- Product listings: 5 minutes
- Product details: 10 minutes
- User profiles: 1 minute
- Categories: 1 hour

## Error Codes

### Standard HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

### Custom Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `INSUFFICIENT_INVENTORY` - Not enough stock
- `PAYMENT_FAILED` - Payment processing error
- `ORDER_NOT_FOUND` - Order doesn't exist
- `UNAUTHORIZED_SELLER` - User not authorized as seller

## WebSocket Events (Real-time Features)

### Connection
```javascript
// Client connects with JWT token
socket.emit('authenticate', { token: 'jwt_token_here' });
```

### Message Events
```javascript
// New message received
socket.on('message:new', (data) => {
  // Handle new message
});

// Order status updated
socket.on('order:status_updated', (data) => {
  // Handle order status change
});
```

## API Versioning

### URL Versioning
- Current: `/api/v1/`
- Future: `/api/v2/`

### Deprecation Strategy
- 6-month deprecation notice
- Backward compatibility maintenance
- Clear migration documentation

This API design provides a solid foundation for mobile-first marketplace functionality with proper security, performance optimization, and scalability considerations.

