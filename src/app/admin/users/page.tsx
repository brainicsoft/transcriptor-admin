import UsersTable from "../components/ui/tables/UserTable";

export default function UsersPage() {
  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <UsersTable />
    </div>
  )
}