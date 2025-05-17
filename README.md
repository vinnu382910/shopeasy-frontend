# ShopEasy - eCommerce Frontend

![React](https://img.shields.io/badge/React-18.x-blue)
![React Router](https://img.shields.io/badge/React_Router-6.x-orange)
![Axios](https://img.shields.io/badge/Axios-1.x-lightgrey)
![React Toastify](https://img.shields.io/badge/React_Toastify-10.x-yellow)

A modern eCommerce frontend built with React that connects to the ShopEasy backend API, providing a seamless shopping experience for users and merchants.

## Live Demo

🔗 [https://shopeasy-frontend-ecru.vercel.app/](https://shopeasy-frontend-ecru.vercel.app/)

## Features

### 1. User Features
- **Authentication**: Secure login/signup with JWT
- **Product Browsing**: View all products with filters
- **Product Search**: Find products by name, category, or brand
- **Advanced Filtering**:
  - Filter by category
  - Price range filtering
  - Brand filtering
  - Sort by price (low-high, high-low)
  - Featured products toggle
- **Product Details**: View detailed product information
- **Shopping Cart**: Add/remove items, adjust quantities
- **Wishlist**: Save favorite products for later
- **Responsive Design**: Works on all device sizes

### 2. Merchant Features
- **Merchant Authentication**: Separate login/signup
- **Product Management**:
  - Add new products with images
  - Update existing products
  - Delete products
- **Profile Management**: Update merchant information
- **Order Management**: View and update order statuses

## Screenshots

![Home Page](https://res.cloudinary.com/dgc9ugux7/image/upload/v1747488073/shopeasy-homepage_haxejz.png)
![Product Page](https://res.cloudinary.com/dgc9ugux7/image/upload/v1747488376/Product-dashboard_vd2mio.png)
![Filters Dashboard](https://res.cloudinary.com/dgc9ugux7/image/upload/v1747488349/Filters-shopEasy_ms8ecl.png)
![Merchant Dashboard](https://res.cloudinary.com/dgc9ugux7/image/upload/v1747488357/Merchant-Dashboard_tv4z2f.png)

## Technologies Used

- **React**: Frontend library for building user interfaces
- **React Router v6**: For client-side routing
- **Axios**: For making HTTP requests to the backend API
- **React Toastify**: For displaying notifications
- **React Icons**: For scalable vector icons
- **CSS**: For styling components
- **React Hooks**: For state management and side effects

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vinnu382910/shopeasy-frontend.git
cd shopeasy-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
REACT_APP_API_BASE_URL=https://your-backend-api-url.com
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

4. Start the development server:
```bash
npm start
```

5. For production build:
```bash
npm run build
```

## Project Structure

```
src/
├── components/               # Reusable components
│   ├── auth/                 # Authentication components
│   ├── cart/                 # Shopping cart components
│   ├── common/               # Shared components
│   ├── merchant/             # Merchant-specific components
│   ├── product/              # Product-related components
│   └── wishlist/             # Wishlist components
├── pages/                    # Page components
├── utils/                    # Utility functions
├── App.js                    # Main application component
├── index.js                  # Application entry point
└── styles/                   # Global styles
```

## Key Components

### 1. Authentication Flow
- `Login.js`: Handles user login
- `Signup.js`: Handles user registration
- `MerchantLogin.js`: Handles merchant login
- `MerchantSignup.js`: Handles merchant registration
- Implements JWT token storage in localStorage

### 2. Product Management
- `ProductList.js`: Displays filtered products
- `ProductInfo.js`: Shows detailed product information
- `AddProductForm.js`: Merchant form for adding new products
- `ProductFilters.js`: Handles all filtering functionality

### 3. Private Routing
- Implements protected routes for:
  - Authenticated users (`/home`, `/cart`, `/wishlist`)
  - Authenticated merchants (`/merchant/*`)

### 4. State Management
- Uses React context and hooks for:
  - Authentication state
  - Shopping cart
  - Wishlist
  - Product filters

## Connecting to Backend

This frontend connects to the ShopEasy backend API which provides:
- User/merchant authentication
- Product data
- Order processing
- Image upload via Cloudinary

Backend GitHub Repository:  
📦 [https://github.com/yourusername/shopeasy-backend](https://github.com/yourusername/shopeasy-backend)

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm eject`: Ejects from Create React App configuration

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

For questions or support, please contact:
- Your Name - vinaykalva712@gmail.com
- Project Link: [https://github.com/vinnu382910/shopeasy-frontend](https://github.com/vinnu382910/shopeasy-frontend)
```

This README includes:
1. Clear feature descriptions for both users and merchants
2. Installation instructions with environment setup
3. Project structure overview
4. Key component explanations
5. Backend connection details
6. Contribution guidelines
7. License and contact information

You can customize it further by:
1. Adding actual screenshots
2. Including a demo video link
3. Adding more detailed documentation for complex components
4. Including test coverage information if available
5. Adding deployment instructions for different platforms
