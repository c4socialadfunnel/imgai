# IMGAI - AI-Powered Image Editing Platform

A comprehensive React/Next.js application that provides AI-powered image editing capabilities using Google's Vertex AI, with user management, subscription systems, and a modern admin panel.

## Features

### Core AI Tools
- **Image Enhancement**: Improve quality, resolution, and clarity
- **Object Removal**: Remove unwanted elements with precision
- **Style Transfer**: Apply artistic styles and filters
- **Text-to-Image**: Generate images from text descriptions
- **Avatar Generation**: Create custom AI avatars

### User Management
- Role-based authentication (Admin/User)
- Credit system for AI feature usage
- Subscription tiers with Stripe integration
- User profiles and settings

### Admin Panel
- User management (create, edit, ban users)
- Credit adjustments and transaction history
- Subscription oversight
- Analytics and reporting
- AI model configuration

## Tech Stack

- **Frontend**: React 18, Next.js 13, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Integration**: Google Vertex AI (Gemini models)
- **Payments**: Stripe (via Supabase Edge Functions)
- **Authentication**: Supabase Auth with social providers

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Cloud Platform account with Vertex AI enabled
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd imgai-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Supabase, Google Cloud, and Stripe credentials.

4. Set up the database:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/create_initial_schema.sql`
   - Set up Row Level Security policies

5. Configure Google Vertex AI:
   - Enable Vertex AI API in Google Cloud Console
   - Create a service account with Vertex AI permissions
   - Download the service account key

6. Set up Stripe:
   - Create Stripe products and prices
   - Configure webhook endpoints
   - Set up subscription plans

7. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── app/                    # Next.js app router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── supabase/             # Supabase configuration
│   └── migrations/        # Database migrations
└── types/                # TypeScript type definitions
```

## Key Features

### Authentication & Authorization
- Email/password authentication
- Social login (Google, GitHub)
- Role-based access control
- Protected routes and API endpoints

### Credit System
- Users earn/purchase credits for AI operations
- Transaction history and credit management
- Admin credit adjustments
- Subscription-based credit allocation

### AI Integration
- Modular AI service architecture
- Support for multiple AI models
- Progress tracking for long-running operations
- Error handling and retry mechanisms

### Admin Panel
- User management dashboard
- Credit system administration
- Analytics and reporting
- System configuration

## Database Schema

### Core Tables
- `users`: Extended user profiles with roles and credits
- `subscriptions`: Stripe subscription management
- `images`: Image processing history and metadata
- `credit_transactions`: Credit usage and purchase tracking
- `admin_logs`: Admin action audit trail
- `ai_models`: AI model configuration

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Audit logging for admin actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please email support@imgai.com or create an issue in the GitHub repository.