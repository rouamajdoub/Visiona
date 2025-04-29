"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/utils/auth-context";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="container py-16">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Subscription</p>
                  <p className="font-medium capitalize">
                    {user.subscription || "Free"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Actions</h2>
              <div className="space-y-4">
                {user.role === "architect" && (
                  <button
                    onClick={() =>
                      (window.location.href =
                        "http://localhost:3000/upload-project")
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium block w-full"
                  >
                    Upload New Project
                  </button>
                )}

                {user.role === "client" && (
                  <>
                    <button
                      onClick={() =>
                        (window.location.href =
                          "http://localhost:3000/projects")
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium block w-full"
                    >
                      Browse Projects
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href =
                          "http://localhost:3000/need-sheet")
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium block w-full"
                    >
                      Create Need Sheet
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    (window.location.href =
                      "http://localhost:3000/account-settings")
                  }
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium block w-full"
                >
                  Account Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
