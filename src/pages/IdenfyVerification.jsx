import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";

const IdenfyVerification = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("USER_ID");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const iframeRef = useRef(null);

  // Function to generate token from your backend
  const generateToken = async () => {
    setLoading(true);
    setError(null);

    try {
      // Replace with your actual backend endpoint
      const response = await fetch(`${API_BASE_URL}/idenfy/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const data = await response.json();
      if (data?.authToken) {
        setAuthToken(data?.authToken);
        setShowIframe(true);
      } else {
        setAuthToken(null);
        setShowIframe(false);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error generating token:", err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // For security, verify the origin
      if (event.origin !== "https://ui.idenfy.com") {
        return;
      }

      console.log("Received message from Idenfy:", event.data);

      // Handle verification status
      if (event.data) {
        const { status, manualStatus, autoSuspected, manualSuspected } =
          event.data;

        if (status === "APPROVED") {
          setVerificationStatus("success");
          setShowIframe(false);
        } else if (status === "DENIED") {
          setVerificationStatus("failed");
          setShowIframe(false);
        } else if (status === "EXPIRED" || status === "TIMEOUT") {
          setVerificationStatus("expired");
          setShowIframe(false);
          setError("Verification time expired. Please try again.");
        }

        // Log all statuses for debugging
        console.log("Status:", status);
        console.log("Manual Status:", manualStatus);
        console.log("Auto Suspected:", autoSuspected);
        console.log("Manual Suspected:", manualSuspected);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Auto-detect expired session after 15 minutes
  useEffect(() => {
    let timeoutId;

    if (showIframe && authToken) {
      timeoutId = setTimeout(() => {
        setError("Session expired. Please start a new verification.");
        setVerificationStatus("expired");
        setShowIframe(false);
      }, 15 * 60 * 1000); // 15 minutes
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showIframe, authToken]);

  const startVerification = () => {
    generateToken();
  };

  const resetVerification = () => {
    setAuthToken(null);
    setShowIframe(false);
    setVerificationStatus(null);
    setError(null);
  };

  useEffect(() => {
    generateToken();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Identity Verification
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!showIframe && !verificationStatus && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Verify Your Identity
                </h2>
                <p className="text-gray-600 mb-6">
                  Please ensure you have a valid ID document and your camera is
                  working properly.
                </p>
              </div>

              <button
                onClick={startVerification}
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Start Verification
                  </>
                )}
              </button>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Before you start:
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Have your ID document ready</li>
                  <li>✓ Ensure good lighting</li>
                  <li>✓ Allow camera permissions</li>
                  <li>✓ Use a supported browser (Chrome, Firefox, Safari)</li>
                </ul>
              </div>
            </div>
          )}

          {showIframe && authToken && (
            <div className="relative">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">
                    <strong>Complete the verification within 15 minutes</strong>
                  </p>
                  <button
                    onClick={resetVerification}
                    className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Cancel & Start Over
                  </button>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                <iframe
                  ref={iframeRef}
                  src={`https://ui.idenfy.com/?authToken=${authToken}&lang=en`}
                  allow="camera; microphone"
                  allowFullScreen
                  style={{
                    width: "100%",
                    height: "800px",
                    border: "none",
                  }}
                  title="Idenfy Verification"
                />
              </div>
            </div>
          )}

          {verificationStatus && (
            <div className="text-center py-8">
              {verificationStatus === "success" && (
                <div>
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Verification Successful!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your identity has been verified successfully.
                  </p>
                </div>
              )}

              {verificationStatus === "failed" && (
                <div>
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We couldn't verify your identity. Please try again.
                  </p>
                </div>
              )}

              {verificationStatus === "expired" && (
                <div>
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-12 h-12 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Session Expired
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your verification session has expired. Please start again.
                  </p>
                </div>
              )}

              <button
                onClick={resetVerification}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Start New Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdenfyVerification;
