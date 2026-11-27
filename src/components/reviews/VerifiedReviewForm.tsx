"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ReviewMediaItem } from "@/lib/services/reviews/types";

interface VerifiedReviewFormProps {
  initialToken?: string;
  initialBookingId?: string;
}

interface BookingDetails {
  _id: string;
  bookingReference?: string;
  propertyId: string;
  propertyName: string;
  propertyCity?: string;
  propertyImage?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestName?: string;
}

export default function VerifiedReviewForm({
  initialToken,
  initialBookingId,
}: VerifiedReviewFormProps) {
  const token = initialToken || "";
  const [bookingId, setBookingId] = useState(initialBookingId || "");
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [eligibilityError, setEligibilityError] = useState("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  // Form fields
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [recommendProperty, setRecommendProperty] = useState(true);
  const [reviewerDisplayName, setReviewerDisplayName] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<ReviewMediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    reviewId: string;
    propertyName: string;
    submittedRating: number;
  } | null>(null);

  // Check eligibility on mount
  useEffect(() => {
    async function checkEligibility() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (token) params.set("token", token);
        if (bookingId) params.set("bookingId", bookingId);

        const res = await fetch(`/api/reviews/eligibility?${params.toString()}`);
        const data = await res.json();

        if (res.ok && data.eligible) {
          setEligible(true);
          setBooking(data.booking);
          if (data.booking?.guestName) {
            setReviewerDisplayName(data.booking.guestName);
          }
          if (data.booking?._id) {
            setBookingId(data.booking._id);
          }
        } else {
          setEligible(false);
          setEligibilityError(
            data.error ||
              "This booking is not eligible to submit a review, or the invitation has expired."
          );
        }
      } catch {
        setEligible(false);
        setEligibilityError("Unable to verify review eligibility. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    }

    if (token || bookingId) {
      checkEligibility();
    } else {
      setLoading(false);
      setEligibilityError("No valid review invitation token or booking reference provided.");
    }
  }, [token, bookingId]);

  // Handle media file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isVideo: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setMediaError("");
    setUploadingMedia(true);

    const photos = uploadedMedia.filter((m) => m.type === "photo");
    const videos = uploadedMedia.filter((m) => m.type === "video");

    if (!isVideo && photos.length + files.length > 5) {
      setMediaError("You can upload a maximum of 5 photographs in total.");
      setUploadingMedia(false);
      return;
    }

    if (isVideo && videos.length + files.length > 2) {
      setMediaError("You can upload a maximum of 2 videos in total.");
      setUploadingMedia(false);
      return;
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        if (token) formData.append("token", token);
        if (bookingId) formData.append("bookingId", bookingId);
        if (booking?.propertyId) formData.append("propertyId", booking.propertyId);

        const res = await fetch("/api/reviews/upload-media", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || `Failed to upload ${file.name}`);
        }

        setUploadedMedia((prev) => [...prev, result]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload media. Please verify file format and size.";
      setMediaError(msg);
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const removeMediaItem = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!reviewText || reviewText.trim().length < 10) {
      setSubmitError("Please write at least 10 characters describing your experience.");
      return;
    }

    if (reviewText.trim().length > 2000) {
      setSubmitError("Review feedback cannot exceed 2,000 characters.");
      return;
    }

    if (reviewTitle.trim().length > 100) {
      setSubmitError("Review title cannot exceed 100 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        token: token || undefined,
        bookingId: bookingId || booking?._id,
        propertyId: booking?.propertyId,
        rating,
        reviewTitle: reviewTitle.trim(),
        reviewText: reviewText.trim(),
        recommendProperty,
        reviewerDisplayName: reviewerDisplayName.trim() || booking?.guestName || "Verified Guest",
        media: uploadedMedia,
      };

      const res = await fetch("/api/reviews/verified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSubmittedData({
        reviewId: data.reviewId,
        propertyName: data.propertyName || booking?.propertyName || "Property",
        submittedRating: data.submittedRating || rating,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while submitting your review.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800">Verifying Your Invitation</h2>
          <p className="text-slate-500 text-sm mt-2">Checking your stay details with Yatra Expertz...</p>
        </div>
      </div>
    );
  }

  // 2. Ineligible or Error State
  if (!eligible) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Invitation Notice</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">{eligibilityError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/hotels"
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Post-Submission Confirmation Screen
  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Thank you for sharing your experience!</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Your review for <strong className="text-slate-800">{submittedData.propertyName}</strong> has been submitted successfully and will be published after quick moderation.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Property:</span>
              <span className="font-semibold text-slate-800">{submittedData.propertyName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Your Rating:</span>
              <span className="font-bold text-amber-500 text-base">{"★".repeat(submittedData.submittedRating)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Pending Moderation
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {booking?.propertyId && (
              <Link
                href={`/hotels/${booking.propertyId}`}
                className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Return to Property
              </Link>
            )}
            <Link
              href="/hotels"
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Explore More Destinations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Form Screen
  const photos = uploadedMedia.filter((m) => m.type === "photo");
  const videos = uploadedMedia.filter((m) => m.type === "video");

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              YATRA<span className="text-blue-600">EXPERTZ</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Share Your Experience
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your authentic review helps fellow travelers and shapes hospitality standards.
          </p>
        </div>

        {/* Property Summary Card */}
        {booking && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 flex items-center gap-4">
            {booking.propertyImage ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                <Image
                  src={booking.propertyImage}
                  alt={booking.propertyName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                {booking.propertyName.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified Stay
                </span>
                {booking.bookingReference && (
                  <span className="text-xs text-slate-400">Ref: {booking.bookingReference}</span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 truncate">{booking.propertyName}</h2>
              {booking.propertyCity && (
                <p className="text-xs text-slate-500">{booking.propertyCity}</p>
              )}
              {booking.checkInDate && (
                <p className="text-xs text-slate-400 mt-1">
                  Stayed: {booking.checkInDate} — {booking.checkOutDate || "Completed"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Review Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          {/* 1. Overall Rating */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl focus:outline-none transition transform hover:scale-110"
                  aria-label={`${star} star rating`}
                >
                  <span
                    className={
                      (hoverRating || rating) >= star
                        ? "text-amber-400"
                        : "text-slate-200"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="ml-3 text-sm font-semibold text-slate-600">
                {rating === 5 && "Excellent"}
                {rating === 4 && "Very Good"}
                {rating === 3 && "Good"}
                {rating === 2 && "Fair"}
                {rating === 1 && "Poor"}
              </span>
            </div>
          </div>

          {/* 2. Review Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="reviewTitle" className="block text-sm font-bold text-slate-800">
                Review Headline
              </label>
              <span className="text-xs text-slate-400">{reviewTitle.length}/100</span>
            </div>
            <input
              id="reviewTitle"
              type="text"
              maxLength={100}
              placeholder="e.g., Unforgettable mountain views & courteous staff"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
          </div>

          {/* 3. Written Review */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="reviewText" className="block text-sm font-bold text-slate-800">
                Your Feedback <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{reviewText.length}/2000</span>
            </div>
            <textarea
              id="reviewText"
              rows={5}
              maxLength={2000}
              required
              placeholder="Tell other travelers about the room comfort, cleanliness, amenities, food, and hospitality. Honest constructive feedback is welcomed!"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Minimum 10 characters.</p>
          </div>

          {/* 4. Recommendation */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Would you recommend this property?
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="recommend"
                  checked={recommendProperty === true}
                  onChange={() => setRecommendProperty(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Yes, I recommend it</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="recommend"
                  checked={recommendProperty === false}
                  onChange={() => setRecommendProperty(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>No, I would not</span>
              </label>
            </div>
          </div>

          {/* 5. Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-bold text-slate-800 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={reviewerDisplayName}
              onChange={(e) => setReviewerDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              placeholder="Your Name (e.g. Rahul S.)"
            />
          </div>

          {/* 6. Media Uploads */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Photos & Videos (Optional)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add up to 5 photos (max 5 MB each, JPEG/PNG/WebP) and up to 2 short videos (max 20 MB each, MP4/WebM).
            </p>

            {mediaError && (
              <div className="p-3 mb-4 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium">
                {mediaError}
              </div>
            )}

            {/* Media Upload Buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              <label className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold border ${
                photos.length >= 5 ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploadingMedia || photos.length >= 5}
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploadingMedia ? "Uploading..." : `Add Photos (${photos.length}/5)`}
              </label>

              <label className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold border ${
                videos.length >= 2 ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  disabled={uploadingMedia || videos.length >= 2}
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                />
                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {uploadingMedia ? "Uploading..." : `Add Videos (${videos.length}/2)`}
              </label>
            </div>

            {/* Media Previews */}
            {uploadedMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {uploadedMedia.map((media, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                    {media.type === "photo" ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={media.url} alt="Review attachment" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-xs font-bold text-slate-600 block">📹 Video</span>
                        <span className="text-[10px] text-slate-400">Attached</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMediaItem(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center text-xs hover:bg-red-600 transition"
                      aria-label="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting || uploadingMedia}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition flex items-center justify-center text-sm"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Submitting Review...
                </>
              ) : (
                "Submit Verified Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
