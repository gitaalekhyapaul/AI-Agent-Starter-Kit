"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface TwitterProfile {
  data: {
    id: string;
    name: string;
    username: string;
    description?: string;
    profile_image_url?: string;
    public_metrics?: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
    verified?: boolean;
  };
}

export default function SuccessPage() {
  const { tokenId } = useParams();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<TwitterProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [smartAccount, setSmartAccount] = useState<string | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchTwitterProfile = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          throw new Error("No token provided");
        }
        // Store token in session storage
        sessionStorage.setItem("twitter_token", token);

        const response = await fetch(
          "/api/auth/twitter/success?token=" + token
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTwitterProfile();
  }, [searchParams]);

  const handleGetSmartAccount = async () => {
    setIsLoadingAccount(true);
    try {
      const response = await fetch(
        `/api/auth/twitter/getAccountAddress?userId=${profile?.data.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch account");
      const { account } = await response.json();
      setSmartAccount(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get account");
    } finally {
      setIsLoadingAccount(false);
    }
  };

  const handleSendAirdrop = async () => {
    if (!smartAccount) return;
    setIsSending(true);
    try {
      const response = await fetch(
        `/api/auth/twitter/sendAirdrop/${tokenId}/${smartAccount}`
      );
      if (!response.ok) throw new Error("Failed to send airdrop");
      alert("Airdrop sent successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send airdrop");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader className="bg-white">
          <CardTitle>Twitter Authentication Success</CardTitle>
          <CardDescription>
            Wow.XYZ Token:{" "}
            <a
              href={`https://wow.xyz/${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {tokenId}
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : isLoading ? (
            <Card className="border-2 bg-white">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="text-sm text-center text-gray-500">
                    Loading your profile details...
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : profile ? (
            <Card className="border-2 bg-white">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {profile.data.profile_image_url && (
                      <Image
                        src={profile.data.profile_image_url}
                        alt={profile.data.name}
                        className="h-12 w-12 rounded-full"
                        width={100}
                        height={100}
                      />
                    )}
                    <div>
                      <div className="font-medium">{profile.data.name}</div>
                      <div className="text-sm text-gray-500">
                        @{profile.data.username}
                      </div>
                    </div>
                  </div>
                  {profile.data.description && (
                    <p className="text-sm text-gray-700">
                      {profile.data.description}
                    </p>
                  )}
                  {profile.data.public_metrics && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        {profile.data.public_metrics.followers_count} followers
                      </span>
                      <span>
                        {profile.data.public_metrics.following_count} following
                      </span>
                      <span>
                        {profile.data.public_metrics.tweet_count} tweets
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>

      {profile && !smartAccount && (
        <Button
          onClick={handleGetSmartAccount}
          disabled={isLoadingAccount}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoadingAccount ? "Fetching Account..." : "Claim Airdrop"}
        </Button>
      )}

      {isLoadingAccount && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Skeleton className="h-6 w-[300px] mx-auto" />
              <p className="mt-2 text-gray-500">
                Fetching your smart account address...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {smartAccount && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="break-all text-sm space-y-1">
                <div className="font-semibold">Smart Account:</div>
                <a
                  href={`https://basescan.org/address/${smartAccount}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {smartAccount}
                </a>
              </div>
              <Button
                onClick={handleSendAirdrop}
                disabled={isSending}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {isSending ? "Sending..." : "Send to Address"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
