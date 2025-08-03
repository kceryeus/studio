import CollectionMap from "@/components/provider/collection-map";

export default function ProviderMapPage() {
  return (
    <div>
        <h2 className="text-2xl font-bold mb-1">Interactive Collection Map</h2>
        <p className="text-muted-foreground mb-4">Visualize client locations and collection statuses in real-time.</p>
        <CollectionMap />
    </div>
  );
}
