"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type TripKey = "privateVacation" | "corporateRetreat" | "golfTrip" | "groupTravel";

type FrequencyKey = "firstTime" | "oneToTwoTimes" | "frequentVisitor";

const TRIP_ORDER: TripKey[] = ["privateVacation", "corporateRetreat", "golfTrip", "groupTravel"];

const FREQUENCY_ORDER: FrequencyKey[] = ["firstTime", "oneToTwoTimes", "frequentVisitor"];

const TRIP_TO_EN: Record<TripKey, string> = {
  privateVacation: "Private Vacation",
  corporateRetreat: "Corporate Retreat",
  golfTrip: "Golf Trip",
  groupTravel: "Group Travel",
};

const FREQUENCY_TO_EN: Record<FrequencyKey, string> = {
  firstTime: "First time",
  oneToTwoTimes: "1-2 times a year",
  frequentVisitor: "Frequent visitor",
};

export default function LeadForm() {
  const t = useTranslations("LeadForm");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [guests, setGuests] = useState("");
  const [tripKey, setTripKey] = useState<TripKey | "">("");
  const [frequencyKey, setFrequencyKey] = useState<FrequencyKey | "">("");
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const tripLabel = (id: TripKey) =>
    id === "privateVacation"
      ? t("tripTypePrivateVacation")
      : id === "corporateRetreat"
        ? t("tripTypeCorporateRetreat")
        : id === "golfTrip"
          ? t("tripTypeGolfTrip")
          : t("tripTypeGroupTravel");

  const frequencyLabel = (id: FrequencyKey) =>
    id === "firstTime"
      ? t("travelFrequencyFirstTime")
      : id === "oneToTwoTimes"
        ? t("travelFrequencyOneToTwoTimes")
        : t("travelFrequencyFrequentVisitor");

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 1 &&
      email.trim().length > 3 &&
      phone.trim().length > 3 &&
      travelDates.trim().length > 1 &&
      guests.trim().length > 0 &&
      tripKey.length > 0 &&
      frequencyKey.length > 0 &&
      status !== "loading"
    );
  }, [name, email, phone, travelDates, guests, tripKey, frequencyKey, status]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setTravelDates("");
    setGuests("");
    setTripKey("");
    setFrequencyKey("");
    setBotField("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/send-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          travelDates: travelDates.trim(),
          guests: Number(guests),
          tripType: tripKey ? TRIP_TO_EN[tripKey] : "",
          travelFrequency: frequencyKey ? FREQUENCY_TO_EN[frequencyKey] : "",
          botField,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(t("errorGeneric"));
        return;
      }

      setStatus("success");
      resetForm();
    } catch {
      setStatus("error");
      setErrorMessage(t("errorGeneric"));
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl shadow-black/20 md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t("title")}</h2>
      <p className="mt-2 text-sm text-slate-600">{t("subtitle")}</p>

      <form className="relative mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="botField"
          value={botField}
          onChange={(event) => setBotField(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -z-50 h-0 w-0 opacity-0"
        />
        <div>
          <label htmlFor="lead-name" className="mb-1.5 block text-sm font-medium text-slate-900">
            {t("name")}
          </label>
          <input
            id="lead-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="lead-email" className="mb-1.5 block text-sm font-medium text-slate-900">
              {t("email")}
            </label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
              required
            />
          </div>
          <div>
            <label htmlFor="lead-phone" className="mb-1.5 block text-sm font-medium text-slate-900">
              {t("phone")}
            </label>
            <input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="lead-dates" className="mb-1.5 block text-sm font-medium text-slate-900">
            {t("travelDates")}
          </label>
          <input
            id="lead-dates"
            type="text"
            placeholder={t("travelDatesPlaceholder")}
            value={travelDates}
            onChange={(e) => setTravelDates(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            required
          />
        </div>

        <div>
          <label htmlFor="lead-guests" className="mb-1.5 block text-sm font-medium text-slate-900">
            {t("numberOfGuests")}
          </label>
          <input
            id="lead-guests"
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-800 focus:ring-2 focus:ring-blue-800/15"
            required
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900">{t("tripType")}</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {TRIP_ORDER.map((id) => {
              const active = tripKey === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTripKey(id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "border-orange-500 bg-orange-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {tripLabel(id)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900">{t("travelFrequency")}</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {FREQUENCY_ORDER.map((id) => {
              const active = frequencyKey === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFrequencyKey(id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "border-orange-500 bg-orange-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {frequencyLabel(id)}
                </button>
              );
            })}
          </div>
        </div>

        {status === "success" ? (
          <p className="text-sm font-medium text-emerald-600">{t("success")}</p>
        ) : null}
        {status === "error" ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full rounded-xl bg-orange-500 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? t("submitting") : t("submit")}
        </button>
      </form>
    </section>
  );
}
