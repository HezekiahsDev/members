"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Users,
  Star,
  BookOpen,
  Zap,
  Calendar,
  LifeBuoy,
  Edit3,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { ACTBotV3 } from "@/components/act-bot-v3"; // For embedded bot in Support tab
import {
  submitContactForm,
  submitTweakRequest,
  schedulePaidConsult,
} from "@/app/actions"; // Mock server actions
import { cn } from "@/lib/utils";

// Mock data - in a real app, this would come from a database via server components or API
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  purchases: [
    {
      id: "purchase1",
      name: "Growth Bundle",
      date: "2025-05-15",
      tweakUsed: false,
      daysRemainingForTweak: 15,
    },
    {
      id: "purchase2",
      name: "Playbook",
      date: "2025-04-10",
      tweakUsed: true,
      daysRemainingForTweak: 0,
    },
  ],
  hoursSaved: 12,
  creditsEarned: 25, // From reviews
  referrals: 2,
  referralCode: "JOHN2025",
  q5_challenge: "Sales", // Example challenge
  reviews: [
    // Example: { platform: "Google", status: "pending/approved/rejected", credit: 25 }
    { platform: "Google", submitted: true, credit: 25 },
    { platform: "LinkedIn", submitted: false },
  ],
  // ... other user data
};

const reviewPlatforms = [
  "LinkedIn",
  "Google Reviews",
  "Facebook",
  "Instagram",
  "Yelp",
  "Nextdoor",
];
const MAX_REVIEW_CREDITS = 150;
const CREDIT_PER_REVIEW = 25;

interface MembersAreaProps {
  startBotAt?: number | null;
}

export function MembersArea({ startBotAt }: MembersAreaProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(mockUser); // In real app, fetch this
  const [showSupportBot, setShowSupportBot] = useState(false);
  const [showContinuationBot, setShowContinuationBot] = useState(false);
  const [botUserData, setBotUserData] = useState(null);

  // Check if we need to continue bot conversation from Q4
  useEffect(() => {
    if (startBotAt && startBotAt >= 4) {
      // Retrieve stored user data from the bot session
      const storedBotData = localStorage.getItem("actBotUserData");
      if (storedBotData) {
        try {
          const parsedData = JSON.parse(storedBotData);
          setBotUserData(parsedData);
          setShowContinuationBot(true);
          setActiveTab("dashboard"); // Show on dashboard initially
          // Clear the stored data after retrieving
          localStorage.removeItem("actBotUserData");
        } catch (error) {
          console.error("Error parsing stored bot data:", error);
        }
      }
    }
  }, [startBotAt]);

  // Tweak Page State
  const [selectedPurchaseForTweak, setSelectedPurchaseForTweak] = useState<
    (typeof userData.purchases)[0] | null
  >(null);
  const [tweakChallenge, setTweakChallenge] = useState(
    userData.q5_challenge || ""
  );
  const [tweakBusinessSize, setTweakBusinessSize] = useState("");
  const [tweakDreamOutcome, setTweakDreamOutcome] = useState("");
  const [tweakSuccessMetric, setTweakSuccessMetric] = useState("");
  const [tweakSettleOutcome, setTweakSettleOutcome] = useState("");
  const [tweakAdditionalNotes, setTweakAdditionalNotes] = useState("");
  const [tweakFormError, setTweakFormError] = useState("");
  const [tweakSuccessMessage, setTweakSuccessMessage] = useState("");

  const totalReviewCredits = userData.reviews
    .filter((r) => r.submitted)
    .reduce((sum, r) => sum + (r.credit || 0), 0);

  const handleStartTweak = (purchase: (typeof userData.purchases)[0]) => {
    if (purchase.daysRemainingForTweak <= 0 || purchase.tweakUsed) return;
    setSelectedPurchaseForTweak(purchase);
    // Pre-fill form if possible (e.g., from original bot session data for this purchase)
    setTweakChallenge(userData.q5_challenge || ""); // Example prefill
    // Reset other fields or prefill them
    setTweakBusinessSize("");
    setTweakDreamOutcome("");
    // ... etc.
    setTweakAdditionalNotes("");
    setTweakFormError("");
    setTweakSuccessMessage("");
    setActiveTab("services"); // Ensure services tab is active
  };

  const handleTweakSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchaseForTweak) return;
    if (tweakAdditionalNotes.length < 200) {
      setTweakFormError(
        "Please provide more detail for additional notes (min 200 characters)."
      );
      return;
    }
    setTweakFormError("");
    setTweakSuccessMessage("");

    try {
      const result = await submitTweakRequest({
        email: userData.email,
        purchase: selectedPurchaseForTweak.name,
        q5_challenge: tweakChallenge,
        business_size: tweakBusinessSize,
        dream_outcome: tweakDreamOutcome,
        success_metric: tweakSuccessMetric,
        settle_outcome: tweakSettleOutcome,
        additional_notes: tweakAdditionalNotes,
      });

      if (result.success) {
        setTweakSuccessMessage(
          result.message ||
            "Tweak submitted successfully! Your updated deliverable will be emailed."
        );
        // Update userData to reflect tweak used for this purchase
        setUserData((prev) => ({
          ...prev,
          purchases: prev.purchases.map((p) =>
            p.id === selectedPurchaseForTweak.id ? { ...p, tweakUsed: true } : p
          ),
        }));
        setSelectedPurchaseForTweak(null); // Close form
      } else {
        setTweakFormError(result.message || "Failed to submit tweak.");
      }
    } catch (error) {
      setTweakFormError("An error occurred while submitting your tweak.");
      console.error("Tweak submission error:", error);
    }
  };

  const handleSchedulePaidConsult = async () => {
    if (!selectedPurchaseForTweak && activeTab !== "services") {
      // Generic consult if not from tweak
      alert(
        "Navigate to Services tab to book a general consult or select a purchase to tweak first for a related consult."
      );
      return;
    }
    try {
      const result = await schedulePaidConsult({
        email: userData.email,
        userName: userData.name,
        tweakContext: selectedPurchaseForTweak
          ? `Regarding tweak for ${selectedPurchaseForTweak.name}`
          : "General Consult",
      });
      if (result.success && result.bookingConfirmed) {
        alert(result.message); // Show success
      } else {
        alert(result.message || "Could not schedule consult.");
      }
    } catch (error) {
      alert("Error scheduling consult.");
    }
  };

  async function handleSupportFormSubmit(formData: FormData) {
    const name = userData.name;
    const email = userData.email;
    const message = formData.get("support_message") as string;

    if (!message) {
      alert("Please enter a message for support.");
      return;
    }
    try {
      await submitContactForm({
        name,
        email,
        message,
        pageSource: "Members Area Support",
      });
      alert("Support request submitted! We'll get back to you soon.");
      // Reset form if needed: (e.target as HTMLFormElement).reset();
    } catch (error) {
      alert("Failed to submit support request.");
    }
  }

  const handleBotComplete = () => {
    setShowContinuationBot(false);
    setBotUserData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-arial">
      {/* <header className="bg-white border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="text-red-600 font-bold text-2xl">K</div>
            <span className="ml-2 text-gray-800 text-lg">
              Kefford Consulting
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:inline">
              Welcome, {userData.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Logout (mocked)")}
            >
              Logout
            </Button>
          </div>
        </div>
      </header> */}

      {/* Bot Continuation Modal */}
      {showContinuationBot && botUserData && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl h-[80vh] rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3 border-b flex justify-between items-center bg-red-50">
              <h3 className="font-semibold text-red-700">
                Continue Your Growth Journey
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContinuationBot(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </Button>
            </div>
            <div className="flex-grow overflow-hidden">
              <ACTBotV3
                initialQuestion={startBotAt || 4}
                isFullScreen={false}
                initialUserData={botUserData}
                onComplete={handleBotComplete}
              />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs
          defaultValue="dashboard"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 bg-gray-200 p-1 rounded-lg">
            {[
              { value: "dashboard", label: "Dashboard", icon: Home },
              { value: "referral", label: "Referral", icon: Users },
              { value: "reviews", label: "Reviews", icon: Star },
              { value: "content", label: "Content", icon: BookOpen },
              { value: "wins", label: "Quick Wins", icon: Zap },
              { value: "services", label: "Services", icon: Calendar },
              { value: "support", label: "Support", icon: LifeBuoy },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-col md:flex-row h-auto md:h-10 py-2 md:py-1 data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                <tab.icon size={18} className="mb-1 md:mb-0 md:mr-2" />{" "}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">
                  Dashboard
                </CardTitle>
                <CardDescription>
                  Your Kefford Consulting impact and activity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show continuation prompt if bot was interrupted */}
                {startBotAt && startBotAt >= 4 && !showContinuationBot && (
                  <Card className="border-red-500 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-red-700">
                            Continue Your Growth Journey
                          </h3>
                          <p className="text-sm text-gray-600">
                            You were in the middle of our consultation. Would
                            you like to continue?
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowContinuationBot(true)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Continue Bot
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Your Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Hours Saved:</span>{" "}
                          <span className="font-bold text-blue-600">
                            {userData.hoursSaved} Hrs
                          </span>
                        </div>
                        <Progress
                          value={userData.hoursSaved * 5}
                          className="h-2 mt-1"
                          indicatorClassName="bg-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Credits Earned:</span>{" "}
                          <span className="font-bold text-green-600">
                            ${userData.creditsEarned}
                          </span>
                        </div>
                        <Progress
                          value={
                            (userData.creditsEarned / MAX_REVIEW_CREDITS) * 100
                          }
                          className="h-2 mt-1"
                          indicatorClassName="bg-green-600"
                        />
                        <p className="text-xs text-gray-500 mt-0.5">
                          Next Reward: $500 Cashback at 5 Referrals
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Recommended for You
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Based on your {userData.q5_challenge} needs, try this
                        Quick Win:
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-red-600 hover:underline"
                        onClick={() => setActiveTab("wins")}
                      >
                        {"5 Ways to Boost Sales (Example)"}
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Your Growth Journey
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                        {userData.purchases.map((p) => (
                          <li key={p.id}>Completed: {p.name} Purchase</li>
                        ))}
                        <li>{userData.referrals} Referrals Made</li>
                        <li className="text-red-500">
                          Next: Schedule Consult (if applicable)
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Recent Activity
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {userData.purchases.map((p) => (
                      <li key={p.id}>
                        Purchased {p.name} on {p.date}
                      </li>
                    ))}
                    {userData.purchases
                      .filter((p) => p.tweakUsed)
                      .map((p) => (
                        <li key={`${p.id}-tweak`}>
                          Tweak Completed for {p.name} on{" "}
                          {new Date().toLocaleDateString()} (mock date)
                        </li>
                      ))}
                    <li>Logged in on {new Date().toLocaleDateString()}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">
                  Invite friends to Kefford Consulting and earn cashback! Get
                  $100 for each of the first 5 successful referrals (up to
                  $500).
                </p>
                <div className="p-4 bg-red-50 rounded-md text-center">
                  <p className="text-lg font-semibold">
                    Your Referral Code:{" "}
                    <span className="text-red-600 tracking-wider">
                      {userData.referralCode}
                    </span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() =>
                      alert(
                        `Share code ${userData.referralCode} on Facebook (mocked)`
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Share on Facebook
                  </Button>
                  <Button
                    onClick={() =>
                      alert(
                        `Share code ${userData.referralCode} on Instagram (mocked)`
                      )
                    }
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    Share on Instagram
                  </Button>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Referral Status: {userData.referrals} / 5
                  </h4>
                  <Progress
                    value={(userData.referrals / 5) * 100}
                    className="h-3"
                    indicatorClassName="bg-red-500"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Top Referrers This Month (Anonymized)
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    <li>User A: 8 Referrals</li>
                    <li>User B: 5 Referrals</li>
                    <li>You: {userData.referrals} Referrals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">
                  Review Progress & Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">
                  Share your experience with Kefford Consulting on these
                  platforms and earn $25 credit for each review (up to $150
                  total). Credits can be used for future services or consults.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {reviewPlatforms.map((platform) => {
                    const review = userData.reviews.find(
                      (r) => r.platform === platform
                    );
                    return (
                      <Card
                        key={platform}
                        className={cn(
                          "p-4 text-center",
                          review?.submitted
                            ? "bg-green-50 border-green-500"
                            : "bg-gray-50"
                        )}
                      >
                        <h5 className="font-semibold mb-2">{platform}</h5>
                        {review?.submitted ? (
                          <p className="text-sm text-green-700">
                            <ThumbsUp size={14} className="inline mr-1" />{" "}
                            Submitted! (+${review.credit} Credit)
                          </p>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              alert(
                                `Submit review for ${platform} (mocked). Ensure FTC disclosure.`
                              )
                            }
                          >
                            Submit Review
                          </Button>
                        )}
                      </Card>
                    );
                  })}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">
                    Total Credits Earned:{" "}
                    <span className="text-red-600">
                      ${totalReviewCredits} / ${MAX_REVIEW_CREDITS}
                    </span>
                  </h4>
                  <Progress
                    value={(totalReviewCredits / MAX_REVIEW_CREDITS) * 100}
                    className="h-3 mt-1"
                    indicatorClassName="bg-red-500"
                  />
                </div>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={totalReviewCredits === 0}
                  onClick={() =>
                    alert(`Redeem ${totalReviewCredits} credits (mocked).`)
                  }
                >
                  Redeem Credits
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">
                  Exclusive Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-10 bg-gray-100 rounded-lg">
                  <BookOpen size={48} className="mx-auto text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Coming Soon!
                  </h3>
                  <p className="text-gray-600">
                    In-depth articles, videos, and resources tailored for your
                    growth.
                  </p>
                </div>
                <form
                  action={async (formData) => {
                    const topic = formData.get("topic_request") as string;
                    if (topic) {
                      await submitContactForm({
                        name: userData.name,
                        email: userData.email,
                        message: `Content Request: ${topic}`,
                        pageSource: "Members Area Content Request",
                      });
                      alert("Content request submitted!");
                      (
                        document.getElementById(
                          "topic_request_form"
                        ) as HTMLFormElement
                      )?.reset();
                    } else {
                      alert("Please enter a topic.");
                    }
                  }}
                  id="topic_request_form"
                  className="mt-6 p-4 border rounded-md"
                >
                  <h4 className="font-semibold mb-2">
                    What topic would you like to see?
                  </h4>
                  <Textarea
                    name="topic_request"
                    placeholder="E.g., Advanced SEO strategies for local businesses"
                    className="mb-2"
                  />
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Request Content
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wins">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-10 bg-gray-100 rounded-lg">
                  <Zap size={48} className="mx-auto text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    Coming Soon!
                  </h3>
                  <p className="text-gray-600">
                    Actionable quick wins to boost your business immediately.
                    E.g., "5 Ways to Boost Sales," "Daily Efficiency Checklist."
                  </p>
                </div>
                {/* Placeholder for list of quick wins once available */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">
                  Kefford Consulting Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Calendar Booking */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Schedule a Consult Call
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Book a 30-minute paid consult call with Edwin for $300.
                  </p>
                  <Button
                    onClick={handleSchedulePaidConsult}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Calendar size={16} className="mr-2" />
                    Book Paid Consult
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Google Calendar integration (mocked). You'll be redirected
                    to Stripe for payment before confirmation.
                  </p>
                </div>
                <hr />
                {/* Tweak Page Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Manage Your Plan Tweaks
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Submit your one-time tweak request for eligible purchases
                    within 30 days.
                  </p>

                  {userData.purchases.map((purchase) => (
                    <Card key={purchase.id} className="mb-4 p-4 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{purchase.name}</h4>
                          <p className="text-xs text-gray-500">
                            Purchased on: {purchase.date}
                          </p>
                          {purchase.tweakUsed ? (
                            <p className="text-xs text-red-500 font-medium">
                              Tweak already used for this purchase.
                            </p>
                          ) : purchase.daysRemainingForTweak > 0 ? (
                            <p className="text-xs text-green-600">
                              Days remaining for tweak:{" "}
                              {purchase.daysRemainingForTweak}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Tweak window expired.
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleStartTweak(purchase)}
                          disabled={
                            purchase.tweakUsed ||
                            purchase.daysRemainingForTweak <= 0
                          }
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Edit3 size={14} className="mr-1" /> Start Tweak
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {selectedPurchaseForTweak && (
                    <Card className="mt-6 p-6 border-red-500 border-2">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl text-red-700">
                          Tweak for: {selectedPurchaseForTweak.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setSelectedPurchaseForTweak(null)}
                        >
                          X
                        </Button>
                      </CardHeader>
                      <form onSubmit={handleTweakSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">
                            Update your challenge (Pick one, then elaborate):
                          </label>
                          {/* Simplified: just a text area for challenge for now */}
                          <Textarea
                            value={tweakChallenge}
                            onChange={(e) => setTweakChallenge(e.target.value)}
                            placeholder="New biggest hurdle and why it matters now. Team size changes?"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Update business size (if changed):
                          </label>
                          <Input
                            value={tweakBusinessSize}
                            onChange={(e) =>
                              setTweakBusinessSize(e.target.value)
                            }
                            placeholder="E.g., 7 employees"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Update your dream outcome, success metric, and
                            settle point:
                          </label>
                          <Textarea
                            value={tweakDreamOutcome}
                            onChange={(e) =>
                              setTweakDreamOutcome(e.target.value)
                            }
                            placeholder="New goal, metric, and settle point for the challenge."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Any additional changes or notes for your tweak? (min
                            200 chars)
                          </label>
                          <Textarea
                            value={tweakAdditionalNotes}
                            onChange={(e) =>
                              setTweakAdditionalNotes(e.target.value)
                            }
                            rows={5}
                            placeholder="E.g., I'd like to focus more on lead generation strategies..."
                            className="mt-1"
                          />
                          {tweakFormError && (
                            <p className="text-xs text-red-500 mt-1">
                              {tweakFormError}
                            </p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Confirm Tweak & Redeliver
                        </Button>
                        {tweakSuccessMessage && (
                          <p className="text-sm text-green-600 mt-2">
                            {tweakSuccessMessage}
                          </p>
                        )}
                      </form>
                      <div className="mt-6 border-t pt-4">
                        <p className="text-sm text-gray-700 mb-2">
                          Want expert guidance on this tweak?
                        </p>
                        <Button
                          onClick={handleSchedulePaidConsult}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Schedule Paid Consult with Edwin
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
                <hr />
                {/* Plans PDF Access */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Your Purchased Plans
                  </h3>
                  {userData.purchases.length > 0 ? (
                    userData.purchases.map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center p-3 bg-gray-100 rounded-md mb-2"
                      >
                        <span className="text-sm font-medium">{p.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            alert(`Download ${p.name}.pdf (mocked)`)
                          }
                        >
                          Download PDF
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No purchases yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-700">Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">
                  Need help? Fill out the form below or chat with our ACT Bot
                  for quick assistance.
                </p>
                <form
                  action={handleSupportFormSubmit}
                  className="space-y-4 p-4 border rounded-md bg-gray-50"
                >
                  <div>
                    <label
                      htmlFor="support_message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Your Message
                    </label>
                    <Textarea
                      name="support_message"
                      id="support_message"
                      rows={5}
                      required
                      className="mt-1"
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Send to Support
                  </Button>
                </form>
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowSupportBot(true)}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <MessageSquare size={16} className="mr-2" /> Chat with ACT
                    Bot Now
                  </Button>
                </div>
                {showSupportBot && (
                  <div
                    className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
                    onClick={() => setShowSupportBot(false)}
                  >
                    <div
                      className="bg-white w-full max-w-lg h-[70vh] rounded-lg shadow-xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2 border-b flex justify-end">
                        {" "}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSupportBot(false)}
                        >
                          Close
                        </Button>
                      </div>
                      <ACTBotV3 isFullScreen={false} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer with recommendations - these are placeholders for now */}
      {/* <footer className="max-w-7xl mx-auto p-6 mt-10 border-t text-center text-sm text-gray-500">
        <h3 className="font-semibold mb-2">Future Enhancements (Post-Launch Ideas):</h3>
        <ul className="list-disc list-inside inline-block text-left text-xs">
          <li>Community Forum for user tips.</li>
          <li>Feedback Loop: "Rate Your Play: 1-5 Stars".</li>
          <li>Upsell Notifications for bundles.</li>
          <li>"Case Studies" page.</li>
          <li>Blog section with starter articles.</li>
        </ul>
        <p className="mt-4">&copy; {new Date().getFullYear()} Kefford Consulting LLC. All Rights Reserved.</p>
      </footer> */}
    </div>
  );
}
