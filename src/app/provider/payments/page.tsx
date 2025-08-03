import PaymentReports from "@/components/provider/payment-reports";

export default function ProviderPaymentsPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-1">Payments & Reporting</h2>
            <p className="text-muted-foreground mb-4">Track client payments, view balances, and generate financial reports.</p>
            <PaymentReports />
        </div>
    );
}
