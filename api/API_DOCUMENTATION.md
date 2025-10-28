# Food Ordering API Documentation

Base URL: `http://localhost:3000/api` (update with your actual server URL)

## Table of Contents
- [Product APIs](#product-apis)
- [Order APIs](#order-apis)

---

## Product APIs

### 1. Get All Products
Retrieve a list of all products with optional filtering.

**Endpoint:** `GET /api/products`

**Access:** Public

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| search | String | Search products by name (case-insensitive) | `?search=burger` |

**Request Example:**
```bash
GET /api/products?search=pizza
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato and mozzarella",
      "price": 12.99,
      "image": "https://example.com/pizza.jpg",
      "variants": [
        {
          "name": "Small",
          "price": 12.99,
          "description": "8 inch pizza",
          "isAvailable": true,
          "sku": "PIZZA-MARG-SM"
        },
        {
          "name": "Large",
          "price": 18.99,
          "description": "12 inch pizza",
          "isAvailable": true,
          "sku": "PIZZA-MARG-LG"
        }
      ],
      "createdAt": "2023-10-15T10:30:00.000Z",
      "updatedAt": "2023-10-15T10:30:00.000Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching products",
  "error": "Error details"
}
```

---

### 2. Get Product by ID
Retrieve a single product by its ID.

**Endpoint:** `GET /api/products/:id`

**Access:** Public

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Product ID (MongoDB ObjectId) |

**Request Example:**
```bash
GET /api/products/60d5ec49f1b2c72b8c8e4f1a
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato and mozzarella",
    "price": 12.99,
    "image": "https://example.com/pizza.jpg",
    "variants": [
      {
        "name": "Small",
        "price": 12.99,
        "description": "8 inch pizza",
        "isAvailable": true,
        "sku": "PIZZA-MARG-SM"
      },
      {
        "name": "Large",
        "price": 18.99,
        "description": "12 inch pizza",
        "isAvailable": true,
        "sku": "PIZZA-MARG-LG"
      }
    ],
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching product",
  "error": "Error details"
}
```

---

### 3. Create Product
Create a new product.

**Endpoint:** `POST /api/products`

**Access:** Private (Admin)

**Request Body:**
```json
{
  "name": "Pepperoni Pizza",
  "description": "Pizza with pepperoni and cheese",
  "price": 14.99,
  "image": "https://example.com/pepperoni.jpg",
  "variants": [
    {
      "name": "Small",
      "price": 14.99,
      "description": "8 inch pizza",
      "isAvailable": true,
      "sku": "PIZZA-PEP-SM"
    },
    {
      "name": "Large",
      "price": 19.99,
      "description": "12 inch pizza",
      "isAvailable": true,
      "sku": "PIZZA-PEP-LG"
    }
  ]
}
```

**Required Fields:**
- `name` (String) - Product name
- `description` (String) - Product description
- `price` (Number) - Base price for the product

**Optional Fields:**
- `image` (String) - URL to product image
- `variants` (Array) - Product variants/sizes
  - `name` (String, required) - Variant name
  - `price` (Number, required) - Variant price
  - `description` (String) - Variant description
  - `isAvailable` (Boolean) - Availability status (default: true)
  - `sku` (String) - Stock keeping unit

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1b",
    "name": "Pepperoni Pizza",
    "description": "Pizza with pepperoni and cheese",
    "price": 14.99,
    "image": "https://example.com/pepperoni.jpg",
    "variants": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f1c",
        "name": "Small",
        "price": 14.99,
        "description": "8 inch pizza",
        "isAvailable": true,
        "sku": "PIZZA-PEP-SM"
      },
      {
        "_id": "60d5ec49f1b2c72b8c8e4f1d",
        "name": "Large",
        "price": 19.99,
        "description": "12 inch pizza",
        "isAvailable": true,
        "sku": "PIZZA-PEP-LG"
      }
    ],
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Error creating product",
  "error": "Validation error details"
}
```

---

### 4. Update Product
Update an existing product.

**Endpoint:** `PUT /api/products/:id`

**Access:** Private (Admin)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Product ID (MongoDB ObjectId) |

**Request Body:**
```json
{
  "name": "Updated Pepperoni Pizza",
  "price": 15.99,
  "description": "Updated description",
  "variants": [
    {
      "name": "Medium",
      "price": 16.99,
      "description": "10 inch pizza",
      "isAvailable": true,
      "sku": "PIZZA-PEP-MD"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f1b",
    "name": "Updated Pepperoni Pizza",
    "description": "Updated description",
    "price": 15.99,
    "image": "https://example.com/pepperoni.jpg",
    "variants": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f1e",
        "name": "Medium",
        "price": 16.99,
        "description": "10 inch pizza",
        "isAvailable": true,
        "sku": "PIZZA-PEP-MD"
      }
    ],
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T11:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Error updating product",
  "error": "Validation error details"
}
```

---

### 5. Delete Product
Delete a product by ID.

**Endpoint:** `DELETE /api/products/:id`

**Access:** Private (Admin)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Product ID (MongoDB ObjectId) |

**Request Example:**
```bash
DELETE /api/products/60d5ec49f1b2c72b8c8e4f1b
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error deleting product",
  "error": "Error details"
}
```

---

## Order APIs

### 1. Get All Orders
Retrieve a list of all orders with optional filtering.

**Endpoint:** `GET /api/orders`

**Access:** Private

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| status | String | Filter by order status | `?status=pending` |
| paymentStatus | String | Filter by payment status | `?paymentStatus=paid` |

**Order Status Values:**
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `delivered`
- `cancelled`

**Payment Status Values:**
- `pending`
- `paid`
- `failed`
- `refunded`

**Request Example:**
```bash
GET /api/orders?status=pending&paymentStatus=paid
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f2a",
      "orderNumber": "ORD-20231015-001",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+1234567890",
      "deliveryAddress": "123 Main St, City, State 12345",
      "status": "pending",
      "paymentStatus": "paid",
      "subtotal": 25.98,
      "tax": 2.08,
      "deliveryFee": 5.00,
      "totalAmount": 33.06,
      "orderItems": [...],
      "paymentTransaction": {...},
      "specialInstructions": "Extra cheese please",
      "createdAt": "2023-10-15T10:30:00.000Z",
      "updatedAt": "2023-10-15T10:30:00.000Z"
    }
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching orders",
  "error": "Error details"
}
```

---

### 2. Get Order by ID
Retrieve a single order by its ID with full details including order items and payment information.

**Endpoint:** `GET /api/orders/:id`

**Access:** Private

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Order ID (MongoDB ObjectId) |

**Request Example:**
```bash
GET /api/orders/60d5ec49f1b2c72b8c8e4f2a
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f2a",
    "orderNumber": "ORD-20231015-001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "deliveryAddress": "123 Main St, City, State 12345",
    "status": "pending",
    "paymentStatus": "paid",
    "subtotal": 25.98,
    "tax": 2.08,
    "deliveryFee": 5.00,
    "totalAmount": 33.06,
    "orderItems": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f3a",
        "product": {
          "_id": "60d5ec49f1b2c72b8c8e4f1a",
          "name": "Margherita Pizza",
          "price": 12.99
        },
        "quantity": 2,
        "price": 12.99,
        "subtotal": 25.98
      }
    ],
    "paymentTransaction": {
      "_id": "60d5ec49f1b2c72b8c8e4f4a",
      "amount": 33.06,
      "status": "completed"
    },
    "specialInstructions": "Extra cheese please",
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Error fetching order",
  "error": "Error details"
}
```

---

### 3. Create Order
Create a new order with order items.

**Endpoint:** `POST /api/orders`

**Access:** Public

**Request Body:**
```json
{
  "items": [
    {
      "productId": "60d5ec49f1b2c72b8c8e4f1a",
      "quantity": 2
    },
    {
      "productId": "60d5ec49f1b2c72b8c8e4f1b",
      "quantity": 1
    }
  ],
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "deliveryAddress": "123 Main St, City, State 12345",
  "specialInstructions": "Extra cheese please"
}
```

**Required Fields:**
- `items` (Array) - Must contain at least one item
  - `productId` (String)
  - `quantity` (Number)
- `customerName` (String)
- `customerEmail` (String)
- `customerPhone` (String)
- `deliveryAddress` (String)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f2a",
    "orderNumber": "ORD-20231015-001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "deliveryAddress": "123 Main St, City, State 12345",
    "status": "pending",
    "paymentStatus": "pending",
    "subtotal": 40.97,
    "tax": 3.28,
    "deliveryFee": 5.00,
    "totalAmount": 49.25,
    "orderItems": [...],
    "specialInstructions": "Extra cheese please",
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Order must contain at least one item"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Product not found: 60d5ec49f1b2c72b8c8e4f1a"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Product out of stock: Margherita Pizza"
}
```

---

### 4. Update Order Status
Update the status of an existing order.

**Endpoint:** `PUT /api/orders/:id/status`

**Access:** Private (Admin)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Order ID (MongoDB ObjectId) |

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `delivered`
- `cancelled`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f2a",
    "orderNumber": "ORD-20231015-001",
    "status": "confirmed",
    "customerName": "John Doe",
    "totalAmount": 49.25,
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T10:35:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid status value"
}
```

---

### 5. Cancel Order
Cancel an existing order.

**Endpoint:** `PUT /api/orders/:id/cancel`

**Access:** Private

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Order ID (MongoDB ObjectId) |

**Request Body:**
```json
{
  "cancellationReason": "Customer requested cancellation"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f2a",
    "orderNumber": "ORD-20231015-001",
    "status": "cancelled",
    "cancellationReason": "Customer requested cancellation",
    "customerName": "John Doe",
    "totalAmount": 49.25,
    "createdAt": "2023-10-15T10:30:00.000Z",
    "updatedAt": "2023-10-15T10:40:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot cancel order that is already delivered"
}
```

---

## Error Codes Summary

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created Successfully |
| 400 | Bad Request (Invalid data or validation error) |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

---

## Additional Notes

### Authentication
Some endpoints require authentication (marked as "Private"). You'll need to include authentication headers in your requests:

```bash
Authorization: Bearer <your-token-here>
```

### Response Format
All API responses follow a consistent format:
```json
{
  "success": true/false,
  "message": "Optional message",
  "data": {} or [],
  "error": "Error details (only on failure)"
}
```

### Testing with cURL

**Get all products:**
```bash
curl -X GET http://localhost:3000/api/products
```

**Create a product:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pepperoni Pizza",
    "description": "Pizza with pepperoni and cheese",
    "price": 14.99,
    "image": "https://example.com/pepperoni.jpg",
    "variants": [
      {"name": "Small", "price": 14.99, "isAvailable": true},
      {"name": "Large", "price": 19.99, "isAvailable": true}
    ]
  }'
```

**Create an order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "60d5ec49f1b2c72b8c8e4f1a", "quantity": 2}],
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "deliveryAddress": "123 Main St"
  }'
```

---

**Last Updated:** October 28, 2025
