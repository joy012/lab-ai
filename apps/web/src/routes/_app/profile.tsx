import { createFileRoute } from "@tanstack/react-router";
import { User, Heart, Shield, Mail, Phone, Droplets } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { healthProfileService } from "@/services/health-profile.service";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const { data: healthProfile } = healthProfileService.useHealthProfile(
    {},
    { enabled: true },
  );

  const hp = healthProfile as any;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border p-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || "User"}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </span>
              )}
            </div>
            <span
              className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
                user?.role === "DOCTOR"
                  ? "bg-primary/10 text-primary"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {user?.role || "PATIENT"}
            </span>
          </div>
        </div>
      </div>

      {/* Health Profile */}
      {hp && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Health Profile</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {hp.age && <InfoCard label="Age" value={`${hp.age} years`} />}
            {hp.gender && <InfoCard label="Gender" value={hp.gender} />}
            {hp.weight && <InfoCard label="Weight" value={`${hp.weight} kg`} />}
            {hp.height && <InfoCard label="Height" value={`${hp.height} cm`} />}
            {hp.bloodGroup && (
              <InfoCard
                label="Blood Group"
                value={hp.bloodGroup}
                icon={<Droplets className="h-4 w-4 text-red-500" />}
              />
            )}
          </div>

          {hp.conditions?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Conditions</p>
              <div className="flex flex-wrap gap-2">
                {hp.conditions.map((c: string, i: number) => (
                  <span
                    key={i}
                    className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hp.medications?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Medications</p>
              <div className="flex flex-wrap gap-2">
                {hp.medications.map((m: string, i: number) => (
                  <span
                    key={i}
                    className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hp.allergies?.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {hp.allergies.map((a: string, i: number) => (
                  <span
                    key={i}
                    className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Account</h2>
        </div>
        <div className="divide-y">
          <InfoRow
            label="Email Verified"
            value={user?.emailVerified ? "Yes" : "No"}
          />
          <InfoRow
            label="Member Since"
            value={user ? new Date(user.createdAt).toLocaleDateString() : "-"}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
