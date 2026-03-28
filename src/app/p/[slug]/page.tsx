import { adminDb } from "@/lib/firebase/admin";
import PresentationView from "./PresentationView";

export default async function PresentationPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const leadsSnapshot = await adminDb.collection("leads").where("slug", "==", slug).limit(1).get();
  
  if (leadsSnapshot.empty) {
    return (
      <div className="min-h-screen bg-[#060608] flexflex-col items-center justify-center text-white font-syne text-center p-8">
        <h2 className="text-4xl font-extrabold mb-4 italic uppercase">Presentation Not Found</h2>
        <p className="text-gray-400">The requested presentation does not exist or has been removed.</p>
      </div>
    );
  }

  const leadData = leadsSnapshot.docs[0].data();
  // Safe serialization for Client Component
  const lead = { 
    id: leadsSnapshot.docs[0].id, 
    ...leadData,
    createdAt: leadData.createdAt ? new Date(leadData.createdAt).toISOString() : new Date().toISOString()
  };

  return <PresentationView lead={lead} />;
}
