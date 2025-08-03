import PaymentForm from "@/components/client/payment-form";
import { DUMMY_CLIENTS } from "@/lib/data";

export default function ClientPaymentPage() {
    // For this prototype, we'll just use the first client's data
    const clientData = DUMMY_CLIENTS[0];
    
    return (
        <div className="max-w-2xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold font-headline">Make a Payment</h1>
                <p className="text-muted-foreground">Securely pay your bill or add credit to your account.</p>
            </div>
            <PaymentForm client={clientData} />
        </div>
    );
}
