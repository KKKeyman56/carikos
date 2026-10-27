"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { FormField } from "@/components/form/form-field";
import { OwnerOnlyNotice, OwnerSignInPrompt } from "@/components/owner/owner-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCreateKos, useOwnerKos, useUpdateKos } from "@/hooks/use-owner-kos";
import { getKosFacilities } from "@/lib/api/kos";
import { kosFormSchema, type KosFormData } from "@/lib/validations/owner-kos";
import type { Kos, KosGender, KosInput } from "@/types";

const GENDER_OPTIONS = [
  { value: "putri", label: "Putri", description: "Khusus mahasiswi" },
  { value: "putra", label: "Putra", description: "Khusus mahasiswa" },
  { value: "campur", label: "Campur", description: "Semua gender" },
] satisfies Array<{ value: KosGender; label: string; description: string }>;

// ASSUMPTION: Depok areas covered by the mock catalogue. Swap to the backend
// list once it exposes one.
const DISTRICT_OPTIONS = [
  "Beji",
  "Pancoran Mas",
  "Cimanggis",
  "Limo",
  "Sukmajaya",
  "Depok",
  "Sawangan",
  "Cinere",
  "Tapos",
  "Cilodong",
  "Bojongsari",
];

// Roughly the Gunadarma Margonda area, used as a sensible default pin.
const DEFAULT_PIN = { latitude: -6.3672, longitude: 106.8275 };

function toFormValues(kos?: Kos): KosFormData {
  if (!kos) {
    return {
      name: "",
      description: "",
      gender: "campur",
      address: "",
      district: "Beji",
      distanceToCampusKm: 1,
      latitude: DEFAULT_PIN.latitude,
      longitude: DEFAULT_PIN.longitude,
      facilityIds: [],
      rooms: [{ name: "", size: "", monthlyPrice: 0 }],
    };
  }

  return {
    name: kos.name,
    description: kos.description,
    gender: kos.gender,
    address: kos.address,
    district: kos.district,
    distanceToCampusKm: kos.distanceToCampusKm,
    latitude: kos.latitude,
    longitude: kos.longitude,
    facilityIds: kos.facilities.map((facility) => facility.id),
    rooms: kos.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      size: room.size,
      monthlyPrice: room.monthlyPrice,
    })),
  };
}

/** Placeholder shown while the edit page resolves its slug. */
export function KosFormSkeleton() {
  return (
    <div aria-hidden="true" className="mt-6 flex flex-col gap-5">
      <Card className="py-4">
        <CardContent className="flex flex-col gap-3 px-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
      <Card className="py-4">
        <CardContent className="flex flex-col gap-3 px-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

type KosFormProps = { mode: "create" } | { mode: "edit"; slug: string };

/**
 * Owner-only form for creating or editing a listing. Data goes through
 * `lib/api/owner.ts`; the component never talks to a backend directly.
 */
export function KosForm(props: KosFormProps) {
  const { user } = useAuth();
  const redirectTo =
    props.mode === "edit" ? `/dashboard/kos/${props.slug}/edit` : "/dashboard/kos/baru";

  if (!user) {
    return <OwnerSignInPrompt redirectTo={redirectTo} />;
  }

  if (user.role !== "owner") {
    return <OwnerOnlyNotice />;
  }

  return props.mode === "edit" ? (
    <EditKosForm ownerId={user.id} slug={props.slug} />
  ) : (
    <KosFormFields ownerId={user.id} />
  );
}

function EditKosForm({ ownerId, slug }: { ownerId: number; slug: string }) {
  const kosQuery = useOwnerKos(ownerId);

  if (kosQuery.isPending) {
    return <KosFormSkeleton />;
  }

  if (kosQuery.isError) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
        <p className="font-semibold">Gagal memuat kos</p>
        <p className="mt-1 text-sm text-muted-foreground">Koneksi lagi ngadat. Coba ulang, ya.</p>
        <Button className="mt-4" variant="outline" onClick={() => void kosQuery.refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  const kos = (kosQuery.data ?? []).find((item) => item.slug === slug);
  if (!kos) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
        <p className="font-semibold">Kos nggak ketemu</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Listing ini nggak ada atau bukan milik akun lu.
        </p>
        <Button className="mt-5" variant="outline" size="lg" render={<Link href="/dashboard" />}>
          Balik ke dashboard
        </Button>
      </div>
    );
  }

  return <KosFormFields ownerId={ownerId} kos={kos} />;
}

function KosFormFields({ ownerId, kos }: { ownerId: number; kos?: Kos }) {
  const router = useRouter();
  const createKos = useCreateKos();
  const updateKos = useUpdateKos();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const facilitiesQuery = useQuery({
    queryKey: ["kos", "facilities"],
    queryFn: getKosFacilities,
    staleTime: 10 * 60 * 1000,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KosFormData>({
    resolver: zodResolver(kosFormSchema),
    defaultValues: toFormValues(kos),
  });

  // keyName stays away from "id": our rooms carry their own numeric id, which
  // the API needs to keep availability status attached to the same room.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
    keyName: "formKey",
  });
  const selectedFacilityIds = useWatch({ control, name: "facilityIds" }) ?? [];
  const gender = useWatch({ control, name: "gender" }) ?? "campur";
  const isEditing = kos !== undefined;

  const toggleFacility = (facilityId: number, checked: boolean) => {
    const next = checked
      ? [...selectedFacilityIds, facilityId]
      : selectedFacilityIds.filter((id) => id !== facilityId);
    setValue("facilityIds", next, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);

    const input: KosInput = {
      name: values.name,
      description: values.description,
      gender: values.gender,
      address: values.address,
      district: values.district,
      distanceToCampusKm: values.distanceToCampusKm,
      latitude: values.latitude,
      longitude: values.longitude,
      facilityIds: values.facilityIds,
      rooms: values.rooms.map((room) => ({
        id: room.id,
        name: room.name,
        size: room.size,
        monthlyPrice: room.monthlyPrice,
      })),
    };

    try {
      if (kos) {
        await updateKos.mutateAsync({ ownerId, kosId: kos.id, input });
      } else {
        await createKos.mutateAsync({ ownerId, input });
      }
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan kos. Coba lagi ya.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Info kos</CardTitle>
          <CardDescription>
            Data ini yang muncul di hasil pencarian dan halaman detail.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormField id="kos-name" label="Nama kos" error={errors.name?.message}>
            <Input
              type="text"
              placeholder="Contoh: Kos Melati Putri"
              className="h-11"
              {...register("name")}
            />
          </FormField>

          <FormField
            id="kos-description"
            label="Deskripsi"
            error={errors.description?.message}
            hint="Ceritakan suasana, kelebihan, dan akses ke kampus."
          >
            <Textarea
              placeholder="Kos nyaman 5 menit jalan kaki ke kampus, lingkungan aman…"
              className="min-h-28"
              {...register("description")}
            />
          </FormField>

          <fieldset aria-describedby={errors.gender ? "kos-gender-error" : undefined}>
            <legend className="text-sm font-medium">Tipe kos</legend>
            <div role="group" aria-label="Tipe kos" className="mt-2 grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map((option) => {
                const selected = gender === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    className={`flex min-h-14 flex-col items-center justify-center rounded-lg border px-2 text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                    onClick={() =>
                      setValue("gender", option.value, { shouldValidate: true, shouldDirty: true })
                    }
                  >
                    <span className="font-medium">{option.label}</span>
                    <span
                      className={`text-xs ${
                        selected ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.gender ? (
              <p
                id="kos-gender-error"
                role="alert"
                className="mt-1 text-xs font-medium text-destructive"
              >
                {errors.gender.message}
              </p>
            ) : null}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="kos-district" label="Kecamatan" error={errors.district?.message}>
              <select
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
                {...register("district")}
              >
                {DISTRICT_OPTIONS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              id="kos-distance"
              label="Jarak ke kampus (km)"
              error={errors.distanceToCampusKm?.message}
            >
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                className="h-11"
                {...register("distanceToCampusKm", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField id="kos-address" label="Alamat lengkap" error={errors.address?.message}>
            <Input
              type="text"
              placeholder="Jl. Margonda Raya No. 12"
              className="h-11"
              {...register("address")}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lokasi peta</CardTitle>
          <CardDescription>
            Titik ini dipakai buat pin di peta halaman detail. Perkiraan juga nggak apa-apa.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="kos-latitude" label="Latitude" error={errors.latitude?.message}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.0001"
              className="h-11"
              {...register("latitude", { valueAsNumber: true })}
            />
          </FormField>
          <FormField id="kos-longitude" label="Longitude" error={errors.longitude?.message}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.0001"
              className="h-11"
              {...register("longitude", { valueAsNumber: true })}
            />
          </FormField>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Contoh titik sekitar Margonda: -6.3672, 106.8275.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Fasilitas</CardTitle>
          <CardDescription>Centang fasilitas yang beneran tersedia di kos ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {facilitiesQuery.isPending ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-3/4" />
              ))}
            </div>
          ) : facilitiesQuery.isError ? (
            <p className="text-sm text-muted-foreground">
              Gagal memuat fasilitas.{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => void facilitiesQuery.refetch()}
              >
                Coba lagi
              </button>
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(facilitiesQuery.data ?? []).map((facility) => (
                <div key={facility.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`kos-facility-${facility.id}`}
                    checked={selectedFacilityIds.includes(facility.id)}
                    onCheckedChange={(checked) => toggleFacility(facility.id, checked === true)}
                  />
                  <Label htmlFor={`kos-facility-${facility.id}`} className="font-normal">
                    {facility.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Kamar</CardTitle>
            <CardDescription>
              Harga tiap kamar dipakai buat rentang harga di listing.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => append({ name: "", size: "", monthlyPrice: 0 })}
          >
            <Plus aria-hidden="true" />
            Tambah kamar
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.formKey} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Kamar {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={fields.length === 1}
                  aria-label={`Hapus kamar ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 aria-hidden="true" />
                  Hapus
                </Button>
              </div>

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <FormField
                  id={`room-${index}-name`}
                  label="Nama kamar"
                  error={errors.rooms?.[index]?.name?.message}
                  className="sm:col-span-2"
                >
                  <Input
                    type="text"
                    placeholder="Contoh: Kamar lantai 2"
                    className="h-11"
                    {...register(`rooms.${index}.name`)}
                  />
                </FormField>
                <FormField
                  id={`room-${index}-size`}
                  label="Ukuran"
                  error={errors.rooms?.[index]?.size?.message}
                >
                  <Input
                    type="text"
                    placeholder="3x4 m"
                    className="h-11"
                    {...register(`rooms.${index}.size`)}
                  />
                </FormField>
                <FormField
                  id={`room-${index}-price`}
                  label="Harga per bulan (Rp)"
                  error={errors.rooms?.[index]?.monthlyPrice?.message}
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={50000}
                    placeholder="750000"
                    className="h-11"
                    {...register(`rooms.${index}.monthlyPrice`, { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            </div>
          ))}

          {errors.rooms?.root?.message ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {errors.rooms.root.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="lg" render={<Link href="/dashboard" />}>
          Batal
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Menyimpan…
            </>
          ) : (
            <>
              <Save aria-hidden="true" />
              {isEditing ? "Simpan perubahan" : "Simpan kos"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
