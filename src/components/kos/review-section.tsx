"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useReviews, useSaveReview } from "@/hooks/use-reviews";
import { reviewSchema, type ReviewFormData } from "@/lib/validations/review";
import { cn } from "cn";
import type { Kos, Review } from "@/types";

function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Read-only 1-5 star row used by each review item. */
function RatingStars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} dari 5 bintang`} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const initial = review.userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <li className="flex gap-3 border-b py-4 last:border-b-0">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-medium">{review.userName}</p>
          <time dateTime={review.createdAt} className="text-xs text-muted-foreground">
            {formatReviewDate(review.createdAt)}
          </time>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <RatingStars rating={review.rating} />
          {review.updatedAt !== review.createdAt ? (
            <span className="text-xs text-muted-foreground">Diedit</span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.comment}</p>
      </div>
    </li>
  );
}

interface ReviewFormProps {
  kosId: number;
  /** The signed-in user's existing review, if they already wrote one. */
  existing?: Review;
}

function ReviewForm({ kosId, existing }: ReviewFormProps) {
  const saveReview = useSaveReview(kosId);
  const [isEditing, setIsEditing] = useState(existing !== undefined);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existing?.rating ?? 0,
      comment: existing?.comment ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveReview.mutateAsync(values);
      setIsEditing(true);
    } catch {
      // The mutation error is rendered below.
    }
  });

  const errorMessage = saveReview.isError
    ? saveReview.error instanceof Error
      ? saveReview.error.message
      : "Gagal nyimpen ulasan. Coba lagi ya."
    : null;

  return (
    <Card className="py-4">
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <p className="font-heading text-sm font-semibold">
              {isEditing ? "Ubah ulasan lu" : "Tulis ulasan"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ceritain pengalaman lu tinggal di kos ini.
            </p>
          </div>

          <fieldset aria-describedby={errors.rating ? "review-rating-error" : undefined}>
            <legend className="text-sm font-medium">Rating</legend>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <div role="group" aria-label="Pilih rating" className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      aria-label={`Beri ${value} bintang`}
                      aria-pressed={field.value === value}
                      onClick={() => field.onChange(value)}
                    >
                      <Star
                        aria-hidden="true"
                        className={cn(
                          "size-6",
                          value <= field.value
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  ))}
                </div>
              )}
            />
            {errors.rating ? (
              <p
                id="review-rating-error"
                role="alert"
                className="mt-1 text-xs font-medium text-destructive"
              >
                {errors.rating.message}
              </p>
            ) : null}
          </fieldset>

          <FormField
            id="review-comment"
            label="Ulasan"
            error={errors.comment?.message}
            hint="Minimal 10 karakter."
          >
            <Textarea
              rows={4}
              placeholder="Contoh: Kamarnya bersih, WiFi kencang, pemiliknya ramah."
              {...register("comment")}
            />
          </FormField>

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}

          {saveReview.isSuccess ? (
            <p role="status" className="text-sm font-medium text-success">
              Ulasan tersimpan. Makasih ya!
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={saveReview.isPending}>
            {saveReview.isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
            {isEditing ? "Perbarui ulasan" : "Kirim ulasan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Reviews + rating form for one kos. Reviews come from the api layer, so the
 * mock localStorage overlay can be swapped for real endpoints later.
 */
export function ReviewSection({ kos }: { kos: Kos }) {
  const { user } = useAuth();
  const reviewsQuery = useReviews(kos.id);
  const existingReview = user
    ? reviewsQuery.reviews.find((review) => review.userId === user.id)
    : undefined;
  const isOwner = user?.id === kos.ownerId;

  return (
    <section className="mt-8 flex flex-col gap-4" aria-labelledby="ulasan-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="ulasan-heading" className="font-heading text-lg font-semibold">
          Ulasan penghuni
        </h2>
        {kos.ratingAvg > 0 ? (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-400" />
            {kos.ratingAvg.toFixed(1)} rata-rata dari {kos.reviewCount} rating
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada rating</p>
        )}
      </div>

      {reviewsQuery.isPending ? (
        <div aria-hidden="true" className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : reviewsQuery.isError ? (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">Gagal memuat ulasan</p>
          <p className="mt-1 text-sm text-muted-foreground">Koneksi lagi ngadat. Coba ulang, ya.</p>
          <Button className="mt-4" variant="outline" onClick={() => void reviewsQuery.refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : reviewsQuery.reviews.length > 0 ? (
        <ul aria-label="Daftar ulasan" className="rounded-xl border px-4">
          {reviewsQuery.reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">Belum ada ulasan tertulis</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kalau lu pernah tinggal di sini, jadi yang pertama berbagi pengalaman.
          </p>
        </div>
      )}

      {!user ? (
        <Card className="py-4">
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Masuk dulu buat nulis ulasan.</p>
            <Button
              size="lg"
              render={<Link href={`/login?redirect=${encodeURIComponent(`/kos/${kos.slug}`)}`} />}
            >
              Masuk buat nulis ulasan
            </Button>
          </CardContent>
        </Card>
      ) : isOwner ? (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Ini listing lu sendiri. Ulasan cuma bisa dikirim sama penghuni lain.
        </p>
      ) : reviewsQuery.isSuccess ? (
        <ReviewForm kosId={kos.id} existing={existingReview} />
      ) : null}
    </section>
  );
}
