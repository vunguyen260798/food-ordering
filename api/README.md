# Food Ordering API

A RESTful API for a food ordering system built with Express.js and MongoDB.

## Features

- Product management (CRUD operations)
- Order management with status tracking
- Payment transaction processing
- Order item management
- MongoDB database integration

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` and update with your MongoDB connection string
   - Default port is 5000

3. Start MongoDB (make sure MongoDB is running on your system)

4. Run the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## Project Structure

```
api/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── Product.js           # Product model
│   ├── Order.js             # Order model
│   ├── OrderItem.js         # Order item model
│   └── PaymentTransaction.js # Payment transaction model
├── controllers/
│   ├── productController.js  # Product controller
│   ├── orderController.js    # Order controller
│   └── paymentController.js  # Payment controller
├── routes/
│   └── router.js            # API routes
├── server.js                # Entry point
├── package.json
└── .env                     # Environment variables
```

## API Endpoints

### Products
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders (with optional filters)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

### Payments
- `GET /api/payments` - Get all payment transactions
- `GET /api/payments/:id` - Get single payment transaction
- `POST /api/payments` - Create payment transaction
- `PUT /api/payments/:id/process` - Process payment
- `PUT /api/payments/:id/refund` - Refund payment

## Models

### Product
- name, description, price, category
- image, inStock, preparationTime
- ingredients, dietary info (vegetarian, vegan)
- rating and review count

### Order
- orderNumber, customer details, delivery address
- orderItems (references to OrderItem)
- pricing breakdown (subtotal, tax, delivery fee, total)
- status tracking and payment status
- timestamps and delivery times

### OrderItem
- product reference, product details snapshot
- quantity, subtotal
- customizations and special requests

### PaymentTransaction
- transactionId, order reference
- amount, currency, payment method
- payment gateway integration
- status tracking (pending, processing, completed, failed, refunded)
- refund information

## Example Usage

### Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce and mozzarella",
    "price": 12.99,
    "category": "main-course",
    "inStock": true,
    "isVegetarian": true
  }'
```

### Create an Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product_id_here",
        "quantity": 2
      }
    ],
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

## License

ISC
