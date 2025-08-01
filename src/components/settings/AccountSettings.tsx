import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "./ChangePasswordForm";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  plan_type?: string;
}

const AccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Try to get profile from profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile from database:", profileError);

        // Fall back to creating profile from user metadata
        const userProfile = {
          id: session.user.id,
          first_name: session.user.user_metadata.first_name || "",
          last_name: session.user.user_metadata.last_name || "",
          email: session.user.email || "",
          plan_type: "free",
        };

        setProfile(userProfile);

        // Try to create/update the profile in the database
        try {
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: session.user.id,
              first_name: userProfile.first_name,
              last_name: userProfile.last_name,
              email: userProfile.email,
              plan_type: "free",
            });

          if (upsertError) {
            console.error("Error upserting profile:", upsertError);
          }
        } catch (err) {
          console.error("Error with profiles table upsert:", err);
        }
      } else {
        // Use profile from database
        setProfile(profileData);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error loading profile",
      });
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
        },
      });

      if (authError) throw authError;

      // Update profiles table
      try {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          plan_type: profile.plan_type || "free",
        });

        if (profileError) {
          console.error("Error updating profile in database:", profileError);
        }
      } catch (err) {
        console.error("Error updating profiles table:", err);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating profile",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <CardTitle>Account Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your personal information and email preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.first_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.last_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                Email cannot be changed. Contact support if you need to update
                your email.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ChangePasswordForm />

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your account security and multi-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Multi-Factor Authentication</h4>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/mfa-setup")}>
                Set Up MFA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
