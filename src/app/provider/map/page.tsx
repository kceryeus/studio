import CollectionMap from "@/components/provider/collection-map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProviderMapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card className="bg-destructive/20 border-destructive">
        <CardHeader>
          <CardTitle>Configuration Error</CardTitle>
          <CardDescription>
            The Google Maps API key is missing. Please set the <code className="font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable to display the map.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div>
        <h2 className="text-2xl font-bold mb-1">Interactive Collection Map</h2>
        <p className="text-muted-foreground mb-4">Visualize client locations and collection statuses in real-time.</p>
        <CollectionMap apiKey={apiKey} />
    </div>
  );
}
