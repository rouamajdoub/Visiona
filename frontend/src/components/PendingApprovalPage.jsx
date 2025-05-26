// components/PendingApprovalPage.jsx
import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const PendingApprovalPage = () => {
  const { user, logout, reloadUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check status every 30 seconds
    const interval = setInterval(() => {
      reloadUser();
    }, 30000);

    return () => clearInterval(interval);
  }, [reloadUser]);

  useEffect(() => {
    // Redirect if status changed
    if (user?.status === "approved") {
      navigate("/architect");
    } else if (user?.status === "rejected") {
      navigate("/architect/rejected");
    }
  }, [user?.status, navigate]);

  const getStatusMessage = () => {
    switch (user?.status) {
      case "pending":
        return {
          title: "Demande en cours de traitement",
          message:
            "Votre demande d'inscription en tant qu'architecte est en cours d'examen par notre équipe. Nous vous contacterons bientôt.",
          color: "yellow",
        };
      case "rejected":
        return {
          title: "Demande rejetée",
          message:
            "Votre demande d'inscription a été rejetée. Veuillez nous contacter pour plus d'informations.",
          color: "red",
        };
      default:
        return {
          title: "Statut inconnu",
          message: "Nous vérifions votre statut. Veuillez patienter.",
          color: "gray",
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div
            className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-${statusInfo.color}-100`}
          >
            {statusInfo.color === "yellow" && (
              <svg
                className={`h-8 w-8 text-${statusInfo.color}-600`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {statusInfo.color === "red" && (
              <svg
                className={`h-8 w-8 text-${statusInfo.color}-600`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {statusInfo.color === "gray" && (
              <svg
                className={`h-8 w-8 text-${statusInfo.color}-600`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {statusInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{statusInfo.message}</p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={reloadUser}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Actualiser le statut
          </button>

          <button
            onClick={logout}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Se déconnecter
          </button>
        </div>

        {user && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Informations du compte
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <span className="font-medium">Nom:</span> {user.prenom}{" "}
                {user.nomDeFamille}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Statut:</span> {user.status}
              </p>
              {user.patenteNumber && (
                <p>
                  <span className="font-medium">N° Patente:</span>{" "}
                  {user.patenteNumber}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Questions? Contactez-nous à{" "}
            <a
              href="mailto:support@example.com"
              className="text-indigo-600 hover:text-indigo-500"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
