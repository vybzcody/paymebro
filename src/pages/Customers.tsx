import { EmptyState } from "@/components/EmptyStates";

const Customers = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customer relationships</p>
        </div>
      </div>

      <EmptyState type="customers" />
    </div>
  );
};

export default Customers;
