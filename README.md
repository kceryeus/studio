# RECOLIXO - Modern Waste Management Solution

RECOLIXO is a comprehensive web application designed to modernize and streamline waste collection services. It serves as a digital platform that connects waste collection service providers with their clients to create an efficient, transparent, and well-organized waste management ecosystem.

## 🚀 New Features - Client Management for Providers

### Quick Client Registration
- **Phone Number as Core Identifier**: All clients now require a phone number for registration
- **Local Management**: Service providers can add and manage clients locally without requiring synchronization
- **Future Sync Ready**: Phone numbers act as synchronization keys for when clients later register on the app
- **M-Pesa/e-Mola Ready**: Phone numbers are prepared for future payment integration

### Enhanced Client Management
- **Quick Add Form**: Streamlined client registration with essential fields only
- **Phone Validation**: Mozambique phone number format validation (9 digits starting with 8 or 9)
- **Status Tracking**: Monitor client collection status, payment status, and sync status
- **Bulk Operations**: Efficient management of multiple clients

## 🗺️ Advanced Maps & Routes Management

### Route Points Management
- **Client Association**: Link route points to existing clients or keep them unassociated
- **Smart Linking**: Automatically link unassociated points to clients without locations
- **Point Types**: Support for both client-linked and standalone collection points
- **Coordinate Management**: Precise latitude/longitude input with validation

### Routes Management
- **Multiple Routes**: Design and manage multiple collection routes simultaneously
- **Custom Naming**: Descriptive route names for easy identification
- **Weekday Assignment**: Flexible scheduling with multiple collection days
- **Color Coding**: Visual route differentiation with customizable colors
- **Active/Inactive Toggle**: Enable/disable routes as needed

### Advanced Features
- **Route Visualization**: Interactive map display with route lines and point markers
- **Street-Based Routing**: Routes follow actual streets and roads instead of straight lines
- **Accurate Metrics**: Real-world distance and time calculations based on road networks
- **Point Reordering**: Drag-and-drop functionality for route optimization
- **Client Information**: Display client status, sync status, and collection details
- **Route Recalculation**: Manually update routes to use latest street-based calculations

### Map Integration
- **Interactive Maps**: Full-screen map view with route overlays
- **Layer Controls**: Toggle client markers and route lines independently
- **Point Addition**: Click-to-add route points directly on the map
- **Real-time Updates**: Live synchronization between map and route data
- **Responsive Design**: Mobile-friendly map interface

## 📱 Phone Number Format

The system now accepts simple 9-digit Mozambique phone numbers:
- `846784911` (9 digits starting with 8 or 9)
- `912345678` (9 digits starting with 8 or 9)

No prefixes, spaces, or special characters required. Just enter the 9-digit number directly.

## 🛣️ Routing System

### Street-Based Routing
The system now provides **actual road-following routes** instead of straight lines between points:

- **OpenRouteService Integration**: Uses real-world road networks for accurate routing
- **Multiple Vehicle Profiles**: Support for cars, trucks, cycling, and walking
- **Automatic Fallback**: Falls back to straight-line calculations if routing service is unavailable
- **Route Optimization**: Calculates optimal paths between multiple collection points
- **Real-time Metrics**: Accurate distance and duration calculations based on road networks

### Routing Quality Indicators
The map interface shows routing quality for each route:
- 🟢 **Green**: Street-following routes using real road networks
- 🟡 **Yellow**: Straight-line routes (fallback when street routing unavailable)

### Getting Street-Following Routes

1. **Set API Key**: Add your OpenRouteService API key to `.env.local`:
   ```bash
   OPENROUTE_API_KEY=your_actual_api_key_here
   ```

2. **Create Routes**: Routes automatically use street routing when API is available
3. **Add Points**: Each new point triggers route recalculation with street routing
4. **View Quality**: Check the routing quality indicator on the map

### API Key Setup
1. Visit [OpenRouteService](https://openrouteservice.org/dev/#/signup)
2. Create a free account and get your API key
3. Add the key to your `.env.local` file
4. Restart your development server

**Note**: Without a valid API key, the system will use the demo key which has limited functionality and will fall back to straight-line routes.

### Route Calculation Features
- **Multi-point Routing**: Calculates optimal paths through multiple collection points
- **Distance Accuracy**: Real-world distances based on actual road networks
- **Time Estimation**: Accurate travel time calculations considering road conditions
- **Segment Data**: Detailed route segments for precise visualization
- **Automatic Updates**: Routes recalculate automatically when points are added/modified

## 🔧 Technical Implementation

### Data Models
- **Enhanced Route Type**: Includes points, colors, metrics, and scheduling
- **RoutePoint Interface**: Supports both client-linked and standalone points
- **CollectionTime**: Flexible time scheduling for routes
- **Provider Interface**: Complete provider management with subscription tracking

### Utility Functions
- **Distance Calculation**: Street-based routing with Haversine fallback
- **Route Metrics**: Automatic calculation of total distance and estimated duration
- **Phone Validation**: Mozambique-specific phone number validation
- **Color Generation**: Random color assignment for route visualization
- **Routing Service**: Integration with OpenRouteService for real-world route calculation

### Components Architecture
- **RoutesManager**: Main route management interface
- **RoutePointEditor**: Point creation, editing, and client linking
- **CollectionMap**: Interactive map with route visualization
- **ClientList**: Enhanced client management with phone number support

## 🎯 Key Benefits

### For Service Providers
- **Efficient Route Planning**: Visual route design with automatic optimization
- **Client Management**: Local client database with future sync capabilities
- **Operational Insights**: Distance, duration, and point count metrics
- **Flexible Scheduling**: Multiple collection days and time slots

### For Future Integration
- **Payment Ready**: Phone numbers prepared for M-Pesa/e-Mola integration
- **Client Sync**: Automatic linking when clients register on the app
- **API Ready**: Structured data models for external integrations
- **Scalable Architecture**: Modular component design for easy expansion

## 🚀 Getting Started

1. **Create Routes**: Use the Routes Manager to create new collection routes
2. **Add Points**: Add collection points with coordinates and optional client linking
3. **Manage Clients**: Use the Quick Add Client form for efficient client registration
4. **Visualize Routes**: View routes on the interactive map with real-time updates
5. **Optimize Operations**: Use metrics and distance calculations for route optimization

## 🔮 Future Enhancements

- **TSP Optimization**: Traveling Salesman Problem optimization for route efficiency
- **Advanced Scheduling**: Time-based route optimization with traffic patterns
- **Mobile App Integration**: Native mobile applications for field workers
- **Real-time Tracking**: Live vehicle and worker location tracking
- **Analytics Dashboard**: Advanced reporting and performance metrics
- **Multi-Profile Routing**: Support for different vehicle types and road restrictions

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# OpenRouteService API Key for street-based routing
# Get your free API key at: https://openrouteservice.org/dev/#/signup
OPENROUTE_API_KEY=your_api_key_here

# MapTiler API Key for map tiles
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_key_here
```

**Note**: The OpenRouteService API key is used server-side only (in the API route) to avoid exposing it to the client. The MapTiler key is used client-side for map rendering.

---

*RECOLIXO - Transforming waste collection through intelligent technology and efficient management.*
